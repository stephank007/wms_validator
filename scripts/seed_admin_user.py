#!/usr/bin/env python3
"""
seed_admin_user.py
──────────────────────────────────────────────────────────
Creates the first admin user in the users collection.
Run ONCE after create_users_collection.py.

    python seed_admin_user.py
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import bcrypt
from datetime import datetime, timezone
from backend.services.mongo_store import MongoStore


# ── Change these before running ──────────────────────────
ADMIN_EMAIL    = "stephan.katz@gmail.com"    # ← your email
ADMIN_USERNAME = "eithan"                    # ← your username
ADMIN_PASSWORD = "moshe-06"                 # ← your password (min 8 chars)
# ─────────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    bcrypt does two things automatically:
      1. Adds a random 'salt' (so two identical passwords hash differently)
      2. Runs the hash 2^12 = 4096 times (slow by design — defeats brute force)

    The result looks like: "$2b$12$<22-char salt><31-char hash>"
    We store ONLY this hash — never the original password.
    """
    salt        = bcrypt.gensalt(rounds=12)        # generate random salt
    hashed      = bcrypt.hashpw(plain.encode(), salt)   # hash password
    return hashed.decode()                          # return as string


def verify_password(plain: str, hashed: str) -> bool:
    """
    Check a plain password against a stored hash.
    bcrypt extracts the salt from the hash automatically.
    Returns True if the password matches, False otherwise.
    """
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def seed_admin():
    store = MongoStore()
    users = store.db["users"]

    print("=" * 55)
    print("  seed_admin_user.py")
    print("=" * 55)

    # Check if this email already exists
    existing = users.find_one({"email": ADMIN_EMAIL})
    if existing:
        print(f"⚠️   User '{ADMIN_EMAIL}' already exists — skipping.")
        store.client.close()
        return

    # Build the user document
    now  = datetime.now(timezone.utc)
    user = {
        "email":               ADMIN_EMAIL,
        "username":            ADMIN_USERNAME,
        "password_hash":       hash_password(ADMIN_PASSWORD),
        "role":                "admin",      # "admin" or "validator"
        "is_active":           True,
        "created_at":          now,
        "last_login":          None,
        "reset_token":         None,         # filled during forgot-password flow
        "reset_token_expires": None,
    }

    result = users.insert_one(user)
    print(f"\n✅  Admin user created")
    print(f"   _id      : {result.inserted_id}")
    print(f"   email    : {ADMIN_EMAIL}")
    print(f"   username : {ADMIN_USERNAME}")
    print(f"   role     : admin")

    # Verify the hash works (quick sanity check)
    check = verify_password(ADMIN_PASSWORD, user["password_hash"])
    print(f"   pw check : {'✅ hash verified' if check else '❌ hash FAILED'}")

    store.client.close()
    print("\n✅  Done. You can now log in with these credentials.\n")


if __name__ == "__main__":
    seed_admin()