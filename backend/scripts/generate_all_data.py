"""
CodeLens Automated Test Data Generator
Generates realistic institutional data for testing
"""

import sys
import os

# Add parent directory to path so imports work if running from backend/scripts/
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from faker import Faker
import csv
import random
from datetime import datetime, timedelta
from scripts.config import DEPARTMENTS, GENERATOR_CONFIG

fake = Faker()

def create_data_directory():
    """Create data directory if not exists"""
    # Create valid path relative to this script
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    print("Created data directory at: " + data_dir)
    return data_dir

def generate_departments(data_dir):
    """Generate departments.csv"""
    filename = os.path.join(data_dir, 'departments.csv')
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['name', 'code'])
        writer.writeheader()
        for dept in DEPARTMENTS:
            writer.writerow(dept)
    
    print(f"[OK] Generated {len(DEPARTMENTS)} departments -> {filename}")
    return DEPARTMENTS

def generate_students(data_dir, departments):
    """Generate students.csv with realistic data"""
    filename = os.path.join(data_dir, 'students.csv')
    total_students = 0
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            'email', 'full_name', 'register_number', 'department_code',
            'admission_year', 'phone', 'gender', 'date_of_birth', 'password'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for dept in departments:
            dept_code = dept['code']
            students_count = GENERATOR_CONFIG['students_per_department']
            
            for i in range(students_count):
                year = random.choice(GENERATOR_CONFIG['admission_years'])
                gender = random.choice(['Male', 'Female', 'Other'])
                
                # Generate realistic data
                first_name = fake.first_name()
                last_name = fake.last_name()
                full_name = f"{first_name} {last_name}"
                email = f"{first_name.lower()}.{last_name.lower()}{random.randint(1, 99)}@college.edu"
                
                # Register number format: CSE2024001
                reg_num = f"{dept_code}{year}{i+1:03d}"
                
                # Date of birth (18-22 years old)
                age = random.randint(18, 22)
                dob = datetime.now() - timedelta(days=age*365 + random.randint(0, 365))
                
                writer.writerow({
                    'email': email,
                    'full_name': full_name,
                    'register_number': reg_num,
                    'department_code': dept_code,
                    'admission_year': year,
                    'phone': f"98{random.randint(10000000, 99999999)}",
                    'gender': gender,
                    'date_of_birth': dob.strftime('%Y-%m-%d'),
                    'password': 'Student@123'
                })
                total_students += 1
    
    print(f"[OK] Generated {total_students} students -> {filename}")
    return total_students

def generate_hods(data_dir, departments):
    """Generate HODs (one per department)"""
    filename = os.path.join(data_dir, 'hods.csv')
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['email', 'full_name', 'department_code', 'password']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for dept in departments:
            title = random.choice(['Dr.', 'Prof.'])
            name = f"{title} {fake.name()}"
            email = f"hod.{dept['code'].lower()}@college.edu"
            
            writer.writerow({
                'email': email,
                'full_name': name,
                'department_code': dept['code'],
                'password': 'Hod@12345'
            })
    
    print(f"[OK] Generated {len(departments)} HODs -> {filename}")

def generate_counsellors(data_dir, departments):
    """Generate counsellors"""
    filename = os.path.join(data_dir, 'counsellors.csv')
    total = 0
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['email', 'full_name', 'department_code', 'password']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for dept in departments:
            for i in range(GENERATOR_CONFIG['counsellors_per_department']):
                title = random.choice(['Ms.', 'Mr.', 'Dr.'])
                name = f"{title} {fake.name()}"
                email = f"counsellor.{dept['code'].lower()}{i+1}@college.edu"
                
                writer.writerow({
                    'email': email,
                    'full_name': name,
                    'department_code': dept['code'],
                    'password': 'Counsel@123'
                })
                total += 1
    
    print(f"[OK] Generated {total} counsellors -> {filename}")

