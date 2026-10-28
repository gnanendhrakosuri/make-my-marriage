import pytest
from pydantic import ValidationError
from app.schemas.auth import LoginRequest, RegisterRequest, UserPublic, AuthData, AuthResponse


def test_register_request_valid():
    req = RegisterRequest(
        accountType="couple",
        name="Genevieve Laurent",
        partnerName="Henri de Montmirail",
        email="genevieve@luxuryweddings.fr",
        phone="+33 6 42 18 90 22",
        weddingDate="2026-09-19",
        password="CoutureCelebration2026!",
    )
    assert req.name == "Genevieve Laurent"
    assert req.accountType == "couple"
    assert req.partnerName == "Henri de Montmirail"


def test_register_request_short_password():
    with pytest.raises(ValidationError):
        RegisterRequest(
            name="Alice",
            email="alice@example.com",
            password="short",  # min_length is 8
        )


def test_login_request_valid():
    req = LoginRequest(
        email="elena.rostova@makemymarriage.com",
        password="HauteConcierge2025!",
        rememberMe=True,
    )
    assert req.email == "elena.rostova@makemymarriage.com"
    assert req.rememberMe is True


def test_auth_response_serialization():
    user = UserPublic(
        id="671e3b6a9f4c3a2b1c0d9e8f",
        name="Elena Rostova",
        email="elena.rostova@makemymarriage.com",
        role="manager",
    )
    auth_data = AuthData(user=user, token="test.token.sig")
    res = AuthResponse(
        success=True,
        message="Sign-in successful!",
        data=auth_data,
    )

    data = res.model_dump()
    assert data["success"] is True
    assert data["data"]["user"]["email"] == "elena.rostova@makemymarriage.com"
    assert data["data"]["token"] == "test.token.sig"
