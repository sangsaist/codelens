"""
Import Users: Admin, Students, Staff
"""

import csv
import sys
from datetime import datetime
from .utils import get_data_file, log_info, log_ok, log_warn, log_error, log_key
from app.common.utils import hash_password

def seed_admin(app, db):
    """Import admin user"""
    from app.auth.models import User, Role, UserRole
    
    csv_file = get_data_file('admin.csv')
    log_info("Importing admin...")
    
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        log_error("Admin role not found. Run migrations first.")
        return
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                existing = User.query.filter_by(email=row['email']).first()
                if existing:
                    log_warn("Admin already exists")
                    continue
                
                user = User(
                    email=row['email'],
                    password_hash=hash_password(row['password']),
                    full_name=row['full_name']
                )
                db.session.add(user)
                db.session.flush()
                
                user_role = UserRole(user_id=user.id, role_id=admin_role.id)
                db.session.add(user_role)
        
        db.session.commit()
        log_ok("Admin user created\n")
        
    except FileNotFoundError:
         log_error(f"File not found: {csv_file}")

def seed_users_bulk(app, db, filename, role_name, user_type):
    """Generic bulk user import"""
    from app.auth.models import User, Role, UserRole
    from app.students.models import Student
    from app.academics.models import Department
    from app.staff.models import StaffProfile
    
    csv_file = get_data_file(filename)
    log_info(f"Importing {user_type}...")
    
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        log_error(f"Role '{role_name}' not found")
        return
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            skipped = 0
            
            for row in reader:
                # 1. Check existing User by email
                existing_user = User.query.filter_by(email=row['email']).first()
                if existing_user:
                    skipped += 1
                    continue
                
                # 2. Check existing Student by Register Number (to avoid unique constraint violation)
                if role_name == 'student':
                    existing_student = Student.query.filter_by(register_number=row['register_number']).first()
                    if existing_student:
                        # Register number taken (likely by a previous user from an old run)
                        skipped += 1
                        continue

                # 3. Create User
                user = User(
                    email=row['email'],
                    password_hash=hash_password(row.get('password', 'TempPass@123')),
                    full_name=row['full_name']
                )
                db.session.add(user)
                db.session.flush()
                
                # Assign role
                user_role = UserRole(user_id=user.id, role_id=role.id)
                db.session.add(user_role)
                
                # Student profile
                if role_name == 'student':
                    dept = Department.query.filter_by(code=row['department_code']).first()
                    
                    # Parse date of birth
                    dob = None
                    if row.get('date_of_birth'):
                        try:
                            dob = datetime.strptime(row['date_of_birth'], '%Y-%m-%d').date()
                        except:
                            pass
                    
                    student = Student(
                        user_id=user.id,
                        register_number=row['register_number'],
                        department_id=dept.id if dept else None,
                        admission_year=int(row.get('admission_year', datetime.now().year)),
                        phone=row.get('phone'),
                        gender=row.get('gender'),
                        date_of_birth=dob
                    )
                    db.session.add(student)
                
                # Staff profile
                elif role_name in ['hod', 'counsellor', 'advisor']:
                    dept = Department.query.filter_by(code=row.get('department_code')).first()
                    staff = StaffProfile(
                        user_id=user.id,
                        department_id=dept.id if dept else None,
                        role_type=role_name
                    )
                    db.session.add(staff)
                
                count += 1
                
                # Commit in batches
                if count % 100 == 0:
                    db.session.commit()
                    log_info(f"Processed {count} {user_type}...")
        
        db.session.commit()
        log_ok(f"Imported {count} {user_type} (skipped {skipped} existing)\n")
        
    except FileNotFoundError:
        log_error(f"File not found: {csv_file}")
