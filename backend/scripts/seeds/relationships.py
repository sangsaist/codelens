"""
Import Relationships (e.g. HOD assignments)
"""

import csv
import sys
from .utils import get_data_file, log_info, log_ok, log_warn, log_error

def assign_hods(app, db):
    """Assign HODs to departments"""
    from app.academics.models import Department
    from app.auth.models import User
    
    csv_file = get_data_file('department_hods.csv')
    log_info("Assigning HODs to departments...")
    
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
                    log_warn(f"Failed: {row['department_code']} / {row['hod_email']}")
        
        db.session.commit()
        log_ok(f"Assigned {count} HODs\n")
        
    except FileNotFoundError:
        log_error(f"File not found: {csv_file}")