def generate_advisors(data_dir, departments):
    """Generate advisors"""
    filename = os.path.join(data_dir, 'advisors.csv')
    total = 0
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['email', 'full_name', 'department_code', 'password']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for dept in departments:
            for i in range(GENERATOR_CONFIG['advisors_per_department']):
                title = random.choice(['Prof.', 'Dr.', 'Mr.', 'Ms.'])
                name = f"{title} {fake.name()}"
                email = f"advisor.{dept['code'].lower()}{i+1}@college.edu"
                
                writer.writerow({
                    'email': email,
                    'full_name': name,
                    'department_code': dept['code'],
                    'password': 'Advisor@123'
                })
                total += 1
    
    print(f"[OK] Generated {total} advisors -> {filename}")

def generate_department_hods(data_dir, departments):
    """Generate department-HOD mapping"""
    filename = os.path.join(data_dir, 'department_hods.csv')
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['department_code', 'hod_email']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for dept in departments:
            writer.writerow({
                'department_code': dept['code'],
                'hod_email': f"hod.{dept['code'].lower()}@college.edu"
            })
    
    print(f"[OK] Generated department-HOD mappings -> {filename}")

def generate_admin(data_dir):
    """Generate admin user"""
    filename = os.path.join(data_dir, 'admin.csv')
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['email', 'full_name', 'password']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        writer.writerow({
            'email': 'admin@college.edu',
            'full_name': 'System Administrator',
            'password': 'Admin@12345'
        })
    
    print(f"[OK] Generated admin user -> {filename}")

def generate_summary(data_dir, departments, total_students):
    """Generate summary report"""
    filename = os.path.join(data_dir, 'SUMMARY.txt')
    
    total_hods = len(departments)
    total_counsellors = len(departments) * GENERATOR_CONFIG['counsellors_per_department']
    total_advisors = len(departments) * GENERATOR_CONFIG['advisors_per_department']
    total_users = 1 + total_hods + total_counsellors + total_advisors + total_students
    
    summary = f"""
CodeLens Test Data Generation Summary

GENERATED DATA STATISTICS
--------------------------------------------------------------

Departments:       {total_hods:>6}
Students:          {total_students:>6}
HODs:              {total_hods:>6}
Counsellors:       {total_counsellors:>6}
Advisors:          {total_advisors:>6}
Admin Users:       {1:>6}
-----------------------------
TOTAL USERS:       {total_users:>6}

GENERATED FILES
--------------------------------------------------------------

* data/departments.csv
* data/students.csv
* data/hods.csv
* data/counsellors.csv
* data/advisors.csv
* data/department_hods.csv
* data/admin.csv

DEFAULT CREDENTIALS
--------------------------------------------------------------

Admin:       admin@college.edu / Admin@12345
HOD:         hod.cse@college.edu / Hod@12345
Counsellor:  counsellor.cse1@college.edu / Counsel@123
Advisor:     advisor.cse1@college.edu / Advisor@123
Student:     (see students.csv) / Student@123

NEXT STEPS
--------------------------------------------------------------

1. Review generated CSV files in data/ directory
2. Run: python scripts/seed_data.py
3. Access system with admin credentials
4. Start testing!

Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    # Use UTF-8 to handle any potential special chars safely
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(summary)
    
    # Don't print the summary to console to avoid encoding errors on Windows
    print(f"[INFO] Summary saved -> {filename}")
    print("See generated SUMMARY.txt for full details and credentials.")

def main():
    """Main execution"""
    print("\n" + "="*70)
    print("  CodeLens Automated Test Data Generator")
    print("="*70 + "\n")
    
    # Create directory using new function that returns path
    data_dir = create_data_directory()
    
    # Generate all data
    print("\n[INFO] Generating institutional data...\n")
    
    departments = generate_departments(data_dir)
    total_students = generate_students(data_dir, departments)
    generate_hods(data_dir, departments)
    generate_counsellors(data_dir, departments)
    generate_advisors(data_dir, departments)
    generate_department_hods(data_dir, departments)
    generate_admin(data_dir)
    
    print("\n" + "="*70)
    generate_summary(data_dir, departments, total_students)
    print("="*70)
    
    print("\n[DONE] Data generation complete! Check backend/data/ folder.\n")

if __name__ == '__main__':
    main()
