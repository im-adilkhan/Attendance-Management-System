from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.attendance import router as attendance_router
from app.api.v1.auth import router as auth_router
from app.api.v1.admin import router as admin_router
from app.api.v1.leaves import router as leaves_router
from app.api.v1.locations import router as locations_router
from app.api.v1.reports import router as reports_router
from app.core.config import cors_origins

app = FastAPI(title="Attendance Management System")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(attendance_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(leaves_router, prefix="/api/v1")
app.include_router(locations_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
@app.get("/health")
def health():
    return {"status": "ok"}
