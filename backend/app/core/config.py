from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Agentic Smart Event Management"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/event_db"
    OPENAI_API_KEY: str = ""
    JWT_SECRET: str = "replace-with-secure-token-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
