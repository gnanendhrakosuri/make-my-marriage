from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    accountType: str = Field(default="couple", description="'couple' or 'planner'")
    name: str = Field(..., min_length=1, max_length=100)
    partnerName: Optional[str] = Field(default=None, max_length=100)
    email: str = Field(..., min_length=3, max_length=150)
    phone: Optional[str] = Field(default=None, max_length=30)
    weddingDate: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=1)
    role: Optional[str] = Field(default=None, description="'manager' or 'admin'")
    rememberMe: Optional[bool] = False


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    role: str
    partnerName: Optional[str] = None
    phone: Optional[str] = None
    weddingDate: Optional[str] = None
    weddingId: Optional[str] = None


class AuthData(BaseModel):
    user: UserPublic
    token: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool = True
    message: str
    data: AuthData
