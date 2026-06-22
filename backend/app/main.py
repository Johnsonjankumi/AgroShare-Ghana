from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import os
from app.routers import farmers, equipment, bookings, pools, payments, ussd, auth, ratings, subscriptions


class SimpleCorsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response


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

    # Production: allow specific Render frontend URLs and localhost for testing
    return [
        "https://agroshare-frontend.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Allow all as fallback
    ]


CORS_ORIGINS = load_cors_origins()

app = FastAPI(title="AgroShare Ghana MVP")

# Add custom CORS middleware directly
app.add_middleware(SimpleCorsMiddleware)

# Also add standard CORS middleware as backup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
