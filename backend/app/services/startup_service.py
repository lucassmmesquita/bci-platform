"""
BCI Ventures — Serviço de Startups.
Lógica de negócio para consulta ao banco de dados.
"""

from __future__ import annotations

import math
from typing import Dict, Optional

from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.models.startup import FormularioStartup
from app.schemas.startup import (
    StartupResponse,
    StartupListItem,
    StartupListResponse,
    StartupFilters,
)


class StartupService:
    """Serviço para consulta de startups no banco de dados."""

    def __init__(self, db: Session):
        self.db = db

    def list_startups(
        self,
        filters: Optional[StartupFilters] = None,
        page: int = 1,
        per_page: int = 20,
        sort_by: str = "data_criacao",
        sort_order: str = "desc",
    ) -> StartupListResponse:
        """
        Lista startups com filtros, paginação e ordenação.
        """
        query = self.db.query(FormularioStartup)

        # ── Aplicar filtros ──────────────────────────────
        if filters:
            if filters.setor:
                query = query.filter(
                    FormularioStartup.setorStartup == filters.setor
                )
            if filters.estagio:
                query = query.filter(
                    FormularioStartup.estagio == filters.estagio
                )
            if filters.status:
                query = query.filter(
                    FormularioStartup.status == filters.status
                )
            if filters.cidade:
                query = query.filter(
                    FormularioStartup.cidade.ilike(f"%{filters.cidade}%")
                )
            if filters.search:
                search_term = f"%{filters.search}%"
                query = query.filter(
                    or_(
                        FormularioStartup.nome_startup.ilike(search_term),
                        FormularioStartup.descricao.ilike(search_term),
                        FormularioStartup.nome.ilike(search_term),
                        FormularioStartup.email.ilike(search_term),
                    )
                )

        # ── Total de registros ───────────────────────────
        total = query.count()

        # ── Ordenação ────────────────────────────────────
        sort_column = getattr(FormularioStartup, sort_by, FormularioStartup.data_criacao)
        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        # ── Paginação ────────────────────────────────────
        offset = (page - 1) * per_page
        query = query.offset(offset).limit(per_page)

        # ── Converter para schema ────────────────────────
        db_startups = query.all()
        items = [StartupListItem.from_db(s) for s in db_startups]

        return StartupListResponse(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=math.ceil(total / per_page) if per_page > 0 else 0,
        )

    def get_startup(self, startup_id: int) -> Optional[StartupResponse]:
        """
        Retorna uma startup completa por ID, com campos JSON parseados.
        """
        db_startup = self.db.query(FormularioStartup).filter(
            FormularioStartup.id == startup_id
        ).first()

        if db_startup is None:
            return None

        return StartupResponse.from_db(db_startup)

    def get_startup_documents(self, startup_id: int) -> Optional[Dict]:
        """
        Retorna os documentos de uma startup (parseados do JSON).
        """
        db_startup = self.db.query(FormularioStartup).filter(
            FormularioStartup.id == startup_id
        ).first()

        if db_startup is None:
            return None

        from app.utils.parsers import parse_document_field

        return {
            "startup_id": startup_id,
            "pitch_deck": parse_document_field(db_startup.pitch_deck),
            "cap_table": parse_document_field(db_startup.cap_table),
            "plano_financeiro": parse_document_field(db_startup.plano_financeiro),
            "mvp_links": db_startup.mvp_links,
        }

    def get_stats(self) -> Dict:
        """
        Retorna estatísticas resumidas (KPIs).
        """
        total = self.db.query(func.count(FormularioStartup.id)).scalar() or 0
        by_status = (
            self.db.query(
                FormularioStartup.status,
                func.count(FormularioStartup.id),
            )
            .group_by(FormularioStartup.status)
            .all()
        )
        by_setor = (
            self.db.query(
                FormularioStartup.setorStartup,
                func.count(FormularioStartup.id),
            )
            .group_by(FormularioStartup.setorStartup)
            .all()
        )
        by_estagio = (
            self.db.query(
                FormularioStartup.estagio,
                func.count(FormularioStartup.id),
            )
            .group_by(FormularioStartup.estagio)
            .all()
        )

        return {
            "total_startups": total,
            "by_status": {s: c for s, c in by_status if s},
            "by_setor": {s: c for s, c in by_setor if s},
            "by_estagio": {e: c for e, c in by_estagio if e},
        }
