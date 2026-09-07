from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Event AI Management System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "supersecretkey_change_in_production_env_var"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    DATABASE_URL: str = "sqlite+aiosqlite:///./sql_app.db" # Default fallback; override with Render Postgres URL
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
