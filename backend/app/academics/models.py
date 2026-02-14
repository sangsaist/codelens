
import uuid
from datetime import datetime
from app.extensions import db

class Department(db.Model):
    __tablename__ = "departments"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(150), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    hod_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to User for HOD
    hod = db.relationship("User", backref=db.backref("department_hod_of", uselist=False))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "hod_id": self.hod_id,
            "created_at": self.created_at.isoformat()
        }

class DepartmentCounsellor(db.Model):
    __tablename__ = "department_counsellors"
    
    department_id = db.Column(db.String(36), db.ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True)
    counsellor_user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    department = db.relationship("Department", backref=db.backref("counsellors"))
    counsellor = db.relationship("User", backref="counsellor_of_departments")
