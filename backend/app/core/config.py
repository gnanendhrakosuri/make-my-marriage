from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or a .env file.
    All fields are validated at startup; a missing required field will raise
    a clear error before the server accepts any requests.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # MongoDB Atlas
    mongodb_uri: str
    database_name: str

    # Security
    secret_key: str
    cookie_secure: bool = False

    # CORS — comma-separated list of allowed origins
    cors_origins: str = "http://localhost:3000"

    # Email Service (Resend)
    resend_api_key: str = ""
    email_from: str = "Make My Marriage <onboarding@resend.dev>"
    frontend_url: str = "http://localhost:3000"

    # Cloudflare R2 Media Storage
    r2_account_id: str = ""
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_bucket_name: str = "make-my-marriage-media"
    r2_endpoint_url: str = ""
    r2_public_domain: str = ""

    @property
    def effective_r2_endpoint(self) -> str:
        """Construct the standard Cloudflare R2 S3 API endpoint if not explicitly provided."""
        if self.r2_endpoint_url:
            return self.r2_endpoint_url
        if self.r2_account_id:
            return f"https://{self.r2_account_id}.r2.cloudflarestorage.com"
        return ""

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a list, trimming whitespace."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
