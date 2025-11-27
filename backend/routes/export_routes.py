# backend/routes/export_routes.py

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services import report_service
import os

router = APIRouter()

@router.get("/export/{validation_id}")
async def export_report(validation_id: str):
    result = await report_service.generate_report(validation_id)

    # Handle error responses from service
    if isinstance(result, dict) and "error" in result:
        status_code = result.get("status", 500)
        raise HTTPException(status_code=status_code, detail=result["error"])

    return {
        "message": "Report generated successfully",
        "report_link": result.get("report_link", "/reports/")
    }

@router.get("/download/{validation_id}")
async def download_report(validation_id: str):
    """Download the generated report as JSON file"""
    report_path = os.path.join("reports", f"{validation_id}.json")
    
    # Check if file exists
    if not os.path.exists(report_path):
        raise HTTPException(status_code=404, detail="Report not found. Generate report first.")
    
    return FileResponse(
        path=report_path,
        filename=f"validation_report_{validation_id}.json",
        media_type="application/json"
    )
