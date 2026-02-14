
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.students.models import Student, StudentAdvisor
from app.platforms.models import PlatformAccount
from app.snapshots.models import PlatformSnapshot
from app.auth.models import User
from app.common.utils import success_response, error_response, is_advisor

advisor_bp = Blueprint("advisor_bp", __name__, url_prefix="/analytics/advisor")

@advisor_bp.route("/my-students", methods=["GET"])
@jwt_required()
def get_my_students():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_advisor(user):
        return error_response("Access Denied. Advisor role required.", 403)

    # Get students assigned to this advisor
    assignments = StudentAdvisor.query.filter_by(advisor_user_id=current_user_id).all()
    student_ids = [a.student_id for a in assignments]
    
    if not student_ids:
        return success_response([], "No students assigned.")

    students = Student.query.filter(Student.id.in_(student_ids)).all()
    
    data = []
    for student in students:
        # Aggregation Logic
        total_solved = 0
        total_growth = 0
        last_active = None
        
        accounts = PlatformAccount.query.filter_by(student_id=student.id).all()
        for account in accounts:
            snapshots = PlatformSnapshot.query.filter_by(platform_account_id=account.id, status="approved")\
                .order_by(PlatformSnapshot.snapshot_date.desc())\
                .limit(2)\
                .all()
            
            if snapshots:
                latest = snapshots[0]
                total_solved += latest.total_solved
                if last_active is None or latest.snapshot_date > last_active:
                    last_active = latest.snapshot_date
                
                if len(snapshots) >= 2:
                    total_growth += (latest.total_solved - snapshots[1].total_solved)

        data.append({
            "student_id": student.id,
            "full_name": student.user.full_name,
            "department_name": student.department.name if student.department else "Unassigned",
            "total_solved": total_solved,
            "growth": total_growth,
            "last_active_date": last_active.isoformat() if last_active else "Never"
        })
        
    return success_response(data)

@advisor_bp.route("/student/<student_id>", methods=["GET"])
@jwt_required()
def get_student_detail(student_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_advisor(user):
        return error_response("Access Denied", 403)
        
    # Check assignment
    assignment = StudentAdvisor.query.filter_by(advisor_user_id=current_user_id, student_id=student_id).first()
    if not assignment:
        return error_response("Student not assigned to you", 403)
        
    student = Student.query.get(student_id)
    if not student:
        return error_response("Student not found", 404)
        
    # Logic copied from get_my_summary (reusing structure)
    department_name = student.department.name if student.department else None
    accounts = PlatformAccount.query.filter_by(student_id=student.id).all()

    platform_summary_list = []
    overall_total_solved = 0
    total_rating_sum = 0
    platforms_with_rating_count = 0
    overall_growth = 0

    for account in accounts:
        snapshots = PlatformSnapshot.query.filter_by(platform_account_id=account.id, status="approved")\
            .order_by(PlatformSnapshot.snapshot_date.desc())\
            .limit(2)\
            .all()

        latest_total_solved = 0
        latest_rating = 0
        last_snapshot_date = None
        total_growth = 0
        growth_percentage = 0

        if snapshots:
            latest = snapshots[0]
            latest_total_solved = latest.total_solved
            latest_rating = latest.contest_rating if latest.contest_rating else 0
            last_snapshot_date = latest.snapshot_date.isoformat()

            overall_total_solved += latest_total_solved
            
            if latest.contest_rating:
                total_rating_sum += latest.contest_rating
                platforms_with_rating_count += 1

            if len(snapshots) >= 2:
                previous = snapshots[1]
                previous_total = previous.total_solved
                total_growth = latest_total_solved - previous_total
                
                if previous_total > 0:
                    growth_percentage = (total_growth / previous_total) * 100
            
            overall_growth += total_growth

        platform_summary_list.append({
            "platform_account_id": account.id,
            "platform_name": account.platform_name,
            "username": account.username,
            "latest_total_solved": latest_total_solved,
            "latest_rating": latest_rating,
            "last_snapshot_date": last_snapshot_date,
            "total_growth": total_growth,
            "growth_percentage": round(growth_percentage, 2)
        })

    overall_rating_average = 0
    if platforms_with_rating_count > 0:
        overall_rating_average = total_rating_sum / platforms_with_rating_count

    response_data = {
        "student_info": {
            "student_id": student.id,
            "full_name": student.user.full_name,
            "email": student.user.email,
            "register_number": student.register_number,
            "admission_year": student.admission_year,
            "department_name": department_name
        },
        "platform_summary": platform_summary_list,
        "overall_aggregation": {
            "total_platforms_linked": len(accounts),
            "overall_total_solved": overall_total_solved,
            "overall_rating_average": round(overall_rating_average, 2),
            "overall_growth": overall_growth
        }
    }
    
    return success_response(response_data)
