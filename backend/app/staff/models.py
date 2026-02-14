
import uuid
from datetime import datetime
from app.extensions import db

class StaffProfile(db.Model):
    __tablename__ = "staff_profiles"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    department_id = db.Column(db.String(36), db.ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    role_type = db.Column(db.String(50), nullable=False) # "hod", "advisor", "counsellor"
    created_by_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship("User", foreign_keys=[user_id], backref=db.backref("staff_profile", uselist=False))
    department = db.relationship("Department", backref="staff_members")
    creator = db.relationship("User", foreign_keys=[created_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.user.full_name if self.user else "Unknown",
            "email": self.user.email if self.user else "Unknown",
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "role_type": self.role_type,
            "created_by": self.creator.full_name if self.creator else "System",
            "created_at": self.created_at.isoformat()
        }
