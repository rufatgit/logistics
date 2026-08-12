from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.config import settings
from backend.database import Base, engine
from backend import (
    models,
)  # noqa: F401 — ensures models are registered before create_all
from backend.routers import auth, carrier, user, shipments, offers

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(carrier.router)
app.include_router(shipments.router)
app.include_router(offers.router)


@app.on_event("startup")
def on_startup():
    # For local dev only. In production, use Alembic migrations instead of create_all.
    Base.metadata.create_all(bind=engine)


@app.get("/")
def health_check():
    return {"message": "Digital Freight Marketplace API is running"}


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
