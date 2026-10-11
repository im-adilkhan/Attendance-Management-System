"""Initial tables for the attendance application.

Revision ID: 20261009_initial_tables
Revises:
"""
from alembic import op
from app.db.base import Base
import app.models  # noqa: F401 - register every model on Base.metadata

revision = "20261009_initial_tables"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Initial project migration: create all registered application tables.
    Base.metadata.create_all(bind=op.get_bind())


def downgrade():
    Base.metadata.drop_all(bind=op.get_bind())
