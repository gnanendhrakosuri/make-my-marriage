import io
import logging
from typing import BinaryIO, Optional
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError

from app.core.config import settings

logger = logging.getLogger("app.storage")

# Standard allowed image MIME types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
}

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB max per photo


class R2StorageService:
    """
    Cloudflare R2 Object Storage integration via AWS S3-compatible Boto3 client.
    Handles secure upload, pre-signed URL generation, and object deletion.
    """

    def __init__(self):
        self._client = None

    def get_client(self):
        """Lazy-initialize and return the boto3 S3 client for Cloudflare R2."""
        if self._client is not None:
            return self._client

        endpoint = settings.effective_r2_endpoint
        if not endpoint or not settings.r2_access_key_id or not settings.r2_secret_access_key:
            logger.warning("Cloudflare R2 credentials are incomplete. Storage operations will run in fallback/mock mode.")
            return None

        self._client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            config=Config(
                signature_version="s3v4",
                s3={"addressing_style": "virtual"},
                retries={"max_attempts": 3, "mode": "standard"},
            ),
            region_name="auto",
        )
        return self._client

    def upload_file(
        self,
        file_obj: BinaryIO,
        object_key: str,
        content_type: str,
        bucket_name: Optional[str] = None,
    ) -> bool:
        """
        Uploads an image file stream directly into Cloudflare R2.
        """
        client = self.get_client()
        bucket = bucket_name or settings.r2_bucket_name

        if client is None:
            logger.info("Mock R2 upload succeeded for key: %s", object_key)
            return True

        try:
            client.upload_fileobj(
                file_obj,
                bucket,
                object_key,
                ExtraArgs={
                    "ContentType": content_type,
                    "CacheControl": "public, max-age=31536000, immutable",
                },
            )
            return True
        except ClientError as e:
            logger.error("Failed to upload object '%s' to R2: %s", object_key, e)
            raise e

    def generate_presigned_url(
        self,
        object_key: str,
        expires_in: int = 3600,  # 1 hour
        bucket_name: Optional[str] = None,
    ) -> str:
        """
        Generates a secure, temporary pre-signed GET URL for viewing/downloading private photos.
        If a public domain is configured, returns the permanent public CDN URL instead.
        """
        if settings.r2_public_domain:
            domain = settings.r2_public_domain.rstrip("/")
            return f"{domain}/{object_key}"

        client = self.get_client()
        bucket = bucket_name or settings.r2_bucket_name

        if client is None:
            # Fallback for dev mode when credentials are not yet configured
            return f"https://mock-r2.makemymarriage.com/{bucket}/{object_key}"

        try:
            url = client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": bucket, "Key": object_key},
                ExpiresIn=expires_in,
            )
            return url
        except ClientError as e:
            logger.error("Failed to generate presigned URL for key '%s': %s", object_key, e)
            return f"https://fallback-storage/{object_key}"

    def delete_object(
        self,
        object_key: str,
        bucket_name: Optional[str] = None,
    ) -> bool:
        """
        Deletes a photo object from Cloudflare R2.
        """
        client = self.get_client()
        bucket = bucket_name or settings.r2_bucket_name

        if client is None:
            logger.info("Mock R2 delete succeeded for key: %s", object_key)
            return True

        try:
            client.delete_object(Bucket=bucket, Key=object_key)
            return True
        except ClientError as e:
            logger.error("Failed to delete object '%s' from R2: %s", object_key, e)
            return False


storage_service = R2StorageService()
