from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number: Mapped[str | None] = mapped_column(String(60), unique=True)
    class_id: Mapped[int | None] = mapped_column(ForeignKey("classes.id"))
