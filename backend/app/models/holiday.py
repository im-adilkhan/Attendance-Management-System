from datetime import date
from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Holiday(Base):
    __tablename__ = "holidays"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    date: Mapped[date] = mapped_column(Date, unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text)
