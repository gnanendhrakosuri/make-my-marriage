from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class GuestCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full name of the guest")
    email: str = Field(
        ...,
        pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        description="Valid recipient email address for invitations",
    )
    phone: Optional[str] = Field(None, max_length=30, description="Optional phone number")
    role: str = Field(default="guest", pattern="^(guest|manager|admin)$", description="Role: guest, manager, or admin")


class GuestUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=30)
    role: Optional[str] = Field(None, pattern="^(guest|manager|admin)$")


class GuestResponse(BaseModel):
    id: str
    weddingId: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "guest"
    invitationStatus: str = "pending"
    rsvpStatus: Optional[str] = None
    lastRemindedAt: Optional[datetime] = None
    reminderCount: int = 0
    createdAt: datetime
    updatedAt: datetime


