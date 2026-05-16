from pydantic_settings import BaseSettings


class Parametres(BaseSettings):
    database_url: str = "postgresql://stock:stock@postgres:5432/stock_db"
    secret_jwt: str = "change-me-local-only"
    algorithme_jwt: str = "HS256"
    duree_token_minutes: int = 480
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"
    aws_endpoint_url: str | None = None
    aws_access_key_id: str = "test"
    aws_secret_access_key: str = "test"
    aws_default_region: str = "eu-west-1"
    s3_bucket_exports: str = "pfa-stock-exports"

    class Config:
        env_file = ".env"


parametres = Parametres()
