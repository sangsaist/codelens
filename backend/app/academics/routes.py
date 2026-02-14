
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.academics.models import Department
from app.auth.models import User
from app.common.utils import success_response, error_response, is_admin

academics_bp = Blueprint("academics", __name__, url_prefix="/academics")

@academics_bp.route("/departments", methods=["POST"])
@jwt_required()
def create_department():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not is_admin(user):
        return error_response("Admin access required", 403)

    data = request.get_json()
    if not data:
         return error_response("No input data provided")

    name = data.get("name")
    code = data.get("code")
    hod_id = data.get("hod_id")

    if not name or not code:
        return error_response("Name and Code required")
    
    if hod_id:
        hod_user = User.query.get(hod_id)
        if not hod_user:
            return error_response("Invalid HOD user id", 404)

    existing = Department.query.filter_by(code=code).first()
    if existing:
        return error_response("Department code already exists", 409)

    department = Department(
        name=name,
        code=code,
        hod_id=hod_id if hod_id else None
    )

    try:
        db.session.add(department)
        db.session.commit()
        return success_response(department.to_dict(), "Department created", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create department: {str(e)}", 500)

@academics_bp.route("/departments", methods=["GET"])
@jwt_required()
def get_departments():
    departments = Department.query.all()
    return success_response([d.to_dict() for d in departments])

@academics_bp.route("/departments/<dept_id>", methods=["GET"])
@jwt_required()
def get_department(dept_id):
    department = Department.query.get(dept_id)
    if not department:
        return error_response("Department not found", 404)
        
    return success_response(department.to_dict())

@academics_bp.route("/departments/<dept_id>", methods=["DELETE"])
@jwt_required()
def delete_department(dept_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not is_admin(user):
        return error_response("Admin access required", 403)

    department = Department.query.get(dept_id)
    if not department:
        return error_response("Department not found", 404)

    if department.students:
        return error_response("Cannot delete department. Students are assigned.", 400)

    try:
        db.session.delete(department)
        db.session.commit()
        return success_response(None, "Department deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete department: {str(e)}", 500)
