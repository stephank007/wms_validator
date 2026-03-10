import os
import sys
import logging
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Optional, Sequence

from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from pymongo.errors import (
    DuplicateKeyError,
    ConnectionFailure,
    ServerSelectionTimeoutError,
    ConfigurationError,
)

logger = logging.getLogger(__name__)

# ── Connection priority ────────────────────────────────────────────────────
#
#   1. ATLAS_URI   — production Atlas cluster (set in .env / deployment env)
#   2. MONGO_URI   — explicit override (useful for staging / CI)
#   3. localhost   — local dev fallback, no env vars needed
#
# From Compass: Atlas = ac-wewfk5q-shard-00-*.28qr4ey.mongodb.net:27017
#               Local  = localhost:27017

_LOCAL_FALLBACK = "mongodb://localhost:27017"

MONGO_URI: str = (
    os.environ.get("ATLAS_URI")      # highest priority
    or os.environ.get("MONGO_URI")   # explicit override
    or _LOCAL_FALLBACK               # safe dev fallback
)

DB_NAME         = "wms_validator"
COLLECTION_NAME = "schemas"

# Derive a safe label for logs (strips credentials from Atlas URIs)
def _safe_uri_label(uri: str) -> str:
    if "mongodb.net" in uri:
        return f"Atlas ({uri.split('@')[-1].split('/')[0]})"
    return uri

_URI_LABEL = _safe_uri_label(MONGO_URI)

logger.info(f"[MongoStore] Resolved connection target: {_URI_LABEL}")


# ── Module-level connection probe ──────────────────────────────────────────
#
# Called once at import time so the app fails fast with a clear message
# rather than crashing deep inside a request handler.

def _build_client(uri: str, label: str) -> MongoClient:
    """
    Create, verify, and return the singleton MongoClient.
    Exits the process immediately if the DB is unreachable — better to
    fail at startup with a clear message than inside a live request.
    """
    try:
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=8_000,
            connectTimeoutMS=8_000,
            socketTimeoutMS=20_000,
            maxPoolSize=10,
            minPoolSize=1,
        )
        client.admin.command("ping")   # verify now, not on first request
        logger.info(f"[MongoStore] ✓ Connected to {label}")
        return client
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        logger.critical(
            f"\n{'='*60}\n"
            f"  FATAL: Cannot reach MongoDB.\n"
            f"  Target : {label}\n"
            f"  Reason : {exc}\n"
            f"\n"
            f"  If using Atlas  → check ATLAS_URI env var and network/IP whitelist\n"
            f"  If using local  → run:  brew services start mongodb-community\n"
            f"{'='*60}\n"
        )
        sys.exit(1)
    except ConfigurationError as exc:
        logger.critical(
            f"\n{'='*60}\n"
            f"  FATAL: MongoDB URI is malformed.\n"
            f"  Target : {label}\n"
            f"  Reason : {exc}\n"
            f"{'='*60}\n"
        )
        sys.exit(1)


# One client for the lifetime of the process — shared by all MongoStore instances.
# Creating a new MongoClient per request triggers a fresh DNS/SRV lookup every time
# (observed as 21 s timeouts in logs). The connection pool handles concurrency.
_CLIENT: MongoClient = _build_client(MONGO_URI, _URI_LABEL)


# ── Data classes ───────────────────────────────────────────────────────────

@dataclass
class WriteOutcome:
    status: str          # inserted | updated | upserted | duplicate | deleted | noop
    inserted_id: Optional[Any] = None
    matched_existing_id: Optional[Any] = None
    raw_result: Optional[Dict[str, Any]] = None


# ── MongoStore ─────────────────────────────────────────────────────────────

class MongoStore:
    def __init__(
        self,
        indexes: Optional[Sequence[Dict[str, Any]]] = None,
        duplicate_handler=None,
        client: Optional[MongoClient] = None,
    ):
        # Use the module-level singleton — or an injected mock client in tests
        self.client: MongoClient = client or _CLIENT
        self.db = self.client[DB_NAME]
        self.collection: Collection = self.db[COLLECTION_NAME]
        self.duplicate_handler = duplicate_handler
        if indexes:
            self._ensure_indexes(indexes)

    # ── Collection shortcuts ───────────────────────────────────────────────

    @property
    def schemas(self):
        """Production schema collection."""
        return self.db["schemas"]

    @property
    def schemas_v2(self):
        """Staging schema collection — enriched with array/object fields."""
        return self.db["schemas_v2"]

    @property
    def schemas_backup(self):
        """Backup kept by promote_v2.py before a promotion."""
        return self.db["schemas_backup"]

    @property
    def binat(self):
        """Minutes of Meeting (MoM) collection."""
        return self.db["binat"]

    # ── CRUD helpers ───────────────────────────────────────────────────────

    def insert_one(self, doc: Dict[str, Any]) -> WriteOutcome:
        try:
            res = self.collection.insert_one(doc)
            return WriteOutcome(status="inserted", inserted_id=res.inserted_id)
        except DuplicateKeyError as exc:
            existing = self.collection.find_one(
                {k: v for k, v in doc.items() if k != "_id"}
            )
            if self.duplicate_handler:
                self.duplicate_handler(doc, existing, exc)
            return WriteOutcome(
                status="duplicate",
                matched_existing_id=existing.get("_id") if existing else None,
            )

    def upsert_one(
        self,
        query: Dict[str, Any],
        update: Dict[str, Any],
        set_on_insert: Optional[Dict[str, Any]] = None,
    ) -> WriteOutcome:
        update_doc: Dict[str, Any] = {"$set": update}
        if set_on_insert:
            update_doc["$setOnInsert"] = set_on_insert

        res = self.collection.update_one(query, update_doc, upsert=True)
        if res.upserted_id is not None:
            return WriteOutcome(
                status="upserted",
                inserted_id=res.upserted_id,
                raw_result=res.raw_result,
            )
        if res.matched_count > 0:
            return WriteOutcome(status="updated", raw_result=res.raw_result)
        return WriteOutcome(status="noop", raw_result=res.raw_result)

    def delete_many(self, query: Dict[str, Any]) -> WriteOutcome:
        res = self.collection.delete_many(query)
        return WriteOutcome(
            status="deleted",
            raw_result={"deleted_count": res.deleted_count},
        )

    def find(self, query: Dict[str, Any]) -> Iterable[Dict[str, Any]]:
        return self.collection.find(query)

    def _ensure_indexes(self, indexes: Sequence[Dict[str, Any]]) -> None:
        for idx in indexes:
            keys = idx.get("keys", [])
            opts = {k: v for k, v in idx.items() if k != "keys"}
            self.collection.create_index(keys, **opts)