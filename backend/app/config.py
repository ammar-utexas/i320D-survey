from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration from environment variables."""

    # Database
    DATABASE_URL: str

    # GitHub OAuth
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    GITHUB_CALLBACK_URL: str

    # JWT Configuration
    JWT_SECRET: str
    JWT_EXPIRY_HOURS: int = 24
    JWT_ALGORITHM: str = "HS256"
    JWT_COOKIE_NAME: str = "surveyflow_token"

    # Frontend URL (for CORS and redirects)
    FRONTEND_URL: str

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
