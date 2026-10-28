from contextlib import asynccontextmanager
from typing import AsyncGenerator, TYPE_CHECKING

from pymongo import AsyncMongoClient

from app.core.config import settings

if TYPE_CHECKING:
    from fastapi import FastAPI

from datetime import datetime, timezone

# Module-level client reference, populated during the application lifespan.
_client: AsyncMongoClient | None = None


async def init_db(client: AsyncMongoClient) -> None:
    """Ensure indexes and initial seed data exist."""
    db = client[settings.database_name]
    await db.users.create_index("email", unique=True)

    import os
    env = os.getenv("ENVIRONMENT", "development").lower()
    seed_demo = os.getenv("SEED_DEMO_USERS", "true" if env != "production" else "false").lower() == "true"
    if not seed_demo:
        return

    from app.core.security import get_password_hash
    now = datetime.now(timezone.utc)

    manager_pwd = os.getenv("SEED_MANAGER_PASSWORD", "HauteConcierge2025!")
    admin_pwd = os.getenv("SEED_ADMIN_PASSWORD", "SuperSecretPrivilege#99")

    # Seed Elena (Lead Concierge Manager)
    elena = await db.users.find_one({"email": "elena.rostova@makemymarriage.com"})
    if not elena:
        await db.users.insert_one({
            "name": "Elena Rostova",
            "email": "elena.rostova@makemymarriage.com",
            "passwordHash": get_password_hash(manager_pwd),
            "role": "manager",
            "partnerName": None,
            "phone": "+33 6 42 18 90 22",
            "weddingDate": None,
            "weddingId": None,
            "status": "active",
            "createdAt": now,
            "updatedAt": now,
            "lastLoginAt": None,
        })

    # Seed Platform Super Admin
    admin = await db.users.find_one({"email": "admin.atelier@makemymarriage.com"})
    if not admin:
        await db.users.insert_one({
            "name": "Platform Super Admin",
            "email": "admin.atelier@makemymarriage.com",
            "passwordHash": get_password_hash(admin_pwd),
            "role": "admin",
            "partnerName": None,
            "phone": None,
            "weddingDate": None,
            "weddingId": None,
            "status": "active",
            "createdAt": now,
            "updatedAt": now,
            "lastLoginAt": None,
        })


@asynccontextmanager
async def lifespan_db(app: "FastAPI") -> AsyncGenerator[None, None]:
    """
    Async context manager that opens the PyMongo Async client connection pool
    on application startup and closes it on shutdown.
    """
    global _client
    _client = AsyncMongoClient(settings.mongodb_uri)
    try:
        await init_db(_client)
        yield
    finally:
        await _client.close()
        _client = None


def get_database():
    """
    Return the active async database handle.
    Call this inside FastAPI dependency functions to obtain a database reference.

    AsyncMongoClient.__getitem__ is synchronous; the returned database object
    exposes async collection methods.

    Raises RuntimeError if called before the lifespan context has started.
    """
    if _client is None:
        raise RuntimeError(
            "Database client is not initialised. "
            "Ensure the application lifespan context is active."
        )
    return _client[settings.database_name]
