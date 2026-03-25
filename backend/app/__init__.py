from pathlib import Path

from flask import Flask
from flask_cors import CORS

from app.db import close_db, init_db


def create_app(test_config=None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        DATABASE=str(Path(__file__).resolve().parent.parent / "bom.db"),
    )
    if test_config:
        app.config.update(test_config)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app import routes

    app.register_blueprint(routes.bp)

    app.teardown_appcontext(close_db)

    with app.app_context():
        init_db()

    return app
