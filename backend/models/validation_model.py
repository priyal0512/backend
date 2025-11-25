from pydantic import BaseModel
from datetime import datetime
from typing import Dict, List

class ValidationModel(BaseModel):
    upload_id: str
    extracted_fields: Dict
    master_fields: Dict
    mismatches: List[Dict]
    validation_score: float
    created_at: datetime = datetime.utcnow()
