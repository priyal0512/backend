# backend/routes/upload_routes.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from database.mongodb_config import db
from services import parser_service
import aiofiles
import os
import uuid

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_term_sheet(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        unique_filename = f"uploaded_{uuid.uuid4().hex}.pdf"
        save_path = os.path.join(UPLOAD_DIR, unique_filename)

        async with aiofiles.open(save_path, "wb") as buffer:
            content = await file.read()
            await buffer.write(content)

        # Extract fields using parser
        print(f"\n📄 Extracting fields from: {save_path}")
        extracted = parser_service.extract_fields(save_path)

        print("\n🧩 Extracted fields output:")
        print(extracted)

        # Fallback safeguard
        if not extracted or "error" in extracted:
            extracted = {"warning": "No structured fields extracted"}

        doc = {
            "filename": file.filename,
            "path": save_path,
            "status": "parsed",
            "extracted_fields": extracted,
        }

        result = await db["uploads"].insert_one(doc)

        return {
            "message": "File uploaded successfully ✅",
            "upload_id": str(result.inserted_id),
            "saved_to": save_path
        }

    except Exception as e:
        print(f"\n❌ Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")
