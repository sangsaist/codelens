
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.auth.models import User, Role, UserRole
from app.staff.models import StaffProfile
from app.academics.models import Department
from app.students.models import Student, StudentAdvisor, StudentCounsellor
from app.common.utils import hash_password, success_response, error_response, is_admin, is_hod, is_advisor, is_counsellor
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

# --- Assignment Routes ---

@staff_bp.route("/assign-advisor", methods=["POST"])
@jwt_required()
def assign_advisor():
    """HOD assigns students to an Advisor"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # 1. HOD/Admin Check
    if not is_admin(user) and not is_hod(user, None):
        return error_response("Access Denied. HOD role required.", 403)
        
    data = request.get_json()
    advisor_id = data.get("advisor_id")
    student_ids = data.get("student_ids", [])
    
    if not advisor_id or not student_ids:
        return error_response("Missing advisor_id or student_ids")
        
    # 2. Verify Advisor
    advisor = User.query.get(advisor_id)
    if not advisor or not is_advisor(advisor):
         return error_response("Invalid advisor selected", 400)
    
    # 3. Dept Match Check (for HOD)
    if not is_admin(user):
        # Ensure Advisor is in HOD's department
        hod_dept_id = user.department_hod_of.id if user.department_hod_of else None
        
        # Check advisor's profile for dept match
        adv_profile = StaffProfile.query.filter_by(user_id=advisor.id).first()
        if not adv_profile or adv_profile.department_id != hod_dept_id:
             return error_response("Advisor does not belong to your department", 403)

    count = 0
    skipped = 0
    for sid in student_ids:
        student = Student.query.get(sid)
        if not student: 
            skipped += 1
            continue
            
        # Ensure student is in same dept
        if not is_admin(user) and student.department_id and student.department_id != user.department_hod_of.id:
            skipped += 1
            continue
            
        # Upsert assignment
        assignment = StudentAdvisor.query.filter_by(student_id=sid).first()
        if assignment:
            assignment.advisor_user_id = advisor_id
        else:
            assignment = StudentAdvisor(student_id=sid, advisor_user_id=advisor_id)
            db.session.add(assignment)
        count += 1
        
    db.session.commit()
    return success_response({"assigned_count": count, "skipped_count": skipped}, f"Assigned {count} students to advisor")

@staff_bp.route("/assign-counsellor", methods=["POST"])
@jwt_required()
def assign_counsellor():
    """Advisor assigns students to a Counsellor"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # 1. Advisor Check
    if not is_advisor(user) and not is_admin(user) and not is_hod(user, None):
         return error_response("Access Denied. Advisor role required.", 403)
         
    data = request.get_json()
    counsellor_id = data.get("counsellor_id")
    student_ids = data.get("student_ids", [])
    
    if not counsellor_id or not student_ids:
         return error_response("Missing counsellor_id or student_ids")
         
    # 2. Verify Counsellor
    counsellor = User.query.get(counsellor_id)
    if not counsellor or not is_counsellor(counsellor):
         return error_response("Invalid counsellor selected", 400)
         
    # Logic: Advisor can usually assign ANY student linked to them
    # But if user is dual role (HOD+Advisor), they might assign department students.
    # We'll enforce: Student must be assigned to current user (as Advisor) OR User is HOD/Admin.
    
    count = 0
    skipped = 0
    for sid in student_ids:
        # Check permissions over student
        if not is_admin(user) and not is_hod(user, None):
             # Must be my student
             is_my_student = StudentAdvisor.query.filter_by(student_id=sid, advisor_user_id=current_user_id).first()
             if not is_my_student:
                 skipped += 1
                 continue
        
        # Upsert Counsellor assignment
        assignment = StudentCounsellor.query.filter_by(student_id=sid).first()
        if assignment:
            assignment.counsellor_user_id = counsellor_id
        else:
            assignment = StudentCounsellor(student_id=sid, counsellor_user_id=counsellor_id)
            db.session.add(assignment)
        count += 1
        
    db.session.commit()
    return success_response({"assigned_count": count, "skipped_count": skipped}, f"Assigned {count} students to counsellor")
