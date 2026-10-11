"""Create the default administrator and office geofence if they do not exist."""
from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.allowed_location import AllowedLocation
from app.models.user import User


def seed() -> None:
    db = SessionLocal()
    try:
        admin = db.scalar(select(User).where(User.email == settings.ADMIN_EMAIL))
        if admin is None:
            db.add(User(full_name="System Administrator", email=settings.ADMIN_EMAIL,
                        role="admin", password_hash=hash_password(settings.ADMIN_PASSWORD)))
        teacher = db.scalar(select(User).where(User.email == settings.DEMO_TEACHER_EMAIL))
        if teacher is None:
            teacher = User(full_name=settings.DEMO_TEACHER_NAME,
                           email=settings.DEMO_TEACHER_EMAIL, role="teacher",
                           password_hash=hash_password(settings.DEMO_TEACHER_PASSWORD))
            db.add(teacher)
            db.flush()
            from app.models.teacher import Teacher
            db.add(Teacher(user_id=teacher.id, employee_number="DEMO-001"))
        office = db.scalar(select(AllowedLocation).where(
            AllowedLocation.name == settings.OFFICE_NAME))
        if office is None:
            db.add(AllowedLocation(name=settings.OFFICE_NAME,
                latitude=settings.OFFICE_LATITUDE, longitude=settings.OFFICE_LONGITUDE,
                radius_meters=settings.OFFICE_RADIUS_METERS, is_active=True))
        from app.models.app_settings import AppSetting
        defaults = {
            "office_start_time": "09:00",
            "late_after_minutes": "15",
            "half_day_hours": "4",
        }
        for key, value in defaults.items():
            if db.scalar(select(AppSetting).where(AppSetting.key == key)) is None:
                db.add(AppSetting(key=key, value=value))
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
    print("Default admin and office location are ready.")
