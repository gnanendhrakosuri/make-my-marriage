from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class SubEventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120, description="Event name, e.g. Sangeet, Ceremony, Reception")
    date: Optional[str] = Field(None, description="Event date string (YYYY-MM-DD)")
    startTime: Optional[str] = Field(None, description="Start time (e.g. 10:00 AM or 18:00)")
    endTime: Optional[str] = Field(None, description="End time")
    location: Optional[str] = Field(None, max_length=200, description="Event sub-venue or hall")
    dressCode: Optional[str] = Field(None, max_length=100, description="Dress code, e.g. Haute Traditional, Black Tie")
    isPublic: bool = Field(default=True, description="Whether event is publicly visible")


class SubEventResponse(BaseModel):
    id: str
    title: str
    date: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    location: Optional[str] = None
    dressCode: Optional[str] = None
    isPublic: bool = True


class WeddingCreate(BaseModel):
    siteTitle: str = Field(..., min_length=1, max_length=150, description="Wedding website title")
    partnerOne: str = Field(..., min_length=1, max_length=100, description="Full name of Partner One")
    partnerTwo: str = Field(..., min_length=1, max_length=100, description="Full name of Partner Two")
    weddingDate: Optional[str] = Field(None, description="Primary celebration date (YYYY-MM-DD)")
    welcomeStory: Optional[str] = Field(None, max_length=1500, description="Welcome address or story")
    urlSlug: str = Field(..., min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$", description="Sanitized vanity URL slug")
    partnerOneRole: Optional[str] = Field(None, max_length=50)
    partnerOneEmail: Optional[str] = Field(None, max_length=120)
    partnerOneBio: Optional[str] = Field(None, max_length=1000)
    partnerTwoRole: Optional[str] = Field(None, max_length=50)
    partnerTwoEmail: Optional[str] = Field(None, max_length=120)
    partnerTwoBio: Optional[str] = Field(None, max_length=1000)
    howWeMet: Optional[str] = Field(None, max_length=2000)
    venueName: Optional[str] = Field(None, max_length=150)
    venueAddress: Optional[str] = Field(None, max_length=250)
    venueCity: Optional[str] = Field(None, max_length=100)
    venueCountry: Optional[str] = Field(None, max_length=100)
    timezone: Optional[str] = Field(default="UTC", max_length=50)
    coordinates: Optional[str] = Field(None, max_length=100)
    accommodationNotes: Optional[str] = Field(None, max_length=1000)
    transportNotes: Optional[str] = Field(None, max_length=1000)
    events: List[SubEventCreate] = Field(default_factory=list)


class WeddingUpdate(BaseModel):
    siteTitle: Optional[str] = Field(None, min_length=1, max_length=150)
    partnerOne: Optional[str] = Field(None, min_length=1, max_length=100)
    partnerTwo: Optional[str] = Field(None, min_length=1, max_length=100)
    weddingDate: Optional[str] = None
    welcomeStory: Optional[str] = None
    venueName: Optional[str] = None
    venueAddress: Optional[str] = None
    venueCity: Optional[str] = None
    venueCountry: Optional[str] = None
    timezone: Optional[str] = None
    coordinates: Optional[str] = None
    accommodationNotes: Optional[str] = None
    transportNotes: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(draft|active|published|archived)$")


class WeddingResponse(BaseModel):
    id: str
    slug: str
    siteTitle: str
    coupleNames: List[str]
    partnerOne: str
    partnerTwo: str
    weddingDate: Optional[str] = None
    welcomeStory: Optional[str] = None
    venueName: Optional[str] = None
    venueAddress: Optional[str] = None
    venueCity: Optional[str] = None
    venueCountry: Optional[str] = None
    timezone: str = "UTC"
    coordinates: Optional[str] = None
    accommodationNotes: Optional[str] = None
    transportNotes: Optional[str] = None
    status: str = "published"
    managerIds: List[str] = Field(default_factory=list)
    events: List[SubEventResponse] = Field(default_factory=list)
    createdAt: datetime
    updatedAt: datetime


class WeddingPublic(BaseModel):
    id: str
    slug: str
    siteTitle: str
    coupleNames: List[str]
    partnerOne: str
    partnerTwo: str
    weddingDate: Optional[str] = None
    welcomeStory: Optional[str] = None
    howWeMet: Optional[str] = None
    venueName: Optional[str] = None
    venueAddress: Optional[str] = None
    venueCity: Optional[str] = None
    venueCountry: Optional[str] = None
    timezone: str = "UTC"
    coordinates: Optional[str] = None
    accommodationNotes: Optional[str] = None
    transportNotes: Optional[str] = None
    status: str = "published"
    events: List[SubEventResponse] = Field(default_factory=list)

