
from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, jwt

def create_app():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)

    # Initialize CORS
    CORS(flask_app)

    db.init_app(flask_app)
    jwt.init_app(flask_app)

    # Import models to ensure they are registered with SQLAlchemy
    import app.auth.models
    import app.students.models
    import app.academics.models
    import app.platforms.models
    import app.snapshots.models
    import app.staff.models # New Staff Profile Model
    # import app.analytics.models # Empty for now

    # Initialize Migrate after models are imported
    migrate.init_app(flask_app, db)

    # Register blueprints
    from app.auth.routes import auth_bp
    flask_app.register_blueprint(auth_bp)

    from app.students.routes import students_bp
    flask_app.register_blueprint(students_bp)

    from app.academics.routes import academics_bp
    flask_app.register_blueprint(academics_bp)

    from app.platforms.routes import platforms_bp
    flask_app.register_blueprint(platforms_bp)

    from app.snapshots.routes import snapshots_bp
    flask_app.register_blueprint(snapshots_bp)

    from app.analytics.routes import analytics_bp
    flask_app.register_blueprint(analytics_bp)

    import app.setup.routes
    from app.setup.routes import setup_bp
    flask_app.register_blueprint(setup_bp)
    
    from app.advisor.routes import advisor_bp
    flask_app.register_blueprint(advisor_bp)

    from app.counsellor.routes import counsellor_bp
    flask_app.register_blueprint(counsellor_bp)

    from app.review.routes import review_bp
    flask_app.register_blueprint(review_bp)

    from app.staff.routes import staff_bp
    flask_app.register_blueprint(staff_bp)

    from app.admin.routes import admin_bp
    flask_app.register_blueprint(admin_bp)

    @flask_app.route("/health")
    def health():
        return {"status": "ok"}

    return flask_app
