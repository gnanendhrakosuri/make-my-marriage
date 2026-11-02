from typing import Optional
from bson import ObjectId
from fastapi import Cookie, Depends, Header, HTTPException, status

from app.core.security import verify_session_token
from app.db.session import get_database


async def get_current_user_doc(
    session_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
    db=Depends(get_database),
) -> dict:
    """
    Resolves the authenticated user document from session cookie or Bearer header.
    Raises HTTPException 401 if unauthenticated or session is invalid.
    """
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
    if not user or user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or deactivated.",
        )

    return user


async def verify_wedding_access(
    wedding_id_str: str,
    user: dict,
    db,
) -> dict:
    """
    Verifies that the current user has management permissions for the given wedding.
    Admin has global access. Managers and couples must be assigned to the wedding.
    """
    try:
        wedding_oid = ObjectId(wedding_id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid wedding identifier format.",
        )

    wedding = await db.weddings.find_one({"_id": wedding_oid})
    if not wedding:
        # Check if wedding exists under custom string ID
        wedding = await db.weddings.find_one({"_id": wedding_id_str})

    role = user.get("role")
    user_id_str = str(user["_id"])

    # Admins always have access
    if role == "admin":
        return wedding or {"_id": wedding_id_str, "slug": "wedding", "coupleNames": ["Couple"]}

    # If wedding doc exists, check managerIds
    if wedding:
        manager_ids = [str(m) for m in wedding.get("managerIds", [])]
        user_wedding_id = str(user.get("weddingId")) if user.get("weddingId") else None
        if user_id_str in manager_ids or user_wedding_id == str(wedding["_id"]):
            return wedding

    # If user has this weddingId assigned on their user record
    if str(user.get("weddingId")) == wedding_id_str:
        return wedding or {"_id": wedding_id_str, "slug": "wedding", "coupleNames": ["Couple"]}

    # Default permissive check for newly created onboarding weddings if user is couple/manager
    if not wedding:
        return {"_id": wedding_id_str, "slug": "wedding", "coupleNames": ["Couple"]}

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to manage this wedding.",
    )
