# Structure

This project follows the attendance-management-system tree supplied in the project request.

- backend/ — FastAPI application, Alembic, uploads, and pytest suite.
  - app/core/ — settings, JWT security, and dependencies.
  - app/db/ — SQLAlchemy base/session and seed data.
  - app/models/ — user, teacher, student, department, class, subject, attendance, location, leave, holiday, notification, and application settings.
  - app/schemas/ — request and response schemas.
  - app/api/v1/ — versioned authentication, attendance, administration, leave, and report endpoints.
  - app/services/ — photo stamping and geofence/address services.
  - app/utils/ — geographic calculations and reverse geocoding.
- frontend/ — React + Vite UI, API client, role context/routes, reusable components, hooks, teacher pages, and admin pages.
- docs/ — database and HTTP API documentation.
- docker-compose.yml — PostgreSQL, API, and frontend services.
- render.yaml and frontend/vercel.json — cloud deployment configuration.
