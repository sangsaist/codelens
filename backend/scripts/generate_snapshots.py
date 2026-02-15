"""Generate random performance snapshots for testing"""

import sys
import os

# Add parent directory to path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import csv
import random
from datetime import datetime, timedelta
from app import create_app, db
from app.students.models import Student
from app.platforms.models import PlatformAccount
from app.snapshots.models import PlatformSnapshot
from scripts.config import PLATFORMS

app = create_app()

def generate_snapshots():
    with app.app_context():
        print("[INFO] Generating performance snapshots...\n")
        
        students = Student.query.limit(100).all()  # First 100 students
        total_snapshots = 0
        
        for student in students:
            # Create platform accounts
            try:
                for platform_name in PLATFORMS:
                    existing = PlatformAccount.query.filter_by(
                        student_id=student.id,
                        platform_name=platform_name
                    ).first()
                    
                    if existing:
                        account = existing
                    else:
                        account = PlatformAccount(
                            student_id=student.id,
                            platform_name=platform_name,
                            username=f"{student.register_number.lower()}_{platform_name.lower()}",
                            profile_url=f"https://{platform_name.lower()}.com/user/{student.register_number}"
                        )
                        db.session.add(account)
                        db.session.flush()
                    
                    # Generate snapshots for last 3 months
                    start_date = datetime.now() - timedelta(days=90)
                    current_solved = random.randint(50, 100)
                    
                    for day_offset in range(0, 90, 7):  # Weekly snapshots
                        snapshot_date = start_date + timedelta(days=day_offset)
                        
                        # Ensure no duplicates
                        existing_snap = PlatformSnapshot.query.filter_by(
                            platform_account_id=account.id,
                            snapshot_date=snapshot_date.date()
                        ).first()
                        
                        if existing_snap:
                            continue
                        
                        # Progressive increase
                        current_solved += random.randint(5, 15)
                        
                        snapshot = PlatformSnapshot(
                            platform_account_id=account.id,
                            total_solved=current_solved,
                            contest_rating=random.randint(1200, 2000),
                            global_rank=random.randint(1000, 50000),
                            snapshot_date=snapshot_date.date(),
                            status='approved'  # Auto-approve for testing
                        )
                        db.session.add(snapshot)
                        total_snapshots += 1
                
                if student.id % 10 == 0:
                    db.session.commit()
                    print(f"  Processed {len([s for s in students if students.index(s) <= students.index(student)])} students...")
            
            except Exception as e:
                print(f"[WARN] Error for student {student.id}: {e}")
                db.session.rollback()
        
        db.session.commit()
        print(f"\n[OK] Generated {total_snapshots} snapshots for {len(students)} students")
        print(f"  Platforms: {', '.join(PLATFORMS)}")
        print(f"  Period: Last 90 days (weekly)")

if __name__ == '__main__':
    generate_snapshots()
