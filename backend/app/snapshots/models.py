
import uuid
from datetime import datetime
from app.extensions import db

class PlatformSnapshot(db.Model):
    __tablename__ = "platform_snapshots"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    platform_account_id = db.Column(
        db.String(36), 
        db.ForeignKey("platform_accounts.id", ondelete="CASCADE"), 
        nullable=False
    )
    total_solved = db.Column(db.Integer, nullable=False)
    contest_rating = db.Column(db.Integer, nullable=True)
    global_rank = db.Column(db.Integer, nullable=True)
    snapshot_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Approval Workflow Fields
    status = db.Column(db.String(20), default="pending", nullable=False)  # pending, approved, rejected
    reviewed_by = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    remarks = db.Column(db.Text, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('platform_account_id', 'snapshot_date', name='unique_platform_snapshot_date'),
    )

    platform_account = db.relationship(
        "PlatformAccount", 
        backref=db.backref(
            "snapshots", 
            lazy=True, 
            order_by="desc(PlatformSnapshot.snapshot_date)",
            cascade="all, delete-orphan"
        )
    )

    reviewer = db.relationship("User", foreign_keys=[reviewed_by])

    def to_dict(self):
        return {
            "id": self.id,
            "platform_account_id": self.platform_account_id,
            "total_solved": self.total_solved,
            "contest_rating": self.contest_rating,
            "global_rank": self.global_rank,
            "snapshot_date": self.snapshot_date.isoformat(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "status": self.status,
            "reviewed_by": self.reviewed_by,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "remarks": self.remarks
        }
