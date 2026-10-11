"""Create the initial admin account if it does not already exist.

Requires ADMIN_EMAIL=admin@demo.com and ADMIN_PASSWORD in the process
environment. An existing account is left unchanged.
"""
import os

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User


def main() -> None:
    email = os.environ.get("ADMIN_EMAIL", "").strip()
    password = os.environ.get("ADMIN_PASSWORD", "")
    if email.lower() != "admin@demo.com" or not password:
        raise SystemExit("Set ADMIN_EMAIL=admin@demo.com and a non-empty ADMIN_PASSWORD.")

    with SessionLocal.begin() as db:
        existing = db.scalar(select(User).where(User.email == email))
        if existing is not None:
            print("Admin account already exists; no changes made.")
            return

        db.add(User(
            full_name="System Administrator",
            email=email,
            role="admin",
            password_hash=hash_password(password),
        ))

    print("Admin account created.")


if __name__ == "__main__":
    main()
