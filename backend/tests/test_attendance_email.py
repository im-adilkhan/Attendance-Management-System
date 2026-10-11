from app.models.attendance import Attendance
from app.core.security import create_access_token
from app.models.user import User


def payload(photo, **extra):
    return {"photo": photo, "latitude": 12.9716, "longitude": 77.5946, **extra}


def test_check_in_email_is_taken_from_authenticated_user(client, photo_data):
    http, db, uploads = client
    response = http.post("/api/v1/attendance/check-in", json=payload(photo_data))
    assert response.status_code == 200
    record = db.query(Attendance).one()
    assert record.in_email == "teacher@example.com"
    assert (uploads / record.in_photo).is_file()


def test_checkout_email_is_taken_from_authenticated_user(client, photo_data):
    http, db, _uploads = client
    http.post("/api/v1/attendance/check-in", json=payload(photo_data))
    response = http.post("/api/v1/attendance/check-out", json=payload(photo_data))
    assert response.status_code == 200
    assert db.query(Attendance).one().out_email == "teacher@example.com"


def test_email_is_not_an_accepted_client_field(client, photo_data):
    http, db, _uploads = client
    response = http.post("/api/v1/attendance/check-in", json=payload(photo_data, email="spoof@example.com"))
    assert response.status_code == 422
    assert db.query(Attendance).count() == 0


def test_double_checkin_is_blocked(client, photo_data):
    http, _db, _uploads = client
    assert http.post("/api/v1/attendance/check-in", json=payload(photo_data)).status_code == 200
    assert http.post("/api/v1/attendance/check-in", json=payload(photo_data)).status_code == 409


def test_outside_geofence_is_rejected(client, photo_data):
    http, db, _uploads = client
    response = http.post("/api/v1/attendance/check-in", json=payload(photo_data, latitude=0, longitude=0))
    assert response.status_code == 403
    assert db.query(Attendance).count() == 0


def test_photo_endpoint_requires_owner_or_admin(client, photo_data):
    http, db, _uploads = client
    response = http.post("/api/v1/attendance/check-in", json=payload(photo_data))
    assert response.status_code == 200
    record = db.query(Attendance).one()
    path = f"/api/v1/attendance/photo/{record.id}/in"
    assert http.get(path).status_code == 200

    other = User(full_name="Other Teacher", email="other@example.com", role="teacher", password_hash="unused")
    admin = User(full_name="Admin", email="admin@example.com", role="admin", password_hash="unused")
    db.add_all([other, admin])
    db.commit()
    other_token = create_access_token(other.id, other.role)
    admin_token = create_access_token(admin.id, admin.role)
    assert http.get(path, headers={"Authorization": "Bearer " + other_token}).status_code == 404
    assert http.get(path, headers={"Authorization": "Bearer " + admin_token}).status_code == 200
