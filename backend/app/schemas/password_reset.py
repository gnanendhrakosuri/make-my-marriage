from pydantic import BaseModel, Field


class PasswordResetRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=150, description="User email for recovery")


class PasswordResetConfirm(BaseModel):
    token: str = Field(..., min_length=10, description="Cryptographic recovery token")
    newPassword: str = Field(..., min_length=8, max_length=128, description="New account password (min 8 characters)")


class PasswordResetResponse(BaseModel):
    success: bool = True
    message: str
