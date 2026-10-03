# Provides an API endpoint for uploading fleet documents from the mobile app.
from pathlib import Path

from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

UPLOAD_DIR = Path("uploads/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type.",
        )

    file_extension = Path(file.filename or "").suffix.lower()

    if not file_extension:
        file_extension = ".jpg"

    safe_filename = f"{Path(file.filename or 'document').stem}{file_extension}"

    file_path = UPLOAD_DIR / safe_filename

    file_content = await file.read()
    file_path.write_bytes(file_content)

    return {
        "message": "Document uploaded successfully.",
        "filename": safe_filename,
        "path": str(file_path),
    }