"""
BCI Ventures API — FastAPI Application Factory.
"""

from __future__ import annotations

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import v1_router

# ── Logging ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Cria e configura a aplicação FastAPI."""

    app = FastAPI(
        title=settings.APP_NAME,
        description=(
            "API da plataforma BCI Ventures — consulta startups cadastradas "
            "no banco de dados e arquivos no FTP."
        ),
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )

    # ── CORS ─────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ──────────────────────────────────────────
    app.include_router(v1_router, prefix="/api/v1")

    # ── Health Check ─────────────────────────────────────
    @app.get("/health", tags=["System"])
    def health_check():
        """Endpoint de health check."""
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": "1.0.0",
            "debug": settings.DEBUG,
        }

    # ── DB Connection Test (via PHP Bridge) ──────────────
    @app.get("/health/db", tags=["System"])
    def db_health():
        """Testa a conexão com o banco de dados via PHP Bridge."""
        from app.services.bridge_service import PHPBridgeService
        try:
            bridge = PHPBridgeService(base_url=settings.PHP_BRIDGE_URL)
            result = bridge.health()
            return result
        except Exception as e:
            return {"status": "error", "detail": str(e)}

    # ── FTP Connection Test ──────────────────────────────
    @app.get("/health/ftp", tags=["System"])
    def ftp_health():
        """Testa a conexão com o servidor FTP."""
        from app.services.ftp_service import FTPService
        try:
            ftp_service = FTPService(
                host=settings.FTP_HOST,
                port=settings.FTP_PORT,
                user=settings.FTP_USER,
                password=settings.FTP_PASSWORD,
                base_path=settings.FTP_BASE_PATH,
            )
            files = ftp_service.list_files()
            return {
                "status": "connected",
                "host": settings.FTP_HOST,
                "base_path": settings.FTP_BASE_PATH,
                "files_count": len(files),
            }
        except Exception as e:
            return {"status": "error", "detail": str(e)}

    # ── Startup Event ────────────────────────────────────
    @app.on_event("startup")
    def on_startup():
        logger.info(f"🚀 {settings.APP_NAME} iniciando...")
        logger.info(f"📊 PHP Bridge: {settings.PHP_BRIDGE_URL}")
        logger.info(f"📁 FTP: {settings.FTP_HOST}:{settings.FTP_PORT}{settings.FTP_BASE_PATH}")
        logger.info(f"🌐 CORS: {settings.CORS_ORIGINS}")
        logger.info(f"📖 Swagger: http://localhost:8000/api/docs")

    return app


# Instância da aplicação (usado pelo uvicorn)
app = create_app()
