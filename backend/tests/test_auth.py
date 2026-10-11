from app.core.security import create_access_token
from app.models.user import User


def test_login_and_me(client):
    http, _db, _uploads = client
    response = http.post("/api/v1/auth/login", json={"email": "teacher@example.com", "password": "teacher-pass-123"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    me = http.get("/api/v1/auth/me", headers={"Authorization": "Bearer " + token})
    assert me.status_code == 200
    assert me.json()["email"] == "teacher@example.com"


def test_client_cannot_register_an_admin(client):
    http, db, _uploads = client
    response = http.post("/api/v1/auth/register", json={"full_name": "New Person", "email": "new@example.com", "password": "long-password", "role": "admin"})
    assert response.status_code == 400
    assert db.query(User).filter_by(email="new@example.com").count() == 0


def test_only_an_admin_can_create_an_admin(client):
    http, db, _uploads = client
    response = http.post("/api/v1/admin/admins", json={"full_name": "New Admin", "email": "new-admin@example.com", "password": "secure-password"})
    assert response.status_code == 403
    assert db.query(User).filter_by(email="new-admin@example.com").count() == 0

    admin = User(full_name="Existing Admin", email="existing-admin@example.com", role="admin", password_hash="unused")
    db.add(admin); db.commit()
    token = create_access_token(admin.id, admin.role)
    response = http.post("/api/v1/admin/admins", headers={"Authorization": "Bearer " + token},
        json={"full_name": "New Admin", "email": "new-admin@example.com", "password": "secure-password"})
    assert response.status_code == 200
    assert db.query(User).filter_by(email="new-admin@example.com", role="admin").count() == 1
