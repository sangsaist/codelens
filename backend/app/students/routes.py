
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.students.models import Student
from app.academics.models import Department
from app.auth.models import User
from app.common.utils import success_response, error_response, is_admin

students_bp = Blueprint("students_bp", __name__, url_prefix="/students")

@students_bp.route("/<student_id>/assign-department", methods=["PUT"])
@jwt_required()
def assign_department(student_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check Admin Role
    if not is_admin(user):
        return error_response("Access denied. Admin role required.", 403)

    # Get Data
    data = request.get_json()
    if not data:
        return error_response("No input data provided")
        
    department_id = data.get("department_id")
    if not department_id:
        return error_response("Missing required field: department_id")

    # Validate Student (exists check)
    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)

    # Validate Department (exists check)
    department = Department.query.get(department_id)
    if not department:
        return error_response("Department not found", 404)

    # Update Student Department
    try:
        student.department_id = department_id
        db.session.commit()
        
        # Return response in exact format requested
        response_data = {
            "student_id": student.id,
            "department_id": student.department_id,
            "department_name": department.name
        }
        
        return success_response(response_data, "Student assigned to department successfully")
        
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to assign department: {str(e)}", 500)
