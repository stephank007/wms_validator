#!/usr/bin/env python3
"""
This a one time only
upload_schema_to_mongo.py
─────────────────────────────────────────────────
Reads common_schema.json and upserts it into MongoDB.
Database   : wms_validator
Collection : schemas
Document   : { _id: "common_schema", data: "<json string>" }

WHY store as a string?
  The schema contains keys like "$id", "$ref", "$defs".
  MongoDB treats "$id" + "$ref" together as a DBRef (a special
  internal pointer type) and corrupts the data silently.
  Storing the whole schema as a JSON string sidesteps this completely.

Run AFTER generate_common_schema.py:
    python generate_common_schema.py
    python upload_schema_to_mongo.py
"""

import json
from services.common_paths import DATA_DIR
from services.mongo_store import MongoStore, DB_NAME, COLLECTION_NAME

SCHEMA_PATH = DATA_DIR / "common_schema.json"
DOCUMENT_ID = "common_schema"


def upload_schema():
    # ── Step A: Read the JSON file ─────────────────────────
    if not SCHEMA_PATH.exists():
        print(f"❌  File not found: {SCHEMA_PATH}")
        print("    Run generate_common_schema.py first.")
        return

    with open(SCHEMA_PATH, encoding="utf-8") as f:
        schema = json.load(f)

    fields_count = schema.get("x-meta", {}).get("catalogue-field-count", "?")
    iface_count  = schema.get("x-meta", {}).get("interface-count", "?")
    print(f"✅  Loaded {SCHEMA_PATH.name}")
    print(f"   Catalogue fields : {fields_count}")
    print(f"   Interfaces       : {iface_count}")

    # ── Step B: Connect via MongoStore ─────────────────────
    store = MongoStore()
    col   = store.schemas

    # ── Step C: Upsert ─────────────────────────────────────
    # Store schema as a JSON *string* to avoid MongoDB DBRef confusion.
    # MongoDB intercepts nested "$id"+"$ref" keys and converts them into
    # a DBRef object — corrupting your data. A plain string is 100% safe.
    document = {
        "_id":  DOCUMENT_ID,
        "data": json.dumps(schema, ensure_ascii=False),  # ← string, not dict
    }

    result = col.replace_one(
        filter={"_id": DOCUMENT_ID},
        replacement=document,
        upsert=True
    )

    if result.upserted_id:
        print(f"\n✅  Inserted → {DB_NAME}.{COLLECTION_NAME}  (_id='{DOCUMENT_ID}')")
    else:
        print(f"\n✅  Updated  → {DB_NAME}.{COLLECTION_NAME}  (_id='{DOCUMENT_ID}')")

    # ── Step D: Verify — read it back and parse ────────────
    stored      = col.find_one({"_id": DOCUMENT_ID})
    schema_back = json.loads(stored["data"])          # ← parse string → dict
    verified    = schema_back.get("x-meta", {}).get("catalogue-field-count", "?")
    print(f"   Verified in DB   : {verified} catalogue fields")

    # ── Step E: Close connection ───────────────────────────
    store.client.close()
    print("\n✅  Done! Schema is now in MongoDB.\n")


if __name__ == "__main__":
    upload_schema()