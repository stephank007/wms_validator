# backend/schema/schema_router.py
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))  # adds project root to path

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from services.mongo_store import MongoStore, MONGO_URI
from backend.auth import service as auth_service

router = APIRouter(prefix="/schema", tags=["Schema"])

# Optional bearer — won't 401 if header is absent
_optional_bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_optional_bearer),
) -> Optional[dict]:
    """
    Returns the decoded JWT payload if a valid token is present.
    Returns None if no token is provided (unauthenticated is allowed).
    Raises 401 only if a token IS provided but is invalid/expired.
    """
    if credentials is None:
        return None  # no token → allow through (schema is not sensitive)
    payload = auth_service.decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token is invalid or expired")
    return payload


@router.get("")
def get_schema(request: Request, current_user: Optional[dict] = Depends(get_optional_user)):
    """
    Return the full common_schema JSON from MongoDB.

    Auth is OPTIONAL — a valid Bearer token is accepted but not required.
    The schema contains field definitions only (no user data), so it is
    safe to serve to unauthenticated local dev clients.
    """
    try:
        store = MongoStore()
        doc = store.schemas.find_one({"_id": "common_schema"})
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {e}")

    if not doc:
        raise HTTPException(status_code=404, detail="Schema not found in database. Run upload_schema_to_mongo.py first.")

    try:
        schema = json.loads(doc["data"])
    except Exception:
        raise HTTPException(status_code=500, detail="Schema data is corrupted in database.")

    user_label = current_user.get("sub", "unknown") if current_user else "unauthenticated"
    print(f"[SCHEMA] User '{user_label}' fetched schema | URI: {request.url}")
    print(f"[SCHEMA] Schema loaded from MongoDB — DB URI: {MONGO_URI} | top-level keys: {list(schema.keys())[:5]}")

    return schema