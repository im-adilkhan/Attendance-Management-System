from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
import re

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from openpyxl import Workbook
from io import BytesIO
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, require_admin
from app.db.session import get_db
from app.models.allowed_location import AllowedLocation
from app.models.app_settings import AppSetting
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User
from app.schemas.attendance import AttendancePhotoInput
from app.services.photo_service import save_stamped_photo
from app.utils.geo import haversine_meters
from app.utils.reverse_geocode import reverse_geocode

router = APIRouter(prefix="/attendance", tags=["attendance"])

def _now():
    return datetime.now(ZoneInfo("Asia/Kolkata"))

def _setting(db: Session, key: str, default: str) -> str:
    row = db.scalar(select(AppSetting).where(AppSetting.key == key))
    return row.value if row else default

def _verify_geofence(db: Session, latitude: float, longitude: float) -> None:
    locations = list(db.scalars(select(AllowedLocation).where(AllowedLocation.is_active.is_(True))))
    if not locations:
        raise HTTPException(status_code=503, detail="No active attendance location is configured")
    for location in locations:
        distance = haversine_meters(latitude, longitude, float(location.latitude), float(location.longitude))
        if distance <= location.radius_meters:
            return
    raise HTTPException(status_code=403, detail="You are outside the allowed attendance location")

def _photo(data: AttendancePhotoInput, user: User, folder: str) -> str:
    try:
        return save_stamped_photo(data.photo, folder, user.full_name, user.email,
                                  data.latitude, data.longitude, settings.UPLOAD_DIR)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

def _serialize(row: Attendance) -> dict:
    return {"id": row.id, "user_id": row.user_id, "date": row.date,
        "in_time": row.in_time, "out_time": row.out_time,
        "check_in_at": row.in_time, "check_out_at": row.out_time,
        "in_email": row.in_email, "out_email": row.out_email,
        "in_photo": row.in_photo, "out_photo": row.out_photo,
        "in_photo_stamped": row.in_photo, "out_photo_stamped": row.out_photo,
        "in_lat": row.in_lat, "in_lng": row.in_lng, "out_lat": row.out_lat,
        "out_lng": row.out_lng, "in_address": row.in_address,
        "out_address": row.out_address, "status": row.status,
        "working_hours": row.working_hours}

@router.post("/check-in")
def check_in(data: AttendancePhotoInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = _now()
    if user.role not in {"teacher", "student"}:
        raise HTTPException(status_code=403, detail="Only teachers and students can mark attendance")
    existing = db.scalar(select(Attendance).where(Attendance.user_id == user.id, Attendance.date == now.date()))
    if existing:
        raise HTTPException(status_code=409, detail="Already checked in today")
    _verify_geofence(db, data.latitude, data.longitude)
    office_time = datetime.strptime(_setting(db, "office_start_time", "09:00"), "%H:%M").time()
    grace = int(_setting(db, "late_after_minutes", "15"))
    from datetime import timedelta
    status = "late" if now.time().replace(tzinfo=None) > (datetime.combine(now.date(), office_time) + timedelta(minutes=grace)).time() else "present"
    photo_path = _photo(data, user, "checkin_photos")
    row = Attendance(user_id=user.id, date=now.date(), in_time=now,
        in_email=user.email, in_photo=photo_path, in_lat=data.latitude, in_lng=data.longitude,
        in_address=reverse_geocode(data.latitude, data.longitude), status=status)
    db.add(row); db.commit(); db.refresh(row)
    return {"message": "Check-in successful", **_serialize(row)}

@router.post("/check-out")
def check_out(data: AttendancePhotoInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = _now()
    row = db.scalar(select(Attendance).where(Attendance.user_id == user.id,
        Attendance.date == now.date(), Attendance.out_time.is_(None)))
    if row is None:
        raise HTTPException(status_code=409, detail="No open check-in for today")
    _verify_geofence(db, data.latitude, data.longitude)
    row.out_time = now; row.out_email = user.email
    row.out_photo = _photo(data, user, "checkout_photos")
    row.out_lat, row.out_lng = data.latitude, data.longitude
    row.out_address = reverse_geocode(data.latitude, data.longitude)
    in_time = row.in_time
    if in_time.tzinfo is None:
        in_time = in_time.replace(tzinfo=now.tzinfo)
    hours = max(0, (now - in_time).total_seconds() / 3600)
    row.working_hours = round(hours, 2)
    if hours < float(_setting(db, "half_day_hours", "4")):
        row.status = "half-day"
    db.commit(); db.refresh(row)
    return {"message": "Check-out successful", **_serialize(row)}

@router.get("/my-history")
def my_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Attendance).where(Attendance.user_id == user.id).order_by(Attendance.date.desc()))
    return [_serialize(row) for row in rows]

