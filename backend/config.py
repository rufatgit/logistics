import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    """Central app configuration reading directly from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App Settings
    APP_NAME: str = os.getenv("APP_NAME", "Digital Freight Marketplace API")
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # Database — PostgreSQL default matching developer project style
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/logistics_db",
    )

    # Auth / JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_dev_only_insecure_secret_key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]


settings = Settings()
