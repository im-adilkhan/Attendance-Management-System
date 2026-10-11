from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import synonym

from app.db.base import Base


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_attendance_user_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    in_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    out_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    in_email: Mapped[str] = mapped_column(String(255), nullable=False)
    out_email: Mapped[str | None] = mapped_column(String(255))
    in_photo: Mapped[str] = mapped_column(String(500), nullable=False)
    out_photo: Mapped[str | None] = mapped_column(String(500))
    in_lat: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    in_lng: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    out_lat: Mapped[float | None] = mapped_column(Numeric(9, 6))
    out_lng: Mapped[float | None] = mapped_column(Numeric(9, 6))
    in_address: Mapped[str | None] = mapped_column(Text)
    out_address: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="present", nullable=False)
    working_hours: Mapped[float | None] = mapped_column(Numeric(5, 2))

    # Compatibility names for earlier API clients during the project transition.
    check_in_at = synonym("in_time")
    check_out_at = synonym("out_time")
    in_photo_stamped = synonym("in_photo")
    out_photo_stamped = synonym("out_photo")
