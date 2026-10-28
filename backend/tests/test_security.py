import time
from app.core.security import (
    create_session_token,
    get_password_hash,
    verify_password,
    verify_session_token,
)


def test_password_hash_and_verify():
    password = "CoutureWedding2025!"
    hashed = get_password_hash(password)

    assert hashed.startswith("pbkdf2:sha256:")
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False
    assert verify_password("", hashed) is False


def test_password_verify_invalid_hash_format():
    assert verify_password("password", "invalid_hash_string") is False
    assert verify_password("password", "pbkdf2:sha256$missing$fields") is False


def test_session_token_create_and_verify():
    user_id = "671e3b6a9f4c3a2b1c0d9e8f"
    token = create_session_token(user_id)

    assert isinstance(token, str)
    parts = token.split(".")
    assert len(parts) == 3
    assert parts[0] == user_id

    verified_id = verify_session_token(token)
    assert verified_id == user_id


def test_session_token_tampered():
    user_id = "671e3b6a9f4c3a2b1c0d9e8f"
    token = create_session_token(user_id)

    # Tamper payload
    tampered = f"evil_id.{token.split('.')[1]}.{token.split('.')[2]}"
    assert verify_session_token(tampered) is None

    # Tamper signature
    tampered_sig = f"{token[:-4]}ffff"
    assert verify_session_token(tampered_sig) is None


def test_session_token_expired():
    user_id = "671e3b6a9f4c3a2b1c0d9e8f"
    token = create_session_token(user_id)

    # Set max_age_seconds to -1 to simulate expiration
    assert verify_session_token(token, max_age_seconds=-1) is None
