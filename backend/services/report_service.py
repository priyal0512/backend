# backend/services/report_service.py

from database.mongodb_config import db
from bson import ObjectId
import json, os

async def generate_report(validation_id: str):
    try:
        # Convert string → ObjectId
        try:
            oid = ObjectId(validation_id)
        except:
            return "Invalid validation_id"

        # Fetch the validation result
        result = await db["validation_results"].find_one({"_id": oid})
        if not result:
            return "Validation not found"

        # Make sure reports/ folder exists
        os.makedirs("reports", exist_ok=True)

        # Save JSON report
        report_path = f"reports/{validation_id}.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=4, default=str)

        # Return path the frontend can access
        return f"/reports/{validation_id}.json"

    except Exception as e:
        return f"Error: {str(e)}"
