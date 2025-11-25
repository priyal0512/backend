from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UploadModel(BaseModel):
    filename: str
    s3_url: Optional[str] = None
    status: str = "uploaded"
    extracted_fields: Optional[dict] = {}
    uploaded_at: datetime = datetime.utcnow()
