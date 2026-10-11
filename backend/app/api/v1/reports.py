from calendar import monthrange
from datetime import date
from io import BytesIO
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from openpyxl import Workbook
from app.core.dependencies import require_admin
from app.db.session import get_db
from app.models.attendance import Attendance
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(require_admin)])

@router.get("/daily")
def daily_report(day: date | None = None, db: Session = Depends(get_db)):
    target = day or date.today()
    rows = list(db.scalars(select(Attendance).where(Attendance.date == target)))
    total_people = db.scalar(select(func.count(User.id)).where(User.role.in_(["teacher", "student"]))) or 0
    return {"date": target, "present": sum(1 for row in rows if row.status in {"present", "late", "half-day"}),
            "late": sum(1 for row in rows if row.status == "late"),
            "absent": max(0, total_people - len(rows)), "records": len(rows)}

def get_month_data(month: str, db: Session):
    try: year, number = map(int, month.split("-")); start = date(year, number, 1)
    except (ValueError, TypeError): raise HTTPException(status_code=422, detail="Month must be YYYY-MM")
    end = date(year, number, monthrange(year, number)[1])
    rows = list(db.scalars(select(Attendance).where(Attendance.date >= start, Attendance.date <= end).order_by(Attendance.date)))
    total_people = db.scalar(select(func.count(User.id)).where(User.role.in_(["teacher", "student"]))) or 0
    days = []
    for day_number in range(1, end.day + 1):
        current = date(year, number, day_number); today_rows = [row for row in rows if row.date == current]
        days.append({"date": current.isoformat(), "present": sum(1 for row in today_rows if row.status in {"present", "late", "half-day"}),
                     "late": sum(1 for row in today_rows if row.status == "late"),
                     "absent": max(0, total_people - len(today_rows)) if current <= date.today() else 0})
    return {"month": month, "days": days, "records": [{"date": row.date.isoformat(), "email": row.in_email, "status": row.status, "working_hours": row.working_hours} for row in rows]}

@router.get("/monthly")
def monthly_report(month: str, db: Session = Depends(get_db)):
    return get_month_data(month, db)

@router.get("/monthly/export")
def export_monthly(month: str, db: Session = Depends(get_db)):
    report = get_month_data(month, db); book = Workbook(); sheet = book.active; sheet.title = "Daily attendance"
    sheet.append(["Date", "Present", "Late", "Absent"])
    for row in report["days"]: sheet.append([row["date"], row["present"], row["late"], row["absent"]])
    sheet2 = book.create_sheet("Attendance records"); sheet2.append(["Date", "Email", "Status", "Working hours"])
    for row in report["records"]: sheet2.append([row["date"], row["email"], row["status"], row["working_hours"]])
    output = BytesIO(); book.save(output); output.seek(0)
    return StreamingResponse(output, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=attendance-" + month + ".xlsx"})
