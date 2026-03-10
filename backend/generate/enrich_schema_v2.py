"""
enrich_schema_v2.py
====================
Enriches common_schema.json with array/object field types and uploads
the result to MongoDB collection  schemas_v2  (never touches 'schemas').

Uses the project's own common_paths.py and mongo_store.py for full
compatibility with the rest of the codebase.

Run from the project root with the venv active:
    python backend/generate/enrich_schema_v2.py

Fallback guarantee:
    'schemas' collection is never touched.
    On any error the original schema remains live and unchanged.
"""

from __future__ import annotations
import json
import sys
from pathlib import Path

# ── path bootstrap (same pattern used across the project) ─────────────────
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from services.common_paths import DATA_DIR          # → wms_validator/data/
from services.mongo_store  import MongoStore, DB_NAME, MONGO_URI


# ── constants ──────────────────────────────────────────────────────────────
SCHEMA_IN   = DATA_DIR / "common_schema.json"
SCHEMA_OUT  = DATA_DIR / "common_schema_v2.json"
COLLECTION  = "schemas_v2"                          # safe target, not 'schemas'


# ── guard: warn about the MONGO_URO typo ──────────────────────────────────
if MONGO_URI is None:
    print(
        "⚠  WARNING: MONGO_URI resolved to None.\n"
        "   mongo_store.py reads os.environ.get('MONGO_URO') — looks like a typo.\n"
        "   Fix: change 'MONGO_URO' → 'MONGO_URI' in mongo_store.py,\n"
        "   or set the env var:  export MONGO_URO=mongodb://localhost:27017\n"
        "   Attempting to connect anyway (MongoClient may default to localhost)."
    )


# ── 1. Load original schema ────────────────────────────────────────────────
with open(SCHEMA_IN, encoding="utf-8") as f:
    schema = json.load(f)

print(f"Loaded: {SCHEMA_IN}")
print(f"  L1 fields : {len(schema['properties'])}")
print(f"  Interfaces: {len(schema['$defs'])}")
print()


# ── 2. Interface 4 — Vendors: CONTACT_PERSONS array ───────────────────────
#
# A vendor in SAP can carry multiple contact persons. Currently CP_FIRST_NAME,
# CP_LAST_NAME, CP_TELEPHONE are flat scalars — meaning only one contact per
# payload. CONTACT_PERSONS is the correct representation.

schema["$defs"]["Interface4"]["properties"]["CONTACT_PERSONS"] = {
    "type": "array",
    "description": "רשימת אנשי קשר של הספק. כל רשומה מייצגת איש קשר אחד.",
    "minItems": 0,
    "maxItems": 20,
    "items": {
        "type": "object",
        "description": "רשומת איש קשר בודד",
        "additionalProperties": False,
        "required": ["CP_FIRST_NAME", "CP_LAST_NAME"],
        "properties": {
            "CP_FIRST_NAME": {
                "type": "string",
                "description": "שם פרטי של איש קשר",
                "maxLength": 35
            },
            "CP_LAST_NAME": {
                "type": "string",
                "description": "שם משפחה של איש קשר",
                "maxLength": 35
            },
            "CP_TELEPHONE": {
                "type": "string",
                "description": "טלפון של איש קשר",
                "maxLength": 16
            },
            "CP_EMAIL": {
                "type": "string",
                "description": "דואר אלקטרוני של איש קשר",
                "maxLength": 60
            },
            "CP_ROLE": {
                "type": "string",
                "description": "תפקיד איש הקשר",
                "maxLength": 30
            }
        }
    }
}

print("✓ Interface4: CONTACT_PERSONS added (array, 0–20 items)")


# ── 3. Interface 5 — Inbound Delivery: ITEMS array ────────────────────────
#
# An inbound delivery (ZWMS_INBOUND_DELIVERY_CREATE) carries multiple line
# items. Currently MATERIAL, QUANTITY etc. are flat — meaning one item only.
# ITEMS moves line-level fields into a proper array structure.

