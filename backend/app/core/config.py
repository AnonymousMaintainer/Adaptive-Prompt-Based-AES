import os
from typing import Annotated, Any

from pydantic import (
    AnyUrl,
    BeforeValidator,
    HttpUrl,
    computed_field,
)
from pydantic_settings import BaseSettings, SettingsConfigDict

def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith('['):
        return [i.strip() for i in v.split(',')]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file='.env',
        env_ignore_empty=True,
        extra='ignore',
    )
    API_V1_STR: str = '/api/v1'

    # CORE
    # 60 minutes * 2 hours
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 2
    ALGORITHM: str = 'HS256'
    SECRET_KEY: str

    FRONTEND_HOST: str
    BACKEND_CORS_ORIGINS: Annotated[list[AnyUrl] | str, BeforeValidator(parse_cors)] = []

    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip('/') for origin in self.BACKEND_CORS_ORIGINS] + [self.FRONTEND_HOST.rstrip('/')]

    # POSTGRESQL
    SENTRY_DSN: HttpUrl | None = None
    POSTGRESQL_USERNAME: str
    POSTGRESQL_PASSWORD: str
    POSTGRESQL_HOST: str
    POSTGRES_PORT: int = 5432
    POSTGRESQL_DATABASE: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def POSTGRESQL_DATABASE_URI(self) -> str:
        return f'postgresql://{self.POSTGRESQL_USERNAME}:{self.POSTGRESQL_PASSWORD}@{self.POSTGRESQL_HOST}/{self.POSTGRESQL_DATABASE}'

    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "culi-dev-s3"
    S3_EXAM_PREFIX: str = "exams"
    S3_URL_EXPIRATION: int = 3600  # 1 hour in seconds

    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MAX_RETRIES: int = 3
    OPENAI_RETRY_DELAY: int = 180  # 3 minutes
    OCR_MODEL_NAME: str = 'gpt-4o-mini'
    AI_MODEL_NAME: str = 'gpt-4o'
    RANDOM_STATE: int = 42

    # Email Configuration
    EMAIL_HOST: str
    EMAIL_PORT: str
    EMAIL_USER: str
    EMAIL_PASS: str
    
settings = Settings()  # type: ignore