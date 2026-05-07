"""
BCI Ventures — SQLAlchemy model para a tabela existente formulario_startups_bci.
Mapeamento as-is da tabela monolítica (47 colunas).
"""

from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base


class FormularioStartup(Base):
    """
    Mapeia a tabela existente `formulario_startups_bci` no MySQL.
    Reflete a estrutura monolítica do CSV — sem normalização nesta fase.
    """
    __tablename__ = "formulario_startups_bci"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # ── Dados do Fundador ────────────────────────────────
    nome = Column(String(255), nullable=False)
    cpf = Column(String(20), nullable=False)
    nascimento = Column(String(20), nullable=True)
    telefone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=False)
    cidade = Column(String(100), nullable=True)

    # ── Dados da Startup ─────────────────────────────────
    nome_startup = Column(String(255), nullable=True)
    descricao = Column(Text, nullable=True)
    setorStartup = Column(String(100), nullable=True)
    problema = Column(String(100), nullable=True)
    problema_outro = Column(String(255), nullable=True)
    tecnologia = Column(String(100), nullable=True)
    tecnologia_outra = Column(String(255), nullable=True)
    estagio = Column(String(50), nullable=True)

    # ── Mercado e Público ────────────────────────────────
    publico = Column(String(50), nullable=True)
    publico_outro = Column(String(255), nullable=True)
    canais = Column(Text, nullable=True)          # JSON array como string
    tam = Column(String(50), nullable=True)
    sam = Column(String(50), nullable=True)
    som = Column(String(50), nullable=True)
    concorrentes = Column(Text, nullable=True)

    # ── Diferenciais e Finanças ──────────────────────────
    diferencial = Column(String(100), nullable=True)
    diferencial_outro = Column(String(255), nullable=True)
    faturamento_atual = Column(String(50), nullable=True)
    previsao_faturamento = Column(String(50), nullable=True)
    valuation = Column(String(50), nullable=True)
    investimento_desejado = Column(String(50), nullable=True)
    recursos_disponiveis = Column(String(100), nullable=True)
    captacao_anterior = Column(String(255), nullable=True)

    # ── Riscos e Estrutura ───────────────────────────────
    riscos = Column(Text, nullable=True)           # JSON array como string
    riscos_outro = Column(Text, nullable=True)
    estrutura_juridica = Column(String(100), nullable=True)
    numero_integrantes = Column(Integer, nullable=True)
    linkedin_equipe = Column(Text, nullable=True)
    experiencia_equipe = Column(Text, nullable=True)
    vinculo_parentesco = Column(String(10), nullable=True)

    # ── Apoio e Engajamento ──────────────────────────────
    tipo_apoio = Column(Text, nullable=True)       # JSON array como string
    nivel_envolvimento = Column(String(50), nullable=True)

    # ── Documentos (JSON stringificado) ──────────────────
    pitch_deck = Column(Text, nullable=True)       # JSON object como string
    cap_table = Column(Text, nullable=True)        # JSON object como string
    plano_financeiro = Column(Text, nullable=True) # JSON object como string
    mvp_links = Column(Text, nullable=True)

    # ── Termos e Status ──────────────────────────────────
    termos = Column(Text, nullable=True)           # JSON array como string
    data_criacao = Column(DateTime, nullable=True)
    data_atualizacao = Column(DateTime, nullable=True)
    status = Column(String(20), nullable=True, default="pendente")

    def __repr__(self):
        return f"<FormularioStartup(id={self.id}, nome_startup='{self.nome_startup}')>"
