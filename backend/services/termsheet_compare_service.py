import io
import re
from fastapi import UploadFile
import pdfplumber

# --------------------------
# READ PDF TEXT
# --------------------------
def extract_text_from_pdf(file: UploadFile):
    pdf_bytes = file.file.read()
    pdf_stream = io.BytesIO(pdf_bytes)

    text = ""
    with pdfplumber.open(pdf_stream) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text


# -----------------------------------
# STRICT PATTERNS FOR FIELDS
# -----------------------------------

DATE_REGEXES = [
    r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",            # 10/12/2024
    r"\b\w+\s\d{1,2},\s\d{4}\b",                      # December 15, 2025
    r"\b\d{1,2}\s\w+\s\d{4}\b",                       # 12 December 2025
]

AMOUNT_REGEXES = [
    r"(rs\.?\s?\d[\d,\.]*)",
    r"(₹\s?\d[\d,\.]*)",
    r"(inr\s?\d[\d,\.]*)"
]

INTEREST_REGEX = r"(\d+(\.\d+)?\s?%)"

TENURE_REGEX = r"(\b\d+\s?(months?|years?)\b)"


# -----------------------------------
# CLEAN FIELD EXTRACTOR
# -----------------------------------
def pick_first_match(text, patterns):
    for p in patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return None


def extract_fields(text: str):
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    fields = {
        "company_name": None,
        "amount": None,
        "date": None,
        "tenure": None,
        "interest_rate": None
    }

    # --------------------------
    # COMPANY NAME — strict rule
    # --------------------------
    for line in lines:
        if line.lower().startswith("company"):
            fields["company_name"] = line
            break
        if "company name" in line.lower():
            fields["company_name"] = line
            break

    # --------------------------
    # AMOUNT — strict numeric value
    # --------------------------
    for line in lines:
        amt = pick_first_match(line, AMOUNT_REGEXES)
        if amt:
            fields["amount"] = amt
            break

    # --------------------------
    # DATE — strict patterns only
    # --------------------------
    for line in lines:
        for pattern in DATE_REGEXES:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                fields["date"] = match.group(0)
                break
        if fields["date"]:
            break

    # --------------------------
    # TENURE — “XX months/years”
    # --------------------------
    for line in lines:
        tn = re.search(TENURE_REGEX, line, re.IGNORECASE)
        if tn:
            fields["tenure"] = tn.group(0)
            break

    # --------------------------
    # INTEREST RATE — “XX%”
    # --------------------------
    for line in lines:
        ir = re.search(INTEREST_REGEX, line)
        if ir:
            fields["interest_rate"] = ir.group(0)
            break

    return fields


# -----------------------------------
# COMPARISON
# -----------------------------------
def compare_fields(ideal_fields, input_fields):
    comparison = {}

    for key in ideal_fields:
        ideal_value = ideal_fields[key]
        input_value = input_fields[key]

        if ideal_value is None and input_value is None:
            status = "not_found_in_both"
        elif ideal_value == input_value:
            status = "same"
        elif ideal_value is None and input_value is not None:
            status = "extra_in_input"
        elif ideal_value is not None and input_value is None:
            status = "missing_in_input"
        else:
            status = "changed"

        comparison[key] = {
            "ideal": ideal_value,
            "input": input_value,
            "status": status
        }
    return comparison


# -----------------------------------
# MAIN FUNCTION
# -----------------------------------
async def compare_termsheets(ideal_file: UploadFile, input_file: UploadFile):

    ideal_text = extract_text_from_pdf(ideal_file)
    input_text = extract_text_from_pdf(input_file)

    ideal_fields = extract_fields(ideal_text)
    input_fields = extract_fields(input_text)

    final_comparison = compare_fields(ideal_fields, input_fields)

    return {
        "ideal_fields": ideal_fields,
        "input_fields": input_fields,
        "differences": final_comparison
    }
