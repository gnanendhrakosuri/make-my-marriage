import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.deps import get_current_user_doc, verify_wedding_access
from app.core.config import settings
from app.db.session import get_database
from app.schemas.invitation import (
    InvitationCreateRequest,
    InvitationItem,
    InvitationResponse,
    InvitationResponseData,
    ReminderRequest,
    ReminderResponse,
    ReminderResponseData,
)
from app.services.email import send_invitation_email, send_reminder_email

logger = logging.getLogger("app.invitations")

router = APIRouter(prefix="/weddings/{weddingId}", tags=["invitations"])


def hash_token(raw_token: str) -> str:
    """Hash the raw token using SHA-256 before persisting."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


@router.post(
    "/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and dispatch an invitation email",
)
async def create_and_send_invitation(
    weddingId: str,
    payload: InvitationCreateRequest,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    # 1. Verify manager permission
    wedding = await verify_wedding_access(weddingId, current_user, db)

    # 2. Verify guest belongs to this wedding
    try:
        guest_oid = ObjectId(payload.guestId)
        guest = await db.guests.find_one({"_id": guest_oid, "weddingId": weddingId})
    except Exception:
        guest = await db.guests.find_one({"_id": payload.guestId, "weddingId": weddingId})

    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found or does not belong to this wedding.",
        )

    # 3. Generate raw cryptographically secure token & SHA-256 hash
    raw_token = secrets.token_hex(32)
    token_hash = hash_token(raw_token)

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=90)  # Invitations valid for 90 days

    # 4. Store invitation document with tokenHash (raw token is never stored)
    invitation_doc = {
        "weddingId": weddingId,
        "guestId": str(guest["_id"]),
        "tokenHash": token_hash,
        "status": "sent",
        "sentAt": now,
        "expiresAt": expires_at,
        "revokedAt": None,
        "createdAt": now,
    }
    result = await db.invitations.insert_one(invitation_doc)
    invitation_id = str(result.inserted_id)

    # 5. Build guest-specific invitation URL
    wedding_slug = wedding.get("slug", "wedding") if isinstance(wedding, dict) else "wedding"
    invite_url = f"{settings.frontend_url.rstrip('/')}/w/{wedding_slug}/invite/{raw_token}"

    couple_names = wedding.get("coupleNames", ["Our Couple"]) if isinstance(wedding, dict) else ["Our Couple"]
    wedding_title = wedding.get("title", f"{' & '.join(couple_names)}'s Wedding") if isinstance(wedding, dict) else "Wedding Celebration"
    wedding_date = wedding.get("weddingDate") or wedding.get("startDate")
    venue_name = wedding.get("venueName")

    # 6. Send the invitation email via Resend
    delivery_result = await send_invitation_email(
        recipient_email=guest["email"],
        guest_name=guest["name"],
        couple_names=couple_names,
        wedding_title=wedding_title,
        wedding_date=wedding_date,
        venue_name=venue_name,
        invite_url=invite_url,
    )

    invitation_status = delivery_result.get("status", "sent")

    # Update guest invitationStatus
    await db.guests.update_one(
        {"_id": guest["_id"]},
        {"$set": {"invitationStatus": invitation_status, "updatedAt": now}},
    )

    # 7. Record notification log entry (no tokens in log)
    notification_doc = {
        "weddingId": weddingId,
        "guestId": str(guest["_id"]),
        "invitationId": invitation_id,
        "type": "invitation",
        "status": invitation_status,
        "providerMessageId": delivery_result.get("providerMessageId"),
        "error": delivery_result.get("error"),
        "sentAt": now,
        "createdAt": now,
    }
    await db.notifications.insert_one(notification_doc)

    if not delivery_result.get("success"):
        error_msg = delivery_result.get("error", "Email dispatch error.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email dispatch via Resend failed: {error_msg}",
        )

    return InvitationResponse(
        success=True,
        message="Invitation dispatched successfully via Resend.",
        data=InvitationResponseData(
            invitationId=invitation_id,
            guestId=str(guest["_id"]),
            status=invitation_status,
            sentAt=now,
        ),
    )


@router.get(
    "/invitations",
    response_model=List[InvitationItem],
    summary="List invitations for a wedding",
)
async def list_invitations(
    weddingId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    await verify_wedding_access(weddingId, current_user, db)

    cursor = db.invitations.find({"weddingId": weddingId}).sort("createdAt", -1).limit(100)
    items = []

    async for doc in cursor:
        guest_id_str = str(doc.get("guestId"))
        guest = None
        try:
            guest = await db.guests.find_one({"_id": ObjectId(guest_id_str)})
        except Exception:
            guest = await db.guests.find_one({"_id": guest_id_str})

        items.append(
            InvitationItem(
                id=str(doc["_id"]),
                weddingId=str(doc["weddingId"]),
                guestId=guest_id_str,
                guestName=guest.get("name") if guest else None,
                guestEmail=guest.get("email") if guest else None,
                status=doc.get("status", "sent"),
                sentAt=doc.get("sentAt"),
                expiresAt=doc.get("expiresAt"),
                revokedAt=doc.get("revokedAt"),
                createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
            )
        )

    return items


@router.post(
    "/invitations/{invitationId}/resend",
    response_model=InvitationResponse,
    summary="Resend an invitation to a guest",
)
async def resend_invitation(
    weddingId: str,
    invitationId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)

    try:
        inv_oid = ObjectId(invitationId)
        invitation = await db.invitations.find_one({"_id": inv_oid, "weddingId": weddingId})
    except Exception:
        invitation = await db.invitations.find_one({"_id": invitationId, "weddingId": weddingId})

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation record not found.",
        )

    if invitation.get("revokedAt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot resend a revoked invitation. Please issue a new invitation.",
        )

    guest_id_str = str(invitation["guestId"])
    try:
        guest = await db.guests.find_one({"_id": ObjectId(guest_id_str), "weddingId": weddingId})
    except Exception:
        guest = await db.guests.find_one({"_id": guest_id_str, "weddingId": weddingId})

    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated guest record not found.",
        )

    # Issue a fresh cryptographically secure token
    raw_token = secrets.token_hex(32)
    token_hash = hash_token(raw_token)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=90)

    await db.invitations.update_one(
        {"_id": invitation["_id"]},
        {"$set": {"tokenHash": token_hash, "sentAt": now, "expiresAt": expires_at, "status": "sent"}},
    )

    wedding_slug = wedding.get("slug", "wedding") if isinstance(wedding, dict) else "wedding"
    invite_url = f"{settings.frontend_url.rstrip('/')}/w/{wedding_slug}/invite/{raw_token}"
    couple_names = wedding.get("coupleNames", ["Our Couple"]) if isinstance(wedding, dict) else ["Our Couple"]

    delivery_result = await send_invitation_email(
        recipient_email=guest["email"],
        guest_name=guest["name"],
        couple_names=couple_names,
        wedding_title=wedding.get("title", "Wedding Celebration"),
        wedding_date=wedding.get("weddingDate"),
        venue_name=wedding.get("venueName"),
        invite_url=invite_url,
    )

    invitation_status = delivery_result.get("status", "sent")

    # Record notification history
    await db.notifications.insert_one({
        "weddingId": weddingId,
        "guestId": guest_id_str,
        "invitationId": str(invitation["_id"]),
        "type": "invitation",
        "status": invitation_status,
        "providerMessageId": delivery_result.get("providerMessageId"),
        "sentAt": now,
        "createdAt": now,
    })

    return InvitationResponse(
        success=True,
        message="Invitation resent successfully.",
        data=InvitationResponseData(
            invitationId=str(invitation["_id"]),
            guestId=guest_id_str,
            status=invitation_status,
            sentAt=now,
        ),
    )


@router.post(
    "/invitations/{invitationId}/revoke",
    response_model=InvitationResponse,
    summary="Revoke an invitation token",
)
async def revoke_invitation(
    weddingId: str,
    invitationId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    await verify_wedding_access(weddingId, current_user, db)

    try:
        inv_oid = ObjectId(invitationId)
        invitation = await db.invitations.find_one({"_id": inv_oid, "weddingId": weddingId})
    except Exception:
        invitation = await db.invitations.find_one({"_id": invitationId, "weddingId": weddingId})

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation record not found.",
        )

    now = datetime.now(timezone.utc)
    await db.invitations.update_one(
        {"_id": invitation["_id"]},
        {"$set": {"status": "revoked", "revokedAt": now}},
    )

    # Also update guest status
    guest_id_str = str(invitation.get("guestId"))
    try:
        await db.guests.update_one(
            {"_id": ObjectId(guest_id_str)},
            {"$set": {"invitationStatus": "revoked", "updatedAt": now}},
        )
    except Exception:
        await db.guests.update_one(
            {"_id": guest_id_str},
            {"$set": {"invitationStatus": "revoked", "updatedAt": now}},
        )

    return InvitationResponse(
        success=True,
        message="Invitation revoked successfully.",
        data=InvitationResponseData(
            invitationId=str(invitation["_id"]),
            guestId=guest_id_str,
            status="revoked",
            sentAt=invitation.get("sentAt"),
        ),
    )


@router.post(
    "/reminders",
    response_model=ReminderResponse,
    summary="Send reminder emails to selected guests",
)
async def send_reminders(
    weddingId: str,
    payload: ReminderRequest,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)
    now = datetime.now(timezone.utc)
    wedding_slug = wedding.get("slug", "wedding") if isinstance(wedding, dict) else "wedding"
    couple_names = wedding.get("coupleNames", ["Our Couple"]) if isinstance(wedding, dict) else ["Our Couple"]

    sent_count = 0

    for gid in payload.guestIds:
        guest = None
        try:
            guest = await db.guests.find_one({"_id": ObjectId(gid), "weddingId": weddingId})
        except Exception:
            guest = await db.guests.find_one({"_id": gid, "weddingId": weddingId})

        if not guest or not guest.get("email"):
            continue

        # Look for existing active invitation token
        inv = await db.invitations.find_one({
            "weddingId": weddingId,
            "guestId": str(guest["_id"]),
            "revokedAt": None,
        })

        if inv:
            raw_token = secrets.token_hex(32)
            token_hash = hash_token(raw_token)
            await db.invitations.update_one(
                {"_id": inv["_id"]},
                {"$set": {"tokenHash": token_hash, "sentAt": now}},
            )
            invite_url = f"{settings.frontend_url.rstrip('/')}/w/{wedding_slug}/invite/{raw_token}"
            inv_id = str(inv["_id"])
        else:
            raw_token = secrets.token_hex(32)
            token_hash = hash_token(raw_token)
            new_inv = {
                "weddingId": weddingId,
                "guestId": str(guest["_id"]),
                "tokenHash": token_hash,
                "status": "sent",
                "sentAt": now,
                "expiresAt": now + timedelta(days=90),
                "revokedAt": None,
                "createdAt": now,
            }
            res = await db.invitations.insert_one(new_inv)
            inv_id = str(res.inserted_id)
            invite_url = f"{settings.frontend_url.rstrip('/')}/w/{wedding_slug}/invite/{raw_token}"

        delivery_result = await send_reminder_email(
            recipient_email=guest["email"],
            guest_name=guest["name"],
            couple_names=couple_names,
            wedding_title=wedding.get("title", "Wedding Celebration"),
            reminder_type=payload.type,
            message_text=payload.message,
            invite_url=invite_url,
            event_name=payload.eventName,
        )

        await db.notifications.insert_one({
            "weddingId": weddingId,
            "guestId": str(guest["_id"]),
            "invitationId": inv_id,
            "type": "reminder",
            "status": delivery_result.get("status", "sent"),
            "providerMessageId": delivery_result.get("providerMessageId"),
            "sentAt": now,
            "createdAt": now,
        })

        # Update guest record with reminder timestamp & count
        await db.guests.update_one(
            {"_id": guest["_id"]},
            {
                "$set": {
                    "lastRemindedAt": now,
                    "updatedAt": now,
                    "invitationStatus": "sent" if guest.get("invitationStatus") == "pending" else guest.get("invitationStatus"),
                },
                "$inc": {"reminderCount": 1},
            },
        )
        sent_count += 1

    return ReminderResponse(
        success=True,
        message=f"Dispatched {sent_count} reminder email(s).",
        data=ReminderResponseData(
            requestedCount=len(payload.guestIds),
            sentCount=sent_count,
            status="completed",
        ),
    )
