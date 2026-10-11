from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


def import_models() -> None:
    """Load every model so Alembic sees all tables in Base.metadata."""
    import app.models  # noqa: F401
