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

    # CORS — comma-separated list of allowed origins
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a list, trimming whitespace."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
