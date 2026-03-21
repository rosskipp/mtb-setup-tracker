from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://mtb:mtb_dev@localhost:5432/mtb_tracker"
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = {"env_prefix": "MTB_"}


settings = Settings()
