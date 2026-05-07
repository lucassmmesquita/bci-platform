# Testing & Quality — BCI Ventures Platform

## 1. Estratégia de Testes

### Pirâmide de Testes
```
         /  E2E  \          5% — Fluxos críticos completos
        / Integração \      25% — API + DB + serviços
       /   Unitários   \   70% — Funções, validadores, score
```

### Meta de Cobertura
- **Backend:** ≥ 80% de cobertura de linha
- **Frontend:** ≥ 70% de cobertura de componentes
- **Scoring Algorithm:** 100% de cobertura (crítico)

---

## 2. Backend — Python (pytest)

### 2.1 Configuração

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

@pytest.fixture
async def db_session():
    """Session com banco de teste (SQLite in-memory ou MySQL de teste)."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSession(engine) as session:
        yield session

@pytest.fixture
async def client(db_session):
    """Client HTTP para testes de API."""
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def sample_startup():
    """Dados de startup para testes."""
    return {
        "nome_startup": "TestTech",
        "descricao": "Plataforma de testes automatizados com IA",
        "setor": "deeptech",
        "problema": "altos_custos",
        "tecnologia": "ia_ml",
        "estagio": "mvp_validado",
        "publico": "b2b",
        "canais": ["midias_sociais", "parcerias"],
        "tam": "10_50mi",
        "sam": "5_10mi",
        "som": "1_5mi",
        "concorrentes": "Empresa A, Empresa B",
        "diferencial": "tecnologia_proprietaria",
        "faturamento_atual": "10k_50k",
        "previsao_faturamento": "1mi_5mi",
        "valuation": "ate_2mi",
        "investimento_desejado": "500k",
        "numero_integrantes": 4,
        "nivel_envolvimento": "time_dedicado",
        "vinculo_parentesco": "nao",
    }
```

### 2.2 Testes Unitários — Scoring

```python
# tests/test_scoring.py

class TestScoringAlgorithm:
    """100% de cobertura — componente mais crítico."""

    def test_calc_inovacao_deeptech_proprietaria(self, sample_startup):
        score, justificativa = calc_inovacao(sample_startup)
        assert 80 <= score <= 100
        assert "deeptech" in justificativa

    def test_calc_inovacao_retailtech_preco(self):
        startup = {"setor": "retailtech", "tecnologia": "mobile", "diferencial": "preco"}
        score, _ = calc_inovacao(startup)
        assert score < 50  # baixa inovação

    def test_calc_mercado_tam_gte_sam_gte_som(self, sample_startup):
        score, _ = calc_mercado(sample_startup)
        assert 0 <= score <= 100

    def test_total_score_range(self, sample_startup):
        result = calculate_total_score(sample_startup)
        assert 0 <= result["total_score"] <= 1000

    def test_classification_S(self):
        assert classify(950) == "S"

    def test_classification_A(self):
        assert classify(800) == "A"

    def test_classification_B(self):
        assert classify(650) == "B"

    def test_classification_C(self):
        assert classify(450) == "C"

    def test_classification_D(self):
        assert classify(300) == "D"

    def test_classification_E(self):
        assert classify(100) == "E"

    def test_weights_sum_to_one(self):
        assert abs(sum(WEIGHTS.values()) - 1.0) < 0.001

    def test_all_dimensions_present(self, sample_startup):
        result = calculate_total_score(sample_startup)
        expected = {'inovacao', 'mercado', 'tracao', 'equipe', 'tecnologia',
                    'modelo_negocio', 'financas', 'competitividade', 'impacto', 'risco'}
        assert set(result["dimensions"].keys()) == expected

    def test_dimension_scores_in_range(self, sample_startup):
        result = calculate_total_score(sample_startup)
        for dim, data in result["dimensions"].items():
            assert 0 <= data["score"] <= 100, f"{dim} fora do range"

    def test_justificativas_not_empty(self, sample_startup):
        result = calculate_total_score(sample_startup)
        for dim, data in result["dimensions"].items():
            assert len(data["justificativa"]) > 0, f"{dim} sem justificativa"
```

### 2.3 Testes Unitários — Validadores

```python
# tests/test_validators.py

class TestCPFValidator:
    def test_cpf_valido(self):
        assert validate_cpf("014.041.313-88") is True

    def test_cpf_invalido(self):
        assert validate_cpf("000.000.000-00") is False

    def test_cpf_sequencial(self):
        assert validate_cpf("111.111.111-11") is False

class TestTamSamSom:
    def test_valid_order(self):
        assert validate_tam_sam_som("acima_200mi", "5_10mi", "1_5mi") is True

    def test_invalid_tam_lt_sam(self):
        assert validate_tam_sam_som("1_5mi", "5_10mi", "500k_1mi") is False

    def test_invalid_sam_lt_som(self):
        assert validate_tam_sam_som("10_50mi", "1_5mi", "5_10mi") is False
```

### 2.4 Testes de Integração — API

```python
# tests/test_api_startups.py

class TestStartupsAPI:
    async def test_list_startups_requires_auth(self, client):
        response = await client.get("/api/v1/startups")
        assert response.status_code == 401

    async def test_list_startups_as_analyst(self, client, analyst_token):
        response = await client.get("/api/v1/startups",
                                     headers={"Authorization": f"Bearer {analyst_token}"})
        assert response.status_code == 200
        assert "data" in response.json()

    async def test_startup_detail(self, client, analyst_token, created_startup):
        response = await client.get(f"/api/v1/startups/{created_startup.id}",
                                     headers={"Authorization": f"Bearer {analyst_token}"})
        assert response.status_code == 200
        assert response.json()["data"]["nome_startup"] == created_startup.nome_startup

    async def test_update_status_valid_transition(self, client, analyst_token, pending_startup):
        response = await client.patch(
            f"/api/v1/startups/{pending_startup.id}/status",
            json={"status": "em_analise"},
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 200

    async def test_update_status_invalid_transition(self, client, analyst_token, pending_startup):
        response = await client.patch(
            f"/api/v1/startups/{pending_startup.id}/status",
            json={"status": "aprovado"},  # pendente → aprovado não é válido
            headers={"Authorization": f"Bearer {analyst_token}"}
        )
        assert response.status_code == 422

    async def test_compare_startups(self, client, analyst_token):
        response = await client.get("/api/v1/startups/compare?ids=1,2,3",
                                     headers={"Authorization": f"Bearer {analyst_token}"})
        assert response.status_code == 200

    async def test_compare_max_5(self, client, analyst_token):
        response = await client.get("/api/v1/startups/compare?ids=1,2,3,4,5,6",
                                     headers={"Authorization": f"Bearer {analyst_token}"})
        assert response.status_code == 400

class TestAuthAPI:
    async def test_login_success(self, client, registered_user):
        response = await client.post("/api/v1/auth/login",
                                      json={"email": "test@bci.com", "password": "Test@123"})
        assert response.status_code == 200
        assert "access_token" in response.json()

    async def test_login_wrong_password(self, client, registered_user):
        response = await client.post("/api/v1/auth/login",
                                      json={"email": "test@bci.com", "password": "wrong"})
        assert response.status_code == 401

class TestRBACPermissions:
    async def test_startup_cannot_list_all(self, client, startup_token):
        response = await client.get("/api/v1/startups",
                                     headers={"Authorization": f"Bearer {startup_token}"})
        assert response.status_code == 403

    async def test_analyst_cannot_manage_users(self, client, analyst_token):
        response = await client.get("/api/v1/users",
                                     headers={"Authorization": f"Bearer {analyst_token}"})
        assert response.status_code == 403

    async def test_admin_can_manage_users(self, client, admin_token):
        response = await client.get("/api/v1/users",
                                     headers={"Authorization": f"Bearer {admin_token}"})
        assert response.status_code == 200
```

---

## 3. Frontend — React (Vitest + React Testing Library)

### 3.1 Configuração

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: { provider: 'v8', reporter: ['text', 'lcov'], thresholds: { lines: 70 } },
  },
});
```

### 3.2 Testes de Componentes

```typescript
// ScoreBadge.test.tsx
describe('ScoreBadge', () => {
  it('renders S classification with purple color', () => {
    render(<ScoreBadge score={950} classification="S" />);
    expect(screen.getByText('S • 950')).toBeInTheDocument();
  });

  it('renders correct color for each classification', () => {
    const cases = [
      { classification: 'S', expectedColor: '#7C5CFC' },
      { classification: 'A', expectedColor: '#00C48C' },
      { classification: 'E', expectedColor: '#FF4757' },
    ];
    // ...
  });
});

// KPICard.test.tsx
describe('KPICard', () => {
  it('displays value and label', () => {
    render(<KPICard value={127} label="Total Startups" icon={<RocketIcon />} />);
    expect(screen.getByText('127')).toBeInTheDocument();
    expect(screen.getByText('Total Startups')).toBeInTheDocument();
  });

  it('shows positive trend indicator', () => {
    render(<KPICard value={127} label="Total" trend={{ value: 12, direction: 'up' }} />);
    expect(screen.getByText('↑ 12%')).toBeInTheDocument();
  });
});
```

---

## 4. Testes E2E (Playwright)

```typescript
// e2e/login-flow.spec.ts
test('analyst can login and view dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'analyst@bci.com');
  await page.fill('[data-testid="password-input"]', 'Test@123');
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL('/analyst/dashboard');
  await expect(page.locator('[data-testid="kpi-total"]')).toBeVisible();
});

// e2e/score-calculation.spec.ts
test('score is calculated and displayed after status change', async ({ page }) => {
  await loginAsAnalyst(page);
  await page.goto('/analyst/startups/1');
  await expect(page.locator('[data-testid="score-total"]')).toBeVisible();
  const score = await page.locator('[data-testid="score-total"]').textContent();
  expect(Number(score)).toBeGreaterThan(0);
  expect(Number(score)).toBeLessThanOrEqual(1000);
});
```

---

## 5. Qualidade de Código

### Linting e Formatting
```json
// Backend: pyproject.toml
[tool.ruff]
line-length = 100
select = ["E", "F", "I", "N", "W"]

[tool.mypy]
strict = true

// Frontend: .eslintrc + prettier
```

### CI Pipeline (GitHub Actions)

```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env: { MYSQL_ROOT_PASSWORD: test, MYSQL_DATABASE: bci_test }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pip install -r requirements.txt -r requirements-test.txt
      - run: ruff check .
      - run: mypy app/
      - run: pytest --cov=app --cov-report=xml -v
      - uses: codecov/codecov-action@v3

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test -- --coverage
```

---

## 6. Regras de Negócio — Validação

| Regra | Teste | Tipo |
|-------|-------|------|
| TAM ≥ SAM ≥ SOM | Validador unitário + API integration | Unit + Integration |
| Transições de status válidas | Cada transição permitida e proibida | Integration |
| Score 0-1000 | Boundary values | Unit |
| Classificação correta | Cada faixa (0, 200, 201, 400, ..., 1000) | Unit |
| Pesos somam 100% | Constante | Unit |
| CPF válido | Algoritmo + casos edge | Unit |
| Upload: tipo e tamanho | Mock file upload | Integration |
| RBAC: cada role | Cada endpoint × cada role | Integration |
| Ranking ordenado | Score DESC, desempates | Integration |
| Auditoria registrada | Ações críticas geram log | Integration |

---

## 7. Comandos

```bash
# Backend
pytest                           # Todos os testes
pytest -v --tb=short             # Verboso
pytest --cov=app --cov-report=html  # Cobertura com HTML
pytest -k "test_scoring"         # Apenas scoring
pytest -x                        # Para no primeiro erro

# Frontend
npm run test                     # Vitest
npm run test -- --coverage       # Com cobertura
npm run test:e2e                 # Playwright E2E
npm run lint                     # ESLint
npm run typecheck                # TypeScript check
```
