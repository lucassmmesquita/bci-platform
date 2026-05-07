# Security & Authentication — BCI Ventures Platform

## 1. Visão Geral

A plataforma é um sistema gerencial interno do time de inovação BCI. A segurança foca em proteger dados sensíveis de startups (CPF, dados financeiros), controlar acesso por papel (RBAC) e garantir compliance LGPD.

---

## 2. Autenticação

### 2.1 Fluxo JWT

```
1. POST /api/v1/auth/login { email, password }
2. Servidor valida credenciais → gera access_token (30min) + refresh_token (7 dias)
3. Client armazena tokens (httpOnly cookie ou memory)
4. Requests autenticados: Authorization: Bearer <access_token>
5. Token expirado → POST /api/v1/auth/refresh { refresh_token }
6. Logout → blacklist do refresh_token no Redis
```

### 2.2 Tokens

| Token | Duração | Storage | Conteúdo (payload) |
|-------|---------|---------|-------------------|
| Access Token | 30 min | Memory (Zustand) | user_id, role, email, iat, exp |
| Refresh Token | 7 dias | httpOnly cookie | user_id, jti (unique ID), exp |

### 2.3 Hash de Senhas

```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Criar hash
hash = pwd_context.hash(password)
# Verificar
pwd_context.verify(plain_password, hashed_password)
```

**Regras de senha:** Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial.

---

## 3. Autorização (RBAC)

### 3.1 Papéis e Permissões

| Recurso | startup | analyst | manager | executive | investor | admin |
|---------|---------|---------|---------|-----------|----------|-------|
| Ver próprios dados | ✅ (read-only) | — | — | — | — | ✅ |
| Ver feedback/notas do próprio projeto | ✅ (read-only) | — | — | — | — | ✅ |
| Ver score do próprio projeto | ✅* | — | — | — | — | ✅ |
| Baixar relatório do próprio projeto | ✅ (PDF) | — | — | — | — | ✅ |
| Listar startups | ❌ | ✅ | ✅ | ✅ | ✅** | ✅ |
| Detalhes startup (qualquer) | ❌ | ✅ | ✅ | ✅ | ✅** | ✅ |
| Alterar status | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Ver score detalhado | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Recalcular score | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Override score | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Dashboard analista | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Dashboard executivo | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Relatórios (geral) | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Pipeline (Kanban) | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Gerenciar usuários | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Config scoring | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

*Startup: score visível somente após liberação pelo analista (flag `score_visible_to_startup`).
**Investidor: acesso limitado a startups aprovadas no deal flow.

### 3.2 Implementação

```python
# app/core/permissions.py
from functools import wraps
from fastapi import HTTPException, Depends

def require_roles(*roles: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, current_user=Depends(get_current_user), **kwargs):
            if current_user.role not in roles:
                raise HTTPException(403, "Acesso negado")
            return await func(*args, current_user=current_user, **kwargs)
        return wrapper
    return decorator

# Uso no endpoint
@router.get("/startups")
@require_roles("analyst", "manager", "executive", "admin")
async def list_startups(...):
    ...
```

---

## 4. Proteção de Dados (LGPD)

### 4.1 Dados Sensíveis — Criptografia em Repouso

| Campo | Método | Coluna no DB |
|-------|--------|-------------|
| CPF | AES-256-GCM | `cpf_encrypted` (VARBINARY) + `cpf_hash` (SHA-256 para busca) |
| Telefone | AES-256-GCM | `telefone_encrypted` (VARBINARY) |
| Email | Texto plano (necessário para login) | `email` (com índice) |

```python
# app/core/encryption.py
from cryptography.fernet import Fernet  # ou AES-256-GCM

class DataEncryptor:
    def __init__(self, key: str):
        self.cipher = Fernet(key)

    def encrypt(self, data: str) -> bytes:
        return self.cipher.encrypt(data.encode())

    def decrypt(self, encrypted: bytes) -> str:
        return self.cipher.decrypt(encrypted).decode()

    @staticmethod
    def hash_for_search(data: str) -> str:
        """SHA-256 para busca sem descriptografia."""
        import hashlib
        return hashlib.sha256(data.encode()).hexdigest()
```

### 4.2 Consentimento

- Termos de uso aceitos no cadastro (registrados com timestamp)
- Log de consentimento imutável
- Endpoint para solicitação de exclusão de dados (LGPD Art. 18)

### 4.3 Direito de Exclusão

```python
@router.delete("/users/me/data")
@require_roles("startup")
async def request_data_deletion(current_user = Depends(get_current_user)):
    """
    1. Marca conta como 'deletion_requested'
    2. Admin revisa e aprova (30 dias)
    3. Dados pessoais anonimizados (CPF → '***', nome → 'Anônimo')
    4. Dados de startup mantidos de forma anonimizada para analytics
    5. Log de exclusão criado
    """
```

---

## 5. Segurança de API

### 5.1 Rate Limiting

```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/auth/login")
@limiter.limit("5/minute")  # Previne brute force
async def login(...): ...

@app.get("/api/v1/startups")
@limiter.limit("60/minute")  # Uso normal
async def list_startups(...): ...
```

### 5.2 Validação de Input

- Todos os inputs validados via Pydantic schemas
- Sanitização contra SQL injection (SQLAlchemy parameterized queries)
- Sanitização contra XSS (escapamento no frontend)
- Tamanho máximo de payload: 25MB (para uploads)
- Content-Type validation em uploads

### 5.3 Headers de Segurança

```python
# Middleware de segurança
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

### 5.4 CORS

```python
CORS_ORIGINS = [
    "https://platform.bciventures.com.br",  # Produção
    "http://localhost:5173",                  # Dev
]
```

---

## 6. Auditoria

### O que é logado:

| Ação | Campos Registrados |
|------|--------------------|
| Login/Logout | user_id, IP, user_agent, timestamp |
| Alteração de status | startup_id, old→new status, user_id |
| Score calculado/alterado | startup_id, score anterior/novo, tipo (auto/manual) |
| Acesso a dados sensíveis | user_id, campo acessado, startup_id |
| Movimentação de pipeline | startup_id, from→to stage |
| Download de documento | doc_id, user_id |
| Exportação de relatório | tipo, filtros, user_id |

### Retenção: 2 anos (compliance) com possibilidade de extensão.

---

## 7. Segurança de Uploads

```python
ALLOWED_MIME_TYPES = {
    'application/pdf', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

async def validate_upload(file: UploadFile):
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(400, "Tipo de arquivo não permitido")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "Arquivo excede 20MB")
    # Verificar magic bytes (não confiar apenas no content-type)
    await file.seek(0)
```

---

## 8. Checklist OWASP Top 10

| # | Vulnerabilidade | Mitigação |
|---|----------------|-----------|
| A01 | Broken Access Control | RBAC + testes de autorização |
| A02 | Cryptographic Failures | AES-256, bcrypt, HTTPS |
| A03 | Injection | SQLAlchemy ORM, Pydantic validation |
| A04 | Insecure Design | Threat modeling, code review |
| A05 | Security Misconfiguration | Env vars, no debug em prod |
| A06 | Vulnerable Components | Dependabot, pip-audit |
| A07 | Auth Failures | JWT + refresh, rate limiting |
| A08 | Data Integrity | Audit logs, input validation |
| A09 | Logging Failures | Structured logging, Sentry |
| A10 | SSRF | URL validation, allowlist |
