"""
BCI Ventures — Pydantic schemas para Startups.
DTOs de resposta, listagem e filtros.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.utils.parsers import (
    normalize_null,
    parse_array_field,
    parse_document_field,
    safe_int,
)


# ── Documento (sub-schema) ──────────────────────────────

class DocumentInfo(BaseModel):
    """Metadados de um documento uploaded."""
    path: str = ""
    original_name: str = ""
    stored_name: str = ""
    size: int = 0
    type: str = ""
    upload_date: str = ""


# ── Startup completa ────────────────────────────────────

class StartupResponse(BaseModel):
    """Resposta completa de uma startup com todos os campos."""
    id: int
    # Fundador
    nome: Optional[str] = None
    cpf: Optional[str] = None
    nascimento: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    cidade: Optional[str] = None
    # Startup
    nome_startup: Optional[str] = None
    descricao: Optional[str] = None
    setor: Optional[str] = None
    problema: Optional[str] = None
    problema_outro: Optional[str] = None
    tecnologia: Optional[str] = None
    tecnologia_outra: Optional[str] = None
    estagio: Optional[str] = None
    # Mercado
    publico: Optional[str] = None
    publico_outro: Optional[str] = None
    canais: List[str] = []
    tam: Optional[str] = None
    sam: Optional[str] = None
    som: Optional[str] = None
    concorrentes: Optional[str] = None
    # Diferenciais e Finanças
    diferencial: Optional[str] = None
    diferencial_outro: Optional[str] = None
    faturamento_atual: Optional[str] = None
    previsao_faturamento: Optional[str] = None
    valuation: Optional[str] = None
    investimento_desejado: Optional[str] = None
    recursos_disponiveis: Optional[str] = None
    captacao_anterior: Optional[str] = None
    # Riscos e Estrutura
    riscos: List[str] = []
    riscos_outro: Optional[str] = None
    estrutura_juridica: Optional[str] = None
    numero_integrantes: int = 0
    linkedin_equipe: Optional[str] = None
    experiencia_equipe: Optional[str] = None
    vinculo_parentesco: Optional[str] = None
    # Apoio
    tipo_apoio: List[str] = []
    nivel_envolvimento: Optional[str] = None
    # Documentos
    pitch_deck: Optional[DocumentInfo] = None
    cap_table: Optional[DocumentInfo] = None
    plano_financeiro: Optional[DocumentInfo] = None
    mvp_links: Optional[str] = None
    # Termos e Status
    termos: List[str] = []
    data_criacao: Optional[datetime] = None
    data_atualizacao: Optional[datetime] = None
    status: Optional[str] = None

    model_config = {"from_attributes": True, "populate_by_name": True}

    @classmethod
    def from_db(cls, db_obj) -> "StartupResponse":
        """Converte o model SQLAlchemy para o schema, parseando campos JSON."""
        return cls(
            id=db_obj.id,
            nome=normalize_null(db_obj.nome),
            cpf=normalize_null(db_obj.cpf),
            nascimento=normalize_null(db_obj.nascimento),
            telefone=normalize_null(db_obj.telefone),
            email=normalize_null(db_obj.email),
            cidade=normalize_null(db_obj.cidade),
            nome_startup=normalize_null(db_obj.nome_startup),
            descricao=normalize_null(db_obj.descricao),
            setor=normalize_null(db_obj.setorStartup),
            problema=normalize_null(db_obj.problema),
            problema_outro=normalize_null(db_obj.problema_outro),
            tecnologia=normalize_null(db_obj.tecnologia),
            tecnologia_outra=normalize_null(db_obj.tecnologia_outra),
            estagio=normalize_null(db_obj.estagio),
            publico=normalize_null(db_obj.publico),
            publico_outro=normalize_null(db_obj.publico_outro),
            canais=parse_array_field(db_obj.canais),
            tam=normalize_null(db_obj.tam),
            sam=normalize_null(db_obj.sam),
            som=normalize_null(db_obj.som),
            concorrentes=normalize_null(db_obj.concorrentes),
            diferencial=normalize_null(db_obj.diferencial),
            diferencial_outro=normalize_null(db_obj.diferencial_outro),
            faturamento_atual=normalize_null(db_obj.faturamento_atual),
            previsao_faturamento=normalize_null(db_obj.previsao_faturamento),
            valuation=normalize_null(db_obj.valuation),
            investimento_desejado=normalize_null(db_obj.investimento_desejado),
            recursos_disponiveis=normalize_null(db_obj.recursos_disponiveis),
            captacao_anterior=normalize_null(db_obj.captacao_anterior),
            riscos=parse_array_field(db_obj.riscos),
            riscos_outro=normalize_null(db_obj.riscos_outro),
            estrutura_juridica=normalize_null(db_obj.estrutura_juridica),
            numero_integrantes=safe_int(db_obj.numero_integrantes),
            linkedin_equipe=normalize_null(db_obj.linkedin_equipe),
            experiencia_equipe=normalize_null(db_obj.experiencia_equipe),
            vinculo_parentesco=normalize_null(db_obj.vinculo_parentesco),
            tipo_apoio=parse_array_field(db_obj.tipo_apoio),
            nivel_envolvimento=normalize_null(db_obj.nivel_envolvimento),
            pitch_deck=_parse_doc(db_obj.pitch_deck),
            cap_table=_parse_doc(db_obj.cap_table),
            plano_financeiro=_parse_doc(db_obj.plano_financeiro),
            mvp_links=normalize_null(db_obj.mvp_links),
            termos=parse_array_field(db_obj.termos),
            data_criacao=db_obj.data_criacao,
            data_atualizacao=db_obj.data_atualizacao,
            status=normalize_null(db_obj.status),
        )


def _parse_doc(raw) -> Optional[DocumentInfo]:
    """Helper para converter campo de upload em DocumentInfo."""
    parsed = parse_document_field(raw)
    if parsed is None:
        return None
    return DocumentInfo(**parsed)


# ── Startup resumida (listagem) ─────────────────────────

class StartupListItem(BaseModel):
    """Versão resumida para listagem no dashboard."""
    id: int
    nome: Optional[str] = None
    nome_startup: Optional[str] = None
    setor: Optional[str] = None
    estagio: Optional[str] = None
    status: Optional[str] = None
    cidade: Optional[str] = None
    email: Optional[str] = None
    faturamento_atual: Optional[str] = None
    investimento_desejado: Optional[str] = None
    numero_integrantes: int = 0
    data_criacao: Optional[datetime] = None
    has_pitch_deck: bool = False
    has_cap_table: bool = False
    has_plano_financeiro: bool = False

    @classmethod
    def from_db(cls, db_obj) -> "StartupListItem":
        return cls(
            id=db_obj.id,
            nome=normalize_null(db_obj.nome),
            nome_startup=normalize_null(db_obj.nome_startup),
            setor=normalize_null(db_obj.setorStartup),
            estagio=normalize_null(db_obj.estagio),
            status=normalize_null(db_obj.status),
            cidade=normalize_null(db_obj.cidade),
            email=normalize_null(db_obj.email),
            faturamento_atual=normalize_null(db_obj.faturamento_atual),
            investimento_desejado=normalize_null(db_obj.investimento_desejado),
            numero_integrantes=safe_int(db_obj.numero_integrantes),
            data_criacao=db_obj.data_criacao,
            has_pitch_deck=parse_document_field(db_obj.pitch_deck) is not None,
            has_cap_table=parse_document_field(db_obj.cap_table) is not None,
            has_plano_financeiro=parse_document_field(db_obj.plano_financeiro) is not None,
        )


# ── Resposta paginada ───────────────────────────────────

class StartupListResponse(BaseModel):
    """Resposta paginada da listagem de startups."""
    items: List[StartupListItem]
    total: int
    page: int
    per_page: int
    total_pages: int


# ── Filtros ──────────────────────────────────────────────

class StartupFilters(BaseModel):
    """Filtros opcionais para listagem de startups."""
    setor: Optional[str] = None
    estagio: Optional[str] = None
    status: Optional[str] = None
    cidade: Optional[str] = None
    search: Optional[str] = None  # busca textual em nome_startup, descricao, nome


# ── FTP Files ────────────────────────────────────────────

class FTPFileInfo(BaseModel):
    """Informações de um arquivo no FTP."""
    filename: str
    size: int = 0
    modified: Optional[str] = None


class FTPFileListResponse(BaseModel):
    """Resposta da listagem de arquivos no FTP."""
    files: List[FTPFileInfo]
    total: int
    base_path: str
