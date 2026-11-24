from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


# ─── Album Schemas ─────────────────────────────────────────────────────────────

class AlbumCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120, description="Album title (e.g. Haldi Ceremony, Reception)")
    description: Optional[str] = Field(None, max_length=500, description="Optional album description")
    accessType: str = Field(default="authorized_guests", pattern="^(public|authorized_guests)$", description="Access visibility")


class AlbumUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=500)
    accessType: Optional[str] = Field(None, pattern="^(public|authorized_guests)$")


class AlbumResponse(BaseModel):
    id: str
    weddingId: str
    title: str
    description: Optional[str] = None
    accessType: str = "authorized_guests"
    photoCount: int = 0
    coverPhotoUrl: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime


# ─── Photo Schemas ─────────────────────────────────────────────────────────────

class PhotoResponse(BaseModel):
    id: str
    weddingId: str
    albumId: str
    storageObjectKey: str
    originalFileName: str
    contentType: str
    sizeBytes: int
    caption: Optional[str] = None
    url: str = Field(..., description="Secure retrieval URL or temporary pre-signed URL")
    uploadedBy: Optional[str] = None
    createdAt: datetime


class BatchPhotoUploadResponse(BaseModel):
    success: bool
    uploadedCount: int
    photos: List[PhotoResponse]
    errors: List[str] = []
