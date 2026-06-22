from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routers import farmers, equipment, bookings, pools, payments, ussd, auth, ratings, subscriptions


def load_cors_origins() -> list[str]:
    environment = os.getenv("ENVIRONMENT", "development").lower()
    raw_origins = os.getenv("CORS_ORIGINS", "")

    if raw_origins.strip():
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    if environment == "development":
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]

    # Production: allow all origins (can be restricted later with CORS_ORIGINS env var)
    return ["*"]


CORS_ORIGINS = load_cors_origins()

app = FastAPI(title="AgroShare Ghana MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(farmers.router, prefix="/api/farmers", tags=["Farmers"])
app.include_router(equipment.router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["Bookings"])
app.include_router(pools.router, prefix="/api/pools", tags=["Rental Pools"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(ratings.router, prefix="/api/ratings", tags=["Ratings"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])
app.include_router(ussd.router, prefix="/api/ussd", tags=["USSD"])

# Mount static files for uploaded equipment photos
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
