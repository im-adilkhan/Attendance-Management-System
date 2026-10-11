from pydantic import BaseModel, ConfigDict, Field


class AttendancePhotoInput(BaseModel):
    photo: str = Field(min_length=20)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    model_config = ConfigDict(extra="forbid")
