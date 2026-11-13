from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.deps import get_current_user_doc, verify_wedding_access
from app.db.session import get_database
from app.schemas.wedding import (
    SubEventResponse,
    WeddingCreate,
    WeddingResponse,
)

router = APIRouter(prefix="/weddings", tags=["weddings"])


@router.post(
    "",
    response_model=WeddingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create and publish a new wedding website",
)
async def create_wedding(
    payload: WeddingCreate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    """
    Creates a new wedding dossier, registers sub-events, assigns the
    creator as manager, and updates the user's active weddingId.
    """
    now = datetime.now(timezone.utc)
    sanitized_slug = payload.urlSlug.strip().lower()

    # Verify slug uniqueness
    existing = await db.weddings.find_one({"slug": sanitized_slug})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"The vanity URL slug '{sanitized_slug}' is already reserved. Please choose another.",
        )

    user_id = current_user["_id"]

    wedding_doc = {
        "slug": sanitized_slug,
        "siteTitle": payload.siteTitle.strip(),
        "coupleNames": [payload.partnerOne.strip(), payload.partnerTwo.strip()],
        "partnerOne": payload.partnerOne.strip(),
        "partnerTwo": payload.partnerTwo.strip(),
        "weddingDate": payload.weddingDate,
        "welcomeStory": payload.welcomeStory,
        "partnerOneRole": payload.partnerOneRole,
        "partnerOneEmail": payload.partnerOneEmail,
        "partnerOneBio": payload.partnerOneBio,
        "partnerTwoRole": payload.partnerTwoRole,
        "partnerTwoEmail": payload.partnerTwoEmail,
        "partnerTwoBio": payload.partnerTwoBio,
        "howWeMet": payload.howWeMet,
        "venueName": payload.venueName,
        "venueAddress": payload.venueAddress,
        "venueCity": payload.venueCity,
        "venueCountry": payload.venueCountry,
        "timezone": payload.timezone or "UTC",
        "coordinates": payload.coordinates,
        "accommodationNotes": payload.accommodationNotes,
        "transportNotes": payload.transportNotes,
        "status": "published",
        "managerIds": [user_id],
        "createdAt": now,
        "updatedAt": now,
    }

    insert_result = await db.weddings.insert_one(wedding_doc)
    wedding_id = insert_result.inserted_id

    # Persist sub-events
    persisted_events: List[SubEventResponse] = []
    if payload.events:
        for ev in payload.events:
            ev_doc = {
                "weddingId": str(wedding_id),
                "title": ev.title.strip(),
                "date": ev.date,
                "startTime": ev.startTime,
                "endTime": ev.endTime,
                "location": ev.location,
                "dressCode": ev.dressCode,
                "isPublic": ev.isPublic,
                "createdAt": now,
                "updatedAt": now,
            }
            ev_res = await db.events.insert_one(ev_doc)
            persisted_events.append(
                SubEventResponse(
                    id=str(ev_res.inserted_id),
                    title=ev_doc["title"],
                    date=ev_doc["date"],
                    startTime=ev_doc["startTime"],
                    endTime=ev_doc["endTime"],
                    location=ev_doc["location"],
                    dressCode=ev_doc["dressCode"],
                    isPublic=ev_doc["isPublic"],
                )
            )

    # Associate weddingId with creator's user account if not already set
    await db.users.update_one(
        {"_id": user_id},
        {"$set": {"weddingId": str(wedding_id), "updatedAt": now}},
    )

    return WeddingResponse(
        id=str(wedding_id),
        slug=wedding_doc["slug"],
        siteTitle=wedding_doc["siteTitle"],
        coupleNames=wedding_doc["coupleNames"],
        partnerOne=wedding_doc["partnerOne"],
        partnerTwo=wedding_doc["partnerTwo"],
        weddingDate=wedding_doc["weddingDate"],
        welcomeStory=wedding_doc["welcomeStory"],
        venueName=wedding_doc["venueName"],
        venueAddress=wedding_doc["venueAddress"],
        venueCity=wedding_doc["venueCity"],
        venueCountry=wedding_doc["venueCountry"],
        timezone=wedding_doc["timezone"],
        coordinates=wedding_doc["coordinates"],
        accommodationNotes=wedding_doc["accommodationNotes"],
        transportNotes=wedding_doc["transportNotes"],
        status=wedding_doc["status"],
        managerIds=[str(user_id)],
        events=persisted_events,
        createdAt=wedding_doc["createdAt"],
        updatedAt=wedding_doc["updatedAt"],
    )


@router.get(
    "/{weddingId}",
    response_model=WeddingResponse,
    summary="Get wedding details by ID",
)
async def get_wedding_by_id(
    weddingId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)

    # Fetch sub-events
    cursor = db.events.find({"weddingId": str(wedding["_id"])})
    event_docs = await cursor.to_list(length=100)
    events = [
        SubEventResponse(
            id=str(doc["_id"]),
            title=doc.get("title", ""),
            date=doc.get("date"),
            startTime=doc.get("startTime"),
            endTime=doc.get("endTime"),
            location=doc.get("location"),
            dressCode=doc.get("dressCode"),
            isPublic=doc.get("isPublic", True),
        )
        for doc in event_docs
    ]

    return WeddingResponse(
        id=str(wedding["_id"]),
        slug=wedding.get("slug", "wedding"),
        siteTitle=wedding.get("siteTitle", "Our Wedding"),
        coupleNames=wedding.get("coupleNames", ["Couple"]),
        partnerOne=wedding.get("partnerOne", ""),
        partnerTwo=wedding.get("partnerTwo", ""),
        weddingDate=wedding.get("weddingDate"),
        welcomeStory=wedding.get("welcomeStory"),
        venueName=wedding.get("venueName"),
        venueAddress=wedding.get("venueAddress"),
        venueCity=wedding.get("venueCity"),
        venueCountry=wedding.get("venueCountry"),
        timezone=wedding.get("timezone", "UTC"),
        coordinates=wedding.get("coordinates"),
        accommodationNotes=wedding.get("accommodationNotes"),
        transportNotes=wedding.get("transportNotes"),
        status=wedding.get("status", "published"),
        managerIds=[str(m) for m in wedding.get("managerIds", [])],
        events=events,
        createdAt=wedding.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=wedding.get("updatedAt", datetime.now(timezone.utc)),
    )

