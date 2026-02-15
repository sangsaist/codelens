
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.extensions import db
from app.snapshots.models import PlatformSnapshot
from app.platforms.models import PlatformAccount
from app.students.models import Student, StudentCounsellor
from app.academics.models import Department, DepartmentCounsellor
from app.auth.models import User
from app.common.utils import success_response, error_response, is_counsellor

review_bp = Blueprint("review_bp", __name__, url_prefix="/counsellor")

from app.staff.models import StaffProfile

def get_assigned_department(user_id):
    profile = StaffProfile.query.filter_by(user_id=user_id).first()
    return profile.department if profile else None

@review_bp.route("/pending-snapshots", methods=["GET"])
@jwt_required()
def get_pending_snapshots():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_counsellor(user):
        return error_response("Access denied. Counsellor role required.", 403)
        
    department = get_assigned_department(current_user_id)
    # Even if department is missing, we rely on StudentCounsellor assignment now.
        
    # Get all pending snapshots for assigned students
    pending_snapshots = db.session.query(
        PlatformSnapshot.id,
        PlatformSnapshot.total_solved,
        PlatformSnapshot.contest_rating,
        PlatformSnapshot.snapshot_date,
        PlatformSnapshot.created_at,
        PlatformAccount.platform_name,
        PlatformAccount.username,
        User.full_name.label("student_name"),
        Student.register_number
    ).join(PlatformAccount, PlatformSnapshot.platform_account_id == PlatformAccount.id)\
     .join(Student, PlatformAccount.student_id == Student.id)\
     .join(User, Student.user_id == User.id)\
     .join(StudentCounsellor, Student.id == StudentCounsellor.student_id)\
     .filter(
         PlatformSnapshot.status == "pending",
         StudentCounsellor.counsellor_user_id == current_user_id
     ).order_by(PlatformSnapshot.created_at.desc()).all()
     
    data = []
    for s in pending_snapshots:
        data.append({
            "snapshot_id": s.id,
            "student_name": s.student_name,
            "register_number": s.register_number,
            "platform_name": s.platform_name,
            "username": s.username,
            "total_solved": s.total_solved,
            "contest_rating": s.contest_rating,
            "snapshot_date": s.snapshot_date.isoformat(),
            "submitted_at": s.created_at.isoformat()
        })
        
    return success_response(data)

@review_bp.route("/snapshots/<snapshot_id>/approve", methods=["PUT"])
@jwt_required()
def approve_snapshot(snapshot_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_counsellor(user):
        return error_response("Access denied.", 403)
        
    snapshot = PlatformSnapshot.query.get(snapshot_id)
    if not snapshot:
        return error_response("Snapshot not found", 404)
        
    # Verify assignment
    student = snapshot.platform_account.student
    assignment = StudentCounsellor.query.filter_by(
        student_id=student.id,
        counsellor_user_id=current_user_id
    ).first()
    
    if not assignment:
        return error_response("Unauthorized. Student is not assigned to you.", 403)
        
    if snapshot.status != "pending":
        return error_response(f"Snapshot is already {snapshot.status}", 400)
        
    snapshot.status = "approved"
    snapshot.reviewed_by = current_user_id
    snapshot.reviewed_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return success_response(None, "Snapshot approved successfully.")
    except Exception as e:
        db.session.rollback()
        return error_response("Failed to approve snapshot", 500)

@review_bp.route("/snapshots/<snapshot_id>/reject", methods=["PUT"])
@jwt_required()
def reject_snapshot(snapshot_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not is_counsellor(user):
        return error_response("Access denied.", 403)
        
    snapshot = PlatformSnapshot.query.get(snapshot_id)
    if not snapshot:
        return error_response("Snapshot not found", 404)
        
    student = snapshot.platform_account.student
    assignment = StudentCounsellor.query.filter_by(
        student_id=student.id,
        counsellor_user_id=current_user_id
    ).first()
    
    if not assignment:
        return error_response("Unauthorized. Student is not assigned to you.", 403)
        
    if snapshot.status != "pending":
        return error_response(f"Snapshot is already {snapshot.status}", 400)
        
    data = request.get_json()
    remarks = data.get("remarks", "Rejected by counsellor")
    
    snapshot.status = "rejected"
    snapshot.reviewed_by = current_user_id
    snapshot.reviewed_at = datetime.utcnow()
    snapshot.remarks = remarks
    
    try:
        db.session.commit()
        return success_response(None, "Snapshot rejected.")
    except Exception as e:
        db.session.rollback()
        return error_response("Failed to reject snapshot", 500)
