from flask import Blueprint, request, jsonify
from app.extensions import db
from app.auth.models import User, Role, UserRole
from app.common.utils import hash_password
from flask_jwt_extended import create_access_token
from app.common.utils import verify_password
from app.students.models import Student


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    full_name = data.get("full_name")

    if not email or not password or not full_name:
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 400

    hashed_pw = hash_password(password)

    new_user = User(
        email=email,
        password_hash=hashed_pw,
        full_name=full_name
    )

    db.session.add(new_user)
    db.session.flush()  # get new_user.id before commit

    # Assign default student role
    student_role = Role.query.filter_by(name="student").first()

    user_role = UserRole(
        user_id=new_user.id,
        role_id=student_role.id
    )

    db.session.add(user_role)

    # Create student profile
    student_profile = Student(
        user_id=new_user.id,
        register_number=f"REG{new_user.id[:8]}",
        admission_year=2026
    )

    db.session.add(student_profile)

    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)

    return jsonify({
        "message": "Login successful",
        "access_token": access_token
    }), 200
