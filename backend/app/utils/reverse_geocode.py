import httpx
from app.core.config import settings

def reverse_geocode(latitude: float, longitude: float) -> str | None:
    """Ask OpenStreetMap for a human-readable address; outages are non-fatal."""
    try:
        response = httpx.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"format": "jsonv2", "lat": latitude, "lon": longitude},
            headers={"User-Agent": "AttendanceManagementBCA/1.0 contact: admin@demo.com"},
            timeout=4.0,
        )
        response.raise_for_status()
        return response.json().get("display_name")
    except (httpx.HTTPError, ValueError, TypeError):
        return None
