"""
BCI Ventures API — Endpoints de Arquivos FTP.
GET /files, GET /files/{filename}
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.dependencies import get_ftp_service
from app.services.ftp_service import FTPService
from app.schemas.startup import FTPFileListResponse
from app.config import settings

router = APIRouter(prefix="/files", tags=["Arquivos FTP"])


# Mapeamento de extensões para MIME types
MIME_TYPES = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".csv": "text/csv",
    ".txt": "text/plain",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}


@router.get("", response_model=FTPFileListResponse)
def list_files(
    ftp_service: FTPService = Depends(get_ftp_service),
):
    """
    Lista todos os arquivos no diretório de uploads do FTP.

    Retorna nome, tamanho e data de modificação de cada arquivo.
    """
    try:
        files = ftp_service.list_files()
        return FTPFileListResponse(
            files=files,
            total=len(files),
            base_path=settings.FTP_BASE_PATH,
        )
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/{filename}")
def download_file(
    filename: str,
    ftp_service: FTPService = Depends(get_ftp_service),
):
    """
    Faz download de um arquivo específico do FTP.

    O arquivo é transmitido diretamente ao cliente via streaming (proxy).
    """
    try:
        buffer, size = ftp_service.get_file(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Arquivo '{filename}' não encontrado")
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Determinar MIME type
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    media_type = MIME_TYPES.get(ext, "application/octet-stream")

    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(size),
        },
    )


@router.get("/{filename}/exists")
def check_file_exists(
    filename: str,
    ftp_service: FTPService = Depends(get_ftp_service),
):
    """Verifica se um arquivo existe no FTP."""
    try:
        exists = ftp_service.check_file_exists(filename)
        return {"filename": filename, "exists": exists}
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
