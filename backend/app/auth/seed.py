from app.extensions import db
from app.auth.models import Role

def seed_roles():
    default_roles = ["admin", "student", "counsellor", "hod", "advisor"]

    for role_name in default_roles:
        existing = Role.query.filter_by(name=role_name).first()
        if not existing:
            role = Role(name=role_name)
            db.session.add(role)

    db.session.commit()
