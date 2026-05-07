"""
BCI Ventures — Serviço de dados via PHP Bridge.
Conecta ao PHP API no servidor para acessar os dados MySQL.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urlencode

import urllib.request
import json

logger = logging.getLogger(__name__)


class PHPBridgeService:
    """
    Serviço que consome o api_bridge.php no servidor remoto.
    Como o MySQL só aceita conexões locais (firewall),
    usamos o PHP como ponte para acessar os dados.
    """

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    def _request(self, params: Dict[str, Any]) -> Any:
        """Faz uma requisição GET ao PHP bridge."""
        query_string = urlencode({k: v for k, v in params.items() if v is not None})
        url = f"{self.base_url}?{query_string}"
        logger.debug(f"PHP Bridge request: {url}")

        try:
            req = urllib.request.Request(url)
            req.add_header("User-Agent", "BCI-Ventures-API/1.0")
            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
                return data
        except Exception as e:
            logger.error(f"Erro ao consultar PHP Bridge: {e}")
            raise ConnectionError(f"Erro ao consultar servidor remoto: {str(e)}")

    def health(self) -> Dict:
        """Verifica conexão com o banco via PHP bridge."""
        return self._request({"action": "health"})

    def list_startups(
        self,
        page: int = 1,
        per_page: int = 20,
        sort_by: str = "data_criacao",
        sort_order: str = "desc",
        setor: Optional[str] = None,
        estagio: Optional[str] = None,
        status: Optional[str] = None,
        cidade: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Dict:
        """Lista startups com filtros e paginação."""
        params = {
            "action": "list",
            "page": page,
            "per_page": per_page,
            "sort_by": sort_by,
            "sort_order": sort_order,
            "setor": setor,
            "estagio": estagio,
            "status": status,
            "cidade": cidade,
            "search": search,
        }
        return self._request(params)

    def get_startup(self, startup_id: int) -> Optional[Dict]:
        """Retorna detalhe de uma startup por ID."""
        return self._request({"action": "get", "id": startup_id})

    def get_stats(self) -> Dict:
        """Retorna estatísticas resumidas."""
        return self._request({"action": "stats"})
