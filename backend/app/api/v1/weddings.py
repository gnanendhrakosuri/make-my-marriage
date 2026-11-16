from datetime import datetime, timezone
from typing import List
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.v1.deps import get_current_user_doc, verify_wedding_access
from app.db.session import get_database
from app.schemas.wedding import (
    SubEventCreate,
    SubEventResponse,
    SubEventUpdate,
    WeddingCreate,
    WeddingResponse,
    WeddingUpdate,
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


@router.patch(
    "/{weddingId}",
    response_model=WeddingResponse,
    summary="Update wedding celebration details",
)
async def update_wedding(
    weddingId: str,
    payload: WeddingUpdate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    """
    Updates wedding celebration details.
    Requires manager or admin access to the wedding.
    """
    wedding = await verify_wedding_access(weddingId, current_user, db)
    now = datetime.now(timezone.utc)

    update_fields = {"updatedAt": now}

    if payload.slug is not None:
        sanitized_slug = payload.slug.strip().lower()
        if sanitized_slug != wedding.get("slug"):
            # Check for slug collision
            existing = await db.weddings.find_one({"slug": sanitized_slug, "_id": {"$ne": wedding["_id"]}})
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"The vanity URL slug '{sanitized_slug}' is already reserved by another wedding.",
                )
            update_fields["slug"] = sanitized_slug

    if payload.siteTitle is not None:
        update_fields["siteTitle"] = payload.siteTitle.strip()
    if payload.partnerOne is not None:
        update_fields["partnerOne"] = payload.partnerOne.strip()
    if payload.partnerTwo is not None:
        update_fields["partnerTwo"] = payload.partnerTwo.strip()

    # Keep coupleNames in sync if partners updated
    p1 = update_fields.get("partnerOne", wedding.get("partnerOne", ""))
    p2 = update_fields.get("partnerTwo", wedding.get("partnerTwo", ""))
    if p1 or p2:
        update_fields["coupleNames"] = [name for name in [p1, p2] if name]

    if payload.weddingDate is not None:
        update_fields["weddingDate"] = payload.weddingDate
    if payload.welcomeStory is not None:
        update_fields["welcomeStory"] = payload.welcomeStory.strip()
    if payload.venueName is not None:
        update_fields["venueName"] = payload.venueName.strip()
    if payload.venueAddress is not None:
        update_fields["venueAddress"] = payload.venueAddress.strip()
    if payload.venueCity is not None:
        update_fields["venueCity"] = payload.venueCity.strip()
    if payload.venueCountry is not None:
        update_fields["venueCountry"] = payload.venueCountry.strip()
    if payload.timezone is not None:
        update_fields["timezone"] = payload.timezone
    if payload.coordinates is not None:
        update_fields["coordinates"] = payload.coordinates
    if payload.accommodationNotes is not None:
        update_fields["accommodationNotes"] = payload.accommodationNotes
    if payload.transportNotes is not None:
        update_fields["transportNotes"] = payload.transportNotes
    if payload.status is not None:
        update_fields["status"] = payload.status

    await db.weddings.update_one({"_id": wedding["_id"]}, {"$set": update_fields})
    updated_wedding = await db.weddings.find_one({"_id": wedding["_id"]})

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
        id=str(updated_wedding["_id"]),
        slug=updated_wedding.get("slug", "wedding"),
        siteTitle=updated_wedding.get("siteTitle", "Our Wedding"),
        coupleNames=updated_wedding.get("coupleNames", ["Couple"]),
        partnerOne=updated_wedding.get("partnerOne", ""),
        partnerTwo=updated_wedding.get("partnerTwo", ""),
        weddingDate=updated_wedding.get("weddingDate"),
        welcomeStory=updated_wedding.get("welcomeStory"),
        venueName=updated_wedding.get("venueName"),
        venueAddress=updated_wedding.get("venueAddress"),
        venueCity=updated_wedding.get("venueCity"),
        venueCountry=updated_wedding.get("venueCountry"),
        timezone=updated_wedding.get("timezone", "UTC"),
        coordinates=updated_wedding.get("coordinates"),
        accommodationNotes=updated_wedding.get("accommodationNotes"),
        transportNotes=updated_wedding.get("transportNotes"),
        status=updated_wedding.get("status", "published"),
        managerIds=[str(m) for m in updated_wedding.get("managerIds", [])],
        events=events,
        createdAt=updated_wedding.get("createdAt", datetime.now(timezone.utc)),
        updatedAt=updated_wedding.get("updatedAt", datetime.now(timezone.utc)),
    )


