# Backend Python — BCI Ventures Platform

## 1. Arquitetura

### Stack
- **Python 3.11+**
- **FastAPI** — Framework web assíncrono
- **SQLAlchemy 2.0** — ORM com async support
- **Pydantic v2** — Validação e serialização
- **Alembic** — Migrações de banco
- **Redis** — Cache e sessões
- **Celery** — Tarefas assíncronas (score, relatórios)
- **WeasyPrint** — Geração de PDF
- **boto3** — Upload de arquivos (S3/MinIO)
- **python-jose** — JWT tokens
- **passlib[bcrypt]** — Hash de senhas
- **cryptography** — Criptografia AES-256 para dados sensíveis

### Estrutura de Pastas

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI app factory
│   ├── config.py                  # Configurações (Pydantic Settings)
│   ├── database.py                # Engine, SessionLocal, Base
│   ├── dependencies.py            # Dependency injection
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── router.py          # Router principal v1
│   │   │   ├── auth.py            # Login, register, refresh
│   │   │   ├── startups.py        # CRUD startups
│   │   │   ├── scoring.py         # Score endpoints
│   │   │   ├── rankings.py        # Rankings e comparativos
│   │   │   ├── pipeline.py        # Pipeline/Kanban
│   │   │   ├── reports.py         # Relatórios
│   │   │   ├── users.py           # Gestão de usuários
│   │   │   ├── dashboard.py       # Dados dos dashboards
│   │   │   └── uploads.py         # Upload de documentos
│   │
│   ├── models/                    # SQLAlchemy models
│   │   ├── user.py
│   │   ├── startup.py
│   │   ├── founder.py
│   │   ├── score.py
│   │   ├── pipeline.py
│   │   ├── document.py
│   │   └── audit_log.py
│   │
│   ├── schemas/                   # Pydantic schemas (DTOs)
│   │   ├── auth.py
│   │   ├── startup.py
│   │   ├── score.py
│   │   ├── user.py
│   │   ├── report.py
│   │   └── common.py              # Paginação, filtros, responses
│   │
│   ├── services/                  # Lógica de negócio
│   │   ├── auth_service.py
│   │   ├── startup_service.py
│   │   ├── scoring_service.py     # Motor de score
│   │   ├── ranking_service.py
│   │   ├── pipeline_service.py
│   │   ├── report_service.py
│   │   ├── upload_service.py
│   │   └── notification_service.py
│   │
│   ├── core/                      # Utilitários core
│   │   ├── security.py            # JWT, hashing, criptografia
│   │   ├── permissions.py         # RBAC decorators
│   │   ├── exceptions.py          # Custom exceptions
│   │   ├── logging.py             # Structured logging
│   │   └── encryption.py          # AES-256 para dados sensíveis
│   │
│   ├── tasks/                     # Celery tasks
│   │   ├── scoring_tasks.py
│   │   ├── report_tasks.py
│   │   └── notification_tasks.py
│   │
│   └── utils/
│       ├── validators.py          # CPF, CNPJ, email validators
│       ├── formatters.py
│       └── constants.py           # Enums e constantes
│
├── migrations/                    # Alembic
│   ├── env.py
│   └── versions/
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_startups.py
│   ├── test_scoring.py
│   └── test_rankings.py
│
├── alembic.ini
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## 2. Configuração

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "BCI Ventures API"
    DEBUG: bool = False
    API_VERSION: str = "v1"

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "bci_ventures"
    DB_USER: str = "bci_user"
    DB_PASSWORD: str
    DATABASE_URL: str = ""

    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage
    S3_BUCKET: str = "bci-documents"
    S3_ENDPOINT: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Encryption
    AES_KEY: str  # 32-byte key para AES-256

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
```

---

## 3. Models (SQLAlchemy)

```python
# app/models/startup.py
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class SetorEnum(str, enum.Enum):
    DEEPTECH = "deeptech"
    RETAILTECH = "retailtech"
    FINTECH = "fintech"
    HEALTHTECH = "healthtech"
    EDTECH = "edtech"
    AGRITECH = "agritech"
    # ... demais setores

