
from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.students.models import Student
from app.platforms.models import PlatformAccount
from app.snapshots.models import PlatformSnapshot
from app.academics.models import Department
from app.auth.models import User
from app.common.utils import success_response, error_response, is_admin, is_hod, is_counsellor

analytics_bp = Blueprint("analytics_bp", __name__, url_prefix="/analytics")

@analytics_bp.route("/my-growth/<platform_account_id>", methods=["GET"])
@jwt_required()
def get_my_growth(platform_account_id):
    current_user_id = get_jwt_identity()

    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Student not found.", 403)

    account = PlatformAccount.query.filter_by(id=platform_account_id).first()
    if not account:
        return error_response("Platform account not found", 404)

    if account.student_id != student.id:
        return error_response("Unauthorized. This platform account does not belong to you.", 403)

    snapshots = PlatformSnapshot.query.filter_by(platform_account_id=account.id)\
        .order_by(PlatformSnapshot.snapshot_date.desc())\
        .limit(2)\
        .all()

    if len(snapshots) < 2:
        return error_response("Not enough snapshots to calculate growth")

    latest = snapshots[0]
    previous = snapshots[1]

    latest_total = latest.total_solved
    previous_total = previous.total_solved
    total_growth = latest_total - previous_total

    latest_rating = latest.contest_rating if latest.contest_rating is not None else 0
    previous_rating = previous.contest_rating if previous.contest_rating is not None else 0
    rating_growth = latest_rating - previous_rating

    growth_percentage = (total_growth / previous_total * 100) if previous_total > 0 else 0

    return success_response({
        "platform_account_id": account.id,
        "latest_snapshot_date": latest.snapshot_date.isoformat(),
        "previous_snapshot_date": previous.snapshot_date.isoformat(),
        "latest_total_solved": latest_total,
        "previous_total_solved": previous_total,
        "total_growth": total_growth,
        "growth_percentage": round(growth_percentage, 2),
        "latest_rating": latest_rating,
        "previous_rating": previous_rating,
        "rating_growth": rating_growth
    })

def check_department_access_level(user_id, department_id):
    user = User.query.get(user_id)
    if is_admin(user) or is_counsellor(user):
        return True
    if is_hod(user, department_id):
        return True
    return False

@analytics_bp.route("/department/<department_id>/leaderboard", methods=["GET"])
@jwt_required()
def get_department_leaderboard(department_id):
    current_user_id = get_jwt_identity()
    
    # Valdiate department exists
    department = Department.query.get(department_id)
    if not department:
        return error_response("Department not found", 404)

    # Access Control
    if not check_department_access_level(current_user_id, department_id):
        return error_response("Unauthorized access to this department leaderboard", 403)

    # MVP Leaderboard Logic
    students = Student.query.filter_by(department_id=department_id).all()
    
    leaderboard_data = []
    
    for student in students:
        total_solved = 0
        
        accounts = PlatformAccount.query.filter_by(student_id=student.id).all()
        for account in accounts:
            latest_snapshot = PlatformSnapshot.query.filter_by(platform_account_id=account.id)\
                .order_by(PlatformSnapshot.snapshot_date.desc())\
                .first()
            if latest_snapshot:
                total_solved += latest_snapshot.total_solved
        
        leaderboard_data.append({
            "student_id": student.id,
            "full_name": student.user.full_name if student.user else "Unknown",
            "total_solved": total_solved
        })
    
    # Sort descending
    leaderboard_data.sort(key=lambda x: x["total_solved"], reverse=True)
    
    # Assign ranks
    for index, entry in enumerate(leaderboard_data):
        entry["rank"] = index + 1
        
    return success_response({
        "department_id": department.id,
        "department_name": department.name,
        "total_students": len(students),
        "leaderboard": leaderboard_data
    })

@analytics_bp.route("/my-summary", methods=["GET"])
@jwt_required()
def get_my_summary():
    current_user_id = get_jwt_identity()

    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Only students access this dashboard.", 403)

    # Fetch Department Name
    department_name = student.department.name if student.department else None

    # Fetch Platform Accounts
    accounts = PlatformAccount.query.filter_by(student_id=student.id).all()

    platform_summary_list = []
    
    overall_total_solved = 0
    total_rating_sum = 0
    platforms_with_rating_count = 0
    overall_growth = 0

    for account in accounts:
        # Fetch last 2 snapshots efficiently
        snapshots = PlatformSnapshot.query.filter_by(platform_account_id=account.id)\
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

            # Global aggregation
            overall_total_solved += latest_total_solved
            
            if latest.contest_rating:
                total_rating_sum += latest.contest_rating
                platforms_with_rating_count += 1

            # Growth Calculation
            if len(snapshots) >= 2:
                previous = snapshots[1]
                previous_total = previous.total_solved
                total_growth = latest_total_solved - previous_total
                
                if previous_total > 0:
                    growth_percentage = (total_growth / previous_total) * 100
                else:
                    growth_percentage = 0
            
            # Aggregate growth
            overall_growth += total_growth

        platform_summary_list.append({
            "platform_name": account.platform_name,
            "username": account.username,
            "latest_total_solved": latest_total_solved,
            "latest_rating": latest_rating,
            "last_snapshot_date": last_snapshot_date,
            "total_growth": total_growth,
            "growth_percentage": round(growth_percentage, 2)
        })

    # Overall Averages
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

    return success_response(response_data, "Student summary fetched successfully")
