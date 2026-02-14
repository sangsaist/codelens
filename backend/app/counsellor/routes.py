
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.students.models import Student
from app.academics.models import Department, DepartmentCounsellor
from app.platforms.models import PlatformAccount
from app.snapshots.models import PlatformSnapshot
from app.auth.models import User
from app.common.utils import success_response, error_response, is_counsellor
from sqlalchemy import func
from datetime import datetime, timedelta

counsellor_bp = Blueprint("counsellor_bp", __name__, url_prefix="/analytics/counsellor")

from app.staff.models import StaffProfile

def get_assigned_department(user_id):
    # Check StaffProfile table
    profile = StaffProfile.query.filter_by(user_id=user_id).first()
    return profile.department if profile else None

@counsellor_bp.route("/summary", methods=["GET"])
@jwt_required()
def get_counsellor_summary():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_counsellor(user):
        return error_response("Access Denied. Counsellor role required.", 403)
        
    department = get_assigned_department(current_user_id)
    if not department:
        return error_response("No department assigned to this counsellor.", 404)
        
    # Get students in this department
    students = Student.query.filter_by(department_id=department.id).all()
    total_students = len(students)
    
    total_solved = 0
    total_growth = 0
    at_risk_count = 0
    
    cutoff_date = datetime.utcnow().date() - timedelta(days=30)
    
    for student in students:
        accounts = PlatformAccount.query.filter_by(student_id=student.id).all()
        student_total = 0
        student_growth = 0
        has_recent = False
        
        for account in accounts:
            snapshots = PlatformSnapshot.query.filter_by(platform_account_id=account.id, status="approved")\
                .order_by(PlatformSnapshot.snapshot_date.desc())\
                .limit(2)\
                .all()
                
            if snapshots:
                latest = snapshots[0]
                student_total += latest.total_solved
                if latest.snapshot_date >= cutoff_date:
                    has_recent = True
                    
                if len(snapshots) >= 2:
                    student_growth += (latest.total_solved - snapshots[1].total_solved)
        
        total_solved += student_total
        total_growth += student_growth
        
        if not has_recent or student_growth <= 0:
            at_risk_count += 1
            
    avg_growth = round(total_growth / total_students, 2) if total_students > 0 else 0
    
    return success_response({
        "department_name": department.name,
        "total_students": total_students,
        "total_solved": total_solved,
        "average_growth": avg_growth,
        "at_risk_count": at_risk_count
    })

@counsellor_bp.route("/students", methods=["GET"])
@jwt_required()
def get_department_students():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_counsellor(user):
        return error_response("Access Denied", 403)
        
    department = get_assigned_department(current_user_id)
    if not department:
        return error_response("No department assigned", 404)
        
    students = Student.query.filter_by(department_id=department.id).all()
    
    data = []
    cutoff_date = datetime.utcnow().date() - timedelta(days=30)
    
    for student in students:
        accounts = PlatformAccount.query.filter_by(student_id=student.id).all()
        total_solved = 0
        growth = 0
        last_active = None
        is_risk = False
        
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
                    growth += (latest.total_solved - snapshots[1].total_solved)

        # Risk Logic
        if not last_active or last_active < cutoff_date or growth <= 0:
            is_risk = True
            
        data.append({
            "student_id": student.id,
            "full_name": student.user.full_name,
            "total_solved": total_solved,
            "growth": growth,
            "last_active": last_active.isoformat() if last_active else "Never",
            "is_risk": is_risk
        })
        
    return success_response(data)

@counsellor_bp.route("/at-risk", methods=["GET"])
@jwt_required()
def get_at_risk_only():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_counsellor(user):
        return error_response("Access Denied", 403)
        
    department = get_assigned_department(current_user_id)
    if not department:
        return error_response("No department assigned", 404)
        
    students = Student.query.filter_by(department_id=department.id).all()
    at_risk_data = []
    cutoff_date = datetime.utcnow().date() - timedelta(days=30)
    
    for student in students:
        accounts = PlatformAccount.query.filter_by(student_id=student.id).all()
        total_solved = 0
        growth = 0
        last_active = None
        has_recent = False
        
        for account in accounts:
            snapshots = PlatformSnapshot.query.filter_by(platform_account_id=account.id, status="approved")\
                .order_by(PlatformSnapshot.snapshot_date.desc())\
                .limit(2)\
                .all()
            
            if snapshots:
                latest = snapshots[0]
                total_solved += latest.total_solved
                if latest.snapshot_date >= cutoff_date:
                    has_recent = True
                
                if last_active is None or latest.snapshot_date > last_active:
                    last_active = latest.snapshot_date
                
                if len(snapshots) >= 2:
                    growth += (latest.total_solved - snapshots[1].total_solved)
        
        reason = ""
        if not has_recent:
            reason = "Inactive (>30 days)"
        elif growth <= 0:
            reason = "No Growth"
            
        if reason:
            at_risk_data.append({
                "student_id": student.id,
                "full_name": student.user.full_name,
                "total_solved": total_solved,
                "growth": growth,
                "last_active": last_active.isoformat() if last_active else "Never",
                "reason": reason
            })
            
    return success_response(at_risk_data)