class EstagioEnum(str, enum.Enum):
    IDEACAO = "ideacao"
    PRE_SEED = "pre_seed"
    MVP_VALIDADO = "mvp_validado"
    TRACAO_INICIAL = "tracao_inicial"
    CRESCIMENTO = "crescimento"
    ESCALA = "escala"
    CONSOLIDADO = "consolidado"

class StatusEnum(str, enum.Enum):
    PENDENTE = "pendente"
    EM_ANALISE = "em_analise"
    APROVADO = "aprovado"
    REJEITADO = "rejeitado"

class Startup(Base):
    __tablename__ = "startups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    founder_id = Column(Integer, ForeignKey("founders.id"), nullable=False)
    nome_startup = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=False)
    setor = Column(Enum(SetorEnum), nullable=False)
    problema = Column(String(100), nullable=False)
    problema_outro = Column(String(255), nullable=True)
    tecnologia = Column(String(100), nullable=False)
    tecnologia_outra = Column(String(255), nullable=True)
    estagio = Column(Enum(EstagioEnum), nullable=False)
    publico = Column(String(50), nullable=False)
    publico_outro = Column(String(255), nullable=True)
    canais = Column(JSON, nullable=False)
    tam = Column(String(50), nullable=False)
    sam = Column(String(50), nullable=False)
    som = Column(String(50), nullable=False)
    concorrentes = Column(Text, nullable=False)
    diferencial = Column(String(100), nullable=False)
    diferencial_outro = Column(String(255), nullable=True)
    faturamento_atual = Column(String(50), nullable=False)
    previsao_faturamento = Column(String(50), nullable=False)
    valuation = Column(String(50), nullable=False)
    investimento_desejado = Column(String(50), nullable=False)
    recursos_disponiveis = Column(String(100), nullable=True)
    captacao_anterior = Column(String(255), nullable=True)
    riscos = Column(Text, nullable=True)
    riscos_outro = Column(Text, nullable=True)
    estrutura_juridica = Column(String(100), nullable=True)
    numero_integrantes = Column(Integer, nullable=False)
    linkedin_equipe = Column(Text, nullable=True)
    experiencia_equipe = Column(Text, nullable=True)
    vinculo_parentesco = Column(String(10), nullable=True)
    tipo_apoio = Column(JSON, nullable=True)
    nivel_envolvimento = Column(String(50), nullable=True)
    termos = Column(JSON, nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.PENDENTE, nullable=False)
    pipeline_stage = Column(String(50), default="inscricao")
    assigned_analyst_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    data_criacao = Column(DateTime, server_default="CURRENT_TIMESTAMP")
    data_atualizacao = Column(DateTime, server_default="CURRENT_TIMESTAMP", onupdate="CURRENT_TIMESTAMP")

    # Relationships
    founder = relationship("Founder", back_populates="startups")
    scores = relationship("Score", back_populates="startup", order_by="Score.created_at.desc()")
    documents = relationship("Document", back_populates="startup")
    pipeline_history = relationship("PipelineHistory", back_populates="startup")
    notes = relationship("StartupNote", back_populates="startup")
