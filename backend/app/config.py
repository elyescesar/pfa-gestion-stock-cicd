from pydantic_settings import BaseSettings


class Parametres(BaseSettings):
    database_url: str = "postgresql://stock:stock@postgres:5432/stock_db"
    secret_jwt: str = "change-me-local-only"
    algorithme_jwt: str = "HS256"
    duree_token_minutes: int = 480
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"

    class Config:
        env_file = ".env"


parametres = Parametres()
