import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routes import auth, companion, journal, tree, insights, settings, memories, uploads

app = FastAPI(
    title="Gen Z Growth Companion API",
    description="Backend API for the AI-powered personal growth platform.",
    version="1.0.0",
)

allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "https://genz-psi.vercel.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(memories.router, prefix="/api/memories")
app.include_router(settings.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Gen Z Growth Companion API is healthy."}
