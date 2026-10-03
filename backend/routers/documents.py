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

    # Tell Gemini to identify the document type first, then extract only relevant fields.
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

    Examples:

    For vehicle insurance:
    {
    "document_type": "vehicle_insurance",
    "fields": {
        "registration_number": "",
        "policy_number": "",
        "insurer": "",
        "policy_start": "",
        "policy_expiry": ""
    }
    }

    For driving licence:
    {
    "document_type": "driving_licence",
    "fields": {
        "name": "",
        "licence_number": "",
        "transport_valid_until": "",
        "non_transport_valid_until": ""
    }
    }

    For Aadhaar:
    {
    "document_type": "aadhaar_card",
    "fields": {
        "name": "",
        "aadhaar_number": ""
    }
    }

    For maintenance invoice:
    {
    "document_type": "maintenance_invoice",
    "fields": {
        "invoice_number": "",
        "invoice_date": "",
        "vehicle_registration_number": "",
        "vendor": "",
        "description": "",
        "amount": ""
    }
    }

    Rules:
    1. Do not put unrelated fields in the response.
    2. Do not put extracted information inside a generic description field.
    3. Only include fields relevant to the identified document type.
    4. If a relevant field is not visible, use an empty string.
    5. Do not guess or invent values.
    6. Return JSON only.
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