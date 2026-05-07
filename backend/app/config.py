"""
BCI Ventures API — Configuração da aplicação.
Lê variáveis de ambiente do arquivo .env.
"""

from __future__ import annotations

import json
from typing import List

from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """Configurações da aplicação carregadas do .env"""

    # ── App ──────────────────────────────────────────────
    APP_NAME: str = "BCI Ventures API"
    DEBUG: bool = False
    API_VERSION: str = "v1"

    # ── Database (MySQL) ─────────────────────────────────
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "bci_formulario"
    DB_USER: str = "bci"
    DB_PASSWORD: str = ""

    # ── FTP ───────────────────────────────────────────────
    FTP_HOST: str = "localhost"
    FTP_PORT: int = 21
    FTP_USER: str = ""
    FTP_PASSWORD: str = ""
    FTP_BASE_PATH: str = "/public_html/uploads"

    # ── PHP Bridge (acesso ao MySQL via PHP no servidor) ──
    PHP_BRIDGE_URL: str = "https://bciventures.com.br/api_bridge.php"

    # ── CORS ──────────────────────────────────────────────
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://bciventures.com.br",
        "https://www.bciventures.com.br",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def database_url(self) -> str:
        """URL de conexão MySQL usando PyMySQL."""
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
            f"?charset=utf8mb4"
        )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