```

```python
# app/models/score.py
class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True)
    startup_id = Column(Integer, ForeignKey("startups.id"), nullable=False)
    total_score = Column(Float, nullable=False)          # 0-1000
    classification = Column(String(1), nullable=False)    # S, A, B, C, D, E

    # Dimensões (0-100 cada)
    dim_inovacao = Column(Float, nullable=False)
    dim_mercado = Column(Float, nullable=False)
    dim_tracao = Column(Float, nullable=False)
    dim_equipe = Column(Float, nullable=False)
    dim_tecnologia = Column(Float, nullable=False)
    dim_modelo_negocio = Column(Float, nullable=False)
    dim_financas = Column(Float, nullable=False)
    dim_competitividade = Column(Float, nullable=False)
    dim_impacto = Column(Float, nullable=False)
    dim_risco = Column(Float, nullable=False)

    justificativas = Column(JSON)       # Dict com justificativa por dimensão
    is_manual_override = Column(Boolean, default=False)
    override_reason = Column(Text, nullable=True)
    calculated_by = Column(String(50), default="algorithm_v1")
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP")
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    startup = relationship("Startup", back_populates="scores")
```

---

## 4. APIs (Endpoints)

### 4.1 Autenticação (`/api/v1/auth`)

| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|-------------|
| POST | `/auth/register` | Criar conta | Pública |
| POST | `/auth/login` | Login (retorna JWT) | Pública |
| POST | `/auth/refresh` | Renovar token | Bearer JWT |
| POST | `/auth/logout` | Invalidar token | Bearer JWT |
| POST | `/auth/forgot-password` | Solicitar reset | Pública |
| POST | `/auth/reset-password` | Resetar senha | Token único |

### 4.2 Startups (`/api/v1/startups`)

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/startups` | Listar (paginado, filtros) | analyst, executive, admin |
| GET | `/startups/:id` | Detalhe de uma startup | analyst, executive, admin |
| POST | `/startups` | Criar (formulário) | startup, admin |
| PUT | `/startups/:id` | Atualizar | startup (owner), admin |
| PATCH | `/startups/:id/status` | Alterar status | analyst, admin |
| DELETE | `/startups/:id` | Remover | admin |
| GET | `/startups/:id/score` | Score detalhado | analyst, executive |
| POST | `/startups/:id/score/recalculate` | Recalcular score | analyst, admin |
| GET | `/startups/:id/documents` | Listar documentos | analyst, executive |
| POST | `/startups/:id/notes` | Adicionar nota | analyst |
| GET | `/startups/compare` | Comparativo (ids[]) | analyst, executive |

### 4.3 Rankings (`/api/v1/rankings`)

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/rankings` | Ranking geral | analyst, executive, investor |
| GET | `/rankings/by-sector` | Ranking por setor | analyst, executive |
| GET | `/rankings/by-stage` | Ranking por estágio | analyst, executive |
| GET | `/rankings/top/:n` | Top N startups | executive, investor |

### 4.4 Dashboard (`/api/v1/dashboard`)

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/dashboard/kpis` | KPIs consolidados | analyst, executive |
| GET | `/dashboard/distribution/sector` | Distribuição por setor | analyst, executive |
| GET | `/dashboard/distribution/stage` | Distribuição por estágio | analyst, executive |
| GET | `/dashboard/pipeline/funnel` | Funil do pipeline | analyst, executive |
| GET | `/dashboard/trends` | Tendências temporais | executive |
| GET | `/dashboard/geo` | Distribuição geográfica | executive |

### 4.5 Pipeline (`/api/v1/pipeline`)

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| GET | `/pipeline` | Todas as startups no pipeline | analyst |
| PATCH | `/pipeline/:startup_id/stage` | Mover entre estágios | analyst |
| PATCH | `/pipeline/:startup_id/assign` | Atribuir responsável | analyst, admin |
| GET | `/pipeline/history/:startup_id` | Histórico de movimentação | analyst |

### 4.6 Relatórios (`/api/v1/reports`)

| Método | Rota | Descrição | Roles |
|--------|------|-----------|-------|
| POST | `/reports/startup/:id` | Relatório individual (PDF) | analyst, executive |
| POST | `/reports/comparison` | Relatório comparativo (PDF) | executive |
| POST | `/reports/pipeline` | Relatório de pipeline (Excel) | executive |
| GET | `/reports/:id/download` | Download do relatório | owner |

---

## 5. Serviços (Lógica de Negócio)

