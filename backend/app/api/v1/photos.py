from datetime import datetime, timezone
import io
import uuid
from typing import List, Optional
from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.v1.deps import get_current_user_doc, verify_wedding_access
from app.db.session import get_database
from app.schemas.photo import (
    AlbumCreate,
    AlbumResponse,
    AlbumUpdate,
    BatchPhotoUploadResponse,
    PhotoResponse,
)
from app.services.storage import ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES, storage_service

router = APIRouter(prefix="/weddings/{weddingId}", tags=["photos"])


# ─── Album Management ──────────────────────────────────────────────────────────

@router.post(
    "/albums",
    response_model=AlbumResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new photo album for a wedding",
)
async def create_album(
    weddingId: str,
    payload: AlbumCreate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)
    now = datetime.now(timezone.utc)

    album_doc = {
        "weddingId": str(wedding["_id"]),
        "title": payload.title.strip(),
        "description": payload.description.strip() if payload.description else None,
        "accessType": payload.accessType,
        "coverPhotoUrl": None,
        "createdBy": str(current_user["_id"]),
        "createdAt": now,
        "updatedAt": now,
    }

    result = await db.photoAlbums.insert_one(album_doc)
    album_id = str(result.inserted_id)

    return AlbumResponse(
        id=album_id,
        weddingId=album_doc["weddingId"],
        title=album_doc["title"],
        description=album_doc["description"],
        accessType=album_doc["accessType"],
        photoCount=0,
        coverPhotoUrl=None,
        createdAt=now,
        updatedAt=now,
    )


@router.get(
    "/albums",
    response_model=List[AlbumResponse],
    summary="List all photo albums for a wedding with photo counts",
)
async def list_albums(
    weddingId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)
    wid_str = str(wedding["_id"])

    cursor = db.photoAlbums.find({"weddingId": wid_str}).sort("createdAt", -1)
    albums = []

    async for doc in cursor:
        album_id_str = str(doc["_id"])
        # Count photos in this album
        photo_count = await db.photos.count_documents({"albumId": album_id_str})

        # Find cover photo if any
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

    return albums


@router.patch(
    "/albums/{albumId}",
    response_model=AlbumResponse,
    summary="Update photo album metadata",
)
async def update_album(
    weddingId: str,
    albumId: str,
    payload: AlbumUpdate,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)
    wid_str = str(wedding["_id"])

    if not ObjectId.is_valid(albumId):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")
    album = await db.photoAlbums.find_one({"_id": ObjectId(albumId), "weddingId": wid_str})

    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")

    now = datetime.now(timezone.utc)
    updates = {"updatedAt": now}
    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.description is not None:
        updates["description"] = payload.description.strip()
    if payload.accessType is not None:
        updates["accessType"] = payload.accessType

    await db.photoAlbums.update_one({"_id": album["_id"]}, {"$set": updates})
    updated = await db.photoAlbums.find_one({"_id": album["_id"]})

    photo_count = await db.photos.count_documents({"albumId": str(album["_id"])})

    cover_url = None
    cover_photo = await db.photos.find_one({"albumId": str(album["_id"])}, sort=[("createdAt", -1)])
    if cover_photo:
        cover_url = storage_service.generate_presigned_url(cover_photo["storageObjectKey"])

    return AlbumResponse(
        id=str(updated["_id"]),
        weddingId=wid_str,
        title=updated.get("title", ""),
        description=updated.get("description"),
        accessType=updated.get("accessType", "authorized_guests"),
        photoCount=photo_count,
        coverPhotoUrl=cover_url,
        createdAt=updated.get("createdAt", now),
        updatedAt=updated.get("updatedAt", now),
    )


@router.delete(
    "/albums/{albumId}",
    status_code=status.HTTP_200_OK,
    summary="Delete an album and all of its photos",
)
async def delete_album(
    weddingId: str,
    albumId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)
    wid_str = str(wedding["_id"])

    if not ObjectId.is_valid(albumId):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")
    album = await db.photoAlbums.find_one({"_id": ObjectId(albumId), "weddingId": wid_str})

    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")

    album_id_str = str(album["_id"])

    # Find and delete all photos in R2
    cursor = db.photos.find({"albumId": album_id_str})
    async for photo in cursor:
        storage_service.delete_object(photo["storageObjectKey"])

    # Remove photo metadata and album doc from MongoDB
    await db.photos.delete_many({"albumId": album_id_str})
    await db.photoAlbums.delete_one({"_id": album["_id"]})

    return {"success": True, "message": f"Album '{album.get('title')}' and its photos deleted successfully."}


# ─── Photo Upload & Management ─────────────────────────────────────────────────

