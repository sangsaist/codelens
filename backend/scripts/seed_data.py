"""
CodeLens Bulk Data Import Script
Imports generated CSV data into database
"""

import sys
import os

# Add parent directory to path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import csv
from datetime import datetime
from app import create_app, db
from app.auth.models import User, Role, UserRole
from app.students.models import Student
from app.academics.models import Department
from app.staff.models import StaffProfile
from app.common.utils import hash_password

app = create_app()

def get_data_file(filename):
    """Helper to get path to data file"""
    return os.path.join(os.path.dirname(__file__), '..', 'data', filename)

def seed_departments():
    """Import departments"""
    csv_file = get_data_file('departments.csv')
    with app.app_context():
        print("[DIR] Importing departments...")
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    existing = Department.query.filter_by(code=row['code']).first()
                    if existing:
                        print(f"  [WARN] Department {row['code']} already exists, skipping")
                        continue
                    
                    dept = Department(
                        name=row['name'],
                        code=row['code']
                    )
                    db.session.add(dept)
                    count += 1
            
            db.session.commit()
            print(f"  [OK] Imported {count} departments\n")
        except FileNotFoundError:
            print(f"  [ERROR] File not found: {csv_file}")
            print("  Run generate_all_data.py first.")
            sys.exit(1)

def seed_admin():
    """Import admin user"""
    csv_file = get_data_file('admin.csv')
    with app.app_context():
        print("[KEY] Importing admin...")
        
        admin_role = Role.query.filter_by(name='admin').first()
        if not admin_role:
            print("  [ERROR] Admin role not found. Run migrations first.")
            return
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    existing = User.query.filter_by(email=row['email']).first()
                    if existing:
                        print(f"  [WARN] Admin already exists")
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
            print(f"  [OK] Admin user created\n")
        except FileNotFoundError:
             print(f"  [ERROR] details not found: {csv_file}")

def seed_users_bulk(filename, role_name, user_type):
    """Generic bulk user import"""
    csv_file = get_data_file(filename)
    with app.app_context():
        print(f"[INFO] Importing {user_type}...")
        
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            print(f"  [ERROR] Role '{role_name}' not found")
            return
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                count = 0
                skipped = 0
                
                for row in reader:
                    # Check existing
                    existing = User.query.filter_by(email=row['email']).first()
                    if existing:
                        skipped += 1
                        continue
                    
                    # Create user
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
                        print(f"  [INFO] Processed {count} {user_type}...")
            
            db.session.commit()
            print(f"  [OK] Imported {count} {user_type} (skipped {skipped} existing)\n")
        except FileNotFoundError:
            print(f"  [ERROR] File not found: {csv_file}")

def assign_hods():
    """Assign HODs to departments"""
    csv_file = get_data_file('department_hods.csv')
    with app.app_context():
        print("[INFO] Assigning HODs to departments...")
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                count = 0
                
                for row in reader:
                    dept = Department.query.filter_by(code=row['department_code']).first()
                    hod_user = User.query.filter_by(email=row['hod_email']).first()
                    
                    if dept and hod_user:
                        dept.hod_id = hod_user.id
                        count += 1
                        print(f"  + {hod_user.full_name} -> {dept.name}")
                    else:
                        print(f"  [FAIL] {row['department_code']} / {row['hod_email']}")
            
            db.session.commit()
            print(f"  [OK] Assigned {count} HODs\n")
            
        except FileNotFoundError:
            print(f"  [ERROR] File not found: {csv_file}")

def print_header():
    """Print fancy header"""
    print("\n" + "="*70)
    print("  CodeLens Bulk Data Import")
    print("="*70 + "\n")

def print_footer():
    """Print completion message"""
    print("\n" + "="*70)
    print("  [DONE] Import Complete!")
    print("="*70)
    print("\n[INFO] Database populated successfully!")
    print("\n[KEY] Login with:")
    print("  Admin:  admin@college.edu / Admin@12345")
    print("  HOD:    hod.cse@college.edu / Hod@12345")
    print("  Check data/SUMMARY.txt for more credentials\n")

def main():
    """Main import process"""
    print_header()
    
    try:
        # Import in order
        seed_departments()
        seed_admin()
        seed_users_bulk('students.csv', 'student', 'students')
        seed_users_bulk('hods.csv', 'hod', 'HODs')
        seed_users_bulk('counsellors.csv', 'counsellor', 'counsellors')
        seed_users_bulk('advisors.csv', 'advisor', 'advisors')
        assign_hods()
        
        print_footer()
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
