# backend/main.py
"""
main.py — FastAPI application entry point.

Start the server with:
    wms-api
  (alias expands to: uvicorn backend.main:app --reload --port 8001)

  --reload  : auto-restarts when you save a file (dev mode only)
  --port    : run on port 8001 (React dev server uses 5173)
"""
import sys
from pathlib import Path

# Add backend/ to Python path so 'services' is always findable,
# regardless of how uvicorn is launched or which Python runs it.
sys.path.insert(0, str(Path(__file__).resolve().parent))
print(sys.path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.auth.auth_router     import router as auth_router
from backend.schema.schema_router import router as schema_router   # ← Step 3

app = FastAPI(
    title       = "WMS Validator API",
    description = "Authentication and schema service for the WMS–SAP validator",
    version     = "1.0.0",
)

# ── CORS — allow the React app to call this API ───────────────────────────────
# CORS is a browser security rule: a page on origin A cannot call an API
# on origin B unless origin B explicitly says "I allow it".
# React runs on localhost:5173, this API on localhost:8001 —
# they are different origins, so we must whitelist the React origin here.
app.add_middleware(
    CORSMiddleware,
    allow_origins     = [
        "http://localhost:5173",
        "http://localhost:4173",
    ],
    allow_credentials = True,
    allow_methods     = ["*"],   # GET, POST, PUT, DELETE, etc.
    allow_headers     = ["*"],   # Authorization, Content-Type, etc.
)

# ── Register routers ──────────────────────────────────────────────────────────
# prefix="/api" means routes become /api/auth/login, /api/schema, etc.
app.include_router(auth_router,   prefix="/api")
app.include_router(schema_router, prefix="/api")   # ← Step 3

# ── Root health check ─────────────────────────────────────────────────────────
@app.get("/")
def root():
    """Quick health check — visit http://localhost:8001 to confirm the server is up."""
    return {"status": "ok", "service": "WMS Validator API"}