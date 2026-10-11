# API documentation

Base prefix: `/api/v1`. Interactive documentation is served by FastAPI at `/docs`.
All protected endpoints use `Authorization: Bearer <JWT>`. The JWT subject is the user id; role checks use the database user role.

## Authentication

- POST `/auth/register`: create a teacher or student with `{full_name,email,password,role}`. Public registration cannot create an admin.
- POST `/auth/login`: `{email,password}`; returns `access_token`, `token_type`, and public user details.
- GET `/auth/me`: return the authenticated account.

## Attendance

- POST `/attendance/check-in`
- POST `/attendance/check-out`

Both accept exactly `{photo,latitude,longitude}`. Email, name, address, time, status, and working hours are server-controlled. The API verifies the active geofence, stamps and stores the photo, and reverse-geocodes the coordinates. Check-in is unique per user and local calendar date. Check-out computes working hours and applies the configured half-day threshold.

- GET `/attendance/my-history`: current user's records.
- GET `/attendance/photo/{record_id}/{in|out}`: returns a stamped image only to the record owner or an admin.
- GET `/attendance/records?email=...&date=YYYY-MM-DD`: admin-only record search.

## Administration

Admin-only CRUD collections use GET/POST `/admin/{teachers|students|classes|departments|holidays|locations}`. Update with PATCH `/admin/{collection}/{id}` and delete with DELETE on the same item path. Settings use GET/PUT `/admin/settings`. Review leave requests with GET `/admin/leaves` and POST `/admin/leaves/{id}/approve` or `/reject`.

Teachers/students are created with full_name, email, password, employee_number or roll_number, and an assignment: teachers require department_id; students require class_id (the course/class record). These assignment ids can be changed with PATCH. Create departments and classes first. Office locations use name, latitude, longitude, radius_meters, and optional is_active.

## Leaves and reports

- POST `/leaves`: `{start_date,end_date,reason}` for the current account.
- GET `/leaves`: current user's requests.
- GET `/reports/daily?day=YYYY-MM-DD`: daily counts (admin).
- GET `/reports/monthly?month=YYYY-MM`: daily summaries and records (admin).
- GET `/reports/monthly/export?month=YYYY-MM`: Excel workbook download (admin).

## Configuration

Set DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES, UPLOAD_DIR, and comma-separated CORS_ALLOWED_ORIGINS in the environment. Attendance photos are delivered through the authenticated `/attendance/photo/{record_id}/{in|out}` endpoint. Teachers can read only their own photos; admins can read attendance photos.


