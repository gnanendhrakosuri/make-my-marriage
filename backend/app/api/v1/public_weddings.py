from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.db.session import get_database
from app.schemas.wedding import SubEventResponse, WeddingPublic

router = APIRouter(prefix="/public/weddings", tags=["public-weddings"])


@router.get(
    "/{slug}",
    response_model=WeddingPublic,
    summary="Get public wedding details by vanity slug",
)
async def get_public_wedding(
    slug: str,
    db=Depends(get_database),
):
    """
    Public guest endpoint. Resolves wedding celebration details and public
    sub-events by the unique custom vanity slug without requiring any login.
    """
    sanitized_slug = slug.strip().lower()
    wedding = await db.weddings.find_one({
        "slug": sanitized_slug,
        "status": {"$in": ["published", "active"]},
    })

    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wedding celebration '{sanitized_slug}' not found or has not been published yet.",
        )

    wedding_id_str = str(wedding["_id"])

    # Query public sub-events
    cursor = db.events.find({
        "weddingId": wedding_id_str,
        "isPublic": True,
    }).sort("date", 1)
    event_docs = await cursor.to_list(length=50)

    events: List[SubEventResponse] = [
        SubEventResponse(
            id=str(doc["_id"]),
            title=doc.get("title", "Celebration Event"),
            date=doc.get("date"),
            startTime=doc.get("startTime"),
            endTime=doc.get("endTime"),
            location=doc.get("location"),
            dressCode=doc.get("dressCode"),
            isPublic=doc.get("isPublic", True),
        )
        for doc in event_docs
    ]

    return WeddingPublic(
        id=wedding_id_str,
        slug=wedding.get("slug", sanitized_slug),
        siteTitle=wedding.get("siteTitle", "Our Wedding"),
        coupleNames=wedding.get("coupleNames", [wedding.get("partnerOne", "Partner 1"), wedding.get("partnerTwo", "Partner 2")]),
        partnerOne=wedding.get("partnerOne", ""),
        partnerTwo=wedding.get("partnerTwo", ""),
        weddingDate=wedding.get("weddingDate"),
        welcomeStory=wedding.get("welcomeStory"),
        howWeMet=wedding.get("howWeMet"),
        venueName=wedding.get("venueName"),
        venueAddress=wedding.get("venueAddress"),
        venueCity=wedding.get("venueCity"),
        venueCountry=wedding.get("venueCountry"),
        timezone=wedding.get("timezone", "UTC"),
        coordinates=wedding.get("coordinates"),
        accommodationNotes=wedding.get("accommodationNotes"),
        transportNotes=wedding.get("transportNotes"),
        status=wedding.get("status", "published"),
        events=events,
    )

