from .mongodb_config import db

async def init_collections():
    await db.create_collection("users", capped=False)
    await db.create_collection("uploads", capped=False)
    await db.create_collection("validation_results", capped=False)
    await db.create_collection("reports", capped=False)
    await db.create_collection("chatbot_logs", capped=False)
