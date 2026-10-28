import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timezone
from typing import Optional

from app.core.config import settings

# OWASP Recommended PBKDF2 Iterations for SHA-256
PBKDF2_ITERATIONS = 600_000


def get_password_hash(password: str) -> str:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with a cryptographically secure random salt.
    Format: pbkdf2:sha256:<iterations>$<salt_hex>$<hash_hex>
    """
    salt = os.urandom(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return f"pbkdf2:sha256:{PBKDF2_ITERATIONS}${salt.hex()}${derived_key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against an encoded PBKDF2 hash using constant-time comparison.
    """
    try:
        algorithm_spec, salt_hex, stored_hash_hex = hashed_password.split("$")
        parts = algorithm_spec.split(":")
        if len(parts) != 3 or parts[0] != "pbkdf2" or parts[1] != "sha256":
            return False

        iterations = int(parts[2])
        salt = bytes.fromhex(salt_hex)
        stored_hash = bytes.fromhex(stored_hash_hex)

        computed_hash = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt,
            iterations,
        )
        return hmac.compare_digest(stored_hash, computed_hash)
    except Exception:
        return False


def create_session_token(user_id: str) -> str:
    """
    Create a signed session token: <user_id>.<timestamp>.<signature>
    """
    timestamp = str(int(datetime.now(timezone.utc).timestamp()))
    payload = f"{user_id}.{timestamp}"
    signature = hmac.new(
        settings.secret_key.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return f"{payload}.{signature}"


def verify_session_token(token: str, max_age_seconds: int = 86400 * 30) -> Optional[str]:
    """
    Verify signature and age of a session token. Returns user_id if valid, else None.
    Default max_age: 30 days.
    """
    try:
        user_id, timestamp_str, signature = token.split(".")
        payload = f"{user_id}.{timestamp_str}"
        expected_sig = hmac.new(
            settings.secret_key.encode("utf-8"),
            payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_sig):
            return None

        created_at = int(timestamp_str)
        current_time = int(datetime.now(timezone.utc).timestamp())
        if current_time - created_at > max_age_seconds or current_time < created_at:
            return None

        return user_id
    except Exception:
        return None
