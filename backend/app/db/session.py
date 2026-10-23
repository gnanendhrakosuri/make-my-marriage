from contextlib import asynccontextmanager
from typing import AsyncGenerator, TYPE_CHECKING

from pymongo import AsyncMongoClient

from app.core.config import settings

if TYPE_CHECKING:
    from fastapi import FastAPI

# Module-level client reference, populated during the application lifespan.
_client: AsyncMongoClient | None = None


@asynccontextmanager
async def lifespan_db(app: "FastAPI") -> AsyncGenerator[None, None]:
    """
    Async context manager that opens the PyMongo Async client connection pool
    on application startup and closes it on shutdown.

    Intended for use with FastAPI's lifespan parameter:

        app = FastAPI(lifespan=lifespan_db)
    """
    global _client
    _client = AsyncMongoClient(settings.mongodb_uri)
    try:
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
