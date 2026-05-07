"""
BCI Ventures API — Router principal v1.
Agrega todos os sub-routers.
"""

from fastapi import APIRouter
from app.api.v1.startups import router as startups_router
from app.api.v1.files import router as files_router

v1_router = APIRouter()

v1_router.include_router(startups_router)
v1_router.include_router(files_router)
