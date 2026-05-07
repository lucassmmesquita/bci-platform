# Database MySQL — BCI Ventures Platform

## 1. Visão Geral

O banco de dados MySQL 8.0+ é o repositório central da plataforma BCI Ventures. Este documento parte da estrutura existente no CSV (`formulario_startups_bci.csv`) e propõe uma modelagem normalizada, extensível e otimizada para as necessidades da plataforma.

### Premissas
- Os dados do CSV já existem em um banco MySQL
- A migração será incremental (sem perda de dados)
- Character set: `utf8mb4` / Collation: `utf8mb4_unicode_ci`
- Engine: InnoDB (suporte a transações e FK)

---

## 2. Mapeamento CSV → Banco Normalizado

### Estrutura Atual (CSV — tabela monolítica)

O CSV possui uma única tabela com 47 colunas contendo dados do fundador, startup, mercado, finanças, equipe, documentos e status. Os campos JSON armazenam arrays (canais, tipo_apoio, termos) e objetos (pitch_deck, cap_table, plano_financeiro).

### Problemas Identificados
1. **Desnormalização:** Dados do fundador misturados com dados da startup
2. **Campos JSON:** Arrays e objetos em colunas (canais, documentos)
3. **Ausência de tabelas de apoio:** Setores, estágios e enums em texto livre
4. **Sem controle de acesso:** Sem tabela de usuários
5. **Sem histórico:** Sem auditoria ou versionamento
6. **Sem CNPJ:** Identificação fraca de startups

---

## 3. Modelo Proposto (Normalizado)

### Diagrama ER Resumido

```
users ──────── founders ──────── startups ──────── scores
  │                                  │                │
  │                                  ├── documents    │
  │                                  ├── notes        │
  │                                  ├── pipeline_history
  │                                  └── startup_channels
  │
  └── audit_logs
```

---

## 4. DDL — Criação das Tabelas

### 4.1 Usuários e Autenticação

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('startup', 'analyst', 'manager', 'executive', 'investor', 'admin') NOT NULL DEFAULT 'startup',
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_token (token),
    INDEX idx_refresh_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 Fundadores

