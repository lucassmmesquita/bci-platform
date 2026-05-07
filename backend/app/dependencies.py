"""
BCI Ventures API — Dependency injection.
"""

from __future__ import annotations

from typing import Generator

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.ftp_service import FTPService
from app.config import settings


def get_db() -> Generator:
    """Fornece uma sessão do banco de dados por request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_ftp_service() -> FTPService:
    """Fornece instância do serviço FTP."""
    return FTPService(
        host=settings.FTP_HOST,
        port=settings.FTP_PORT,
        user=settings.FTP_USER,
        password=settings.FTP_PASSWORD,
        base_path=settings.FTP_BASE_PATH,
    )
