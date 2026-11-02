import pytest
from pydantic import ValidationError
from app.schemas.password_reset import PasswordResetRequest, PasswordResetConfirm


def test_password_reset_request_validation():
    req = PasswordResetRequest(email="valid.user@example.com")
    assert req.email == "valid.user@example.com"

    with pytest.raises(ValidationError):
        PasswordResetRequest(email="a")


def test_password_reset_confirm_validation():
    req = PasswordResetConfirm(token="valid_random_token_12345", newPassword="ValidNewPassword#2026")
    assert req.token == "valid_random_token_12345"
    assert req.newPassword == "ValidNewPassword#2026"

    # Too short password
    with pytest.raises(ValidationError):
        PasswordResetConfirm(token="valid_random_token_12345", newPassword="short")

    # Too short token
    with pytest.raises(ValidationError):
        PasswordResetConfirm(token="short", newPassword="ValidNewPassword#2026")
