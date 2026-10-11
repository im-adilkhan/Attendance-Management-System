import base64
import binascii
import io
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from PIL import Image, ImageDraw, ImageFont, UnidentifiedImageError


def save_stamped_photo(base64_img: str, folder: str, name: str, email: str,
                       lat: float, lng: float, upload_root: str = "uploads") -> str:
    """Decode an image, stamp identity/time/location, and persist it under uploads."""
    encoded = base64_img.split(",")[-1]
    try:
        image_bytes = base64.b64decode(encoded, validate=True)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except (binascii.Error, UnidentifiedImageError, ValueError) as exc:
        raise ValueError("Photo must be a valid base64 encoded image") from exc

    draw = ImageDraw.Draw(image)
    font = ImageFont.load_default()
    stamp_time = datetime.now().astimezone().strftime("%d-%m-%Y %I:%M:%S %p")
    lines = [f"{name} | {email}", stamp_time, f"Lat: {lat:.5f}, Lng: {lng:.5f}"]
    line_height = 15
    strip_height = line_height * len(lines) + 12
    width, height = image.size
    top = max(0, height - strip_height)
    draw.rectangle([(0, top), (width, height)], fill=(0, 0, 0))
    draw.multiline_text((10, top + 5), "\n".join(lines), fill=(255, 255, 255),
                        font=font, spacing=0)

    # Only generated filenames and the expected attendance folders are allowed.
    if folder not in {"checkin_photos", "checkout_photos", "profile_photos"}:
        raise ValueError("Invalid photo folder")
    relative_path = Path(folder) / f"{uuid4().hex}.jpg"
    upload_root_path = Path(upload_root).resolve()
    destination = (upload_root_path / relative_path).resolve()
    if not destination.is_relative_to(upload_root_path):
        raise ValueError("Invalid photo path")
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "JPEG", quality=85)
    # Store a path relative to the private upload directory for photo API reads.
    return relative_path.as_posix()
