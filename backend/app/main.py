from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analytics, bikes, rides, setups

app = FastAPI(title="MTB Setup Tracker", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bikes.router)
app.include_router(rides.router)
app.include_router(setups.router)
app.include_router(analytics.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
