from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt



def create_app():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)

    db.init_app(flask_app)
    migrate.init_app(flask_app, db)
    jwt.init_app(flask_app)

    # Import models
    import app.auth.models
    import app.students.models

    # Register blueprints
    from app.auth.routes import auth_bp
    flask_app.register_blueprint(auth_bp)

    from flask_jwt_extended import jwt_required, get_jwt_identity
    
    
    @flask_app.route("/protected")
    @jwt_required()
    def protected():
        current_user_id = get_jwt_identity()
        return {"logged_in_as": current_user_id}

    @flask_app.route("/health")
    def health():
        return {"status": "ok"}

    return flask_app
