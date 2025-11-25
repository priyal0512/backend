# backend/routes/chatbot_routes.py

from fastapi import APIRouter
from pydantic import BaseModel
from services import chatbot_service

# ✅ define router — REQUIRED by FastAPI
router = APIRouter()

class Query(BaseModel):
    query: str

@router.post("/chatbot")
async def chatbot_response(query: Query):
    """
    Handles chatbot queries by sending them to the AI service and returning a response.
    """
    try:
        response = await chatbot_service.respond(query.query)
        return {"answer": response}
    except Exception as e:
        return {"error": str(e)}
