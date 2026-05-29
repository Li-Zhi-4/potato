import psycopg2
import psycopg2.extras
from flask import g, current_app
import click


class DB:
    """Wraps a psycopg2 connection + cursor to match the sqlite3 interface
    used throughout the controllers (db.execute(...).fetchone(), db.commit())."""

    def __init__(self, conn):
        self._conn = conn
        self._cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def execute(self, query, params=None):
        self._cursor.execute(query, params)
        return self._cursor

    def commit(self):
        self._conn.commit()

    def rollback(self):
        self._conn.rollback()

    def close(self):
        self._cursor.close()
        self._conn.close()


def get_db() -> DB:
    if "db" not in g:
        conn = psycopg2.connect(current_app.config["DATABASE_URL"])
        g.db = DB(conn)
    return g.db


def close_db(_e=None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db() -> None:
    conn = psycopg2.connect(current_app.config["DATABASE_URL"])
    cursor = conn.cursor()
    # load database schema
    with current_app.open_resource('postgres_schema.sql') as f:
        cursor.execute(f.read().decode('utf8'))
    # load test data
    with current_app.open_resource('test_data.sql') as f:
        cursor.execute(f.read().decode('utf8'))
    conn.commit()
    cursor.close()
    conn.close()


@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')


def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)