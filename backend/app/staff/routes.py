
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.auth.models import User, Role, UserRole
from app.staff.models import StaffProfile
from app.academics.models import Department
from app.common.utils import hash_password, success_response, error_response, is_admin, is_hod, is_advisor
from datetime import datetime

staff_bp = Blueprint("staff_bp", __name__, url_prefix="/staff")

def can_create_role(creator_user, new_role_type, target_department_id):
    """
    Determines if a user can create a specific staff role in a specific department.
    Hierarchy:
    - Admin -> HODs (any dept), Advisors (any dept), Counsellors (any dept)
    - HOD -> Advisors (own dept)
    - Advisor -> Counsellors (own dept)
    """
    
    # 1. Admin Override (Can create anything)
    if is_admin(creator_user):
        return True

    # 2. HOD Logic
    if creator_user.department_hod_of and creator_user.department_hod_of.id == target_department_id:
        if new_role_type == "advisor":
            return True
        if new_role_type == "counsellor":
             # Optional: HOD should probably be allowed to create Counsellors too if Advisor can.
             return False

    # 3. Advisor Logic 
    staff_profile = StaffProfile.query.filter_by(user_id=creator_user.id).first()
    if staff_profile and staff_profile.role_type == "advisor" and staff_profile.department_id == target_department_id:
        if new_role_type == "counsellor":
            return True

    return False

@staff_bp.route("/create", methods=["POST"])
@jwt_required()
def create_staff():
    current_user_id = get_jwt_identity()
    creator = User.query.get(current_user_id)
    if not creator:
        return error_response("User not found", 404)

    data = request.get_json()
    if not data:
        return error_response("No input data provided")

    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    role_type = data.get("role_type") # "hod", "advisor", "counsellor"
    department_id = data.get("department_id")

    if not all([email, password, full_name, role_type, department_id]):
        return error_response("Missing required fields: email, password, full_name, role_type, department_id")

    allowed_roles = ["hod", "advisor", "counsellor"]
    if role_type not in allowed_roles:
         return error_response("Invalid role_type. Must be one of: hod, advisor, counsellor")

    department = Department.query.get(department_id)
    if not department:
        return error_response("Department not found", 404)

    if not can_create_role(creator, role_type, department_id):
        return error_response("You do not have permission to create this role in the specified department", 403)

    if User.query.filter_by(email=email).first():
        return error_response("Email already registered", 409)

    try:
        hashed_pw = hash_password(password)
        new_user = User(
            email=email,
            password_hash=hashed_pw,
            full_name=full_name
        )
        db.session.add(new_user)
        db.session.flush()

        role_obj = Role.query.filter_by(name=role_type).first()
        if not role_obj:
            role_obj = Role(name=role_type)
            db.session.add(role_obj)
            db.session.flush()

        user_role = UserRole(user_id=new_user.id, role_id=role_obj.id)
        db.session.add(user_role)

        staff_profile = StaffProfile(
            user_id=new_user.id,
            department_id=department_id,
            role_type=role_type,
            created_by_id=creator.id
        )
        db.session.add(staff_profile)

        if role_type == "hod":
            if department.hod_id:
                db.session.rollback()
                return error_response(f"Department '{department.name}' already has an HOD assigned.", 400)
            
            department.hod_id = new_user.id
            db.session.add(department)

        db.session.commit()

        return success_response({
            "user_id": new_user.id,
            "role_type": role_type,
            "department_id": department_id
        }, "Staff account created successfully", 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create staff account: {str(e)}", 500)

@staff_bp.route("/my-team", methods=["GET"])
@jwt_required()
def get_my_team():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return error_response("User not found", 404)

    staff_query = StaffProfile.query.join(User, StaffProfile.user_id == User.id)\
                                    .join(Department, StaffProfile.department_id == Department.id)
    
    if is_admin(user):
        pass 
    elif user.department_hod_of: 
        dept_id = user.department_hod_of.id
        staff_query = staff_query.filter(
            StaffProfile.department_id == dept_id,
            StaffProfile.role_type.in_(["advisor", "counsellor"])
        )
    else:
        my_profile = StaffProfile.query.filter_by(user_id=user.id).first()
        if my_profile and my_profile.role_type == "advisor":
            staff_query = staff_query.filter(
                StaffProfile.department_id == my_profile.department_id,
                StaffProfile.role_type == "counsellor"
            )
        else:
            return error_response("Access denied. You do not have permission to view staff list.", 403)

    results = staff_query.all()
    
    data = []
    for staff in results:
        creator_name = "System"
        if staff.creator:
            creator_name = staff.creator.full_name

        data.append({
            "user_id": staff.user_id,
            "full_name": staff.user.full_name,
            "email": staff.user.email,
            "role_type": staff.role_type,
            "department_name": staff.department.name,
            "created_by": creator_name,
            "created_at": staff.created_at.isoformat()
        })

    return success_response(data)
