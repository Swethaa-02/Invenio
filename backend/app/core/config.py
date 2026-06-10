from typing import Any, Dict, Optional
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Innovation Discovery Engine"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super_secret_startup_key_change_me_in_production_99881122"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "postgres"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    GEMINI_API_KEY: Optional[str] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Optional[str], info: Any) -> Any:
        if isinstance(v, str) and v:
            return v
        
        # Fallback to local sqlite for instant testing/typechecks
        server = info.data.get("POSTGRES_SERVER")
        user = info.data.get("POSTGRES_USER")
        password = info.data.get("POSTGRES_PASSWORD")
        db_name = info.data.get("POSTGRES_DB")
        
        if not all([server, user, password, db_name]) or server == "localhost" and db_name == "postgres":
            # Return sqlite fallback
            return "sqlite+aiosqlite:///./sql_app.db"
            
        return f"postgresql+asyncpg://{user}:{password}@{server}/{db_name}"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
