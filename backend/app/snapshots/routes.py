
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.extensions import db
from app.snapshots.models import PlatformSnapshot
from app.platforms.models import PlatformAccount
from app.students.models import Student
from app.common.utils import success_response, error_response

snapshots_bp = Blueprint("snapshots_bp", __name__, url_prefix="/snapshots")

@snapshots_bp.route("", methods=["POST"])
@jwt_required()
def create_snapshot():
    current_user_id = get_jwt_identity()

    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Only students can create snapshots.", 403)

    data = request.get_json()
    if not data:
        return error_response("No input data provided")

    platform_account_id = data.get("platform_account_id")
    total_solved = data.get("total_solved")
    snapshot_date_str = data.get("snapshot_date")

    if not platform_account_id or total_solved is None or not snapshot_date_str:
        return error_response("Missing required fields: platform_account_id, total_solved, snapshot_date")

    # Validate Platform Account Ownership
    platform_account = PlatformAccount.query.filter_by(id=platform_account_id).first()
    if not platform_account:
        return error_response("Platform account not found", 404)
    
    if platform_account.student_id != student.id:
        return error_response("Unauthorized. This platform account does not belong to you.", 403)

    try:
        snapshot_date = datetime.strptime(snapshot_date_str, "%Y-%m-%d").date()
    except ValueError:
        return error_response("Invalid date format. Use YYYY-MM-DD")

    # Check for duplicate snapshot on same date
    existing_snapshot = PlatformSnapshot.query.filter_by(
        platform_account_id=platform_account_id,
        snapshot_date=snapshot_date
    ).first()

    if existing_snapshot:
        return error_response(f"Snapshot for date {snapshot_date} already exists.", 409)

    new_snapshot = PlatformSnapshot(
        platform_account_id=platform_account_id,
        total_solved=total_solved,
        contest_rating=data.get("contest_rating"),
        global_rank=data.get("global_rank"),
        snapshot_date=snapshot_date
    )

    try:
        db.session.add(new_snapshot)
        db.session.commit()
        return success_response(new_snapshot.to_dict(), "Snapshot created", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create snapshot: {str(e)}", 500)

@snapshots_bp.route("/<platform_account_id>", methods=["GET"])
@jwt_required()
def get_snapshots(platform_account_id):
    current_user_id = get_jwt_identity()

    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Student not found.", 403)

    # Validate Ownership
    platform_account = PlatformAccount.query.filter_by(id=platform_account_id).first()
    if not platform_account:
        return error_response("Platform account not found", 404)
    
    if platform_account.student_id != student.id:
        return error_response("Unauthorized access.", 403)

    snapshots = PlatformSnapshot.query.filter_by(platform_account_id=platform_account_id)\
        .order_by(PlatformSnapshot.snapshot_date.desc()).all()
    
    return success_response([s.to_dict() for s in snapshots])

@snapshots_bp.route("/<platform_account_id>/latest", methods=["GET"])
@jwt_required()
def get_latest_snapshot(platform_account_id):
    current_user_id = get_jwt_identity()

    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Student not found.", 403)

    # Validate Ownership
    platform_account = PlatformAccount.query.filter_by(id=platform_account_id).first()
    if not platform_account:
        return error_response("Platform account not found", 404)
    
    if platform_account.student_id != student.id:
        return error_response("Unauthorized access.", 403)

    latest_snapshot = PlatformSnapshot.query.filter_by(platform_account_id=platform_account_id)\
        .order_by(PlatformSnapshot.snapshot_date.desc()).first()

    if not latest_snapshot:
        return error_response("No snapshots found", 404)

    return success_response(latest_snapshot.to_dict())
