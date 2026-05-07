<p align="center">
  <img src="frontend/src/assets/logo/BCI_Logo_B.svg" width="200" alt="BCI Ventures" />
</p>

<h1 align="center">BCI Ventures Platform</h1>

<p align="center">
  Plataforma interna de avaliação, scoring e gestão de startups para o time de inovação da <strong>BCI Ventures</strong> — uma Corporate Venture Builder posicionada como Smart Venture Studio as a Service.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=white" />
</p>

---

## Visão Geral

A **BCI Ventures Platform** é uma aplicação web gerencial destinada ao time de inovação da BCI Ventures. As startups se cadastram pelo site externo [bciventures.com.br](https://bciventures.com.br/), e a plataforma consome esses dados oferecendo ferramentas para:

- **Avaliação algorítmica** — Score multidimensional proprietário (Startup + Produto)
- **Ranking inteligente** — Classificação automática por score consolidado
- **Pipeline visual** — Kanban com estágios do funil de venture building
- **Análise comparativa** — Comparação lado a lado de até 5 startups
- **Relatórios executivos** — Exportação em PDF com dados consolidados
- **Deal flow** — Fluxo de oportunidades para investidores e executivos

---

## Arquitetura

```
┌──────────────────────────┐
│  Site BCI (cadastro)     │
│  bciventures.com.br      │
│  MySQL + FTP uploads     │
└────────────┬─────────────┘
             │
     ┌───────┴───────┐
     │  PHP Bridge   │  ← Proxy de acesso ao MySQL (bypass firewall 3306)
     │  api_bridge.php│
     └───────┬───────┘
             │ HTTPS
     ┌───────┴───────┐
     │   Backend     │  ← FastAPI (Python 3.11)
     │   Render.com  │     Endpoints REST /api/v1/*
     │               │     FTP Service (documentos)
     └───────┬───────┘
             │ HTTPS
     ┌───────┴───────┐
     │   Frontend    │  ← React + Vite
     │   /admin/     │     SPA hospedado no FTP
     │   FTP Server  │
     └───────────────┘
```

### Fluxo de dados

```
Startup cadastra no site → MySQL (tabela formulario_startups_bci)
                                    ↓
                          PHP Bridge (api_bridge.php)
                                    ↓
                          Backend FastAPI (Render)
                                    ↓
                          Frontend React (/admin/)
```

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18, Vite, Recharts, Lucide Icons, D3.js |
| **Backend** | Python 3.11, FastAPI, Pydantic, SQLAlchemy |
| **Banco de dados** | MySQL 8.0 (hospedado em srv36.prodns.com.br) |
| **Storage** | FTP (documentos em /public_html/uploads) |
| **API Bridge** | PHP (proxy MySQL para bypass de firewall) |
| **Hosting Backend** | Render (Web Service) |
| **Hosting Frontend** | FTP (bciventures.com.br/admin/) |
| **Repositório** | GitHub |

---

## Estrutura do Projeto

```
bci/
├── backend/                    # API FastAPI
│   ├── app/
│   │   ├── api/v1/             # Endpoints (startups, files)
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Bridge, FTP, Startup services
│   │   ├── utils/              # Parsers e helpers
│   │   ├── config.py           # Configurações (env vars)
│   │   └── main.py             # App factory + CORS + health
│   ├── api_bridge.php          # PHP proxy para MySQL
│   ├── requirements.txt        # Dependências Python
│   ├── Procfile                # Start command (Render)
│   └── .env.example            # Template de variáveis
│
├── frontend/                   # SPA React
│   ├── src/
│   │   ├── components/         # UI components (Card, KPI, Badge, Graph)
│   │   ├── pages/              # Pages (Dashboard, List, Detail, Kanban...)
│   │   ├── services/           # API client + startupService
│   │   ├── mocks/              # Mock data (scores, dashboard)
│   │   ├── contexts/           # AuthContext
│   │   ├── constants/          # Enums, dimensions, labels
│   │   └── utils/              # Formatters
│   ├── .env.development        # API URL local
│   ├── .env.production         # API URL Render
│   └── vite.config.js          # Build config (base: /admin/)
│
├── render.yaml                 # Blueprint de deploy (Render)
└── .gitignore
```

---

## Módulos

### 📊 Dashboard do Analista
KPIs consolidados, pipeline por estágio, distribuição por setor e grafo interativo de ecossistema (D3.js) conectando startups a tendências tecnológicas.

### 📋 Listagem de Startups
Tabela paginada com filtros por setor, estágio e status. Busca textual, ordenação por coluna e seleção para comparação.

### 🔍 Detalhe da Startup
Perfil completo organizado em abas: Dados (fundador, startup, mercado, finanças), Score (radar chart), Documentos (download do FTP), Pipeline, Notas e Histórico.

### 📈 Scoring
Algoritmo de avaliação com 14 dimensões (7 Startup + 7 Produto), pesos configuráveis, penalidade de risco, nível de confiança e recomendação de ação.

### 🏆 Ranking
Ranking ordenado por score consolidado com classificação por letra (S/A/B/C/D/E) e badges visuais.

### 🔄 Pipeline Kanban
Visualização de estágios do funil: Inscrição → Triagem → Avaliação → Shortlist → Negociação → Aprovação → Onboarding.

### 📄 Relatórios
Exportação de relatórios individuais e comparativos em PDF com formatação profissional.

---

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/v1/startups` | Lista paginada com filtros |
| `GET` | `/api/v1/startups/{id}` | Detalhe completo |
| `GET` | `/api/v1/startups/stats` | KPIs consolidados |
| `GET` | `/api/v1/startups/{id}/documents` | Metadados de documentos |
| `GET` | `/api/v1/files` | Lista arquivos no FTP |
| `GET` | `/api/v1/files/{filename}` | Download de arquivo |
| `GET` | `/health` | Health check geral |
| `GET` | `/health/db` | Status da conexão com DB |
| `GET` | `/health/ftp` | Status da conexão FTP |

Documentação Swagger: `/api/docs`

---

## Personas

| Persona | Acesso |
|---------|--------|
| **Analista de Inovação** | Dashboard, avaliação, scoring, relatórios, pipeline |
| **Executivo / C-Level** | Dashboard executivo, rankings, KPIs, comparativos |
| **Investidor / LP** | Deal flow, análise de risco, filtros por tese |
| **Fundador (Startup)** | Portal read-only: dados cadastrados, status, feedback |
| **Administrador** | Gestão de usuários, configuração de score, auditoria |

---

## Licença

Projeto proprietário — **BCI Ventures** © 2026. Todos os direitos reservados.
