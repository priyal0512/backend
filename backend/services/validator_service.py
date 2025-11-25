import os
import json
import re
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# =========================================================
# Load .env and Gemini key
# =========================================================
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ Missing GEMINI_API_KEY")

MODEL_NAME = "gemini-2.5-flash"
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1/models/"
    f"{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
)

# =========================================================
# Load Master Schemas
# =========================================================
SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schemas" / "master_schemas.json"

with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
    MASTER_SCHEMAS = json.load(f)

# =========================================================
# Logger
# =========================================================
LOG_PATH = Path(__file__).resolve().parents[1] / "logs"
LOG_PATH.mkdir(exist_ok=True)
LOG_FILE = LOG_PATH / "ai_validation.log"


def log(msg: str):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{datetime.now().isoformat()} - {msg}\n")


# =========================================================
# Helper: extract JSON safely
# =========================================================
def extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text)
    text = re.sub(r"```$", "", text)

    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None

    raw = m.group(0)

    for attempt in [
        lambda s: s,
        lambda s: s.replace("'", '"'),
        lambda s: re.sub(r",\s*}", "}", s),
        lambda s: re.sub(r",\s*]", "]", s),
    ]:
        try:
            return json.loads(attempt(raw))
        except:
            pass

    return None


# =========================================================
# 🧠 Main Validator (UPDATED)
# =========================================================
def validate_fields(extracted_fields: dict, document_type: str = "unknown", deep_check=False):
    """
    Universal validator supporting all financial document types.
    """

    # ---------------------------------------------------------
    # 🔥 FIXED: Always use correct schema — fallback improved
    # ---------------------------------------------------------
    if document_type in MASTER_SCHEMAS:
        schema = MASTER_SCHEMAS[document_type]
    else:
        # fallback if unknown
        schema = MASTER_SCHEMAS.get("unknown", {})

    required_fields = schema.get("required_fields", [])
    optional_fields = schema.get("optional_fields", [])

    # 🔥 CRITICAL FIX — if schema had empty required fields, fallback to generic fields
    if not required_fields:
        required_fields = [
            "Company Name", "Date", "Investor", "Investment Amount",
            "Valuation (Pre-Money)", "Valuation (Post-Money)",
            "Equity to be Issued", "Issuer", "ISIN",
            "Issue Date", "Redemption Date"
        ]

    log(f"Validating doc_type={document_type}, required={required_fields}")

    # ---------------------------------------------------------
    # 2. Check presence
    # ---------------------------------------------------------
    missing = []
    present = {}

    for field in required_fields:
        if field in extracted_fields and extracted_fields[field]:
            present[field] = extracted_fields[field]
        else:
            missing.append(field)

    # ---------------------------------------------------------
    # BASE SCORE
    # ---------------------------------------------------------
    completeness_score = (
        (len(present) / len(required_fields)) * 100 if required_fields else 100
    )

    # RETURN SIMPLE RESULT IF DEEP CHECK OFF
    if not deep_check or completeness_score < 30:
        return {
            "document_type": document_type,
            "validated_fields": present,
            "issues": [f"Missing required fields: {missing}"] if missing else [],
            "score": round(completeness_score),
            "summary": f"{len(present)}/{len(required_fields)} required fields present.",
            "status": "Failed ❌" if completeness_score < 60 else "Needs Review ⚠️",
        }

    # ---------------------------------------------------------
    # 3. Deep validation using Gemini
    # ---------------------------------------------------------
    prompt = f"""
You are validating a financial term sheet.

Document Type: {document_type}

Extracted Fields:
{json.dumps(extracted_fields, indent=2)}

Required Fields:
{json.dumps(required_fields, indent=2)}

Perform:
- Format checking
- Logical consistency
- Percentage/currency checks
- Highlight incorrect values

Return ONLY valid JSON:
{{
  "validated_fields": {{}},
  "issues": [],
  "score": 0,
  "summary": ""
}}
"""

    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    log("Sending deep validation request to Gemini...")

    resp = requests.post(GEMINI_URL, headers=headers, json=payload, timeout=60)

    if resp.status_code != 200:
        return {
            "document_type": document_type,
            "validated_fields": present,
            "issues": [f"Gemini API error: {resp.status_code}"],
            "score": round(completeness_score),
            "summary": "Base validation only.",
            "status": "Needs Review ⚠️",
        }

    ai_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]

    parsed = extract_json(ai_text)
    if not parsed:
        return {
            "document_type": document_type,
            "validated_fields": present,
            "issues": ["Could not parse AI deep validation."],
            "score": round(completeness_score),
            "summary": "Base validation only.",
            "status": "Needs Review ⚠️",
        }

    # ---------------------------------------------------------
    # Final scoring
    # ---------------------------------------------------------
    parsed["score"] = round((parsed.get("score", 0) + completeness_score) / 2)
    parsed["document_type"] = document_type

    if parsed["score"] >= 85:
        parsed["status"] = "Validated ✅"
    elif parsed["score"] >= 60:
        parsed["status"] = "Needs Review ⚠️"
    else:
        parsed["status"] = "Failed ❌"

    return parsed
