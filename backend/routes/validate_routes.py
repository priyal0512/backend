# backend/routes/validate_routes.py

from fastapi import APIRouter, HTTPException
from database.mongodb_config import db
from bson import ObjectId
from services import validator_service
import json

# ✅ MUST BE AT TOP LEVEL
router = APIRouter()

@router.post("/validate/{upload_id}")
async def validate(upload_id: str):
    """
    Runs validation for the uploaded term sheet.
    Uses the universal AI validator.
    """

    try:
        # 1. Fetch upload record
        upload = await db["uploads"].find_one({"_id": ObjectId(upload_id)})
        if not upload:
            raise HTTPException(status_code=404, detail="Upload not found")

        extracted = upload.get("extracted_fields", {})
        document_type = upload.get("document_type", "unknown")

        if not extracted:
            raise HTTPException(
                status_code=400,
                detail="No extracted fields to validate"
            )

        # Fix: JSON string stored in DB
        if isinstance(extracted, str):
            try:
                extracted = json.loads(extracted)
            except:
                raise HTTPException(
                    status_code=400,
                    detail="Extracted fields are not valid JSON"
                )

        # 2. Run validator
        validation_result = validator_service.validate_fields(
            extracted_fields=extracted,
            document_type=document_type,
            deep_check=False
        )

        # Fix: ensure dict
        if isinstance(validation_result, str):
            try:
                validation_result = json.loads(validation_result)
            except:
                validation_result = {"error": "Bad validator output"}

        # 3. Save results
        vdoc = {
            "upload_id": upload_id,
            "document_type": validation_result.get("document_type", document_type),
            "validated_fields": validation_result.get("validated_fields", {}),
            "issues": validation_result.get("issues", []),
            "score": validation_result.get("score", 0),
            "summary": validation_result.get("summary", "No summary"),
            "status": validation_result.get("status", "Unknown"),
        }

        result = await db["validation_results"].insert_one(vdoc)

        # 4. Return response
        return {
            "message": "AI validation completed ✅",
            "validation_id": str(result.inserted_id),
            "document_type": vdoc["document_type"],
            "score": vdoc["score"],
            "status": vdoc["status"],
            "summary": vdoc["summary"],
            "issues": vdoc["issues"],
            "validated_fields": vdoc["validated_fields"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")
