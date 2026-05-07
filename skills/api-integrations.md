# API Integrations — BCI Ventures Platform

## 1. Visão Geral

A plataforma gerencial BCI Ventures consome dados já cadastrados pelas startups no site externo (bciventures.com.br) e expõe APIs internas para o frontend React. Futuras integrações externas ampliam a inteligência da plataforma.

---

## 2. Arquitetura de API

### Padrões Gerais

- **Estilo:** REST com versionamento (`/api/v1/`)
- **Formato:** JSON (Content-Type: application/json)
- **Autenticação:** Bearer JWT em todos os endpoints protegidos
- **Documentação:** OpenAPI 3.0 auto-gerada pelo FastAPI (`/api/docs`)
- **Paginação:** Cursor-based ou offset (`?page=1&per_page=20`)
- **Filtros:** Query params (`?setor=fintech&status=pendente`)
- **Ordenação:** `?sort_by=total_score&order=desc`
- **Erros:** Formato padronizado (ver abaixo)

### Response Padrão — Sucesso

```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 127,
    "total_pages": 7
  }
}
```

### Response Padrão — Erro

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": [
      { "field": "tam", "message": "TAM deve ser maior ou igual ao SAM" }
    ]
  }
}
```

### HTTP Status Codes

| Code | Uso |
|------|-----|
| 200 | GET, PATCH com sucesso |
| 201 | POST com criação |
| 204 | DELETE com sucesso |
| 400 | Validação de input falhou |
| 401 | Token ausente ou inválido |
| 403 | Permissão insuficiente (RBAC) |
| 404 | Recurso não encontrado |
| 409 | Conflito (duplicata) |
| 422 | Regra de negócio violada |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## 3. Endpoints Detalhados

### 3.1 Autenticação

```yaml
POST /api/v1/auth/login:
  body: { email: string, password: string }
  response: { access_token, refresh_token, user: { id, name, role } }

POST /api/v1/auth/refresh:
  body: { refresh_token: string }
  response: { access_token, refresh_token }

POST /api/v1/auth/logout:
  headers: Authorization: Bearer <token>
  response: 204

GET /api/v1/auth/me:
  headers: Authorization: Bearer <token>
  response: { id, email, full_name, role, last_login_at }
```

### 3.2 Startups

```yaml
GET /api/v1/startups:
  params: page, per_page, setor, estagio, status, score_min, score_max, city, sort_by, order, search
  response: PaginatedResponse<StartupSummary>

GET /api/v1/startups/{id}:
  response: StartupDetail (todos os campos + último score + documentos)

PATCH /api/v1/startups/{id}/status:
  body: { status: "em_analise" | "aprovado" | "rejeitado", reason?: string }
  response: StartupDetail

GET /api/v1/startups/{id}/score:
  response: ScoreDetail (total, classificação, 10 dimensões + justificativas)

POST /api/v1/startups/{id}/score/recalculate:
  response: ScoreDetail (novo score calculado)

POST /api/v1/startups/{id}/score/override:
  body: { dimension: string, new_value: number, reason: string }
  response: ScoreDetail

GET /api/v1/startups/compare?ids=1,3,7,12:
  response: ComparisonResult (array de startups com scores sobrepostos)

POST /api/v1/startups/{id}/notes:
  body: { content: string, is_internal: boolean }
  response: Note

GET /api/v1/startups/{id}/notes:
  response: Note[]
```

### 3.3 Rankings

```yaml
GET /api/v1/rankings:
  params: setor, estagio, limit, period
  response: RankedStartup[] (com rank, nome, setor, score, classificação)

GET /api/v1/rankings/top/{n}:
  response: RankedStartup[] (top N)
```

### 3.4 Dashboard

```yaml
GET /api/v1/dashboard/kpis:
  response: { total_startups, pending, avg_score, approved_month, rejected_month, trend }

GET /api/v1/dashboard/distribution/sector:
  response: { sector: string, count: number, percentage: number }[]

GET /api/v1/dashboard/distribution/stage:
  response: { stage: string, count: number, percentage: number }[]

GET /api/v1/dashboard/distribution/classification:
  response: { classification: string, count: number }[]

