from fastapi import APIRouter, UploadFile, File, HTTPException
from services.termsheet_compare_service import compare_termsheets

router = APIRouter(
    prefix="/compare",
    tags=["Compare Term Sheets"]
)

@router.post("/termsheets")
async def compare_two_termsheets(
    ideal_file: UploadFile = File(...),
    input_file: UploadFile = File(...)
):
    try:
        result = await compare_termsheets(ideal_file, input_file)
        return {"status": "success", "comparison": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
