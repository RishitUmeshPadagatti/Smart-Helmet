from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime, timezone

from app.routes import users_router

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.getLogger("uvicorn.error").info(
        "Smart Helmet backend starting up at %s", datetime.now(timezone.utc).isoformat()
    )
    yield
    logging.getLogger("uvicorn.error").info(
        "Smart Helmet backend shutting down at %s", datetime.now(timezone.utc).isoformat()
    )


# Initialize FastAPI app
app = FastAPI(title="Smart Helmet Backend", version="1.0.0", lifespan=lifespan)

# CORS middleware: allow only origins on port 8081
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*:8081$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router)


# Health check endpoint
@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


# Root endpoint
@app.get("/")
async def root():
    return {"message": "Smart Helmet Backend API"}