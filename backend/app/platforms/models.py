
import uuid
from datetime import datetime
from app.extensions import db
from app.students.models import Student

class PlatformAccount(db.Model):
    __tablename__ = "platform_accounts"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = db.Column(db.String(36), db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    platform_name = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(150), nullable=False)
    profile_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('student_id', 'platform_name', name='unique_student_platform'),
    )

    student = db.relationship("Student", backref=db.backref("platform_accounts", lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "platform_name": self.platform_name,
            "username": self.username,
            "profile_url": self.profile_url,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
