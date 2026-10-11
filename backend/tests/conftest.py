import base64
import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import create_access_token, hash_password
from app.core.dependencies import get_db
from app.db.base import Base
from app.main import app
from app.models.allowed_location import AllowedLocation
from app.models.user import User

@pytest.fixture
def client(tmp_path, monkeypatch):
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)
    db = TestingSession()
    user = User(id=1, full_name="Test Teacher", email="teacher@example.com", role="teacher",
                password_hash=hash_password("teacher-pass-123"))
    db.add(user)
    db.add(AllowedLocation(name="Test Office", latitude=12.9716, longitude=77.5946,
                           radius_meters=250, is_active=True))
    db.commit()
    monkeypatch.setattr("app.api.v1.attendance.settings.UPLOAD_DIR", str(tmp_path))
    monkeypatch.setattr("app.api.v1.attendance.reverse_geocode", lambda _lat, _lng: "Test address")
    def override_db():
        yield db
    app.dependency_overrides[get_db] = override_db
    token = create_access_token(user.id, user.role)
    with TestClient(app, headers={"Authorization": "Bearer " + token}) as test_client:
        yield test_client, db, tmp_path
    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def photo_data():
    buffer = io.BytesIO()
    Image.new("RGB", (320, 240), "white").save(buffer, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode()
