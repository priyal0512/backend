from pydantic import BaseModel
from datetime import datetime

class ReportModel(BaseModel):
    validation_id: str
    report_link: str
    generated_at: datetime = datetime.utcnow()
