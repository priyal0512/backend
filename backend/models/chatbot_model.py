from pydantic import BaseModel
from datetime import datetime

class ChatbotLog(BaseModel):
    query: str
    response: str
    created_at: datetime = datetime.utcnow()
