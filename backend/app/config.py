from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./mtb_tracker.db"
    app_name: str = "MTB Setup Tracker"

    class Config:
        env_file = ".env"


settings = Settings()
