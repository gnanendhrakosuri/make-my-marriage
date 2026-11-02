from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.deps import get_current_user_doc, verify_wedding_access
from app.db.session import get_database
from app.schemas.guest import GuestCreate, GuestResponse, GuestUpdate

router = APIRouter(prefix="/weddings/{weddingId}/guests", tags=["guests"])


@router.post(
    "",
    response_model=GuestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a guest to a wedding",
)
async def add_guest(
    weddingId: str,
    payload: GuestCreate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    await verify_wedding_access(weddingId, current_user, db)

    normalized_email = payload.email.strip().lower()
    now = datetime.now(timezone.utc)

    # Check if guest already exists for this wedding
    existing_guest = await db.guests.find_one({
        "weddingId": weddingId,
        "email": normalized_email,
    })
    if existing_guest:
        # If updating role or phone on existing
        update_fields = {}
        if payload.role and payload.role != existing_guest.get("role"):
            update_fields["role"] = payload.role
        if payload.phone and payload.phone != existing_guest.get("phone"):
            update_fields["phone"] = payload.phone.strip()
        if update_fields:
            update_fields["updatedAt"] = now
            await db.guests.update_one({"_id": existing_guest["_id"]}, {"$set": update_fields})
            existing_guest.update(update_fields)

        return GuestResponse(
            id=str(existing_guest["_id"]),
            weddingId=str(existing_guest["weddingId"]),
            name=existing_guest["name"],
            email=existing_guest["email"],
            phone=existing_guest.get("phone"),
            role=existing_guest.get("role", "guest"),
            invitationStatus=existing_guest.get("invitationStatus", "pending"),
            rsvpStatus=existing_guest.get("rsvpStatus"),
            lastRemindedAt=existing_guest.get("lastRemindedAt"),
            reminderCount=existing_guest.get("reminderCount", 0),
            createdAt=existing_guest.get("createdAt", now),
            updatedAt=existing_guest.get("updatedAt", now),
        )

    guest_doc = {
        "weddingId": weddingId,
        "name": payload.name.strip(),
        "email": normalized_email,
        "phone": payload.phone.strip() if payload.phone else None,
        "role": payload.role or "guest",
        "invitationStatus": "pending",
        "lastRemindedAt": None,
        "reminderCount": 0,
        "createdAt": now,
        "updatedAt": now,
    }

    result = await db.guests.insert_one(guest_doc)
    guest_doc["_id"] = result.inserted_id

    # If this guest email corresponds to an existing user, sync role
    user_account = await db.users.find_one({"email": normalized_email})
    if user_account and payload.role:
        await db.users.update_one({"_id": user_account["_id"]}, {"$set": {"role": payload.role, "updatedAt": now}})

    return GuestResponse(
        id=str(guest_doc["_id"]),
        weddingId=guest_doc["weddingId"],
        name=guest_doc["name"],
        email=guest_doc["email"],
        phone=guest_doc["phone"],
        role=guest_doc["role"],
        invitationStatus=guest_doc["invitationStatus"],
        rsvpStatus=guest_doc.get("rsvpStatus"),
        lastRemindedAt=guest_doc.get("lastRemindedAt"),
        reminderCount=guest_doc.get("reminderCount", 0),
        createdAt=guest_doc["createdAt"],
        updatedAt=guest_doc["updatedAt"],
    )


@router.get(
    "",
    response_model=List[GuestResponse],
    summary="List guests for a wedding",
)
async def list_guests(
    weddingId: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    await verify_wedding_access(weddingId, current_user, db)

    query = {"weddingId": weddingId}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]

    skip = (page - 1) * limit
    cursor = db.guests.find(query).sort("createdAt", -1).skip(skip).limit(limit)

    results = []
    now = datetime.now(timezone.utc)
    async for g in cursor:
        results.append(
            GuestResponse(
                id=str(g["_id"]),
                weddingId=str(g["weddingId"]),
                name=g["name"],
                email=g["email"],
                phone=g.get("phone"),
                role=g.get("role", "guest"),
                invitationStatus=g.get("invitationStatus", "pending"),
                rsvpStatus=g.get("rsvpStatus"),
                lastRemindedAt=g.get("lastRemindedAt"),
                reminderCount=g.get("reminderCount", 0),
                createdAt=g.get("createdAt", now),
                updatedAt=g.get("updatedAt", now),
            )
        )

    return results


@router.patch(
    "/{guestId}",
    response_model=GuestResponse,
    summary="Update guest phone number and role (admin, manager, guest)",
)
async def update_guest(
    weddingId: str,
    guestId: str,
    payload: GuestUpdate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    await verify_wedding_access(weddingId, current_user, db)

    try:
        g_oid = ObjectId(guestId)
        guest = await db.guests.find_one({"_id": g_oid, "weddingId": weddingId})
    except Exception:
        guest = await db.guests.find_one({"_id": guestId, "weddingId": weddingId})

    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found.",
        )

    now = datetime.now(timezone.utc)
    updates = {}
    if payload.name is not None:
        updates["name"] = payload.name.strip()
    if payload.phone is not None:
        updates["phone"] = payload.phone.strip() if payload.phone else None
    if payload.role is not None:
        updates["role"] = payload.role

    if updates:
        updates["updatedAt"] = now
        await db.guests.update_one({"_id": guest["_id"]}, {"$set": updates})
        guest.update(updates)

        # Also sync role to user account if one exists with this guest's email
        if payload.role is not None and guest.get("email"):
            await db.users.update_one(
                {"email": guest["email"].strip().lower()},
                {"$set": {"role": payload.role, "updatedAt": now}},
            )

    return GuestResponse(
        id=str(guest["_id"]),
        weddingId=str(guest["weddingId"]),
        name=guest["name"],
        email=guest["email"],
        phone=guest.get("phone"),
        role=guest.get("role", "guest"),
        invitationStatus=guest.get("invitationStatus", "pending"),
        rsvpStatus=guest.get("rsvpStatus"),
        lastRemindedAt=guest.get("lastRemindedAt"),
        reminderCount=guest.get("reminderCount", 0),
        createdAt=guest.get("createdAt", now),
        updatedAt=guest.get("updatedAt", now),
    )
