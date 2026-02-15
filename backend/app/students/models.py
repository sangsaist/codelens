
import uuid
from datetime import datetime
from app.extensions import db

class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(
        db.String(36),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )
    
    department_id = db.Column(db.String(36), db.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)

    register_number = db.Column(db.String(50), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    admission_year = db.Column(db.Integer, nullable=False)
    graduation_year = db.Column(db.Integer)
    is_alumni = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("student_profile", uselist=False))
    department = db.relationship("Department", backref="students")

class StudentAdvisor(db.Model):
    __tablename__ = "student_advisors"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    advisor_user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship("Student", backref=db.backref("advisor_record", uselist=False))
    advisor = db.relationship("User", backref="advised_students")

class StudentCounsellor(db.Model):
    __tablename__ = "student_counsellors"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey("students.id", ondelete="CASCADE"), unique=True, nullable=False)
    counsellor_user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship("Student", backref=db.backref("counsellor_record", uselist=False))
    counsellor = db.relationship("User", backref="counselled_students")
