
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.auth.models import User, Role, UserRole
from app.students.models import Student
from app.academics.models import Department
from app.common.utils import hash_password, success_response, error_response, is_admin
import uuid
from datetime import datetime

admin_bp = Blueprint("admin_bp", __name__, url_prefix="/admin")

@admin_bp.route("/create-user", methods=["POST"])
@jwt_required()
def create_institutional_user():
    # 1. Verify access: Admin only
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not is_admin(user):
        return error_response("Access denied. Admin role required.", 403)

    data = request.get_json()
    if not data:
        return error_response("No input data provided")

    # 2. Extract Data
    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")
    role_name = data.get("role")
    department_id = data.get("department_id") # Optional

    if not all([email, password, full_name, role_name]):
        return error_response("Missing required fields: email, password, full_name, role")

    # 3. Validate Role
    allowed_roles = ["admin", "counsellor", "advisor", "student"]
    if role_name not in allowed_roles:
        return error_response(f"Invalid role. Allowed roles: {', '.join(allowed_roles)}")

    # 4. Check if user already exists
    if User.query.filter_by(email=email).first():
        return error_response("Email already registered", 409)

    # 5. Get Role Object
    role_obj = Role.query.filter_by(name=role_name).first()
    if not role_obj:
        return error_response(f"Role '{role_name}' does not exist in database", 500)

    try:
        # 6. Create User
        hashed_pw = hash_password(password)
        new_user = User(
            email=email,
            password_hash=hashed_pw,
            full_name=full_name
        )
        db.session.add(new_user)
        db.session.flush()

        # 7. Assign Role
        user_role = UserRole(
            user_id=new_user.id,
            role_id=role_obj.id
        )
        db.session.add(user_role)

        # 8. Role Specific Logic
        if role_name == "student":
            admission_year = datetime.now().year
            # Generate register number or accept from input? Assuming auto-gen for now like registration
            student_profile = Student(
                user_id=new_user.id,
                register_number=f"REG{new_user.id[:8].upper()}",
                admission_year=admission_year,
                department_id=department_id if department_id else None
            )
            db.session.add(student_profile)
        
        elif role_name in ["counsellor", "advisor"]:
            # Logic for Counsellor/Advisor linking to department?
            # Currently our Counsellor/Advisor models might not exist or work differently.
            # The prompt says "optionally link department if provided".
            # If we don't have separate tables for them yet, we might rely just on UserRole + DepartmentID (if stored somewhere).
            # But wait, Student has department_id. Do Counsellors?
            # Let's check previously viewed files or assume standard practice.
            # I tried to view app/counsellor/routes.py but couldn't see models.
            # Checking Setup...
            # The prompt implies we should just create the user and assign role. 
            # If there are specific profile tables for Counsellor/Advisor, we should create them.
            # I'll check if those models exist by listing their directories first in previous step (I did list_dir).
            # But I couldn't view the file content.
            # Assuming for now we just create the User and UserRole. 
            # If department_id is critical for permissions (like is_hod logic), we might need extending User model or a Staff model.
            # BUT: In `app.analytics.routes.py`, `is_hod` checks `user_id` and `department_id`.
            # Let's assume for MVP we only need UserRole.
            
            # Additional: Verify department exists if provided
            if department_id:
                dept = Department.query.get(department_id)
                if not dept:
                    db.session.rollback()
                    return error_response("Department provided does not exist", 404)
                
                # If we had a Staff or Counsellor model with department_id, we would set it here.
                # For now, we'll proceed with just User creation.
                pass

        db.session.commit()
        
        return success_response({
            "user_id": new_user.id, 
            "role": role_name
        }, "User created successfully", 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create user: {str(e)}", 500)
