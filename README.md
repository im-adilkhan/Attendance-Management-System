# Attendance Management System

FastAPI, SQLAlchemy, Alembic, PostgreSQL, and React + Vite BCA mini project.

## Local run (Windows)

1. Copy `.env.example` to `.env` in the repository root and set a private `SECRET_KEY`.
2. Create a PostgreSQL role and database (if they are not present):

   ```sql
   CREATE USER attendance_user WITH PASSWORD 'attendance_pass';
   CREATE DATABASE attendance_db OWNER attendance_user;
   ```

3. Start the backend:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   alembic upgrade head
   python -m app.db.seed
   uvicorn app.main:app --reload
   ```

4. In a second terminal start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

FastAPI docs: `http://localhost:8000/docs`. Vite: `http://localhost:5173`. Seed credentials: admin `admin@demo.com` / `admin123`; demo teacher `teacher@demo.com` / `teacher123`. Change these before sharing a deployment.

## Docker Compose

Copy `.env.example` to `.env`, set `SECRET_KEY`, then run:

```powershell
docker compose up --build
```

Compose runs PostgreSQL 16 with named volume `pgdata`, the API, and the frontend. The API waits for the database, applies migrations, and creates seed users and the office geofence on startup. Photos persist in `backend/uploads`.

## Tests

From `backend`, run `pytest`. The suite covers auth, authenticated email snapshots, check-in/out, duplicate check-in, geofence, and distance calculations.

## Deploy to Render and Vercel

1. Push the repository to GitHub and connect it to Render. The root `render.yaml` blueprint creates PostgreSQL and a Python API service. The API applies Alembic migrations at startup.
2. Deploy the Render blueprint. After the first successful deploy, open the API service Shell and run `python -m app.db.seed` once. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `CORS_ALLOWED_ORIGINS` on the API service. Set CORS to the exact Vercel origin (for example `https://your-project.vercel.app`, with no trailing slash). Uploaded images use Render's persistent disk mounted at `/var/data`.
3. Import the repository in Vercel and set Root Directory to `frontend`. Set `VITE_API_URL` to the Render API URL plus `/api/v1`, such as `https://attendance-api.onrender.com/api/v1`, then redeploy. `frontend/vercel.json` rewrites app routes to the SPA entry.
4. After the Vercel URL is available, confirm the same origin in Render's `CORS_ALLOWED_ORIGINS` and redeploy the API. Keep the generated `SECRET_KEY` private.

The frontend reads `VITE_API_URL` at build time. The backend serves generated photos through an authenticated API route that checks the attendance owner and resolves paths inside the configured upload directory.


### Render upload persistence

The Render blueprint provisions a persistent disk mounted at `/var/data` and sets `UPLOAD_DIR=/var/data/uploads`. Persistent disks require a paid Render web service; the free web-service filesystem is ephemeral, so uploaded photos can disappear on restart or redeploy. Keep the disk enabled, or replace local photo storage with Cloudinary or S3 before using a free instance. Configure CORS_ALLOWED_ORIGINS and VITE_API_URL as described above.

