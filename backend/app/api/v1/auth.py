from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import LoginInput, RegisterInput

router = APIRouter(prefix="/auth", tags=["auth"])

def public_user(user: User) -> dict:
    return {"id": user.id, "full_name": user.full_name, "email": user.email, "role": user.role}

@router.post("/register")
def register(data: RegisterInput, db: Session = Depends(get_db)):
    if data.role not in {"teacher", "student"}:
        raise HTTPException(status_code=400, detail="Role must be teacher or student")
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(status_code=409, detail="Email is already registered")
    user = User(full_name=data.full_name, email=data.email, role=data.role,
                password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"access_token": create_access_token(user.id, user.role),
            "token_type": "bearer", "user": public_user(user)}

@router.post("/login")
def login(data: LoginInput, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email))
    if user is None or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return {"access_token": create_access_token(user.id, user.role),
            "token_type": "bearer", "user": public_user(user)}

@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return public_user(user)