def _records_query(email: str | None, date: str | None, name: str | None,
                   class_id: int | None, department_id: int | None):
    query = (select(Attendance).join(User, Attendance.user_id == User.id)
             .outerjoin(Student, Student.user_id == User.id)
             .outerjoin(Teacher, Teacher.user_id == User.id)
             .order_by(Attendance.date.desc(), Attendance.in_time.desc()))
    if email:
        query = query.where(or_(Attendance.in_email.ilike("%" + email + "%"),
                                Attendance.out_email.ilike("%" + email + "%")))
    if name:
        query = query.where(User.full_name.ilike("%" + name + "%"))
    if class_id is not None:
        query = query.where(Student.class_id == class_id)
    if department_id is not None:
        query = query.where(Teacher.department_id == department_id)
    if date:
        try:
            query = query.where(Attendance.date == datetime.strptime(date, "%Y-%m-%d").date())
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="Date must be YYYY-MM-DD") from exc
    return query

@router.get("/records")
def attendance_records(email: str | None = None, date: str | None = None,
                       name: str | None = None, class_id: int | None = None,
                       department_id: int | None = None,
                       _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return [_serialize(row) for row in db.scalars(_records_query(email, date, name, class_id, department_id))]


@router.get("/records/export")
def export_attendance_records(email: str | None = None, date: str | None = None,
                              name: str | None = None, class_id: int | None = None,
                              department_id: int | None = None,
                              _admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    query = _records_query(email, date, name, class_id, department_id)
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Attendance"
    sheet.append(["Date", "Check-in email", "Check-out email", "Check-in", "Check-out",
                  "Status", "Hours", "Check-in latitude", "Check-in longitude",
                  "Check-in address", "Check-out latitude", "Check-out longitude", "Check-out address"])
    for row in db.scalars(query):
        sheet.append([row.date.isoformat(), row.in_email, row.out_email,
            row.in_time.isoformat() if row.in_time else None,
            row.out_time.isoformat() if row.out_time else None, row.status, row.working_hours,
            row.in_lat, row.in_lng, row.in_address, row.out_lat, row.out_lng, row.out_address])
    output = BytesIO()
    workbook.save(output)
    output.seek(0)
    return StreamingResponse(output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attendance-records.xlsx"})


@router.get("/photo/{record_id}/{side}")
def attendance_photo(record_id: int, side: str, user: User = Depends(get_current_user),
                     db: Session = Depends(get_db)):
    if side not in {"in", "out"}:
        raise HTTPException(status_code=404, detail="Photo not found")
    row = db.get(Attendance, record_id)
    if row is None or (user.role != "admin" and row.user_id != user.id):
        raise HTTPException(status_code=404, detail="Photo not found")
    relative_path = row.in_photo if side == "in" else row.out_photo
    if not relative_path:
        raise HTTPException(status_code=404, detail="Photo not found")
    expected_folder = "checkin_photos" if side == "in" else "checkout_photos"
    photo_name = Path(relative_path).name
    if Path(relative_path).parent.name != expected_folder or not re.fullmatch(r"[a-f0-9]{32}\.jpg", photo_name):
        raise HTTPException(status_code=404, detail="Photo not found")
    root = Path(settings.UPLOAD_DIR).resolve()
    photo = (root / expected_folder / photo_name).resolve()
    if not photo.is_relative_to(root) or not photo.is_file():
        raise HTTPException(status_code=404, detail="Photo not found")
    return FileResponse(photo, media_type="image/jpeg", filename=photo_name)
