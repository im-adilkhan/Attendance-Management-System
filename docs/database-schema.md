# Database schema

## users

User identity, role, and password hash. Email is unique. The seed creates admin@demo.com and teacher@demo.com demo accounts.

## teachers and students

Teacher and student profile rows each reference one user. Teacher profiles can include employee_number and department_id. Student profiles can include roll_number and class_id.

## departments, classes, and subjects

Departments have a unique name and code. Classes store name, section, and academic_year. Subjects can reference a department.

## allowed_locations

Stores active office geofences with latitude, longitude (Numeric(9,6)) and radius_meters. Haversine distance is checked at both attendance events.

## attendance

One row per person and local calendar date, enforced by unique (user_id, date). Fields include timezone-aware in_time/out_time, in_email/out_email snapshots, stamped in_photo/out_photo paths, Numeric(9,6) coordinates, reverse-geocoded addresses, status, and working_hours.

## leave_requests, holidays, notifications, app_settings

Leave requests reference the applicant and include date range, reason, status, and reviewer note. Holidays store a unique date. Notifications belong to a user. App settings store office_start_time, late_after_minutes, and half_day_hours key/value pairs.

The initial Alembic revision creates the registered models. Run `alembic upgrade head` from backend.
