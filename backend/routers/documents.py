# Provides an API endpoint for uploading fleet documents from the mobile app.
from pathlib import Path
import json
from fastapi import APIRouter, File, UploadFile, HTTPException
# Gemini client and environment configuration for document extraction.
import os
from google import genai
# Generates unique IDs for uploaded documents.
from uuid import uuid4

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

UPLOAD_DIR = Path("uploads/documents")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Uploads a document using a unique ID so files never overwrite each other.
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

    # Generate a unique ID for this document.
    document_id = str(uuid4())

    file_extension = Path(file.filename or "").suffix.lower()

    if not file_extension:
        file_extension = ".jpg"

    safe_filename = f"{document_id}{file_extension}"
    file_path = UPLOAD_DIR / safe_filename

    file_content = await file.read()
    file_path.write_bytes(file_content)

    return {
        "message": "Document uploaded successfully.",
        "document_id": document_id,
        "filename": safe_filename,
        "path": str(file_path),
    }

# Processes a previously uploaded document using its document ID.
@router.post("/process")
async def process_document(document_id: str):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured.",
        )

    # Find the uploaded document using its unique ID.
    matching_files = list(UPLOAD_DIR.glob(f"{document_id}.*"))

    if not matching_files:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    file_path = matching_files[0]
    file_content = file_path.read_bytes()

    # Determine the MIME type from the file extension.
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".pdf": "application/pdf",
    }

    mime_type = mime_types.get(
        file_path.suffix.lower(),
        "application/octet-stream",
    )

    client = genai.Client(api_key=api_key)

    # Tell Gemini to identify the document type and extract relevant fields.
    prompt = """
    Analyze the uploaded fleet-related document.

    First identify the document type.

    Then extract ONLY the fields that are actually present and relevant to that document type.

    Return ONLY valid JSON using this structure:

    {
      "document_type": "",
      "fields": {}
    }

    Use these document types when applicable:

    - vehicle_insurance
    - vehicle_rc
    - driving_licence
    - aadhaar_card
    - maintenance_invoice
    - fuel_receipt
    - transport_bill
    - permit
    - other

    Rules:
    1. Do not put unrelated fields in the response.
    2. Do not put extracted information inside a generic description field.
    3. Only include fields relevant to the identified document type.
    4. If a relevant field is not visible, use an empty string.
    5. Do not guess or invent values.
    6. Return JSON only.
    """

    # Request structured JSON directly from Gemini.
    response = client.models.generate_content(
        # Use Gemini 3.7 Flash for document extraction.
        model="gemini-3.7-flash",       
        contents=[
            prompt,
            {
                "inline_data": {
                    "mime_type": mime_type,
                    "data": file_content,
                }
            },
        ],
        config={
            "response_mime_type": "application/json",
        },
    )

    # Convert Gemini's JSON response into a Python dictionary.
    extracted_data = json.loads(response.text)

    return {
        "message": "Document processed successfully.",
        "document_id": document_id,
        "extracted_data": extracted_data,
    }