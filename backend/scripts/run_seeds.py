"""
CodeLens Database Seeder
"""

import sys
import os

# Add parent directory to path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from seeds import departments, users, relationships, snapshots
from seeds.utils import log_start, log_done, log_error

app = create_app()

def run(app, db):
    """Run seeding logic"""
    try:
        # 1. Departments
        departments.run(app, db)
        
        # 2. Admin
        users.seed_admin(app, db)
        
        # 3. Bulk Users
        users.seed_users_bulk(app, db, 'students.csv', 'student', 'students')
        users.seed_users_bulk(app, db, 'hods.csv', 'hod', 'HODs')
        users.seed_users_bulk(app, db, 'counsellors.csv', 'counsellor', 'counsellors')
        users.seed_users_bulk(app, db, 'advisors.csv', 'advisor', 'advisors')
        
        # 4. Relationships
        relationships.assign_hods(app, db)
        
        # 5. Snapshots
        snapshots.run(app, db)
        
        log_done("Database populated!")
        
    except Exception as e:
        log_error(f"Seeding failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

def main():
    log_start("CodeLens Database Seeder")
    with app.app_context():
        run(app, db)

if __name__ == '__main__':
    main()
