from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://mtb:mtb_pass@localhost:5432/mtb_tracker"
    app_name: str = "MTB Setup Tracker"
    debug: bool = False

    model_config = {"env_prefix": "MTB_"}


settings = Settings()
