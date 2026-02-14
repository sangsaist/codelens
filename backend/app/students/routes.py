
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.students.models import Student
from app.academics.models import Department
from app.auth.models import User
from app.common.utils import success_response, error_response, is_admin

students_bp = Blueprint("students_bp", __name__, url_prefix="/students")

@students_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_students():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Check Admin Role
    if not is_admin(user):
        return error_response("Access denied. Admin role required.", 403)
    
    try:
        # Join User to get names
        students = db.session.query(Student, User).join(User, Student.user_id == User.id).all()
        
        response_data = []
        for student, user in students:
            dept_name = student.department.name if student.department else None
            response_data.append({
                "id": student.id,
                "full_name": user.full_name,
                "email": user.email,
                "register_number": student.register_number,
                "admission_year": student.admission_year,
                "department_id": student.department_id,
                "department_name": dept_name
            })
            
        return success_response(response_data, "Students fetched successfully")
    except Exception as e:
        return error_response(f"Failed to fetch students: {str(e)}", 500)

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

@students_bp.route("/<student_id>/unassign-department", methods=["PUT"])
@jwt_required()
def unassign_department(student_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not is_admin(user):
        return error_response("Access denied. Admin role required.", 403)

    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)

    try:
        student.department_id = None
        db.session.commit()

        response_data = {
            "student_id": student.id,
            "department_id": None
        }
        return success_response(response_data, "Student unassigned from department")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to unassign department: {str(e)}", 500)

from app.platforms.models import PlatformAccount
from app.snapshots.models import PlatformSnapshot
from app.auth.models import UserRole

@students_bp.route("/<student_id>", methods=["DELETE"])
@jwt_required()
def delete_student(student_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not is_admin(user):
        return error_response("Access denied. Admin role required.", 403)

    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)
    
    try:
        user_id = student.user_id
        
        # 1. Get Account IDs
        account_ids = [acc.id for acc in student.platform_accounts]
        
        # 2. Delete Snapshots (Bulk)
        if account_ids:
            PlatformSnapshot.query.filter(PlatformSnapshot.platform_account_id.in_(account_ids)).delete(synchronize_session=False)
        
        # 3. Delete Platform Accounts (Bulk)
        if account_ids:
            PlatformAccount.query.filter(PlatformAccount.id.in_(account_ids)).delete(synchronize_session=False)

        # 4. Delete Student (Bulk) to avoid session cascade issues
        Student.query.filter(Student.id == student_id).delete(synchronize_session=False)
        
        # 5. Delete User Roles (Manual cleanup just in case)
        if user_id:
            UserRole.query.filter(UserRole.user_id == user_id).delete(synchronize_session=False)

        # 6. Delete User (Bulk)
        if user_id:
            User.query.filter(User.id == user_id).delete(synchronize_session=False)
            
        db.session.commit()
        return success_response(None, "Student deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete student: {str(e)}", 500)
