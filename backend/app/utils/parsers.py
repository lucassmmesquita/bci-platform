"""
BCI Ventures — Funções de parsing e normalização.
Trata campos JSON stringificados, NULLs literais e arrays do formulário.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional


def normalize_null(value: Any) -> Any:
    """Converte strings 'NULL', 'null', '[]' vazios para None."""
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.upper() == "NULL" or stripped == "" or stripped == "[]":
            return None
        return stripped
    return value


def parse_json_field(value: Any) -> Any:
    """
    Faz parsing seguro de campos JSON stringificados.
    Retorna o valor parsed ou None se inválido.
    """
    if value is None:
        return None
    if isinstance(value, (list, dict)):
        return value
    if isinstance(value, str):
        normalized = normalize_null(value)
        if normalized is None:
            return None
        try:
            parsed = json.loads(normalized)
            return parsed
        except json.JSONDecodeError:
            # Tenta limpar aspas duplas escapadas (padrão do CSV)
            try:
                cleaned = normalized.replace('""', '"')
                if cleaned.startswith('"') and cleaned.endswith('"'):
                    cleaned = cleaned[1:-1]
                parsed = json.loads(cleaned)
                return parsed
            except (json.JSONDecodeError, Exception):
                return normalized
    return value


def parse_document_field(value: Any) -> Optional[Dict]:
    """
    Parse de campos de upload (pitch_deck, cap_table, plano_financeiro).
    Retorna dict com metadados do documento ou None.
    """
    parsed = parse_json_field(value)
    if parsed is None:
        return None
    if isinstance(parsed, list):
        if len(parsed) == 0:
            return None
        # Se vier como array, pega o primeiro item
        parsed = parsed[0] if isinstance(parsed[0], dict) else None
        if parsed is None:
            return None
    if isinstance(parsed, dict):
        return {
            "path": parsed.get("path", ""),
            "original_name": parsed.get("original_name", ""),
            "stored_name": parsed.get("stored_name", ""),
            "size": parsed.get("size", 0),
            "type": parsed.get("type", ""),
            "upload_date": parsed.get("upload_date", ""),
        }
    return None


def parse_array_field(value: Any) -> List:
    """
    Parse de campos array (canais, riscos, tipo_apoio, termos).
    Sempre retorna uma lista.
    """
    parsed = parse_json_field(value)
    if parsed is None:
        return []
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, str):
        return [parsed]
    return []


def safe_int(value: Any, default: int = 0) -> int:
    """Converte valor para int de forma segura."""
    if value is None:
        return default
    try:
        return int(value)
    except (ValueError, TypeError):
        return default
