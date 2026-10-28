import re
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response, status

from app.core.config import settings
from app.core.security import (
    create_session_token,
    get_password_hash,
    verify_password,
    verify_session_token,
)
from app.db.session import get_database
from app.schemas.auth import (
    AuthData,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserPublic,
)

router = APIRouter(prefix="/auth", tags=["auth"])

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account (Couple or Wedding Planner)",
)
async def register(
    payload: RegisterRequest,
    response: Response,
    db=Depends(get_database),
):
    normalized_email = payload.email.strip().lower()

    if not EMAIL_REGEX.match(normalized_email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid email address.",
        )

    # Check for duplicate email
    existing_user = await db.users.find_one({"email": normalized_email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists. Please sign in instead.",
        )

    role = payload.accountType if payload.accountType in ["couple", "planner"] else "couple"
    hashed_pwd = get_password_hash(payload.password)
    now = datetime.now(timezone.utc)

    user_doc = {
        "name": payload.name.strip(),
        "email": normalized_email,
        "passwordHash": hashed_pwd,
        "role": role,
        "partnerName": payload.partnerName.strip() if payload.partnerName else None,
        "phone": payload.phone.strip() if payload.phone else None,
        "weddingDate": payload.weddingDate if payload.weddingDate else None,
        "weddingId": None,
        "status": "active",
        "createdAt": now,
        "updatedAt": now,
        "lastLoginAt": now,
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Issue session token
    session_token = create_session_token(user_id)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=86400 * 30,
        path="/",
    )

    return AuthResponse(
        success=True,
        message="Account created successfully! Welcome to Make My Marriage Atelier.",
        data=AuthData(
            user=UserPublic(
                id=user_id,
                name=user_doc["name"],
                email=user_doc["email"],
                role=user_doc["role"],
                partnerName=user_doc["partnerName"],
                phone=user_doc["phone"],
                weddingDate=user_doc["weddingDate"],
                weddingId=None,
            ),
            token=session_token,
        ),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Authenticate an existing user account",
)
async def login(
    payload: LoginRequest,
    response: Response,
    db=Depends(get_database),
):
    normalized_email = payload.email.strip().lower()

    if not EMAIL_REGEX.match(normalized_email):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid email address.",
        )

    user = await db.users.find_one({"email": normalized_email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated or suspended. Please contact the platform concierge.",
        )

    # Update last login timestamp
    now = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLoginAt": now}},
    )

    user_id = str(user["_id"])
    max_age = 86400 * 30 if payload.rememberMe else 86400 * 1

    session_token = create_session_token(user_id)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        max_age=max_age,
        path="/",
    )

    return AuthResponse(
        success=True,
        message="Sign-in successful! Welcome back to Make My Marriage Atelier Privé.",
        data=AuthData(
            user=UserPublic(
                id=user_id,
                name=user.get("name", "User"),
                email=user.get("email"),
                role=user.get("role", "couple"),
                partnerName=user.get("partnerName"),
                phone=user.get("phone"),
                weddingDate=user.get("weddingDate"),
                weddingId=str(user["weddingId"]) if user.get("weddingId") else None,
            ),
            token=session_token,
        ),
    )


@router.get(
    "/me",
    response_model=AuthResponse,
    summary="Get current authenticated user profile",
)
async def get_current_user(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
    db=Depends(get_database),
):
    token = session_token
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
        )

    user_id = verify_session_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid. Please sign in again.",
        )

    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user session identifier.",
        )

    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found.",
        )

    return AuthResponse(
        success=True,
        message="Current user profile retrieved successfully.",
        data=AuthData(
            user=UserPublic(
                id=str(user["_id"]),
                name=user.get("name", "User"),
                email=user.get("email"),
                role=user.get("role", "couple"),
                partnerName=user.get("partnerName"),
                phone=user.get("phone"),
                weddingDate=user.get("weddingDate"),
                weddingId=str(user["weddingId"]) if user.get("weddingId") else None,
            ),
            token=token,
        ),
    )


@router.post(
    "/logout",
    summary="Sign out and clear session cookie",
)
async def logout(response: Response):
    response.delete_cookie(key="session_token", path="/")
    return {"success": True, "message": "Sign out successful."}
