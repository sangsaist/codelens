from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import models so migrations detect them
    import app.auth.models

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
