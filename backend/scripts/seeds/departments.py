"""
Import Departments
"""

import csv
import sys
from .utils import get_data_file, log_info, log_ok, log_warn, log_error

def run(app, db):
    """Import departments from CSV"""
    from app.academics.models import Department
    
    csv_file = get_data_file('departments.csv')
    try:
        log_info("Importing departments...")
        
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                existing = Department.query.filter_by(code=row['code']).first()
                if existing:
                    log_warn(f"Department {row['code']} already exists, skipping")
                    continue
                
                dept = Department(
                    name=row['name'],
                    code=row['code']
                )
                db.session.add(dept)
                count += 1
        
        db.session.commit()
        log_ok(f"Imported {count} departments\n")
        
    except FileNotFoundError:
        log_error(f"File not found: {csv_file}")
        log_warn("Run generate_all_data.py first.")
        sys.exit(1)
