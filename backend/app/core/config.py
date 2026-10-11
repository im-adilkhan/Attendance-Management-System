from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://attendance_user:attendance_pass@localhost:5432/attendance_db"
    SECRET_KEY: str = "change-this-development-secret"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    UPLOAD_DIR: str = "uploads"
    ADMIN_EMAIL: str = "admin@demo.com"
    ADMIN_PASSWORD: str = "admin123"
    DEMO_TEACHER_EMAIL: str = "teacher@demo.com"
    DEMO_TEACHER_PASSWORD: str = "teacher123"
    DEMO_TEACHER_NAME: str = "Demo Teacher"
    OFFICE_NAME: str = "Main Office"
    OFFICE_LATITUDE: float = 12.9716
    OFFICE_LONGITUDE: float = 77.5946
    OFFICE_RADIUS_METERS: int = 150
    JWT_ALGORITHM: str = "HS256"
    CORS_ALLOWED_ORIGINS: str = "http://localhost:5173"
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[3] / ".env",
        extra="ignore",
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_postgres_url(cls, value: str) -> str:
        # Some hosting providers still expose the legacy postgres:// prefix.
        if isinstance(value, str) and value.startswith("postgres://"):
            return value.replace("postgres://", "postgresql+psycopg2://", 1)
        if isinstance(value, str) and value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg2://", 1)
        return value


settings = Settings()


def cors_origins() -> list[str]:
    """Return the configured browser origins as a clean list."""
    return [origin.strip() for origin in settings.CORS_ALLOWED_ORIGINS.split(",")
            if origin.strip()]
