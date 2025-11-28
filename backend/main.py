from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# ✅ Import routers
from routes.upload_routes import router as upload_router
from routes.validate_routes import router as validate_router
from routes.export_routes import router as export_router
from routes.chatbot_routes import router as chatbot_router
from routes.auth_routes import router as auth_router
from routes.data_routes import router as data_router
from routes.compare_routes import router as compare_router   # ⭐ NEW

app = FastAPI(title="AI Term Sheet Validation System")

# ⭐ CORS SETTINGS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print("MAIN FILE LOADED SUCCESSFULLY")

# ⭐ ROUTERS
app.include_router(upload_router, prefix="/api")
app.include_router(validate_router, prefix="/api")
app.include_router(export_router, prefix="/api")
app.include_router(chatbot_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(data_router, prefix="/api")
app.include_router(compare_router, prefix="/api")   # ⭐ NEW Compare Feature

# ⭐ STATIC FILES (Reports + Uploads)
reports_dir = os.path.join(os.path.dirname(__file__), "reports")
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")

os.makedirs(reports_dir, exist_ok=True)
os.makedirs(uploads_dir, exist_ok=True)

app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# ⭐ ROOT ENDPOINT
@app.get("/")
def home():
    return {"status": "Backend running successfully ✅"}
