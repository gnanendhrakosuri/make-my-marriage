from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.core.config import settings
from app.db.session import lifespan_db

app = FastAPI(
    title="Make My Marriage API",
    version="0.1.0",
    description="Backend API for the Make My Marriage wedding platform.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan_db,
)

# ─── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/api/v1/health", tags=["health"])
async def health_check() -> dict[str, str]:
    """
    Confirm that the API server is running.
    Does not verify database connectivity.
    """
    return {"status": "ok"}


# ─── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router, prefix="/api/v1")
