# backend/auth/router.py
"""
Auth router — HTTP endpoints.

Each function here:
  1. Reads the incoming request
  2. Calls a service function
  3. Returns the right HTTP response

Nothing else. No business logic lives here.
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .models import (
    RegisterRequest, RegisterResponse,
    LoginRequest, LoginResponse,
    UserProfile,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse,
)
from . import service

router  = APIRouter(prefix="/auth", tags=["Authentication"])
bearer  = HTTPBearer()   # reads "Authorization: Bearer <token>" header


# ── Dependency: get current user from token ────────────────────────────────────
# This is a FastAPI "dependency" — a reusable function you inject into any
# route that requires authentication. Add `current_user = Depends(get_current_user)`
# to any route and FastAPI will automatically:
#   1. Read the Authorization header
#   2. Decode the JWT
#   3. Pass the user payload to your function
#   4. Return 401 automatically if the token is missing or invalid

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    """
    Extract and verify the JWT from the Authorization header.
    Raises 401 if the token is missing, expired, or tampered.
    """
    payload = service.decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Token is invalid or expired",
            headers     = {"WWW-Authenticate": "Bearer"},
        )
    return payload   # {"sub": email, "usr": username, "role": role, "exp": ...}


# ══════════════════════════════════════════════════════════════════════════════
# Endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(body: RegisterRequest):
    """
    Create a new user account.
    Returns 201 Created on success.
    Returns 409 Conflict if email or username already exists.
    """
    result = service.register_user(
        email    = body.email,
        username = body.username,
        password = body.password,
        role     = body.role,
    )
    if not result["ok"]:
        # 409 = Conflict — the resource (user) already exists
        raise HTTPException(status_code=409, detail=result["message"])

    user = result["user"]
    return RegisterResponse(
        message  = "Account created successfully",
        username = user["username"],
        email    = user["email"],
        role     = user["role"],
    )


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest):
    """
    Log in with email + password.
    Returns a JWT access token on success.
    Returns 401 Unauthorized if credentials are wrong.
    """
    result = service.login_user(email=body.email, password=body.password)
    if not result["ok"]:
        # 401 = Unauthorized — credentials are wrong
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = result["message"],
        )

    user = result["user"]
    return LoginResponse(
        access_token = result["token"],
        username     = user["username"],
        email        = user["email"],
        role         = user["role"],
    )


@router.get("/me", response_model=UserProfile)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Return the profile of the currently logged-in user.
    Requires a valid JWT in the Authorization header.

    The `Depends(get_current_user)` part means FastAPI automatically
    validates the token before this function even starts.
    """
    user = service.get_user_by_email(current_user["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserProfile(
        username   = user["username"],
        email      = user["email"],
        role       = user["role"],
        is_active  = user["is_active"],
        created_at = user.get("created_at"),
        last_login = user.get("last_login"),
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(body: ForgotPasswordRequest):
    """
    Request a password reset token.
    Always returns 200 — never reveals if the email exists.
    The reset token is returned directly (dev mode).
    In production: send it via email instead.
    """
    result = service.forgot_password(email=body.email)
    return ForgotPasswordResponse(
        message         = result["message"],
        dev_reset_token = result.get("token"),
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(body: ResetPasswordRequest):
    """
    Set a new password using a reset token.
    Returns 400 Bad Request if the token is invalid or expired.
    """
    result = service.reset_password(
        token        = body.token,
        new_password = body.new_password,
    )
    if not result["ok"]:
        # 400 = Bad Request — the token is wrong or expired
        raise HTTPException(status_code=400, detail=result["message"])

    return ResetPasswordResponse(message=result["message"])