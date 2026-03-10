#!/usr/bin/env python3
"""
create_users_collection.py
──────────────────────────────────────────────────────────
Creates the 'users' collection in wms_validator database.
Sets up indexes and prints a summary.

Safe to re-run — MongoDB ignores index creation if they already exist.

Run once, before starting the API:
    python create_users_collection.py
"""

from services.mongo_store import MongoStore
from pymongo import ASCENDING
from datetime import datetime, timezone


def create_users_collection():
    store  = MongoStore()
    db     = store.db
    users  = db["users"]            # collection (created on first use)

    print("=" * 55)
    print("  create_users_collection.py")
    print("=" * 55)

    # ── Indexes ──────────────────────────────────────────────
    # An index is like a phone book — it lets MongoDB find documents
    # instantly instead of scanning every row.
    #
    # unique=True means MongoDB will REFUSE to insert a second document
    # with the same value — this enforces "one account per email".

    users.create_index(
        [("email", ASCENDING)],
        unique=True,
        name="email_unique"
    )
    print("✅  Index created : email  (unique)")

    users.create_index(
        [("username", ASCENDING)],
        unique=True,
        name="username_unique"
    )
    print("✅  Index created : username  (unique)")

    users.create_index(
        [("reset_token", ASCENDING)],
        name="reset_token_lookup",
        sparse=True          # sparse = only index documents that HAVE this field
    )
    print("✅  Index created : reset_token  (sparse)")

    # ── Print collection stats ────────────────────────────────
    count = users.count_documents({})
    print(f"\n   Collection      : wms_validator.users")
    print(f"   Documents       : {count}")
    print(f"   Indexes         : {users.index_information().keys()}")

    store.client.close()
    print("\n✅  Done. Run seed_admin_user.py to create the first user.\n")


if __name__ == "__main__":
    create_users_collection()