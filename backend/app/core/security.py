from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.core.config import settings

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return password_context.verify(password, hashed)


def create_access_token(
    user_id: int,
    role: str,
    expires_minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES,
) -> str:
    return jwt.encode(
        {"sub": str(user_id), "role": role,
         "exp": datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)},
        settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM,
    )
