from flask import Blueprint, jsonify, request
from app.db import get_db
import uuid
from datetime import datetime
from app.utils.helpers import row_to_dict
from psycopg2 import errors as pg_errors

bp = Blueprint('parts', __name__, url_prefix='/api/parts')


# -- crud api --

@bp.get("")
def list_users():
    db = get_db()
    rows = db.execute("SELECT * FROM users ORDER BY first_name").fetchall()
    return jsonify([row_to_dict(r) for r in rows])