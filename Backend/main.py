from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager


# Use lifespan context manager for startup/shutdown (preferred over @app.on_event)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.getLogger("uvicorn.error").info(
        "Smart Helmet backend starting up at %s", datetime.now(timezone.utc).isoformat()
    )
    yield
    logging.getLogger("uvicorn.error").info(
        "Smart Helmet backend shutting down at %s", datetime.now(timezone.utc).isoformat()
    )


app = FastAPI(title="Smart Helmet Backend", version="1.0.0", lifespan=lifespan)

# Allow CORS for React Native app
app.add_middleware(
    CORSMiddleware,
    # Allow only origins that use port 8081 (e.g. Expo dev server / web preview)
    # This uses a regex to match http or https origins on any host with port 8081
    allow_origin_regex=r"^https?://.*:8081$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for latest data (mock data for now)
latest_data = {
    "temperature": 25.5,
    "impact_detected": False,
    "latitude": 12.9716,
    "longitude": 77.5946,
    "timestamp": "2025-12-10T14:00:00Z"
}

@app.get("/get_data")
async def get_data():
    return latest_data

@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


@app.get("/")
async def root():
    return {"message": "Smart Helmet Backend API"}