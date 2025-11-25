# backend/routes/export_routes.py

from fastapi import APIRouter, HTTPException
from services import report_service

router = APIRouter()

@router.get("/export/{validation_id}")
async def export_report(validation_id: str):

    link = await report_service.generate_report(validation_id)

    if link in ["Validation not found", "Invalid validation_id"]:
        raise HTTPException(status_code=404, detail=link)

    return {
        "message": "Report generated successfully",
        "report_link": link
    }