```python
# app/services/startup_service.py
class StartupService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_startup(self, data: StartupCreateSchema, founder_id: int) -> Startup:
        """Cria startup, valida duplicatas, dispara cálculo de score."""
        # 1. Verificar duplicata (CPF + nome_startup)
        # 2. Validar TAM >= SAM >= SOM
        # 3. Criar registro
        # 4. Disparar task Celery para score
        # 5. Criar entrada no pipeline (stage=inscricao)
        # 6. Enviar email de confirmação
        # 7. Criar log de auditoria

    async def list_startups(self, filters: StartupFilterSchema) -> PaginatedResponse:
        """Lista startups com filtros, paginação e ordenação."""

    async def update_status(self, startup_id: int, new_status: StatusEnum, user_id: int):
        """Altera status com validação de transição e auditoria."""
        VALID_TRANSITIONS = {
            StatusEnum.PENDENTE: [StatusEnum.EM_ANALISE],
            StatusEnum.EM_ANALISE: [StatusEnum.APROVADO, StatusEnum.REJEITADO],
            StatusEnum.REJEITADO: [StatusEnum.PENDENTE],
        }
        # Validar transição, registrar auditoria, notificar startup
```

```python
# app/services/scoring_service.py
class ScoringService:
    """Motor de cálculo do score — detalhado em scoring-algorithm.md"""

    WEIGHTS = {
        'inovacao': 0.12, 'mercado': 0.15, 'tracao': 0.13,
        'equipe': 0.12, 'tecnologia': 0.10, 'modelo_negocio': 0.10,
        'financas': 0.08, 'competitividade': 0.08, 'impacto': 0.05, 'risco': 0.07,
    }

    async def calculate_score(self, startup_id: int) -> Score:
        """Calcula score completo para uma startup."""

    def _classify(self, total: float) -> str:
        """Retorna classificação S/A/B/C/D/E."""
        if total >= 901: return 'S'
        if total >= 751: return 'A'
        if total >= 601: return 'B'
        if total >= 401: return 'C'
        if total >= 201: return 'D'
        return 'E'
```

---

## 6. Middleware e Cross-Cutting

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def create_app() -> FastAPI:
    app = FastAPI(
        title="BCI Ventures API",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )

    # CORS
    app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS,
                       allow_methods=["*"], allow_headers=["*"], allow_credentials=True)

    # Rate limiting (slowapi)
    # Request logging middleware
    # Error handling middleware

    # Include routers
    app.include_router(v1_router, prefix="/api/v1")
    return app
```

### Error Handling

```python
# app/core/exceptions.py
class AppException(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: dict = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or {}

class NotFoundException(AppException):
    def __init__(self, entity: str, id: int):
        super().__init__(404, "NOT_FOUND", f"{entity} #{id} não encontrado(a)")

class DuplicateException(AppException):
    def __init__(self, entity: str):
        super().__init__(409, "DUPLICATE", f"{entity} já cadastrado(a)")

class InvalidTransitionException(AppException):
    def __init__(self, from_status: str, to_status: str):
        super().__init__(422, "INVALID_TRANSITION",
                         f"Transição {from_status} → {to_status} não é permitida")
```

---

## 7. Validadores

```python
# app/utils/validators.py
import re

def validate_cpf(cpf: str) -> bool:
    """Valida CPF com algoritmo de dígitos verificadores."""
    cpf = re.sub(r'[^0-9]', '', cpf)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return False
    for i in range(9, 11):
        total = sum(int(cpf[j]) * ((i + 1) - j) for j in range(i))
        digit = (total * 10 % 11) % 10
        if int(cpf[i]) != digit:
            return False
    return True

def validate_tam_sam_som(tam: str, sam: str, som: str) -> bool:
    """Valida que TAM >= SAM >= SOM usando ordem das faixas."""
    ORDER = ['ate_100k','100k_500k','500k_1mi','1_5mi','5_10mi','10_50mi',
             '50_100mi','100_200mi','acima_200mi']
    try:
        return ORDER.index(tam) >= ORDER.index(sam) >= ORDER.index(som)
    except ValueError:
        return False
```

---

## 8. Docker

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db, redis]
    volumes: ["./uploads:/app/uploads"]

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: bci_ventures
      MYSQL_USER: bci_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    ports: ["3306:3306"]
    volumes: ["mysql_data:/var/lib/mysql"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  celery:
    build: .
    command: celery -A app.tasks worker -l info
    env_file: .env
    depends_on: [db, redis]

volumes:
  mysql_data:
```