schema["$defs"]["Interface5"]["properties"]["ITEMS"] = {
    "type": "array",
    "description": "שורות האספקה הנכנסת. כל רשומה מייצגת פריט אחד במשלוח.",
    "minItems": 1,
    "maxItems": 500,
    "items": {
        "type": "object",
        "description": "שורת פריט בודד באספקה",
        "additionalProperties": False,
        "required": ["MATERIAL", "QUANTITY", "REC_DOC_LINE"],
        "properties": {
            "REC_DOC_LINE":        {"type": "string", "description": "מספר שורת הזמנה",   "maxLength": 10},
            "MATERIAL":            {"type": "string", "description": "מקט צהל",            "maxLength": 120},
            "QUANTITY":            {"type": "string", "description": "כמות מוזמנת",        "maxLength": 17},
            "BATCH":               {"type": "string", "description": "סדרה",               "maxLength": 10},
            "SERIAL":              {"type": "string", "description": "מספר סיריאלי",       "maxLength": 18},
            "STOCK_TYPE":          {"type": "string", "description": "סטאטוס מלאי צפוי",   "maxLength": 1},
            "LINE_TEXT":           {"type": "string", "description": "הערות שורה",         "maxLength": 255},
            "DELETION_INDIC":      {"type": "string", "description": "סמן מחיקה",          "maxLength": 1},
            "INSPECTION_TYPE":     {"type": "string", "description": "נדרש ביקורת טיב",    "maxLength": 1},
            "ASN_EXPIRATION_DATE": {"type": "string", "description": "תאריך פג תוקף",
                                    "pattern": "^\\d{8}$", "examples": ["20240315"]},
            "ASN_VERSION":         {"type": "string", "description": "גירסה",               "maxLength": 50},
        }
    }
}

if "ITEMS" not in schema["$defs"]["Interface5"].get("required", []):
    schema["$defs"]["Interface5"]["required"].append("ITEMS")

print("✓ Interface5: ITEMS added (array, 1–500 items, added to required)")


# ── 4. Register new fields in L1 catalogue ────────────────────────────────
#
# L1 only needs: correct type and a hard ceiling.
# Internal structure is L2's job — not L1's.

schema["properties"]["CONTACT_PERSONS"] = {
    "type": "array",
    "description": "רשימת אנשי קשר. L1 מאמת סוג מערך ו-maxItems בלבד.",
    "maxItems": 20
}

schema["properties"]["ITEMS"] = {
    "type": "array",
    "description": "שורות אספקה. L1 מאמת סוג מערך ו-maxItems בלבד.",
    "maxItems": 500
}

print(f"✓ L1 catalogue: now {len(schema['properties'])} fields")
print()


# ── 5. Version metadata ────────────────────────────────────────────────────
schema["x-meta"]["schema_version"] = "v2"
schema["x-meta"]["v2_changes"] = [
    "Interface4: added CONTACT_PERSONS (array of contact person objects, maxItems=20)",
    "Interface5: added ITEMS (array of delivery line objects, minItems=1, maxItems=500)",
    "L1: registered CONTACT_PERSONS and ITEMS as array types with maxItems ceiling",
]


# ── 6. Save local JSON copy ────────────────────────────────────────────────
with open(SCHEMA_OUT, "w", encoding="utf-8") as f:
    json.dump(schema, f, ensure_ascii=False, indent=2)

print(f"✓ Saved: {SCHEMA_OUT}")


# ── 7. Upload to schemas_v2 ────────────────────────────────────────────────
#
# MongoStore hardcodes self.collection = db["schemas"], so we access
# db["schemas_v2"] directly via store.db — the same pattern already used
# by the store.schemas and store.binat properties in mongo_store.py.

try:
    store = MongoStore()
    col   = store.db[COLLECTION]                    # db["schemas_v2"]

    document = {
        "_id":  "common_schema",
        "data": json.dumps(schema, ensure_ascii=False),
    }
    col.replace_one({"_id": "common_schema"}, document, upsert=True)
    store.client.close()

    print(f"✓ Uploaded to MongoDB: {DB_NAME}.{COLLECTION}")
    print()
    print("Next steps:")
    print(f"  1. Verify:  mongo shell → use {DB_NAME}; db.{COLLECTION}.findOne()")
    print(f"  2. Test:    point the router at '{COLLECTION}' (env var SCHEMA_COLLECTION)")
    print(f"  3. Promote: python backend/generate/promote_v2.py")
    print(f"  4. Panic:   python backend/generate/rollback_to_backup.py")

except Exception as exc:
    print(f"\n✗ MongoDB upload failed: {exc}")
    print(f"  Schema saved locally at: {SCHEMA_OUT}")
    print(f"  Fix the MONGO_URO typo in mongo_store.py first, then re-run.")
    sys.exit(1)