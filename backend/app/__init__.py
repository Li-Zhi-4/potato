from pathlib import Path
from flask import Flask
from flask_cors import CORS
from app.db import close_db, init_db
from dotenv import load_dotenv
import os

load_dotenv()


def create_app(test_config=None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        SECRET_KEY=os.getenv('SECRET_KEY'),
        DATABASE_URL=os.getenv('DATABASE_URL')
    )
    if test_config:
        app.config.update(test_config)

    CORS(app, resources={r"/api/.*": {"origins": "*"}})

    from . import db
    db.init_app(app)

    from app import auth
    from app.controllers import parts
    from app.controllers import vendors
    from app.controllers import purchase_orders
    from app.controllers import boms
    from app.controllers import vendor_parts
    from app.controllers import assembly_parts
    from app.controllers import components
    app.register_blueprint(auth.bp)
    app.register_blueprint(parts.bp)
    app.register_blueprint(vendors.bp)
    app.register_blueprint(purchase_orders.bp)
    app.register_blueprint(boms.bp)
    app.register_blueprint(vendor_parts.bp)
    app.register_blueprint(assembly_parts.bp)
    app.register_blueprint(components.bp)

    return app
