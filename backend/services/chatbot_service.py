import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.5-flash"

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1/models/"
    f"{MODEL_NAME}:generateContent?key={GEMINI_API_KEY}"
)

async def respond(query: str):
    """
    Sends user query to Gemini model and returns generated answer.
    """
    try:
        payload = {
            "contents": [
                {"parts": [{"text": query}]}
            ]
        }

        headers = {"Content-Type": "application/json"}

        response = requests.post(GEMINI_URL, json=payload, headers=headers)

        if response.status_code != 200:
            return f"Error: Gemini API Error {response.status_code}: {response.text}"

        data = response.json()

        answer = data["candidates"][0]["content"]["parts"][0]["text"]

        return answer.strip()

    except Exception as e:
        return f"Error: {str(e)}"
