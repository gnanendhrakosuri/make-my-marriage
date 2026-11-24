import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

from app.db.session import get_database
from app.schemas.photo import AlbumResponse, PhotoResponse
from app.services.storage import storage_service

router = APIRouter(prefix="/public/weddings/{slug}/gallery", tags=["public-gallery"])


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


async def check_guest_authorization(
    slug: str,
    raw_token: Optional[str],
    db,
) -> tuple[dict, bool]:
    """
    Resolves the wedding by slug and checks whether the provided invitation token
    grants authorized guest access to private albums.
    Returns (wedding_doc, is_authorized).
    """
    wedding = await db.weddings.find_one({"slug": slug.strip().lower()})
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wedding with slug '{slug}' not found.",
        )

    wid_str = str(wedding["_id"])
    if not raw_token:
        return wedding, False

    token_hash = hash_token(raw_token.strip())
    invitation = await db.invitations.find_one({
        "tokenHash": token_hash,
        "weddingId": wid_str,
        "revokedAt": None,
    })

    if not invitation:
        return wedding, False

    # Check expiration if applicable
    expires_at = invitation.get("expiresAt")
    if expires_at and expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return wedding, False

    return wedding, True


@router.get(
    "",
    summary="Retrieve wedding gallery albums with token-based access enforcement",
)
async def get_public_gallery(
    slug: str,
    token: Optional[str] = Query(None, description="Optional guest invitation token"),
    x_invitation_token: Optional[str] = Header(None, alias="X-Invitation-Token"),
    db=Depends(get_database),
):
    raw_token = token or x_invitation_token
    wedding, is_authorized = await check_guest_authorization(slug, raw_token, db)
    wid_str = str(wedding["_id"])

    # Query albums: if authorized guest, can see all albums; otherwise only public albums
    album_query = {"weddingId": wid_str}
    if not is_authorized:
        album_query["accessType"] = "public"

    cursor = db.photoAlbums.find(album_query).sort("createdAt", -1)
    albums: List[AlbumResponse] = []

    async for doc in cursor:
        album_id_str = str(doc["_id"])
        photo_count = await db.photos.count_documents({"albumId": album_id_str})

        cover_url = None
        cover_photo = await db.photos.find_one({"albumId": album_id_str}, sort=[("createdAt", -1)])
        if cover_photo:
            cover_url = storage_service.generate_presigned_url(cover_photo["storageObjectKey"])

        albums.append(
            AlbumResponse(
                id=album_id_str,
                weddingId=wid_str,
                title=doc.get("title", "Untitled Album"),
                description=doc.get("description"),
                accessType=doc.get("accessType", "authorized_guests"),
                photoCount=photo_count,
                coverPhotoUrl=cover_url,
                createdAt=doc.get("createdAt", datetime.now(timezone.utc)),
                updatedAt=doc.get("updatedAt", datetime.now(timezone.utc)),
            )
        )

    # Check if there are private albums that require an invitation token to view
    has_private_albums = await db.photoAlbums.count_documents({
        "weddingId": wid_str,
        "accessType": "authorized_guests",
    }) > 0

    return {
        "wedding": {
            "id": wid_str,
            "slug": wedding.get("slug"),
            "coupleNames": wedding.get("coupleNames", []),
            "siteTitle": wedding.get("siteTitle"),
            "weddingDate": wedding.get("weddingDate"),
        },
        "isAuthorizedGuest": is_authorized,
        "hasPrivateAlbums": has_private_albums,
        "albums": albums,
    }


@router.get(
    "/albums/{albumId}/photos",
    response_model=List[PhotoResponse],
    summary="Retrieve photos for a specific gallery album",
)
async def get_gallery_album_photos(
    slug: str,
    albumId: str,
    token: Optional[str] = Query(None, description="Optional guest invitation token"),
    x_invitation_token: Optional[str] = Header(None, alias="X-Invitation-Token"),
    db=Depends(get_database),
):
    raw_token = token or x_invitation_token
    wedding, is_authorized = await check_guest_authorization(slug, raw_token, db)
    wid_str = str(wedding["_id"])

    if not ObjectId.is_valid(albumId):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery album not found in this wedding.",
        )
    album = await db.photoAlbums.find_one({"_id": ObjectId(albumId), "weddingId": wid_str})

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gallery album not found in this wedding.",
        )

    # If album is private, guest authorization is strictly required
    if album.get("accessType") == "authorized_guests" and not is_authorized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This photo album is private. Please use the personalized invitation link sent to your email to view it.",
        )

    cursor = db.photos.find({"weddingId": wid_str, "albumId": str(album["_id"])}).sort("createdAt", -1)
    photos: List[PhotoResponse] = []

    async for p in cursor:
        url = storage_service.generate_presigned_url(p["storageObjectKey"])
        photos.append(
            PhotoResponse(
                id=str(p["_id"]),
                weddingId=wid_str,
                albumId=p["albumId"],
                storageObjectKey=p["storageObjectKey"],
                originalFileName=p.get("originalFileName", "photo.jpg"),
                contentType=p.get("contentType", "image/jpeg"),
                sizeBytes=p.get("sizeBytes", 0),
                caption=p.get("caption"),
                url=url,
                uploadedBy=None,  # Do not leak uploader user ID to guests
                createdAt=p.get("createdAt", datetime.now(timezone.utc)),
            )
        )

    return photos
