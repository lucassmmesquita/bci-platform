# PRD — BCI Ventures Platform

## 1. Visão Geral

A **BCI Ventures Platform** é uma aplicação web **gerencial e interna** destinada ao time de inovação da BCI Ventures — uma Corporate Venture Builder posicionada como **Smart Venture Studio as a Service**. A plataforma **não é o ponto de cadastro das startups** — as startups já se cadastram e enviam seus projetos pelo site externo [bciventures.com.br](https://bciventures.com.br/). A plataforma consome esses dados cadastrados e oferece ferramentas para avaliação, scoring, ranking, análise comparativa e tomada de decisão estratégica.

### 1.1 Propósito

Receber os dados de startups já cadastradas no site da BCI, avaliar esses projetos por meio de um algoritmo de score proprietário, e fornecer inteligência acionável ao time de inovação para apoiar decisões estratégicas de:

- Aquisição (M&A)
- Fusão e Incorporação
- Investimento Direto
- Participação Societária (Equity)
- Parcerias Estratégicas
- Programas de Inovação Aberta

### 1.2 Posicionamento Estratégico

```
Site BCI (cadastro externo) → Plataforma (importação) → Avaliação (Score) → Ranking → Decisão Estratégica → Deal Flow
```

A plataforma transforma dados brutos de startups (já cadastrados no site) em inteligência acionável para analistas, gestores e executivos do time BCI.

---

## 2. Objetivos do Produto

| # | Objetivo | Métrica de Sucesso |
|---|----------|--------------------|
| O1 | Importar e centralizar dados de startups cadastradas no site | 100% dos cadastros sincronizados automaticamente |
| O2 | Automatizar avaliação de oportunidades | Score calculado em < 5s após cadastro completo |
| O3 | Rankear startups para decisão executiva | Dashboard com ranking atualizado em tempo real |
| O4 | Gerar relatórios executivos | Exportação PDF/Excel em < 10s |
| O5 | Estruturar pipeline de venture building | Visualização Kanban do funil de inovação |
| O6 | Suportar análise comparativa | Comparação lado a lado de até 5 startups |
| O7 | Garantir segurança e compliance | LGPD compliant, dados criptografados |
| O8 | Escalar para múltiplos programas | Multi-tenant por programa/vertical |

---

## 3. Personas

### 3.1 Fundador / CEO de Startup *(acesso somente leitura)*
- **Perfil:** Empreendedor entre 25-45 anos, tech-savvy
- **Necessidades:** Visualizar os dados do seu projeto, acompanhar o status da avaliação, ver o feedback da equipe BCI e baixar o relatório de análise
- **Dor:** Processos burocráticos, falta de transparência e ausência de feedback estruturado
- **Jornada:** Cadastro via site bciventures.com.br → Login na plataforma (read-only) → Visualiza dados cadastrados → Vê feedback/notas da equipe BCI → Baixa relatório de análise em PDF
- **Nota:** O cadastro do projeto continua sendo feito no site externo. Na plataforma, o fundador tem acesso **somente leitura** ao seu próprio projeto, feedback recebido e download do relatório de avaliação.

### 3.2 Analista de Inovação (BCI)
- **Perfil:** Profissional de inovação, 28-40 anos, background em negócios/tecnologia
- **Necessidades:** Avaliar startups, gerar scores, comparar oportunidades, criar relatórios
- **Dor:** Dados fragmentados em planilhas, falta de padronização na avaliação
- **Jornada:** Login → Dashboard → Análise de startups → Score review → Relatório → Recomendação

### 3.3 Tomador de Decisão / C-Level
- **Perfil:** Executivo sênior, 40-60 anos, foco em resultados estratégicos
- **Necessidades:** Visão consolidada do pipeline, rankings, KPIs, relatórios executivos
- **Dor:** Falta de dados estruturados para decisão de investimento
- **Jornada:** Login → Dashboard executivo → Ranking → Comparativo → Decisão → Aprovação

### 3.4 Investidor / LP
- **Perfil:** Investidor institucional ou anjo, foco em retorno e risco
- **Necessidades:** Acesso ao deal flow qualificado, análise de risco, due diligence
- **Dor:** Falta de pipeline qualificado e estruturado
- **Jornada:** Login → Deal flow → Filtro por setor/score → Análise detalhada → Manifestação de interesse

### 3.5 Administrador da Plataforma
- **Perfil:** Tech lead ou product owner da BCI
- **Necessidades:** Gerenciar usuários, configurar parâmetros do score, monitorar sistema
- **Dor:** Manutenção de múltiplas ferramentas desconectadas
- **Jornada:** Login → Admin panel → Configurações → Monitoramento → Ajustes

---

## 4. Módulos da Plataforma

### 4.1 Módulo de Importação e Visualização de Startups

**Descrição:** Os dados das startups são cadastrados no site externo (bciventures.com.br) e importados automaticamente para a plataforma. Este módulo permite ao time BCI visualizar, filtrar e gerenciar os dados importados.

**Fonte de dados:** Tabela MySQL compartilhada com o site externo (ou sincronização via webhook/API).

**Campos importados do cadastro (CSV existente):**

#### Dados do Fundador
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome | text | Sim | Min 3 caracteres |
| cpf | masked text | Sim | CPF válido (algoritmo) |
| nascimento | date | Sim | Idade ≥ 18 anos |
| telefone | masked text | Sim | Formato (XX) XXXXX-XXXX |
| email | email | Sim | Email válido |
| cidade | text | Sim | Autocomplete de cidades |

#### Dados da Startup
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome_startup | text | Sim | Min 2 caracteres |
| descricao | textarea | Sim | Min 50, max 2000 caracteres |
| setorStartup | select | Sim | Enum de setores |
| problema | select | Sim | Enum de problemas |
| problema_outro | text | Condicional | Se problema = "outro" |
| tecnologia | select | Sim | Enum de tecnologias |
| tecnologia_outra | text | Condicional | Se tecnologia = "outra" |
| estagio | select | Sim | Enum de estágios |

#### Mercado e Público
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| publico | select | Sim | B2B, B2C, B2G, B2B2C |
| publico_outro | text | Condicional | Se publico = "outro" |
| canais | multi-select | Sim | Array de canais |
| tam | select | Sim | Faixas de valor |
| sam | select | Sim | Faixas de valor |
| som | select | Sim | Faixas de valor |
| concorrentes | textarea | Sim | Min 10 caracteres |

#### Diferenciais e Finanças
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| diferencial | select | Sim | Enum de diferenciais |
| diferencial_outro | text | Condicional | Se diferencial = "outro" |
| faturamento_atual | select | Sim | Faixas de valor |
| previsao_faturamento | select | Sim | Faixas de valor |
| valuation | select | Sim | Faixas de valor |
| investimento_desejado | select | Sim | Valor numérico |
| recursos_disponiveis | select | Sim | Enum |
| captacao_anterior | select | Sim | Sim/Não + detalhes |

#### Riscos e Estrutura
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| riscos | textarea | Não | Max 1000 caracteres |
| riscos_outro | text | Condicional | Se riscos = "outro" |
| estrutura_juridica | select | Sim | Enum |
| numero_integrantes | number | Sim | Min 1 |
| linkedin_equipe | textarea | Sim | URLs válidas |
| experiencia_equipe | textarea | Sim | Min 30 caracteres |
| vinculo_parentesco | select | Sim | Sim/Não |

#### Apoio e Engajamento
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| tipo_apoio | multi-select | Sim | Array de tipos |
| nivel_envolvimento | select | Sim | Enum |

#### Documentos
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| pitch_deck | file upload | Sim | PDF, max 20MB |
| cap_table | file upload | Não | PDF/XLSX, max 10MB |
| plano_financeiro | file upload | Não | PDF/XLSX, max 10MB |
| mvp_links | text | Não | URLs válidas |

#### Termos e Status
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| termos | checkbox group | Sim | Todos aceitos |
| status | enum | Auto | pendente, em_analise, aprovado, rejeitado |

**Setores Disponíveis (Enum `setorStartup`):**
- Deeptech, RetailTech, FinTech, HealthTech, EdTech, AgriTech, LegalTech, PropTech, FoodTech, LogTech, InsurTech, GovTech, HRTech, MarTech, CleanTech, BioTech, CyberSecurity, AI/ML, IoT, Blockchain, SaaS, Marketplace, Social Impact, Outro

**Estágios (Enum `estagio`):**
- ideacao, pre_seed, mvp_validado, tracao_inicial, crescimento, escala, consolidado

**Problemas (Enum `problema`):**
- altos_custos, acesso_limitado, ineficiencia_processos, falta_tecnologia, regulatorio, outro

**Tecnologias (Enum `tecnologia`):**
- saas, iot, ia_ml, blockchain, cloud, mobile, hardware, biotech, outro

---

### 4.2 Módulo de Avaliação e Score

**Descrição:** Motor de avaliação algorítmica que processa os dados cadastrados e gera um score multidimensional.

**Funcionalidades:**
- Cálculo automático de score ao completar cadastro
- Score por dimensão (0-100) e score consolidado (0-1000)
- Classificação: S (901-1000), A (751-900), B (601-750), C (401-600), D (201-400), E (0-200)
- Justificativa textual por dimensão
- Histórico de recálculos
- Ajuste manual por analista (com log de auditoria)

**Dimensões de Avaliação:**

| Dimensão | Peso | Critérios |
|----------|------|-----------|
| Inovação | 12% | Grau de novidade, tecnologia proprietária, PI |
| Mercado | 15% | TAM, SAM, SOM, tendências, timing |
| Tração | 13% | Faturamento, crescimento, clientes, canais |
| Equipe | 12% | Experiência, tamanho, dedicação, complementaridade |
| Tecnologia | 10% | Maturidade, escalabilidade técnica, stack |
| Modelo de Negócio | 10% | Recorrência, unit economics, margens |
| Finanças | 8% | Saúde financeira, valuation, captação |
| Competitividade | 8% | Diferencial, barreiras de entrada, moat |
| Impacto | 5% | Social, ambiental, ESG |
| Risco | 7% | Operacional, tecnológico, regulatório |

---

### 4.3 Módulo de Dashboard e Analytics

**Descrição:** Painéis visuais para diferentes perfis de usuário.

**Portal da Startup (somente leitura):**
- Visualizar os dados cadastrados do seu projeto (importados do site)
- Status atual da avaliação (pendente, em análise, aprovado, rejeitado)
- Feedback e notas públicas da equipe BCI sobre o projeto
- Score de avaliação (após liberação pelo analista)
- Download do relatório de análise em PDF
- **Nota:** Nenhuma edição é permitida — dados são somente leitura

**Dashboard do Analista:**
- Pipeline de startups por estágio (Kanban)
- Filtros por setor, estágio, score, cidade
- Lista de startups pendentes de análise
- Gráficos de distribuição (setor, estágio, score)
- Comparativo entre startups

**Dashboard Executivo:**
- KPIs consolidados (total de startups, score médio, taxa de aprovação)
- Ranking Top 10 por score
- Distribuição por setor e estágio
- Tendências temporais
- Funil de conversão do pipeline
- Mapa geográfico de startups

**Dashboard de Investidor:**
- Deal flow filtrado
- Oportunidades por tese de investimento
- Score + classificação
- Análise de risco consolidada

---

### 4.4 Módulo de Relatórios

**Descrição:** Geração de relatórios executivos e analíticos.

**Tipos de Relatório:**
- **Relatório Individual:** Perfil completo da startup + score + análise
- **Relatório Comparativo:** Até 5 startups lado a lado
- **Relatório de Pipeline:** Visão geral do funil de venture building
- **Relatório de Deal Flow:** Oportunidades filtradas por critério
- **Relatório de Portfólio:** Performance de startups aprovadas/investidas

**Formatos:** PDF, Excel, CSV

---

### 4.5 Módulo de Gestão de Usuários

**Descrição:** Controle de acesso baseado em papéis (RBAC).

**Papéis:**

| Papel | Permissões |
|-------|-----------|
| Startup | Somente leitura: visualizar próprios dados cadastrados, ver feedback/notas da equipe BCI, acompanhar status da avaliação, baixar relatório de análise do seu projeto |
| Analista | Leitura de todas startups, avaliação, score review, relatórios |
| Gestor | Tudo do Analista + aprovação, configuração de parâmetros |
| Executivo | Dashboard executivo, rankings, relatórios consolidados |
| Investidor | Deal flow, análise filtrada, manifestação de interesse |
| Admin | Acesso total, gestão de usuários, configurações do sistema |

---

### 4.6 Módulo de Pipeline / Venture Building

**Descrição:** Gestão visual do funil de inovação e venture building.

**Estágios do Pipeline:**
1. **Inscrição** — Startup cadastrada, aguardando triagem
2. **Triagem** — Análise inicial, score automático gerado
3. **Avaliação Profunda** — Due diligence, entrevistas, validações
4. **Shortlist** — Startups pré-aprovadas
5. **Negociação** — Termos, valuation, estrutura do deal
6. **Aprovação** — Decisão final do comitê
7. **Onboarding** — Integração ao portfólio/programa
8. **Acompanhamento** — Monitoramento pós-deal

**Funcionalidades:**
- Visualização Kanban drag-and-drop
- Filtros e busca avançada
- Atribuição de responsável por estágio
- Notas e comentários por startup
- Alertas e SLAs por estágio
- Histórico de movimentações

---

## 5. Regras de Negócio

### RN01 — Cadastro Único
Uma startup é identificada unicamente pelo CNPJ (a ser adicionado) ou pela combinação CPF + nome_startup. Duplicatas devem ser detectadas e rejeitadas.

### RN02 — Status de Cadastro
- Todo cadastro inicia com status `pendente`
- Somente analistas podem alterar status
- Transições válidas: pendente → em_analise → aprovado/rejeitado
- Cadastros rejeitados podem ser reabertos (pendente)

### RN03 — Score Automático
- O score é calculado automaticamente quando todos os campos obrigatórios estão preenchidos
- O score pode ser recalculado a qualquer momento
- Ajustes manuais devem ter justificativa registrada

### RN04 — Validação de Mercado
- TAM deve ser ≥ SAM ≥ SOM (validação lógica obrigatória)
- Se TAM < SAM ou SAM < SOM, exibir erro de validação

### RN05 — Documentos
- Pitch deck é obrigatório para cálculo de score
- Documentos aceitos: PDF, XLSX, PPTX, DOC/DOCX
- Tamanho máximo: 20MB por arquivo
- Documentos são armazenados com versionamento

### RN06 — LGPD
- Dados pessoais (CPF, telefone, email) são criptografados em repouso
- Consentimento explícito é obrigatório (termos)
- Direito de exclusão deve ser implementado
- Log de acesso a dados sensíveis

### RN07 — Auditoria
- Toda alteração de score, status ou dados críticos gera log de auditoria
- Logs incluem: usuário, ação, timestamp, valores anterior e novo

### RN08 — Ranking
- O ranking é ordenado pelo score consolidado (decrescente)
- Empates são desfeitos por: (1) data de cadastro mais antiga, (2) score de inovação
- Rankings podem ser filtrados por setor, estágio e período

---

## 6. Requisitos Técnicos

### 6.1 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18+ com TypeScript |
| State Management | Redux Toolkit ou Zustand |
| UI Library | Material UI ou Chakra UI (customizado) |
| Backend | Python 3.11+ com FastAPI |
| ORM | SQLAlchemy 2.0 |
| Banco de Dados | MySQL 8.0+ |
| Cache | Redis |
| Storage | AWS S3 ou MinIO (documentos) |
| Autenticação | JWT + OAuth2 |
| API Style | REST com versionamento (v1/) |
| Documentação API | OpenAPI/Swagger automático |
| CI/CD | GitHub Actions |
| Containerização | Docker + Docker Compose |
| Monitoramento | Sentry + Prometheus + Grafana |

### 6.2 Requisitos Não Funcionais

| Requisito | SLA |
|-----------|-----|
| Disponibilidade | 99.5% uptime |
| Tempo de resposta API | p95 < 500ms |
| Cálculo de score | < 5 segundos |
| Geração de relatório PDF | < 15 segundos |
| Capacidade | 10.000 startups simultâneas |
| Segurança | OWASP Top 10 compliance |
| LGPD | Compliance total |
| Backup | Diário, retenção 90 dias |
| RPO | 24 horas |
| RTO | 4 horas |

---

## 7. Jornadas de Usuário

### 7.1 Jornada: Dados da Startup Chegam à Plataforma

```
1. Startup cadastra projeto no site bciventures.com.br (processo externo)
2. Dados são salvos na tabela MySQL (formulario_startups_bci)
3. Plataforma importa/sincroniza automaticamente os novos registros
4. Score é calculado automaticamente com base nos dados importados
5. Startup aparece no dashboard do analista com status "pendente"
6. Notificação interna é enviada ao time de inovação
```

### 7.2 Jornada: Startup Acessa o Portal (Read-Only)

```
1. Startup recebe email com credenciais de acesso à plataforma
2. Login na plataforma com email cadastrado
3. Visualiza seus dados cadastrados (somente leitura)
4. Acompanha status da avaliação (pendente → em análise → aprovado/rejeitado)
5. Lê feedback e notas públicas da equipe BCI
6. Quando disponível, baixa relatório de análise em PDF
```

### 7.3 Jornada: Analista Avalia Startup

```
1. Login → Dashboard do analista
2. Visualiza startups pendentes (ordenadas por data)
3. Seleciona startup → Visualiza perfil completo
4. Score automático já calculado → Analisa dimensões
5. Revisa documentos (pitch deck, financeiro)
6. Adiciona notas e observações
7. Ajusta score manualmente (se necessário, com justificativa)
8. Altera status: pendente → em_analise → aprovado/rejeitado
9. Gera relatório individual
```

### 7.3 Jornada: Executivo Toma Decisão

```
1. Login → Dashboard executivo
2. Visualiza KPIs consolidados
3. Acessa ranking Top 10
4. Seleciona 3 startups para comparativo
5. Analisa radar chart comparativo
6. Exporta relatório comparativo em PDF
7. Encaminha para comitê de investimento
```

---

## 8. Critérios de Aceite Globais

- [ ] Importação automática de dados do site externo funcionando
- [ ] Score calculado automaticamente em < 5s após importação
- [ ] Dashboard com dados atualizados em tempo real
- [ ] Ranking ordenado corretamente por score
- [ ] Relatório PDF gerado com formatação profissional
- [ ] Comparativo visual entre startups funcional
- [ ] RBAC implementado e testado para todos os papéis
- [ ] API documentada via Swagger/OpenAPI
- [ ] Dados sensíveis criptografados (AES-256)
- [ ] Responsivo em desktop, tablet e mobile
- [ ] Testes unitários com cobertura ≥ 80%
- [ ] Performance: p95 < 500ms para APIs principais

---

## 9. Roadmap de Entregas

### Fase 1 — MVP (8 semanas)
- Importação de dados do site externo (sync MySQL ou webhook)
- Autenticação e RBAC para time interno BCI
- Score automático (versão 1.0)
- Dashboard do analista
- Listagem, filtro e detalhe de startups

### Fase 2 — Analytics (4 semanas)
- Dashboard executivo
- Rankings e comparativos
- Relatórios PDF
- Pipeline Kanban

### Fase 3 — Avançado (4 semanas)
- Dashboard de investidor
- Deal flow
- Integrações externas
- Notificações e alertas
- Multi-programa (multi-tenant)

### Fase 4 — Escala (4 semanas)
- API pública para parceiros
- Internacionalização (i18n)
- Machine Learning no score (v2.0)
- Mobile responsivo otimizado
- Compliance avançado

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| Score | Pontuação algorítmica (0-1000) de avaliação de startups |
| Deal Flow | Fluxo de oportunidades de investimento |
| Venture Builder | Modelo de criação de negócios a partir de um estúdio |
| Pipeline | Funil de estágios de avaliação e maturação |
| TAM | Total Addressable Market (Mercado Total Endereçável) |
| SAM | Serviceable Addressable Market (Mercado Endereçável Atendível) |
| SOM | Serviceable Obtainable Market (Mercado Endereçável Obtível) |
| RBAC | Role-Based Access Control |
| Due Diligence | Processo de investigação e análise de uma empresa |
| Cap Table | Tabela de capitalização societária |
| Valuation | Avaliação do valor de mercado da empresa |
| Equity | Participação societária |
| M&A | Mergers & Acquisitions (Fusões e Aquisições) |
| ICT | Instituição de Ciência e Tecnologia |
| ESG | Environmental, Social and Governance |
| PI | Propriedade Intelectual |
