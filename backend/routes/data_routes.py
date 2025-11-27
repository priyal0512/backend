# backend/routes/data_routes.py

from fastapi import APIRouter, HTTPException
from database.mongodb_config import db
from bson import ObjectId

router = APIRouter()

@router.get("/uploads")
async def get_all_uploads():
    """Get all uploaded files"""
    try:
        uploads = await db["uploads"].find({}).to_list(length=None)
        
        # Convert ObjectId to string for JSON serialization
        for upload in uploads:
            if "_id" in upload:
                upload["_id"] = str(upload["_id"])
            if "upload_id" in upload and isinstance(upload["upload_id"], ObjectId):
                upload["upload_id"] = str(upload["upload_id"])
        
        return uploads
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch uploads: {str(e)}")

@router.get("/validations")
async def get_all_validations():
    """Get all validation results"""
    try:
        validations = await db["validation_results"].find({}).to_list(length=None)
        
        # Convert ObjectId to string for JSON serialization
        for validation in validations:
            if "_id" in validation:
                validation["_id"] = str(validation["_id"])
            if "upload_id" in validation and isinstance(validation["upload_id"], ObjectId):
                validation["upload_id"] = str(validation["upload_id"])
        
        return validations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch validations: {str(e)}")

@router.get("/stats")
async def get_stats():
    """Get dashboard statistics"""
    try:
        uploads = await db["uploads"].count_documents({})
        validations = await db["validation_results"].count_documents({})
        
        # Calculate success rate
        validation_docs = await db["validation_results"].find({}).to_list(length=None)
        successful = sum(1 for v in validation_docs if v.get("status") in ["Valid", "Approved"])
        success_rate = round((successful / validations * 100)) if validations > 0 else 0
        
        # Count total issues
        total_issues = sum(len(v.get("issues", [])) for v in validation_docs)
        
        return {
            "totalUploads": uploads,
            "totalValidations": validations,
            "successRate": success_rate,
            "totalIssues": total_issues,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")
