# backend/database/mongodb_config.py

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get MongoDB connection URI
MONGO_URI = os.getenv("MONGODB_URI")

# Ensure it's not empty
if not MONGO_URI:
    raise ValueError("⚠️ MONGODB_URI not found in .env file!")

# Create async MongoDB client
client = AsyncIOMotorClient(MONGO_URI)

# Select the database
db = client["term_sheet_validation"]

# Optional helper (not required, but nice for reusability)
async def get_database():
    return db