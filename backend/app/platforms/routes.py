
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.platforms.models import PlatformAccount
from app.students.models import Student
from app.common.utils import success_response, error_response

platforms_bp = Blueprint("platforms_bp", __name__, url_prefix="/platforms")

@platforms_bp.route("/link", methods=["POST"])
@jwt_required()
def link_platform():
    current_user_id = get_jwt_identity()
    
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Only students can link accounts.", 403)

    data = request.get_json()
    if not data:
        return error_response("No input data provided")

    platform_name = data.get("platform_name")
    username = data.get("username")

    if not platform_name or not username:
        return error_response("Platform name and username are required")
    
    if not isinstance(platform_name, str) or not isinstance(username, str):
        return error_response("Invalid data types")

    platform_name = platform_name.strip().lower()
    username = username.strip()

    ALLOWED_PLATFORMS = {
        "leetcode": "https://leetcode.com/{}",
        "codeforces": "https://codeforces.com/profile/{}",
        "github": "https://github.com/{}",
        "hackerrank": "https://www.hackerrank.com/profile/{}"
    }

    if platform_name not in ALLOWED_PLATFORMS:
        return error_response(f"Unsupported platform. Allowed: {', '.join(ALLOWED_PLATFORMS.keys())}")

    profile_url = ALLOWED_PLATFORMS[platform_name].format(username)

    existing_account = PlatformAccount.query.filter_by(
        student_id=student.id, 
        platform_name=platform_name
    ).first()

    if existing_account:
        return error_response(f"Account for {platform_name} is already linked.", 409)

    new_account = PlatformAccount(
        student_id=student.id,
        platform_name=platform_name,
        username=username,
        profile_url=profile_url
    )

    try:
        db.session.add(new_account)
        db.session.commit()
        return success_response(new_account.to_dict(), "Platform linked successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to link account: {str(e)}", 500)

@platforms_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_platforms():
    current_user_id = get_jwt_identity()
    
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Only students can view linked accounts.", 403)

    accounts = PlatformAccount.query.filter_by(student_id=student.id).all()
    return success_response([account.to_dict() for account in accounts])

@platforms_bp.route("/<platform_id>", methods=["DELETE"])
@jwt_required()
def unlink_platform(platform_id):
    current_user_id = get_jwt_identity()
    
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return error_response("Access denied. Only students can unlink accounts.", 403)

    account = PlatformAccount.query.filter_by(id=platform_id).first()
    
    if not account:
        return error_response("Platform account not found", 404)

    if account.student_id != student.id:
        return error_response("Unauthorized action", 403)

    try:
        db.session.delete(account)
        db.session.commit()
        return success_response(None, "Platform account unlinked successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to unlink account: {str(e)}", 500)
