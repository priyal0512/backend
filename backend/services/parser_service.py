# backend/services/parser_service.py

import fitz  # PyMuPDF
import os
import json
import re
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai
from datetime import datetime

# =========================================================
# 1️⃣ Load Environment & Gemini key
# =========================================================
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found in .env file")

genai.configure(api_key=GEMINI_API_KEY)

# =========================================================
# Logging
# =========================================================
LOG_PATH = Path(__file__).resolve().parents[1] / "logs"
LOG_PATH.mkdir(exist_ok=True)
LOG_FILE = LOG_PATH / "parser.log"

def log_to_file(message: str):
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{datetime.now().isoformat()} - {message}\n")


# =========================================================
# 2️⃣ PDF TEXT EXTRACTION
# =========================================================
def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        text = ""
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text("text") + "\n"
        doc.close()

        cleaned = text.strip()
        log_to_file(f"Extracted {len(cleaned)} chars from PDF: {pdf_path}")
        return cleaned
    except Exception as e:
        log_to_file(f"PDF extraction error: {e}")
        return ""


# =========================================================
# 3️⃣ DOCUMENT CLASSIFICATION
# =========================================================
HEURISTICS = {
    "structured_note": [
        "ISIN", "Autocall", "Knock-in", "Barrier", "Underlying",
        "Calculation Amount", "Reference Index", "Strike Level"
    ],
    "startup_equity": [
        "Pre-Money", "Post-Money", "Equity", "SAFE", "Investment Amount",
        "Valuation", "Cap Table"
    ],
    "venture_debt": ["Warrants", "Loan", "Borrower", "Covenants"],
    "bank_loan": ["Facility", "Interest Rate", "Borrower"],
    "m_and_a": ["Buyer", "Seller", "Purchase Price"],
    "real_estate": ["Property", "Lease", "Possession"],
}

def classify_doc(text: str) -> str:
    try:
        snippet = text[:10000]
        scores = {t: 0 for t in HEURISTICS}

        for doc_type, patterns in HEURISTICS.items():
            for p in patterns:
                if p.lower() in snippet.lower():
                    scores[doc_type] += 1

        best = max(scores, key=lambda x: scores[x])
        if scores[best] > 0:
            log_to_file(f"Document classified (heuristic): {best}")
            return best

        # AI FALLBACK
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
Classify the following term sheet into exactly ONE category:
startup_equity, structured_note, bank_loan, venture_debt, m_and_a, real_estate, unknown.

Return ONLY the category.

TEXT:
{snippet[:6000]}
"""

        resp = model.generate_content(prompt)
        text_out = resp.text.strip().lower().replace(" ", "_")

        if text_out in HEURISTICS or text_out == "unknown":
            log_to_file(f"Document classified (AI): {text_out}")
            return text_out

        return "unknown"

    except Exception as e:
        log_to_file(f"Doc classify error: {e}")
        return "unknown"


# =========================================================
# 4️⃣ REGEX EXTRACTION
# =========================================================
def extract_regex(text: str, doc_type: str) -> dict:
    extracted = {}

    patterns = {
        # universal
        "Company Name": [r"Company Name[:\s-]+(.+)"],
        "Investor": [r"Investor[:\s-]+(.+)"],
        "Investment Amount": [r"Investment Amount[:\s-]+(.+)"],
        "Valuation (Pre-Money)": [r"Pre[- ]?Money[:\s-]+(.+)"],
        "Valuation (Post-Money)": [r"Post[- ]?Money[:\s-]+(.+)"],
        "Equity to be Issued": [r"Equity[:\s-]+(.+)"],

        # structured notes
        "Issuer": [r"Issuer[:\s-]+(.+)"],
        "ISIN": [r"ISIN[:\s-]+([A-Z0-9]+)"],
        "Issue Date": [r"Issue Date[:\s-]+(.+)"],
        "Redemption Date": [r"Redemption Date[:\s-]+(.+)"],
        "Underlying Asset": [r"Underlying[:\s-]+(.+)"],
        "Strike Level": [r"Strike[:\s-]+(.+)"],
        "Autocall Barrier": [r"Autocall[:\s-]+(.+)"],
        "Knock-in Barrier": [r"Knock[- ]?in[:\s-]+(.+)"],
        "Calculation Amount": [r"Calculation Amount[:\s-]+(.+)"],
        "Coupon Rate": [r"Coupon[:\s-]+(.+)"],
    }

    for key, regs in patterns.items():
        for reg in regs:
            m = re.search(reg, text, re.I)
            if m:
                extracted[key] = m.group(1).strip()
                break

    log_to_file(f"Regex extracted fields: {list(extracted.keys())}")
    return extracted


# =========================================================
# 5️⃣ AI EXTRACTION (schema based)
# =========================================================
def extract_ai(text: str, doc_type: str) -> dict:
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        schemas = {
            "structured_note": [
                "Issuer", "ISIN", "Issue Date", "Redemption Date",
                "Underlying Asset", "Strike Level", "Autocall Barrier",
                "Knock-in Barrier", "Calculation Amount", "Coupon Rate"
            ],
            "startup_equity": [
                "Company Name", "Investor", "Investment Amount",
                "Valuation (Pre-Money)", "Valuation (Post-Money)",
                "Equity to be Issued"
            ]
        }

        target_fields = schemas.get(doc_type, schemas["startup_equity"] + schemas["structured_note"])

        prompt = f"""
Extract the following fields from the term sheet.
Return ONLY strict JSON.
Missing fields must be null.

Fields:
{target_fields}

Text:
{text[:6000]}
"""

        resp = model.generate_content(prompt)
        raw = resp.text.strip()
        raw = raw.replace("```json", "").replace("```", "")

        match = re.search(r"\{[\s\S]*\}", raw)
        data = json.loads(match.group(0)) if match else {}

        clean = {k: v for k, v in data.items() if v not in ["", None, "null"]}
        return clean

    except Exception as e:
        log_to_file(f"AI extraction error: {e}")
        return {}


# =========================================================
# 6️⃣ MERGE LOGIC
# =========================================================
def merge_fields(regex_fields: dict, ai_fields: dict) -> dict:
    merged = dict(regex_fields)
    for k, v in ai_fields.items():
        if k not in merged or not merged[k]:
            merged[k] = v
    return merged


# =========================================================
# 7️⃣ MAIN EXTRACTION (SAFE SIGNATURE)
# =========================================================
def extract_fields(pdf_path: str, doc_type: str = "unknown") -> dict:
    try:
        raw_text = extract_text_from_pdf(pdf_path)
        if not raw_text:
            return {"error": "No text extracted"}

        if doc_type == "unknown":
            doc_type = classify_doc(raw_text)

        regex_fields = extract_regex(raw_text, doc_type)

        need_ai = doc_type == "structured_note" or len(regex_fields) < 5
        ai_fields = extract_ai(raw_text, doc_type) if need_ai else {}

        final = merge_fields(regex_fields, ai_fields)
        return final

    except Exception as e:
        return {"error": str(e)}


# =========================================================
# 8️⃣ WRAPPER (used in upload route)
# =========================================================
def extract_fields_with_type(pdf_path: str) -> dict:
    raw_text = extract_text_from_pdf(pdf_path)

    doc_type = classify_doc(raw_text)
    fields = extract_fields(pdf_path, doc_type)

    return {
        "document_type": doc_type,
        "raw_text": raw_text,
        "extracted_fields": fields
    }
