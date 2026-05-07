"""
BCI Ventures API — Endpoints de Startups.
Usa o PHP Bridge para acessar dados do MySQL no servidor remoto.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import settings
from app.services.bridge_service import PHPBridgeService
from app.utils.parsers import (
    normalize_null,
    parse_array_field,
    parse_document_field,
)

router = APIRouter(prefix="/startups", tags=["Startups"])


def get_bridge() -> PHPBridgeService:
    """Dependency: retorna instância do serviço PHP Bridge."""
    return PHPBridgeService(base_url=settings.PHP_BRIDGE_URL)


def _enrich_startup(item: dict) -> dict:
    """
    Enriquece um registro de startup com parsing de campos JSON.
    Transforma strings JSON em listas/objetos reais.
    """
    enriched = dict(item)

    # Parse de campos JSON que vêm como strings
    for field in ["canais", "riscos", "tipo_apoio", "termos"]:
        enriched[field] = parse_array_field(item.get(field))

    # Parse de campos de upload
    for field in ["pitch_deck", "cap_table", "plano_financeiro"]:
        enriched[field] = parse_document_field(item.get(field))

    # Normalizar NULLs
    for field in ["problema_outro", "tecnologia_outra", "publico_outro",
                   "diferencial_outro", "riscos_outro", "mvp_links"]:
        enriched[field] = normalize_null(item.get(field))

    # Adicionar flags de documentos
    enriched["has_pitch_deck"] = enriched["pitch_deck"] is not None
    enriched["has_cap_table"] = enriched["cap_table"] is not None
    enriched["has_plano_financeiro"] = enriched["plano_financeiro"] is not None

    # Setor alias
    enriched["setor"] = item.get("setorStartup")

    return enriched


@router.get("")
def list_startups(
    page: int = Query(1, ge=1, description="Página atual"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    sort_by: str = Query("data_criacao", description="Campo para ordenação"),
    sort_order: str = Query("desc", description="Direção da ordenação (asc ou desc)"),
    setor: Optional[str] = Query(None, description="Filtrar por setor"),
    estagio: Optional[str] = Query(None, description="Filtrar por estágio"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    cidade: Optional[str] = Query(None, description="Filtrar por cidade"),
    search: Optional[str] = Query(None, description="Busca textual (nome, descrição, email)"),
    bridge: PHPBridgeService = Depends(get_bridge),
):
    """
    Lista startups cadastradas com filtros, paginação e ordenação.

    Os dados são obtidos do MySQL via PHP Bridge no servidor remoto.

    **Filtros disponíveis:**
    - `setor` — Deeptech, FinTech, HealthTech, etc.
    - `estagio` — ideacao, pre_seed, mvp_validado, etc.
    - `status` — pendente, em_analise, aprovado, rejeitado
    - `cidade` — Busca parcial (ex: "Fortaleza")
    - `search` — Busca textual livre em nome, descrição e email
    """
    try:
        result = bridge.list_startups(
            page=page,
            per_page=per_page,
            sort_by=sort_by,
            sort_order=sort_order,
            setor=setor,
            estagio=estagio,
            status=status,
            cidade=cidade,
            search=search,
        )
        # Enriquecer cada item com parsing de campos JSON
        result["items"] = [_enrich_startup(item) for item in result.get("items", [])]
        return result
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/stats")
def get_stats(bridge: PHPBridgeService = Depends(get_bridge)):
    """
    Retorna estatísticas resumidas das startups (KPIs).

    - Total de startups
    - Distribuição por status
    - Distribuição por setor
    - Distribuição por estágio
    """
    try:
        return bridge.get_stats()
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/{startup_id}")
def get_startup(
    startup_id: int,
    bridge: PHPBridgeService = Depends(get_bridge),
):
    """
    Retorna os dados completos de uma startup, incluindo campos JSON parseados.
    """
    try:
        result = bridge.get_startup(startup_id)
        if result is None or "error" in result:
            raise HTTPException(
                status_code=404,
                detail=result.get("error", f"Startup #{startup_id} não encontrada")
            )
        return _enrich_startup(result)
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/{startup_id}/documents")
def get_startup_documents(
    startup_id: int,
    bridge: PHPBridgeService = Depends(get_bridge),
):
    """
    Retorna os documentos de uma startup (pitch_deck, cap_table, plano_financeiro).
    Os campos JSON de upload são parseados e retornam metadados estruturados.
    """
    try:
        result = bridge.get_startup(startup_id)
        if result is None or "error" in result:
            raise HTTPException(
                status_code=404,
                detail=result.get("error", f"Startup #{startup_id} não encontrada")
            )
        return {
            "startup_id": startup_id,
            "pitch_deck": parse_document_field(result.get("pitch_deck")),
            "cap_table": parse_document_field(result.get("cap_table")),
            "plano_financeiro": parse_document_field(result.get("plano_financeiro")),
            "mvp_links": normalize_null(result.get("mvp_links")),
        }
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
