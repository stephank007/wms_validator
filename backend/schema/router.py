# backend/schema/router.py
"""
Schema router — serves the common_schema from MongoDB.

Single endpoint:
    GET /api/schema  →  returns the full common_schema JSON
                        requires a valid JWT (protected route)

The schema is stored in MongoDB as a JSON string (to avoid
MongoDB misinterpreting keys like $schema, $id, $defs).
We parse it here and return it as a plain dict so FastAPI
serialises it to JSON for the React app.
"""
import sys
import json
from pathlib import Path

# Add backend/ to path so 'services' is findable
# (same fix used in auth/service.py — .parents[1] from backend/schema/ = backend/)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backend.auth import service as auth_service
from services.mongo_store import MongoStore

router = APIRouter(prefix="/schema", tags=["Schema"])
bearer = HTTPBearer()


# ── Auth dependency (same pattern as auth/router.py) ─────────────────────────
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    """Verify JWT. Raises 401 if missing, expired, or tampered."""
    payload = auth_service.decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Token is invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.get("")
def get_schema(current_user: dict = Depends(get_current_user)):
    """
    Return the full common_schema JSON from MongoDB.

    - Protected: requires a valid JWT in Authorization: Bearer <token>
    - The schema is stored as a JSON string under _id="common_schema"
      in the wms_validator.schemas collection.
    - We parse the string here and return the dict so FastAPI
      serialises it correctly for React.
    """
    store = MongoStore()
    col   = store.db["schemas"]

    doc = col.find_one({"_id": "common_schema"})
    if not doc:
        raise HTTPException(
            status_code=404,
            detail="common_schema not found in MongoDB. Run upload_schema_to_mongo.py first.",
        )

    try:
        schema = json.loads(doc["data"])
    except (KeyError, json.JSONDecodeError) as e:
        raise HTTPException(
            status_code=500,
            detail=f"Schema document is malformed: {e}",
        )

    return schema