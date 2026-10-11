from datetime import date
from typing import Any
from math import isfinite
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.allowed_location import AllowedLocation
from app.models.app_settings import AppSetting
from app.models.course_class import CourseClass
from app.models.department import Department
from app.models.holiday import Holiday
from app.models.leave_request import LeaveRequest
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])
RESOURCES = {
    "departments": (Department, {"name", "code"}),
    "classes": (CourseClass, {"name", "section", "academic_year"}),
    "holidays": (Holiday, {"name", "date", "description"}),
    "locations": (AllowedLocation, {"name", "latitude", "longitude", "radius_meters", "is_active"}),
}

def dump_model(row):
    return {column.name: getattr(row, column.name) for column in row.__table__.columns}

def validate_location(values, current=None):
    try:
        latitude = float(values.get("latitude", getattr(current, "latitude", None)))
        longitude = float(values.get("longitude", getattr(current, "longitude", None)))
        radius = int(values.get("radius_meters", getattr(current, "radius_meters", None)))
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="Location requires latitude, longitude, and radius_meters") from exc
    if not isfinite(latitude) or not -90 <= latitude <= 90:
        raise HTTPException(status_code=422, detail="Latitude must be between -90 and 90")
    if not isfinite(longitude) or not -180 <= longitude <= 180 or radius <= 0:
        raise HTTPException(status_code=422, detail="Invalid longitude or radius")
    return {"latitude": latitude, "longitude": longitude, "radius_meters": radius}

def person_data(db, kind):
    model = Teacher if kind == "teachers" else Student
    rows = db.scalars(select(model).order_by(model.id.desc()))
    output = []
    for row in rows:
        user = db.get(User, row.user_id)
        output.append({"id": row.id, "user_id": row.user_id,
            "full_name": user.full_name if user else "", "email": user.email if user else "",
            "employee_number": getattr(row, "employee_number", None),
            "roll_number": getattr(row, "roll_number", None)})
    return output

@router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    return {row.key: row.value for row in db.scalars(select(AppSetting))}

@router.put("/settings")
def put_settings(values: dict[str, Any], db: Session = Depends(get_db)):
    allowed = {"office_start_time", "late_after_minutes", "half_day_hours"}
    if set(values) - allowed:
        raise HTTPException(status_code=422, detail="Unsupported settings field")
    for key, value in values.items():
        row = db.scalar(select(AppSetting).where(AppSetting.key == key))
        if row is None: db.add(AppSetting(key=key, value=str(value)))
        else: row.value = str(value)
    db.commit()
    return get_settings(db)

@router.get("/leaves")
def list_leaves(db: Session = Depends(get_db)):
    rows = db.scalars(select(LeaveRequest).order_by(LeaveRequest.created_at.desc()))
    result = []
    for row in rows:
        user = db.get(User, row.user_id)
        result.append({**dump_model(row), "user": {"id": user.id, "full_name": user.full_name, "email": user.email} if user else None})
    return result

@router.post("/leaves/{request_id}/{decision}")
def decide_leave(request_id: int, decision: str, db: Session = Depends(get_db)):
    if decision not in {"approve", "reject"}:
        raise HTTPException(status_code=404, detail="Unknown leave decision")
    row = db.get(LeaveRequest, request_id)
    if row is None: raise HTTPException(status_code=404, detail="Leave request not found")
    if row.status != "pending": raise HTTPException(status_code=409, detail="Request was already reviewed")
    row.status = "approved" if decision == "approve" else "rejected"
    db.commit(); db.refresh(row)
    return dump_model(row)

