from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.academics.models import Department
from app.auth.models import User, Role, UserRole

academics_bp = Blueprint("academics", __name__, url_prefix="/academics")

def is_admin(user_id):
    # Check if user has admin role
    return db.session.query(UserRole)\
        .join(Role)\
        .filter(
            UserRole.user_id == user_id,
            Role.name == "admin"
        ).first() is not None

@academics_bp.route("/departments", methods=["POST"])
@jwt_required()
def create_department():
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    name = data.get("name")
    code = data.get("code")
    hod_id = data.get("hod_id")

    if not name or not code:
        return jsonify({"error": "Name and Code required"}), 400
    
    if hod_id:
        hod_user = User.query.get(hod_id)
        if not hod_user:
            return jsonify({"error": "Invalid HOD user id"}), 400

    existing = Department.query.filter_by(code=code).first()
    if existing:
        return jsonify({"error": "Department code already exists"}), 400

    department = Department(
        name=name,
        code=code,
        hod_id=hod_id if hod_id else None
    )

    db.session.add(department)
    db.session.commit()

    return jsonify(department.to_dict()), 201

@academics_bp.route("/departments", methods=["GET"])
@jwt_required()
def get_departments():
    departments = Department.query.all()
    return jsonify([d.to_dict() for d in departments]), 200

@academics_bp.route("/departments/<dept_id>", methods=["GET"])
@jwt_required()
def get_department(dept_id):
    department = Department.query.get(dept_id)
    if not department:
        return jsonify({"error": "Department not found"}), 404
        
    return jsonify(department.to_dict()), 200
