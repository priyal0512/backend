# backend/services/report_service.py

from database.mongodb_config import db
from bson import ObjectId
import json, os
from utils.logger import log

async def generate_report(validation_id: str):
    try:
        log(f"Generating report for validation_id: {validation_id}")
        
        # Convert string → ObjectId
        try:
            oid = ObjectId(validation_id)
        except Exception as e:
            log(f"Invalid validation_id format: {validation_id} - {str(e)}")
            return {"error": "Invalid validation_id format", "status": 400}

        # Fetch the validation result
        result = await db["validation_results"].find_one({"_id": oid})
        
        if not result:
            log(f"Validation not found for ID: {validation_id}. Checking database...")
            # Debug: check what's in the database
            all_validations = await db["validation_results"].find({}).to_list(length=5)
            log(f"Database contains {len(all_validations)} validations")
            for v in all_validations:
                log(f"  - ID: {v.get('_id')}")
            return {"error": "Validation not found", "status": 404}

        # Make sure reports/ folder exists
        os.makedirs("reports", exist_ok=True)

        # Save JSON report
        report_path = f"reports/{validation_id}.json"
        
        # Create a copy to avoid modifying original
        report_data = dict(result)
        
        # Convert ObjectId to string for JSON serialization
        if "_id" in report_data:
            report_data["_id"] = str(report_data["_id"])
        if "upload_id" in report_data:
            report_data["upload_id"] = str(report_data["upload_id"])
            
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=4, default=str)

        log(f"Report generated successfully for validation_id: {validation_id}")
        # Return path the frontend can access
        return {"success": True, "report_link": f"/reports/{validation_id}.json", "status": 200}

    except Exception as e:
        log(f"Error generating report: {str(e)}")
        return {"error": f"Error generating report: {str(e)}", "status": 500}
