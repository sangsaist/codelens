
from flask import Blueprint, request
from app.extensions import db
from app.auth.models import User, Role, UserRole
from app.students.models import Student
from app.common.utils import hash_password, verify_password, success_response, error_response
from flask_jwt_extended import create_access_token
from datetime import datetime

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return error_response("No input data provided")

    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")

    if not email or not password or not full_name:
        return error_response("Missing required fields: email, password, full_name")

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return error_response("Email already registered", 409)

    hashed_pw = hash_password(password)

    new_user = User(
        email=email,
        password_hash=hashed_pw,
        full_name=full_name
    )

    try:
        db.session.add(new_user)
        db.session.flush()

        # Assign default student role
        student_role = Role.query.filter_by(name="student").first()
        if not student_role:
             db.session.rollback()
             return error_response("System error: Default role 'student' not found.", 500)

        user_role = UserRole(
            user_id=new_user.id,
            role_id=student_role.id
        )
        db.session.add(user_role)

        # Create student profile
        admission_year = datetime.now().year
        student_profile = Student(
            user_id=new_user.id,
            register_number=f"REG{new_user.id[:8].upper()}",
            admission_year=admission_year
        )
        db.session.add(student_profile)

        db.session.commit()
        return success_response({"user_id": new_user.id}, "User registered successfully", 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f"Registration failed: {str(e)}", 500)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return error_response("No input data provided")

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return error_response("Email and password required")

    user = User.query.filter_by(email=email).first()

    if not user or not verify_password(password, user.password_hash):
        return error_response("Invalid credentials", 401)

    access_token = create_access_token(identity=user.id)

    return success_response({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "roles": [r.role.name for r in user.roles if r.role]
        }
    }, "Login successful")
