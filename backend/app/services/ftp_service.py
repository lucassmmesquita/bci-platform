"""
BCI Ventures — Serviço FTP.
Conexão e listagem de arquivos no servidor FTP.
"""

from __future__ import annotations

import ftplib
import io
import logging
from typing import BinaryIO, List, Tuple

from app.schemas.startup import FTPFileInfo

logger = logging.getLogger(__name__)


class FTPService:
    """Serviço para interação com o servidor FTP."""

    def __init__(
        self,
        host: str,
        port: int,
        user: str,
        password: str,
        base_path: str,
    ):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.base_path = base_path

    def _connect(self) -> ftplib.FTP:
        """Cria e retorna uma conexão FTP autenticada."""
        ftp = ftplib.FTP()
        ftp.connect(self.host, self.port, timeout=30)
        ftp.login(self.user, self.password)
        ftp.encoding = "utf-8"
        logger.info(f"Conectado ao FTP {self.host}:{self.port}")
        return ftp

    def list_files(self, subdirectory: str = "") -> List[FTPFileInfo]:
        """
        Lista todos os arquivos no diretório de uploads.

        Args:
            subdirectory: Subdiretório opcional dentro do base_path.

        Returns:
            Lista de FTPFileInfo com nome, tamanho e data de modificação.
        """
        files: List[FTPFileInfo] = []
        ftp = None
        try:
            ftp = self._connect()
            target_path = self.base_path
            if subdirectory:
                target_path = f"{self.base_path}/{subdirectory}"

            ftp.cwd(target_path)

            # Usar MLSD se disponível (mais informações), fallback para LIST
            try:
                entries = list(ftp.mlsd())
                for name, facts in entries:
                    if facts.get("type") == "file":
                        size = int(facts.get("size", 0))
                        modified = facts.get("modify", "")
                        files.append(FTPFileInfo(
                            filename=name,
                            size=size,
                            modified=modified,
                        ))
            except ftplib.error_perm:
                # Fallback: usar nlst + size individual
                filenames = ftp.nlst()
                for name in filenames:
                    if name in (".", ".."):
                        continue
                    try:
                        size = ftp.size(name) or 0
                    except ftplib.error_perm:
                        size = 0
                    files.append(FTPFileInfo(
                        filename=name,
                        size=size,
                        modified=None,
                    ))

            logger.info(f"Listados {len(files)} arquivos em {target_path}")

        except ftplib.all_errors as e:
            logger.error(f"Erro ao listar arquivos FTP: {e}")
            raise ConnectionError(f"Erro ao conectar/listar FTP: {str(e)}")
        finally:
            if ftp:
                try:
                    ftp.quit()
                except Exception:
                    ftp.close()

        return files

    def get_file(self, filename: str) -> Tuple[BinaryIO, int]:
        """
        Faz download de um arquivo do FTP.

        Args:
            filename: Nome do arquivo (relativo ao base_path).

        Returns:
            Tupla (BytesIO com conteúdo, tamanho em bytes).

        Raises:
            FileNotFoundError: Se o arquivo não existir.
            ConnectionError: Se houver erro de conexão.
        """
        ftp = None
        try:
            ftp = self._connect()
            ftp.cwd(self.base_path)

            # Verificar se o arquivo existe
            try:
                size = ftp.size(filename) or 0
            except ftplib.error_perm:
                raise FileNotFoundError(f"Arquivo '{filename}' não encontrado no FTP")

            # Download para memória
            buffer = io.BytesIO()
            ftp.retrbinary(f"RETR {filename}", buffer.write)
            buffer.seek(0)

            logger.info(f"Download do arquivo '{filename}' ({size} bytes)")
            return buffer, size

        except FileNotFoundError:
            raise
        except ftplib.all_errors as e:
            logger.error(f"Erro ao baixar arquivo FTP '{filename}': {e}")
            raise ConnectionError(f"Erro ao baixar arquivo do FTP: {str(e)}")
        finally:
            if ftp:
                try:
                    ftp.quit()
                except Exception:
                    ftp.close()

    def check_file_exists(self, filename: str) -> bool:
        """Verifica se um arquivo existe no FTP."""
        ftp = None
        try:
            ftp = self._connect()
            ftp.cwd(self.base_path)
            ftp.size(filename)
            return True
        except ftplib.error_perm:
            return False
        except ftplib.all_errors:
            return False
        finally:
            if ftp:
                try:
                    ftp.quit()
                except Exception:
                    ftp.close()