@router.get("/{resource}")
def list_resource(resource: str, db: Session = Depends(get_db)):
    if resource in {"teachers", "students"}: return person_data(db, resource)
    if resource == "admins":
        return [{"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}
                for user in db.scalars(select(User).where(User.role == "admin"))]
    if resource not in RESOURCES: raise HTTPException(status_code=404, detail="Unknown resource")
    model, _ = RESOURCES[resource]
    return [dump_model(row) for row in db.scalars(select(model).order_by(model.id.desc()))]

@router.post("/{resource}")
def create_resource(resource: str, values: dict[str, Any], db: Session = Depends(get_db)):
    if resource == "admins":
        if set(values) != {"full_name", "email", "password"}:
            raise HTTPException(status_code=422, detail="Admin requires full_name, email, and password")
        from app.core.security import hash_password
        user = User(full_name=values["full_name"], email=values["email"], role="admin",
                    password_hash=hash_password(values["password"]))
        db.add(user); db.commit(); db.refresh(user)
        return {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}
    if resource in {"teachers", "students"}:
        allowed = {"full_name", "email", "password", "employee_number" if resource == "teachers" else "roll_number"}
        if set(values) - allowed: raise HTTPException(status_code=422, detail="Unsupported field")
        required = {"full_name", "email", "password"}
        if required - set(values): raise HTTPException(status_code=422, detail="Name, email and password are required")
        from app.core.security import hash_password
        role = "teacher" if resource == "teachers" else "student"
        user = User(full_name=values["full_name"], email=values["email"], role=role,
                    password_hash=hash_password(values["password"]))
        db.add(user); db.flush()
        profile = Teacher(user_id=user.id, employee_number=values.get("employee_number")) if role == "teacher" else Student(user_id=user.id, roll_number=values.get("roll_number"))
        db.add(profile); db.commit(); db.refresh(profile)
        return {"id": profile.id, "user_id": user.id, "full_name": user.full_name, "email": user.email,
                "employee_number": getattr(profile, "employee_number", None), "roll_number": getattr(profile, "roll_number", None)}
    if resource not in RESOURCES: raise HTTPException(status_code=404, detail="Unknown resource")
    model, allowed = RESOURCES[resource]
    if set(values) - allowed: raise HTTPException(status_code=422, detail="Unsupported field")
    if resource == "locations": values.update(validate_location(values))
    if resource == "holidays": values["date"] = date.fromisoformat(values["date"])
    row = model(**values); db.add(row); db.commit(); db.refresh(row)
    return dump_model(row)

@router.patch("/{resource}/{item_id}")
def update_resource(resource: str, item_id: int, values: dict[str, Any], db: Session = Depends(get_db)):
    if resource in {"teachers", "students"}:
        model = Teacher if resource == "teachers" else Student
        row = db.get(model, item_id)
        if row is None: raise HTTPException(status_code=404, detail="Record not found")
        user = db.get(User, row.user_id)
        profile_fields = {"employee_number"} if resource == "teachers" else {"roll_number"}
        for key, value in values.items():
            if key in profile_fields: setattr(row, key, value)
            elif key in {"full_name", "email"}: setattr(user, key, value)
            else: raise HTTPException(status_code=422, detail="Unsupported field")
        db.commit(); return {"id": row.id, "full_name": user.full_name, "email": user.email}
    if resource not in RESOURCES: raise HTTPException(status_code=404, detail="Unknown resource")
    model, allowed = RESOURCES[resource]; row = db.get(model, item_id)
    if row is None: raise HTTPException(status_code=404, detail="Record not found")
    if set(values) - allowed: raise HTTPException(status_code=422, detail="Unsupported field")
    if resource == "locations": values.update(validate_location(values, row))
    if resource == "holidays" and "date" in values: values["date"] = date.fromisoformat(values["date"])
    for key, value in values.items(): setattr(row, key, value)
    db.commit(); db.refresh(row); return dump_model(row)

@router.delete("/{resource}/{item_id}")
def delete_resource(resource: str, item_id: int, db: Session = Depends(get_db)):
    if resource == "admins":
        row = db.get(User, item_id)
        if row is None or row.role != "admin": raise HTTPException(status_code=404, detail="Admin not found")
        admins = list(db.scalars(select(User).where(User.role == "admin")))
        if len(admins) <= 1: raise HTTPException(status_code=409, detail="Cannot delete the last admin")
        db.delete(row); db.commit(); return {"message": "Deleted"}
    if resource in {"teachers", "students"}:
        model = Teacher if resource == "teachers" else Student
        row = db.get(model, item_id)
        if row is None: raise HTTPException(status_code=404, detail="Record not found")
        user = db.get(User, row.user_id); db.delete(row)
        if user: db.delete(user)
    else:
        if resource not in RESOURCES: raise HTTPException(status_code=404, detail="Unknown resource")
        model, _ = RESOURCES[resource]; row = db.get(model, item_id)
        if row is None: raise HTTPException(status_code=404, detail="Record not found")
        db.delete(row)
    db.commit(); return {"message": "Deleted"}

