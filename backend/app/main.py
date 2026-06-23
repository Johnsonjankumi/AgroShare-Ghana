from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routers import farmers, equipment, bookings, pools, payments, ussd, auth, ratings, subscriptions


ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()


def load_cors_origins() -> list[str]:
    raw_origins = os.getenv("CORS_ORIGINS", "")

    if raw_origins.strip():
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    if ENVIRONMENT == "development":
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]

    # Production fallback for the known hosted frontend only.
    return [
        "https://agroshare-frontend.onrender.com",
    ]


def docs_enabled() -> bool:
    return ENVIRONMENT != "production" or os.getenv("EXPOSE_API_DOCS", "false").lower() == "true"


CORS_ORIGINS = load_cors_origins()
API_DOCS_ENABLED = docs_enabled()

app = FastAPI(
    title="AgroShare Ghana MVP",
    docs_url="/docs" if API_DOCS_ENABLED else None,
    redoc_url="/redoc" if API_DOCS_ENABLED else None,
    openapi_url="/openapi.json" if API_DOCS_ENABLED else None,
)

# CORS middleware - MUST be added first before any routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
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
