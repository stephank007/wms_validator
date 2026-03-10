# backend/auth/service.py
"""
Auth service — all business logic lives here.

The router calls these functions.
This file knows about: bcrypt, JWT, MongoDB.
This file does NOT know about HTTP requests or responses.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))  # adds backend/ to path

import bcrypt
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional

from jose import jwt, JWTError           # JSON Web Token library
from services.mongo_store import MongoStore

# ── JWT Configuration ─────────────────────────────────────────────────────────
# SECRET_KEY signs every token. Anyone with this key can forge tokens,
# so in production load it from an environment variable — never hardcode it.
# For development, a long random string is fine.
#
# Generate your own with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEx = "dev-secret-key-change-this-in-production-please"
SECRET_KEY = "79ed1488bc46d9f8ad46f4a35ee9bd22e4231a9acdd3e0f975614fe0b8ea4a23"
ALGORITHM  = "HS256"             # HMAC SHA-256 — standard JWT signing algorithm
TOKEN_EXPIRE_HOURS = 8           # token stays valid for 8 hours

# ── Reset token configuration ─────────────────────────────────────────────────
RESET_TOKEN_EXPIRE_MINUTES = 60  # forgot-password link expires in 1 hour


# ══════════════════════════════════════════════════════════════════════════════
# Password helpers
# ══════════════════════════════════════════════════════════════════════════════

def hash_password(plain: str) -> str:
    """
    Hash a plain-text password with bcrypt.
    bcrypt automatically generates a random salt each time,
    so calling hash_password("abc") twice gives two DIFFERENT hashes —
    both will still verify correctly against "abc".
    """
    salt   = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(plain.encode(), salt)
    return hashed.decode()


def verify_password(plain: str, hashed: str) -> bool:
    """
    Check plain password against stored hash.
    Returns True if they match, False otherwise.
    bcrypt extracts the salt from the stored hash automatically.
    """
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ══════════════════════════════════════════════════════════════════════════════
# JWT helpers
# ══════════════════════════════════════════════════════════════════════════════

def create_access_token(email: str, username: str, role: str) -> str:
    """
    Create a JWT access token.

    A JWT has three parts separated by dots:
      header.payload.signature

    The PAYLOAD contains claims — facts about the user:
      sub  = subject (the user's email — standard JWT field name)
      usr  = username
      role = their role
      exp  = expiry timestamp (JWT library checks this automatically)

    The SIGNATURE is a cryptographic hash of header+payload using SECRET_KEY.
    This means:
      - Anyone can READ the payload (it's base64 encoded, not encrypted)
      - But nobody can MODIFY it without invalidating the signature
      - Only our server (which knows SECRET_KEY) can create valid tokens
    """
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        "sub":  email,        # standard: "subject" = who this token is for
        "usr":  username,
        "role": role,
        "exp":  expire,       # standard: "expiry" — jose checks this on decode
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and verify a JWT token.
    Returns the payload dict if valid, None if expired or tampered.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# ══════════════════════════════════════════════════════════════════════════════
# Database operations
# ══════════════════════════════════════════════════════════════════════════════

def _users_col():
    """Get the users collection from the shared singleton client."""
    store = MongoStore()
    return store.db["users"]


def register_user(email: str, username: str, password: str, role: str) -> dict:
    """
    Create a new user. Returns a result dict with status and data.

    We return a dict (not raise exceptions) so the router can
    decide what HTTP status code to use.
    """
    users = _users_col()

    # Check duplicates manually for a cleaner error message
    if users.find_one({"email": email}):
        return {"ok": False, "error": "email_taken", "message": "This email is already registered"}
    if users.find_one({"username": username}):
        return {"ok": False, "error": "username_taken", "message": "This username is already taken"}

    now  = datetime.now(timezone.utc)
    user = {
        "email":               email,
        "username":            username,
        "password_hash":       hash_password(password),
        "role":                role,
        "is_active":           True,
        "created_at":          now,
        "last_login":          None,
        "reset_token":         None,
        "reset_token_expires": None,
    }
    users.insert_one(user)
    return {"ok": True, "user": user}


def login_user(email: str, password: str) -> dict:
    """
    Verify credentials. If valid, return a JWT token.
    We always say "invalid credentials" — never "email not found"
    (that would tell attackers which emails are registered).
    """
    users = _users_col()

    user = users.find_one({"email": email})

    # Both "user not found" and "wrong password" return the same error.
    # This is called "username enumeration protection".
    if not user or not verify_password(password, user["password_hash"]):
        return {"ok": False, "error": "invalid_credentials", "message": "Invalid email or password"}

    if not user.get("is_active", True):
        return {"ok": False, "error": "account_disabled", "message": "Account is disabled"}

    # Update last_login timestamp
    users.update_one(
        {"email": email},
        {"$set": {"last_login": datetime.now(timezone.utc)}}
    )

    token = create_access_token(
        email    = user["email"],
        username = user["username"],
        role     = user["role"],
    )
    return {"ok": True, "token": token, "user": user}


def forgot_password(email: str) -> dict:
    """
    Generate a password-reset token and store it in the user document.

    In production: send this token by email (via SendGrid / SES / etc.)
    For now: return it in the API response for testing.

    Security note: we return the same success message whether the
    email exists or not — prevents attackers from discovering registered emails.
    """
    users = _users_col()

    user = users.find_one({"email": email})
    if not user:
        # Don't reveal that the email doesn't exist
        return {"ok": True, "message": "If that email exists, a reset link was sent", "token": None}

    # Generate a cryptographically random token (32 bytes = 64 hex chars)
    token   = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)

    users.update_one(
        {"email": email},
        {"$set": {
            "reset_token":         token,
            "reset_token_expires": expires,
        }}
    )
    return {
        "ok":      True,
        "message": "If that email exists, a reset link was sent",
        "token":   token,   # in production: email this, don't return it
    }


def reset_password(token: str, new_password: str) -> dict:
    """
    Find the user with this reset token, check it hasn't expired,
    and replace their password.
    """
    users = _users_col()

    now  = datetime.now(timezone.utc)
    user = users.find_one({
        "reset_token": token,
        "reset_token_expires": {"$gt": now},   # $gt = greater than (not expired)
    })

    if not user:
        return {"ok": False, "error": "invalid_token", "message": "Reset token is invalid or expired"}

    users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash":       hash_password(new_password),
            "reset_token":         None,   # consume the token — can't reuse it
            "reset_token_expires": None,
        }}
    )
    return {"ok": True, "message": "Password updated successfully"}


def get_user_by_email(email: str) -> Optional[dict]:
    """Fetch a user document by email. Returns None if not found."""
    users = _users_col()
    return users.find_one({"email": email})