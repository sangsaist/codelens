
import unittest
from app import create_app, db
from app.students.models import Student
from app.platforms.models import PlatformAccount
from app.snapshots.models import PlatformSnapshot
from app.auth.models import User, Role, UserRole
from datetime import date
import uuid

class TestSnapshotApprovalWorkflow(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            
            # Create a user and student
            user_id = str(uuid.uuid4())
            student_id = str(uuid.uuid4())
            
            user = User(id=user_id, email="test@student.com", full_name="Test Student", is_active=True)
            user.set_password("password")
            db.session.add(user)
            
            student = Student(id=student_id, user_id=user_id, register_number="12345", admission_year=2024)
            db.session.add(student)
            
            # Platform Account
            account = PlatformAccount(
                id=str(uuid.uuid4()),
                student_id=student_id,
                platform_name="leetcode",
                username="testuser"
            )
            db.session.add(account)
            self.account_id = account.id
            
            db.session.commit()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_snapshot_creation_is_pending(self):
        with self.app.app_context():
            # Simulate snapshot creation
            snap = PlatformSnapshot(
                platform_account_id=self.account_id,
                total_solved=10,
                snapshot_date=date(2025, 1, 1),
                status="pending" # As set by route
            )
            db.session.add(snap)
            db.session.commit()
            
            fetched = PlatformSnapshot.query.filter_by(platform_account_id=self.account_id).first()
            self.assertEqual(fetched.status, "pending")
            
            # Check analytics query (should be excluded)
            # In real route we filter status="approved". Here we manual test query.
            approved_snaps = PlatformSnapshot.query.filter_by(
                platform_account_id=self.account_id, 
                status="approved"
            ).all()
            self.assertEqual(len(approved_snaps), 0)

    def test_approval_workflow(self):
        with self.app.app_context():
            snap = PlatformSnapshot(
                platform_account_id=self.account_id,
                total_solved=10,
                snapshot_date=date(2025, 1, 1),
                status="pending"
            )
            db.session.add(snap)
            db.session.commit()
            
            # Approve it
            snap.status = "approved"
            db.session.commit()
            
            approved_snaps = PlatformSnapshot.query.filter_by(
                platform_account_id=self.account_id, 
                status="approved"
            ).all()
            self.assertEqual(len(approved_snaps), 1)

if __name__ == '__main__':
    unittest.main()
