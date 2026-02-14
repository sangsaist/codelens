
import os
from flask import Blueprint, request, current_app
from app.extensions import db
from app.auth.models import User, Role, UserRole
from app.common.utils import hash_password, success_response, error_response

setup_bp = Blueprint("setup_bp", __name__, url_prefix="/setup")

@setup_bp.route("/bootstrap-admin", methods=["POST"])
def bootstrap_admin():
    # Check if environment is development
    if not current_app.debug:
        return error_response("Bootstrap only allowed in development", 403)

    data = request.get_json()
    if not data:
        return error_response("No input data provided")

    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")

    if not email or not password or not full_name:
        return error_response("Missing required fields: email, password, full_name")

    # Check/Create Roles first to ensure they exist
    admin_role = Role.query.filter_by(name="admin").first()
    if not admin_role:
        admin_role = Role(name="admin")
        db.session.add(admin_role)
    
    student_role = Role.query.filter_by(name="student").first()
    if not student_role:
        student_role = Role(name="student")
        db.session.add(student_role)
    
    # Flush to get IDs if created
    db.session.flush()

    user = User.query.filter_by(email=email).first()

    if user:
        # User exists, ensure admin role
        existing_admin_role = UserRole.query.filter_by(user_id=user.id, role_id=admin_role.id).first()
        if not existing_admin_role:
            user_admin_role = UserRole(user_id=user.id, role_id=admin_role.id)
            db.session.add(user_admin_role)
            db.session.commit()
            return success_response(None, "Admin role assigned to existing user")
        else:
            return success_response(None, "User already has admin role")

    else:
        # Create new user
        hashed_pw = hash_password(password)
        new_user = User(
            email=email,
            password_hash=hashed_pw,
            full_name=full_name
        )
        db.session.add(new_user)
        db.session.flush() # Get ID

        # Assign both student and admin roles
        # Student role
        user_student_role = UserRole(user_id=new_user.id, role_id=student_role.id)
        db.session.add(user_student_role)

        # Admin role
        user_admin_role = UserRole(user_id=new_user.id, role_id=admin_role.id)
        db.session.add(user_admin_role)

        db.session.commit()
        return success_response(None, "Admin bootstrapped successfully")
