from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class InvitationCreateRequest(BaseModel):
    guestId: str = Field(..., description="The unique guest identifier")


class InvitationResponseData(BaseModel):
    invitationId: str
    guestId: str
    status: str
    sentAt: Optional[datetime] = None


class InvitationResponse(BaseModel):
    success: bool = True
    message: str
    data: InvitationResponseData


class InvitationItem(BaseModel):
    id: str
    weddingId: str
    guestId: str
    guestName: Optional[str] = None
    guestEmail: Optional[str] = None
    status: str
    sentAt: Optional[datetime] = None
    expiresAt: Optional[datetime] = None
    revokedAt: Optional[datetime] = None
    createdAt: datetime


class ReminderRequest(BaseModel):
    guestIds: List[str] = Field(..., min_length=1, description="List of guest IDs to send reminders to")
    type: str = Field("rsvp_reminder", description="Reminder type: rsvp_reminder, event_reminder, etc.")
    eventName: Optional[str] = Field(None, max_length=150, description="Optional specific event name (e.g. Sangeet, Mehendi, Reception)")
    message: Optional[str] = Field(None, max_length=500, description="Optional custom reminder message")



class ReminderResponseData(BaseModel):
    requestedCount: int
    sentCount: int
    status: str


class ReminderResponse(BaseModel):
    success: bool = True
    message: str
    data: ReminderResponseData