@router.post(
    "/{weddingId}/events",
    response_model=SubEventResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new celebration event to the wedding itinerary",
)
async def add_wedding_event(
    weddingId: str,
    payload: SubEventCreate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    """
    Adds a new event (e.g. Welcome Drinks, Reception, Brunch) to a wedding dossier.
    Requires manager or admin access to the wedding.
    """
    wedding = await verify_wedding_access(weddingId, current_user, db)
    now = datetime.now(timezone.utc)

    ev_doc = {
        "weddingId": str(wedding["_id"]),
        "title": payload.title.strip(),
        "date": payload.date,
        "startTime": payload.startTime,
        "endTime": payload.endTime,
        "location": payload.location,
        "dressCode": payload.dressCode,
        "isPublic": payload.isPublic,
        "createdAt": now,
        "updatedAt": now,
    }

    res = await db.events.insert_one(ev_doc)
    return SubEventResponse(
        id=str(res.inserted_id),
        title=ev_doc["title"],
        date=ev_doc["date"],
        startTime=ev_doc["startTime"],
        endTime=ev_doc["endTime"],
        location=ev_doc["location"],
        dressCode=ev_doc["dressCode"],
        isPublic=ev_doc["isPublic"],
    )


@router.put(
    "/{weddingId}/events/{eventId}",
    response_model=SubEventResponse,
    summary="Update an existing celebration event in the wedding itinerary",
)
async def update_wedding_event(
    weddingId: str,
    eventId: str,
    payload: SubEventUpdate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    """
    Updates an event's details. Requires manager/admin access to the wedding.
    """
    wedding = await verify_wedding_access(weddingId, current_user, db)
    now = datetime.now(timezone.utc)

    query = {"weddingId": str(wedding["_id"])}
    if ObjectId.is_valid(eventId):
        query["_id"] = ObjectId(eventId)
    else:
        query["_id"] = eventId

    existing = await db.events.find_one(query)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{eventId}' not found in wedding dossier.",
        )

    update_fields = {"updatedAt": now}
    if payload.title is not None:
        update_fields["title"] = payload.title.strip()
    if payload.date is not None:
        update_fields["date"] = payload.date
    if payload.startTime is not None:
        update_fields["startTime"] = payload.startTime
    if payload.endTime is not None:
        update_fields["endTime"] = payload.endTime
    if payload.location is not None:
        update_fields["location"] = payload.location
    if payload.dressCode is not None:
        update_fields["dressCode"] = payload.dressCode
    if payload.isPublic is not None:
        update_fields["isPublic"] = payload.isPublic

    await db.events.update_one({"_id": existing["_id"]}, {"$set": update_fields})
    updated = await db.events.find_one({"_id": existing["_id"]})

    return SubEventResponse(
        id=str(updated["_id"]),
        title=updated.get("title", ""),
        date=updated.get("date"),
        startTime=updated.get("startTime"),
        endTime=updated.get("endTime"),
        location=updated.get("location"),
        dressCode=updated.get("dressCode"),
        isPublic=updated.get("isPublic", True),
    )


@router.delete(
    "/{weddingId}/events/{eventId}",
    status_code=status.HTTP_200_OK,
    summary="Delete a celebration event from the wedding itinerary",
)
async def delete_wedding_event(
    weddingId: str,
    eventId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    """
    Deletes an event from the wedding dossier. Requires manager/admin access.
    """
    wedding = await verify_wedding_access(weddingId, current_user, db)

    query = {"weddingId": str(wedding["_id"])}
    if ObjectId.is_valid(eventId):
        query["_id"] = ObjectId(eventId)
    else:
        query["_id"] = eventId

    delete_result = await db.events.delete_one(query)
    if delete_result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{eventId}' not found in wedding dossier.",
        )

    return {"message": "Event deleted successfully", "eventId": eventId}



