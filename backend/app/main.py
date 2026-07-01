from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
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

# Mount React frontend static files
FRONTEND_BUILD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "build")
if os.path.exists(FRONTEND_BUILD_DIR):
    app.mount("/static", StaticFiles(directory=os.path.join(FRONTEND_BUILD_DIR, "static")), name="static")

    # Root path handler - serve React app for non-API routes
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Don't serve frontend for API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi"):
            return {"detail": "Not Found"}
        
        # Serve index.html for all other routes (React routing)
        index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Not Found"}
    
    @app.get("/")
    async def serve_root():
        index_path = os.path.join(FRONTEND_BUILD_DIR, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Frontend not found"}
