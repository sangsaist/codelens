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

    register_number = db.Column(db.String(50), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    admission_year = db.Column(db.Integer, nullable=False)
    graduation_year = db.Column(db.Integer)
    is_alumni = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("student_profile", uselist=False))
