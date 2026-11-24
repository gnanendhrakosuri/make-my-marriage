import io
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from httpx import ASGITransport, AsyncClient

from app.db.session import get_database
from app.main import app
from app.services.storage import ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES, R2StorageService


def test_storage_service_allowed_types():
    assert "image/jpeg" in ALLOWED_IMAGE_TYPES
    assert "image/png" in ALLOWED_IMAGE_TYPES
    assert "image/webp" in ALLOWED_IMAGE_TYPES
    assert MAX_FILE_SIZE_BYTES == 25 * 1024 * 1024


def test_storage_service_mock_mode_when_unconfigured():
    with patch("app.services.storage.settings") as mock_settings:
        mock_settings.effective_r2_endpoint = ""
        mock_settings.r2_access_key_id = ""
        mock_settings.r2_secret_access_key = ""
        mock_settings.r2_bucket_name = "test-bucket"
        mock_settings.r2_public_domain = ""

        service = R2StorageService()
        assert service.get_client() is None

        url = service.generate_presigned_url("weddings/123/albums/456/photo.jpg")
        assert "photo.jpg" in url

        dummy_file = io.BytesIO(b"fake image bytes")
        assert service.upload_file(dummy_file, "test.jpg", "image/jpeg") is True
        assert service.delete_object("test.jpg") is True


def test_storage_service_boto3_configured():
    with patch("boto3.client") as mock_boto:
        mock_client = MagicMock()
        mock_boto.return_value = mock_client
        mock_client.generate_presigned_url.return_value = "https://r2.cloudflarestorage.com/signed-url"

        service = R2StorageService()
        with patch("app.services.storage.settings") as mock_settings:
            mock_settings.effective_r2_endpoint = "https://test-account.r2.cloudflarestorage.com"
            mock_settings.r2_access_key_id = "test-key"
            mock_settings.r2_secret_access_key = "test-secret"
            mock_settings.r2_bucket_name = "test-bucket"
            mock_settings.r2_public_domain = ""

            client = service.get_client()
            assert client is not None
            mock_boto.assert_called_once()

            # Test upload
            dummy_file = io.BytesIO(b"image data")
            assert service.upload_file(dummy_file, "key.jpg", "image/jpeg") is True
            mock_client.upload_fileobj.assert_called_once()

            # Test presigned URL
            presigned = service.generate_presigned_url("key.jpg")
            assert presigned == "https://r2.cloudflarestorage.com/signed-url"

            # Test delete
            assert service.delete_object("key.jpg") is True
            mock_client.delete_object.assert_called_once()


@pytest.mark.asyncio
async def test_public_gallery_endpoint_nonexistent_wedding():
    mock_db = MagicMock()
    mock_db.weddings = MagicMock()
    mock_db.weddings.find_one = AsyncMock(return_value=None)

    app.dependency_overrides[get_database] = lambda: mock_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get("/api/v1/public/weddings/nonexistent-slug-xyz/gallery")
            assert response.status_code == 404
            assert "not found" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.pop(get_database, None)


@pytest.mark.asyncio
async def test_private_album_requires_token_authorization():
    mock_db = MagicMock()
    mock_db.weddings.find_one = AsyncMock(return_value={
        "_id": "670000000000000000000001",
        "slug": "test-couple",
        "coupleNames": ["Sarah", "Julian"],
    })
    mock_db.photoAlbums.find_one = AsyncMock(return_value={
        "_id": "67000000000000000000000b",
        "weddingId": "670000000000000000000001",
        "title": "Private Intimate Reception",
        "accessType": "authorized_guests",
    })

    app.dependency_overrides[get_database] = lambda: mock_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            # Requesting private album photos without invitation token -> 403 Forbidden
            response = await ac.get("/api/v1/public/weddings/test-couple/gallery/albums/67000000000000000000000b/photos")
            assert response.status_code == 403
            assert "private" in response.json()["detail"].lower()
    finally:
        app.dependency_overrides.pop(get_database, None)


@pytest.mark.asyncio
async def test_private_album_allowed_with_valid_token():
    import hashlib
    raw_token = "valid-secret-guest-token-12345"
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    mock_db = MagicMock()
    mock_db.weddings.find_one = AsyncMock(return_value={
        "_id": "670000000000000000000001",
        "slug": "test-couple",
        "coupleNames": ["Sarah", "Julian"],
    })
    mock_db.invitations.find_one = AsyncMock(return_value={
        "_id": "67000000000000000000000c",
        "weddingId": "670000000000000000000001",
        "tokenHash": token_hash,
        "revokedAt": None,
        "expiresAt": None,
    })
    mock_db.photoAlbums.find_one = AsyncMock(return_value={
        "_id": "67000000000000000000000b",
        "weddingId": "670000000000000000000001",
        "title": "Private Intimate Reception",
        "accessType": "authorized_guests",
    })

    mock_cursor = MagicMock()
    mock_cursor.sort.return_value = mock_cursor

    async def mock_async_iter(*args, **kwargs):
        yield {
            "_id": "67000000000000000000000f",
            "weddingId": "670000000000000000000001",
            "albumId": "67000000000000000000000b",
            "storageObjectKey": "weddings/670000000000000000000001/albums/67000000000000000000000b/test.jpg",
            "originalFileName": "test.jpg",
            "contentType": "image/jpeg",
            "sizeBytes": 1024,
            "caption": "Ceremony moment",
            "createdAt": "2025-10-24T18:00:00Z",
        }

    mock_cursor.__aiter__ = mock_async_iter
    mock_db.photos.find.return_value = mock_cursor

    app.dependency_overrides[get_database] = lambda: mock_db
    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            response = await ac.get(
                f"/api/v1/public/weddings/test-couple/gallery/albums/67000000000000000000000b/photos?token={raw_token}"
            )
            assert response.status_code == 200
            photos = response.json()
            assert len(photos) == 1
            assert photos[0]["originalFileName"] == "test.jpg"
            assert photos[0]["uploadedBy"] is None
    finally:
        app.dependency_overrides.pop(get_database, None)

