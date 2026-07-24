import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routes import auth, companion, journal, tree, insights, settings, uploads

app = FastAPI(
    title="Gen Z Growth Companion API",
    description="Backend API for the AI-powered personal growth platform.",
    version="1.0.0",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

app.include_router(auth.router, prefix="/api/auth")
app.include_router(companion.router, prefix="/api/companion")
app.include_router(journal.router, prefix="/api/journal")
app.include_router(tree.router, prefix="/api/tree")
app.include_router(insights.router, prefix="/api/insights")
app.include_router(settings.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")

@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Gen Z Growth Companion API is healthy."}
