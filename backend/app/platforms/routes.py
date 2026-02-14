
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.platforms.models import PlatformAccount
from app.students.models import Student

platforms_bp = Blueprint("platforms_bp", __name__, url_prefix="/platforms")

@platforms_bp.route("/link", methods=["POST"])
@jwt_required()
def link_platform():
    current_user_id = get_jwt_identity()
    
    # Check if user is a student
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify({"message": "Access denied. Only students can link accounts."}), 403

    data = request.get_json()
    if not data:
        return jsonify({"message": "No input data provided"}), 400

    platform_name = data.get("platform_name")
    username = data.get("username")
    username = data.get("username")
    # profile_url is auto-generated

    if not platform_name or not username:
        return jsonify({"message": "Platform name and username are required"}), 400

    # formatting
    platform_name = platform_name.strip().lower()
    username = username.strip()

    ALLOWED_PLATFORMS = {
        "leetcode": "https://leetcode.com/{}",
        "codeforces": "https://codeforces.com/profile/{}",
        "github": "https://github.com/{}",
        "hackerrank": "https://www.hackerrank.com/profile/{}"
    }

    if platform_name not in ALLOWED_PLATFORMS:
        return jsonify({"message": f"Unsupported platform. Allowed: {', '.join(ALLOWED_PLATFORMS.keys())}"}), 400

    profile_url = ALLOWED_PLATFORMS[platform_name].format(username)

    # Check for existing link
    existing_account = PlatformAccount.query.filter_by(
        student_id=student.id, 
        platform_name=platform_name
    ).first()

    if existing_account:
        return jsonify({"message": f"Account for {platform_name} is already linked."}), 409

    new_account = PlatformAccount(
        student_id=student.id,
        platform_name=platform_name,
        username=username,
        profile_url=profile_url
    )

    try:
        db.session.add(new_account)
        db.session.commit()
        return jsonify(new_account.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to link account", "error": str(e)}), 500

@platforms_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_platforms():
    current_user_id = get_jwt_identity()
    
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify({"message": "Access denied. Only students can view linked accounts."}), 403

    accounts = PlatformAccount.query.filter_by(student_id=student.id).all()
    return jsonify([account.to_dict() for account in accounts]), 200

@platforms_bp.route("/<platform_id>", methods=["DELETE"])
@jwt_required()
def unlink_platform(platform_id):
    current_user_id = get_jwt_identity()
    
    student = Student.query.filter_by(user_id=current_user_id).first()
    if not student:
        return jsonify({"message": "Access denied. Only students can unlink accounts."}), 403

    account = PlatformAccount.query.filter_by(id=platform_id).first()
    
    if not account:
        return jsonify({"message": "Platform account not found"}), 404

    if account.student_id != student.id:
        return jsonify({"message": "Unauthorized action"}), 403

    try:
        db.session.delete(account)
        db.session.commit()
        return jsonify({"message": "Platform account unlinked successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to unlink account", "error": str(e)}), 500