```sql
CREATE TABLE founders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cpf_encrypted VARBINARY(512) NOT NULL,  -- AES-256
    cpf_hash VARCHAR(64) NOT NULL,           -- SHA-256 para busca
    nascimento DATE NOT NULL,
    telefone_encrypted VARBINARY(512) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_founders_cpf_hash (cpf_hash),
    INDEX idx_founders_cidade (cidade)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.3 Startups

```sql
CREATE TABLE startups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    founder_id INT NOT NULL,
    nome_startup VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) NULL UNIQUE,
    descricao TEXT NOT NULL,
    setor ENUM(
        'deeptech','retailtech','fintech','healthtech','edtech',
        'agritech','legaltech','proptech','foodtech','logtech',
        'insurtech','govtech','hrtech','martech','cleantech',
        'biotech','cybersecurity','ai_ml','iot','blockchain',
        'saas','marketplace','social_impact','outro'
    ) NOT NULL,
    problema VARCHAR(100) NOT NULL,
    problema_outro VARCHAR(255) NULL,
    tecnologia VARCHAR(100) NOT NULL,
    tecnologia_outra VARCHAR(255) NULL,
    estagio ENUM(
        'ideacao','pre_seed','mvp_validado','tracao_inicial',
        'crescimento','escala','consolidado'
    ) NOT NULL,
    publico ENUM('b2b','b2c','b2g','b2b2c','outro') NOT NULL,
    publico_outro VARCHAR(255) NULL,
    tam VARCHAR(50) NOT NULL,
    sam VARCHAR(50) NOT NULL,
    som VARCHAR(50) NOT NULL,
    concorrentes TEXT NOT NULL,
    diferencial VARCHAR(100) NOT NULL,
    diferencial_outro VARCHAR(255) NULL,
    faturamento_atual VARCHAR(50) NOT NULL,
    previsao_faturamento VARCHAR(50) NOT NULL,
    valuation VARCHAR(50) NOT NULL,
    investimento_desejado VARCHAR(50) NOT NULL,
    recursos_disponiveis VARCHAR(100) NULL,
    captacao_anterior VARCHAR(255) NULL,
    riscos TEXT NULL,
    riscos_outro TEXT NULL,
    estrutura_juridica VARCHAR(100) NULL,
    numero_integrantes INT NOT NULL DEFAULT 1,
    linkedin_equipe TEXT NULL,
    experiencia_equipe TEXT NULL,
    vinculo_parentesco ENUM('sim','nao') DEFAULT 'nao',
    nivel_envolvimento VARCHAR(50) NULL,
    mvp_links TEXT NULL,
    status ENUM('pendente','em_analise','aprovado','rejeitado') DEFAULT 'pendente',
    pipeline_stage ENUM(
        'inscricao','triagem','avaliacao','shortlist',
        'negociacao','aprovacao','onboarding','acompanhamento'
    ) DEFAULT 'inscricao',
    assigned_analyst_id INT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (founder_id) REFERENCES founders(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_analyst_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_startups_setor (setor),
    INDEX idx_startups_estagio (estagio),
    INDEX idx_startups_status (status),
    INDEX idx_startups_pipeline (pipeline_stage),
    INDEX idx_startups_data (data_criacao),
    FULLTEXT INDEX idx_startups_search (nome_startup, descricao, concorrentes)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.4 Canais e Tipo de Apoio (tabelas de relacionamento)

```sql
CREATE TABLE startup_channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    channel ENUM(
        'midias_sociais','parcerias','marketplace','marketing_conteudo',
        'vendas_diretas','eventos','indicacao','seo_sem','outro'
    ) NOT NULL,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_channel_unique (startup_id, channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE startup_support_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    support_type ENUM(
        'produto','tecnologia','captacao','juridico',
        'marketing','gestao','comercial','outro'
    ) NOT NULL,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_support_unique (startup_id, support_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE startup_terms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    term_type ENUM(
        'informacoes_verdadeiras','autorizo_contato','concordo_termos'
    ) NOT NULL,
    accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_term_unique (startup_id, term_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.5 Documentos

```sql
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    doc_type ENUM('pitch_deck','cap_table','plano_financeiro','outro') NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT TRUE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by_id INT NOT NULL,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id),
    INDEX idx_docs_startup (startup_id),
    INDEX idx_docs_type (doc_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.6 Scores

```sql
CREATE TABLE scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    total_score DECIMAL(6,2) NOT NULL,
    classification CHAR(1) NOT NULL,

    -- Dimensões (0-100)
    dim_inovacao DECIMAL(5,2) NOT NULL,
    dim_mercado DECIMAL(5,2) NOT NULL,
    dim_tracao DECIMAL(5,2) NOT NULL,
    dim_equipe DECIMAL(5,2) NOT NULL,
    dim_tecnologia DECIMAL(5,2) NOT NULL,
    dim_modelo_negocio DECIMAL(5,2) NOT NULL,
    dim_financas DECIMAL(5,2) NOT NULL,
    dim_competitividade DECIMAL(5,2) NOT NULL,
    dim_impacto DECIMAL(5,2) NOT NULL,
    dim_risco DECIMAL(5,2) NOT NULL,

    justificativas JSON NULL,
    is_manual_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT NULL,
    algorithm_version VARCHAR(20) DEFAULT 'v1.0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by_id INT NULL,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_scores_startup (startup_id),
    INDEX idx_scores_total (total_score DESC),
    INDEX idx_scores_class (classification)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.7 Pipeline e Histórico

```sql
CREATE TABLE pipeline_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    from_stage VARCHAR(50) NULL,
    to_stage VARCHAR(50) NOT NULL,
    changed_by_id INT NOT NULL,
    reason TEXT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users(id),
    INDEX idx_pipeline_startup (startup_id),
    INDEX idx_pipeline_date (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.8 Notas e Comentários

```sql
CREATE TABLE startup_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    startup_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id),
    INDEX idx_notes_startup (startup_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.9 Auditoria

```sql
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(512) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_date (created_at),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.10 Relatórios Gerados

```sql
CREATE TABLE generated_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('individual','comparison','pipeline','dealflow','portfolio') NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_format ENUM('pdf','xlsx','csv') NOT NULL DEFAULT 'pdf',
    parameters JSON NULL,
    generated_by_id INT NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by_id) REFERENCES users(id),
    INDEX idx_reports_type (report_type),
    INDEX idx_reports_date (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 5. Script de Migração (CSV → Normalizado)

```sql
-- Passo 1: Criar usuários para cada fundador único no CSV
INSERT INTO users (email, password_hash, role, full_name)
SELECT DISTINCT email, 'TEMP_HASH_REQUIRES_RESET', 'startup', nome
FROM formulario_startups_bci;

-- Passo 2: Criar fundadores
INSERT INTO founders (user_id, nome, cpf_encrypted, cpf_hash, nascimento, telefone_encrypted, cidade)
SELECT u.id, f.nome, AES_ENCRYPT(f.cpf, @aes_key), SHA2(f.cpf, 256),
       f.nascimento, AES_ENCRYPT(f.telefone, @aes_key), f.cidade
FROM formulario_startups_bci f
JOIN users u ON u.email = f.email;

-- Passo 3: Criar startups (mapeando campos)
INSERT INTO startups (founder_id, nome_startup, descricao, setor, ...)
SELECT fo.id, f.nome_startup, f.descricao, LOWER(f.setorStartup), ...
FROM formulario_startups_bci f
JOIN founders fo ON fo.cpf_hash = SHA2(f.cpf, 256);

-- Passo 4: Extrair canais do JSON para tabela de relacionamento
-- (requer procedure ou script Python para parse do JSON)

-- Passo 5: Migrar documentos (parse do JSON de uploads)
-- (requer script Python para extrair metadados e registrar na tabela documents)
```

---

## 6. Índices e Otimização

### Índices Compostos para Queries Frequentes
```sql
-- Ranking por setor e score
CREATE INDEX idx_ranking_setor ON scores(startup_id, total_score DESC);

-- Filtro de pipeline
CREATE INDEX idx_pipeline_filter ON startups(pipeline_stage, status, setor);

-- Dashboard: distribuição temporal
CREATE INDEX idx_temporal ON startups(data_criacao, setor, estagio);
```

### Views Materializadas (para dashboards)

```sql
-- View: Ranking com dados da startup
CREATE VIEW v_ranking AS
SELECT s.id, s.nome_startup, s.setor, s.estagio, s.status,
       sc.total_score, sc.classification,
       sc.dim_inovacao, sc.dim_mercado, sc.dim_tracao,
       f.nome AS founder_name, f.cidade
FROM startups s
JOIN scores sc ON sc.startup_id = s.id
    AND sc.id = (SELECT MAX(id) FROM scores WHERE startup_id = s.id)
JOIN founders f ON f.id = s.founder_id
ORDER BY sc.total_score DESC;

-- View: KPIs consolidados
CREATE VIEW v_kpis AS
SELECT
    COUNT(*) AS total_startups,
    AVG(sc.total_score) AS avg_score,
    SUM(CASE WHEN s.status = 'aprovado' THEN 1 ELSE 0 END) AS total_approved,
    SUM(CASE WHEN s.status = 'rejeitado' THEN 1 ELSE 0 END) AS total_rejected,
    SUM(CASE WHEN s.status = 'pendente' THEN 1 ELSE 0 END) AS total_pending
FROM startups s
LEFT JOIN scores sc ON sc.startup_id = s.id
    AND sc.id = (SELECT MAX(id) FROM scores WHERE startup_id = s.id);
```

---

## 7. Backup e Manutenção

```bash
# Backup diário automatizado
mysqldump -u bci_user -p bci_ventures \
  --single-transaction --routines --triggers \
  --result-file=/backups/bci_$(date +%Y%m%d).sql

# Retenção: 90 dias
find /backups -name "bci_*.sql" -mtime +90 -delete
```

---

## 8. Evolução Futura

| Tabela | Descrição | Prioridade |
|--------|-----------|------------|
| `programs` | Programas de inovação (multi-tenant) | Fase 3 |
| `program_startups` | Relação startup-programa | Fase 3 |
| `investor_interests` | Manifestações de interesse de investidores | Fase 3 |
| `integrations_log` | Log de integrações externas | Fase 4 |
| `scoring_configs` | Configuração dinâmica de pesos do score | Fase 2 |
| `notifications` | Sistema de notificações | Fase 2 |
| `team_members` | Membros da equipe da startup (normalizado) | Fase 2 |
