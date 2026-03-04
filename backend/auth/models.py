# backend/auth/models.py
"""
Auth data models — request bodies and response shapes.

Pydantic models serve two purposes here:
  1. Validation  — FastAPI checks every incoming request against them.
                   Missing field? Wrong type? FastAPI rejects it with a
                   clear 422 error before your code even runs.
  2. Documentation — FastAPI auto-generates an interactive API docs page
                   at http://localhost:8000/docs showing every field.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


# ── Registration ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """What the client sends when creating a new account."""
    email:    EmailStr   # Pydantic validates this is a real email format
    username: str
    password: str
    role:     Optional[str] = "validator"  # default role for new users

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        """Reject weak passwords before they reach the database."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("username")
    @classmethod
    def username_clean(cls, v):
        """No spaces or special characters in usernames."""
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, _ and -")
        return v.lower()   # store usernames in lowercase always


class RegisterResponse(BaseModel):
    """What we send back after successful registration."""
    message:  str
    username: str
    email:    str
    role:     str


# ── Login ─────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    """Email + password. That's all we need."""
    email:    EmailStr
    password: str


class LoginResponse(BaseModel):
    """
    What we send back after successful login.

    access_token: A JWT — a signed string the client stores and sends
                  with every future request to prove who they are.
    token_type:   Always "bearer" — this is the HTTP standard name for JWTs.
    """
    access_token: str
    token_type:   str = "bearer"
    username:     str
    email:        str
    role:         str


# ── Current user (from token) ─────────────────────────────────────────────────

class UserProfile(BaseModel):
    """
    Returned by GET /auth/me
    We never return password_hash — only safe fields.
    """
    username:   str
    email:      str
    role:       str
    is_active:  bool
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None


# ── Forgot / Reset password ───────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    """User provides their email to trigger a reset."""
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """
    In production you would EMAIL the token.
    For now we return it directly so you can test without an email server.
    The field is called 'dev_reset_token' as a reminder this is dev-only.
    """
    message:         str
    dev_reset_token: Optional[str] = None   # remove this in production!


class ResetPasswordRequest(BaseModel):
    """Client sends the token they received + their new password."""
    token:        str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class ResetPasswordResponse(BaseModel):
    message: str