@router.post(
    "/albums/{albumId}/photos",
    response_model=BatchPhotoUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload one or multiple photos to an album",
)
async def upload_photos(
    weddingId: str,
    albumId: str,
    files: List[UploadFile] = File(...),
    captions: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    """
    Validates uploaded images, streams them securely into Cloudflare R2,
    and registers their metadata and object keys in MongoDB.
    """
    wedding = await verify_wedding_access(weddingId, current_user, db)
    wid_str = str(wedding["_id"])

    # Validate that album exists
    if not ObjectId.is_valid(albumId):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")
    album = await db.photoAlbums.find_one({"_id": ObjectId(albumId), "weddingId": wid_str})

    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found.")

    album_id_str = str(album["_id"])
    now = datetime.now(timezone.utc)

    uploaded_photos: List[PhotoResponse] = []
    errors: List[str] = []

    for file in files:
        # Validate content type
        content_type = file.content_type or ""
        if content_type.lower() not in ALLOWED_IMAGE_TYPES:
            errors.append(f"File '{file.filename}': Unsupported image type '{content_type}'. Allowed: JPEG, PNG, WebP, GIF, HEIC.")
            continue

        # Read file bytes to check size
        file_bytes = await file.read()
        size_bytes = len(file_bytes)

        if size_bytes > MAX_FILE_SIZE_BYTES:
            errors.append(f"File '{file.filename}': Exceeds 25MB limit ({round(size_bytes / (1024 * 1024), 2)}MB).")
            continue

        if size_bytes == 0:
            errors.append(f"File '{file.filename}': Empty file.")
            continue

        # Generate unique storage object key: weddings/{weddingId}/albums/{albumId}/{photo_uuid}.ext
        ext = ALLOWED_IMAGE_TYPES[content_type.lower()]
        unique_photo_id = uuid.uuid4().hex
        object_key = f"weddings/{wid_str}/albums/{album_id_str}/{unique_photo_id}{ext}"

        # Upload stream to Cloudflare R2
        try:
            storage_service.upload_file(
                file_obj=io.BytesIO(file_bytes),
                object_key=object_key,
                content_type=content_type,
            )
        except Exception as e:
            errors.append(f"File '{file.filename}': Storage upload failed ({str(e)}).")
            continue

        # Save metadata to MongoDB Atlas
        photo_doc = {
            "weddingId": wid_str,
            "albumId": album_id_str,
            "storageObjectKey": object_key,
            "originalFileName": file.filename or f"photo_{unique_photo_id}{ext}",
            "contentType": content_type,
            "sizeBytes": size_bytes,
            "caption": captions,
            "uploadedBy": str(current_user["_id"]),
            "createdAt": now,
        }
        res = await db.photos.insert_one(photo_doc)
        photo_id_str = str(res.inserted_id)

        # Generate presigned access URL
        presigned_url = storage_service.generate_presigned_url(object_key)

        uploaded_photos.append(
            PhotoResponse(
                id=photo_id_str,
                weddingId=wid_str,
                albumId=album_id_str,
                storageObjectKey=object_key,
                originalFileName=photo_doc["originalFileName"],
                contentType=content_type,
                sizeBytes=size_bytes,
                caption=captions,
                url=presigned_url,
                uploadedBy=str(current_user["_id"]),
                createdAt=now,
            )
        )

    # Touch album's updatedAt timestamp
    await db.photoAlbums.update_one({"_id": album["_id"]}, {"$set": {"updatedAt": now}})

    return BatchPhotoUploadResponse(
        success=len(uploaded_photos) > 0,
        uploadedCount=len(uploaded_photos),
        photos=uploaded_photos,
        errors=errors,
    )


@router.get(
    "/albums/{albumId}/photos",
    response_model=List[PhotoResponse],
    summary="List all photos for an album with fresh retrieval URLs",
)
async def list_album_photos(
    weddingId: str,
    albumId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)
    wid_str = str(wedding["_id"])

    cursor = db.photos.find({"weddingId": wid_str, "albumId": albumId}).sort("createdAt", -1)
    photos = []

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
                uploadedBy=p.get("uploadedBy"),
                createdAt=p.get("createdAt", datetime.now(timezone.utc)),
            )
        )

    return photos


@router.delete(
    "/albums/{albumId}/photos/{photoId}",
    status_code=status.HTTP_200_OK,
    summary="Delete a single photo from Cloudflare R2 and MongoDB",
)
async def delete_photo(
    weddingId: str,
    albumId: str,
    photoId: str,
    current_user: dict = Depends(get_current_user_doc),
    db=Depends(get_database),
):
    wedding = await verify_wedding_access(weddingId, current_user, db)
    wid_str = str(wedding["_id"])

    if not ObjectId.is_valid(photoId):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found.")
    photo = await db.photos.find_one({"_id": ObjectId(photoId), "weddingId": wid_str, "albumId": albumId})

    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found.")

    # Delete from Cloudflare R2
    storage_service.delete_object(photo["storageObjectKey"])

    # Delete from MongoDB
    await db.photos.delete_one({"_id": photo["_id"]})

    return {"success": True, "message": "Photo deleted successfully."}
