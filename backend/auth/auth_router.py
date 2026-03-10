# backend/auth/auth_router.py
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
bearer  = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    payload = service.decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail      = "Token is invalid or expired",
            headers     = {"WWW-Authenticate": "Bearer"},
        )
    return payload


@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(body: RegisterRequest):
    result = service.register_user(
        email    = body.email,
        username = body.username,
        password = body.password,
        role     = body.role,
    )
    if not result["ok"]:
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
    result = service.login_user(email=body.email, password=body.password)
    if not result["ok"]:
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
    result = service.forgot_password(email=body.email)
    return ForgotPasswordResponse(
        message         = result["message"],
        dev_reset_token = result.get("token"),
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(body: ResetPasswordRequest):
    result = service.reset_password(
        token        = body.token,
        new_password = body.new_password,
    )
    if not result["ok"]:
        raise HTTPException(status_code=400, detail=result["message"])

    return ResetPasswordResponse(message=result["message"])