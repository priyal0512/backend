from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Import routers directly (bullet-proof, avoids package import errors)
from routes.upload_routes import router as upload_router
from routes.validate_routes import router as validate_router
from routes.export_routes import router as export_router
from routes.chatbot_routes import router as chatbot_router
from routes.auth_routes import router as auth_router

app = FastAPI(title="AI Term Sheet Validation System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTERS
app.include_router(upload_router, prefix="/api")
app.include_router(validate_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(chatbot_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/")
def home():
    return {"status": "Backend running successfully ✅"}
