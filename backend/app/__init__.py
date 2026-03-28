from pathlib import Path
from flask import Flask
from flask_cors import CORS
from app.db import close_db, init_db


def create_app(test_config=None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=str(Path(__file__).resolve().parent.parent / "data.db")
    )
    if test_config:
        app.config.update(test_config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from . import db
    db.init_app(app)

    from app import auth
    from app import parts
    from app import vendors
    app.register_blueprint(auth.bp)
    app.register_blueprint(parts.bp)
    app.register_blueprint(vendors.bp)

    return app
