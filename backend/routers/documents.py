# Provides an API endpoint for uploading fleet documents from the mobile app.
from pathlib import Path
import json
from fastapi import APIRouter, File, UploadFile, HTTPException
# Gemini client and environment configuration for document extraction.
import os
from google import genai

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

# Sends the uploaded document to Gemini and returns structured extracted information.
@router.post("/process")
async def process_document(file: UploadFile = File(...)):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured.",
        )

    client = genai.Client(api_key=api_key)

    file_content = await file.read()

    prompt = """
    Analyze this fleet document.

    Identify the document type and extract the important information.

    Return ONLY valid JSON with this structure:

    {
      "document_type": "",
      "registration_number": "",
      "policy_number": "",
      "insurer": "",
      "policy_start": "",
      "policy_expiry": "",
      "invoice_number": "",
      "invoice_date": "",
      "amount": "",
      "description": ""
    }

    If a field is not present, return an empty string.
    """

    # Request structured JSON directly from Gemini instead of Markdown-wrapped JSON.
    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=[
            prompt,
            {
                "inline_data": {
                    "mime_type": file.content_type or "image/jpeg",
                    "data": file_content,
                }
            },
        ],
        config={
            "response_mime_type": "application/json",
        },
    )
    # Convert Gemini's JSON response text into structured data for the frontend.
    extracted_data = json.loads(response.text)

    return {
        "message": "Document processed successfully.",
        "extracted_data": extracted_data,
    }