
from flask import jsonify
from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    return generate_password_hash(password)

def verify_password(password, password_hash):
    return check_password_hash(password_hash, password)

def success_response(data=None, message="Success", status_code=200):
    return jsonify({
        "success": True,
        "message": message,
        "data": data
    }), status_code

def error_response(message="An error occurred", status_code=400):
    return jsonify({
        "success": False,
        "error": message
    }), status_code

def is_admin(user):
    if not user:
        return False
    # Check if any of the user's roles is 'admin'
    return any(ur.role.name.lower() == 'admin' for ur in user.roles if ur.role)

def is_hod(user, department_id):
    if not user:
        return False
    # Check if user is HOD of the department
    # Also check if they have 'hod' role
    is_hod_role = any(ur.role.name.lower() == 'hod' for ur in user.roles if ur.role)
    if not is_hod_role:
        return False
        
    # Check actual department assignment
    # Using the relationship defined in Department model: user.department_hod_of
    if user.department_hod_of and user.department_hod_of.id == department_id:
        return True
        
    return False

def is_counsellor(user):
    if not user:
        return False
    return any(ur.role.name.lower() == 'counsellor' for ur in user.roles if ur.role)
