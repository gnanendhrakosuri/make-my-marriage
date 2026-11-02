from urllib.parse import quote
import hashlib
from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.db.session import get_database

router = APIRouter(prefix="/public/invitations", tags=["public-invitations"])


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


class RsvpRequest(BaseModel):
    response: str = Field(..., pattern="^(yes|no)$", description="'yes' or 'no'")
    dietaryNotes: Optional[str] = Field(None, max_length=200)


@router.get("/{token}")
async def validate_invitation(
    token: str,
    db=Depends(get_database),
):
    """
    Validates the raw invitation token (GET never modifies RSVP).
    Returns wedding and guest details for the RSVP landing view.
    """
    token_hash = hash_token(token)
    invitation = await db.invitations.find_one({"tokenHash": token_hash})

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation link is invalid or does not exist.",
        )

    if invitation.get("revokedAt"):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This invitation link has been revoked by the wedding concierge.",
        )

    now = datetime.now(timezone.utc)
    expires_at = invitation.get("expiresAt")
    if expires_at and expires_at.replace(tzinfo=timezone.utc if expires_at.tzinfo is None else expires_at.tzinfo) < now:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This invitation link has expired.",
        )

    # Fetch guest
    guest_id = invitation.get("guestId")
    guest = None
    try:
        guest = await db.guests.find_one({"_id": ObjectId(guest_id)})
    except Exception:
        guest = await db.guests.find_one({"_id": guest_id})

    # Fetch wedding
    wedding_id = invitation.get("weddingId")
    wedding = None
    try:
        wedding = await db.weddings.find_one({"_id": ObjectId(wedding_id)})
    except Exception:
        wedding = await db.weddings.find_one({"_id": wedding_id})

    # Fetch current RSVP if exists
    rsvp = await db.rsvps.find_one({"invitationId": str(invitation["_id"])})

    couple_names = wedding.get("coupleNames", ["Couple"]) if wedding else ["Our Beloved Couple"]
    wedding_title = wedding.get("title", f"{' & '.join(couple_names)}'s Wedding") if wedding else "Wedding Celebration"

    # Check if guest already has an account
    guest_email = guest.get("email", "").strip().lower() if guest else ""
    user_account = await db.users.find_one({"email": guest_email}) if guest_email else None
    has_account = bool(user_account)

    return {
        "success": True,
        "data": {
            "invitationId": str(invitation["_id"]),
            "guestName": guest.get("name") if guest else "Honored Guest",
            "guestEmail": guest_email,
            "hasAccount": has_account,
            "coupleNames": couple_names,
            "weddingTitle": wedding_title,
            "weddingDate": wedding.get("weddingDate") or wedding.get("startDate") if wedding else None,
            "venueName": wedding.get("venueName") if wedding else "Private Luxury Sanctuary",
            "venueAddress": wedding.get("venueAddress") if wedding else None,
            "currentResponse": rsvp.get("response") if rsvp else None,
            "canRespond": True,
        },
    }


@router.post("/{token}/rsvp")
async def submit_rsvp(
    token: str,
    payload: RsvpRequest,
    db=Depends(get_database),
):
    """
    Submits or updates the guest's RSVP response (Yes or No).
    """
    token_hash = hash_token(token)
    invitation = await db.invitations.find_one({"tokenHash": token_hash})

    if not invitation or invitation.get("revokedAt"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or revoked invitation token.",
        )

    now = datetime.now(timezone.utc)
    invitation_id = str(invitation["_id"])
    guest_id = str(invitation["guestId"])
    wedding_id = str(invitation["weddingId"])

    guest = None
    try:
        guest = await db.guests.find_one({"_id": ObjectId(guest_id)})
    except Exception:
        guest = await db.guests.find_one({"_id": guest_id})

    # Upsert RSVP record
    rsvp_doc = {
        "weddingId": wedding_id,
        "guestId": guest_id,
        "invitationId": invitation_id,
        "response": payload.response,
        "dietaryNotes": payload.dietaryNotes,
        "respondedAt": now,
        "updatedAt": now,
    }

    await db.rsvps.update_one(
        {"invitationId": invitation_id},
        {"$set": rsvp_doc},
        upsert=True,
    )

    # Update guest RSVP status
    try:
        await db.guests.update_one(
            {"_id": ObjectId(guest_id)},
            {"$set": {"rsvpStatus": payload.response, "updatedAt": now}},
        )
    except Exception:
        await db.guests.update_one(
            {"_id": guest_id},
            {"$set": {"rsvpStatus": payload.response, "updatedAt": now}},
        )

    # Check if guest's email already has a registered user account
    guest_email = ""
    if guest and guest.get("email"):
        guest_email = guest["email"].strip().lower()
    else:
        g = await db.guests.find_one({"_id": ObjectId(guest_id)}) if ObjectId.is_valid(guest_id) else await db.guests.find_one({"_id": guest_id})
        if g and g.get("email"):
            guest_email = g["email"].strip().lower()

    user_account = await db.users.find_one({"email": guest_email}) if guest_email else None
    has_account = bool(user_account)

    safe_email = quote(guest_email)
    guest_name = guest.get("name", "") if guest else ""
    safe_name = quote(guest_name)
    redirect_url = (
        f"/login?email={safe_email}"
        if has_account
        else f"/signup?email={safe_email}&name={safe_name}"
    )

    return {
        "success": True,
        "message": f"Your RSVP ({payload.response.upper()}) has been confirmed. Thank you!",
        "data": {
            "response": payload.response,
            "respondedAt": now.isoformat(),
            "guestEmail": guest_email,
            "hasAccount": has_account,
            "redirectUrl": redirect_url,
        },
    }
