from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.dependencies import get_current_user
from app.models.user import User
from app.utils.reverse_geocode import reverse_geocode

router = APIRouter(prefix="/locations", tags=["locations"])

@router.get("/reverse")
def reverse_location(latitude: float = Query(ge=-90, le=90),
                     longitude: float = Query(ge=-180, le=180),
                     _user: User = Depends(get_current_user)):
    address = reverse_geocode(latitude, longitude)
    if address is None:
        raise HTTPException(status_code=503, detail="Address lookup is temporarily unavailable")
    return {"address": address}