GET /api/v1/dashboard/pipeline/funnel:
  response: { stage: string, count: number }[]

GET /api/v1/dashboard/trends:
  params: period (7d, 30d, 90d, 1y)
  response: { date: string, registrations: number, approvals: number }[]

GET /api/v1/dashboard/geo:
  response: { city: string, state: string, count: number, lat: number, lng: number }[]
```

### 3.5 Pipeline

```yaml
GET /api/v1/pipeline:
  params: stage, assigned_to, setor
  response: { stage: string, startups: StartupCard[] }[]

PATCH /api/v1/pipeline/{startup_id}/stage:
  body: { to_stage: string, reason?: string }
  response: PipelineEntry

PATCH /api/v1/pipeline/{startup_id}/assign:
  body: { analyst_id: number }
  response: PipelineEntry

GET /api/v1/pipeline/{startup_id}/history:
  response: PipelineHistoryEntry[]
```

### 3.6 Relatórios

```yaml
POST /api/v1/reports/startup/{id}:
  body: { format: "pdf" | "xlsx" }
  response: { report_id: number, download_url: string }

POST /api/v1/reports/comparison:
  body: { startup_ids: number[], format: "pdf" }
  response: { report_id, download_url }

POST /api/v1/reports/pipeline:
  body: { filters: {...}, format: "xlsx" }
  response: { report_id, download_url }

GET /api/v1/reports/{id}/download:
  response: Binary file (PDF/XLSX)
```

### 3.7 Uploads / Documentos

```yaml
GET /api/v1/startups/{id}/documents:
  response: Document[]

GET /api/v1/documents/{id}/download:
  response: Binary file
```

### 3.8 Usuários (Admin)

```yaml
GET /api/v1/users:
  params: role, is_active, search
  response: PaginatedResponse<User>

POST /api/v1/users:
  body: { email, full_name, role, password }
  response: User

PATCH /api/v1/users/{id}:
  body: { role?, is_active?, full_name? }
  response: User

GET /api/v1/audit-logs:
  params: user_id, action, entity_type, date_from, date_to
  response: PaginatedResponse<AuditLog>
```

---

## 4. Integração com Site Externo (bciventures.com.br)

As startups cadastram dados via site externo. A plataforma consome esses dados de duas formas possíveis:

### Opção A — Banco de Dados Compartilhado (recomendada para MVP)
- O site e a plataforma acessam o mesmo MySQL
- A plataforma lê a tabela `formulario_startups_bci` (ou migrada)
- Sincronização em tempo real

### Opção B — API de Sincronização (recomendada para produção)
```yaml
# Webhook: site notifica plataforma de novo cadastro
POST /api/v1/webhooks/new-startup:
  headers: X-Webhook-Secret: <shared_secret>
  body: { startup_id: number, event: "created" | "updated" }
  response: 200 OK

# Ou: Sync periódico (cron)
GET /api/v1/sync/startups?since=2025-08-18T00:00:00Z
  # Busca novos cadastros desde a última sincronização
```

---

## 5. Integrações Externas Futuras

| Integração | Propósito | Prioridade |
|-----------|----------|------------|
| **CNPJ API (ReceitaWS)** | Validar CNPJ, obter dados da empresa | Fase 2 |
| **LinkedIn API** | Verificar perfis da equipe | Fase 3 |
| **Crunchbase / PitchBook** | Dados de mercado e investimentos | Fase 3 |
| **SendGrid / SES** | Notificações por email | Fase 1 |
| **Slack** | Alertas internos para o time BCI | Fase 2 |
| **Google Analytics** | Métricas do site de cadastro | Fase 3 |
| **Power BI / Metabase** | Conexão para dashboards avançados | Fase 3 |

---

## 6. Swagger / OpenAPI

```python
# Auto-gerado pelo FastAPI
# Acessível em:
#   /api/docs     (Swagger UI)
#   /api/redoc    (ReDoc)
#   /api/openapi.json

app = FastAPI(
    title="BCI Ventures API",
    description="API gerencial para avaliação de startups e gestão de pipeline de inovação",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)
```

Cada endpoint deve ter docstrings descritivas e exemplos nos schemas Pydantic para enriquecer a documentação automática.
