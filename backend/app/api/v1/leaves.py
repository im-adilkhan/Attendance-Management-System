from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.leave_request import LeaveRequest
from app.models.user import User
from app.api.v1.admin import dump_model
from pydantic import BaseModel, Field
from datetime import date

router = APIRouter(prefix="/leaves", tags=["leaves"])
class LeaveInput(BaseModel):
    start_date: date
    end_date: date
    reason: str = Field(min_length=3, max_length=2000)

@router.post("")
def apply_leave(data: LeaveInput, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.end_date < data.start_date: raise HTTPException(status_code=422, detail="End date must be on or after start date")
    row = LeaveRequest(user_id=user.id, start_date=data.start_date, end_date=data.end_date, reason=data.reason)
    db.add(row); db.commit(); db.refresh(row); return dump_model(row)

@router.get("")
def my_leaves(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(LeaveRequest).where(LeaveRequest.user_id == user.id).order_by(LeaveRequest.created_at.desc()))
    return [dump_model(row) for row in rows]
