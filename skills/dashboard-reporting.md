# Dashboard & Reporting — BCI Ventures Platform

## 1. Visão Geral

Os dashboards e relatórios são o coração da plataforma gerencial. Eles transformam os dados brutos das startups cadastradas no site BCI em inteligência acionável para o time de inovação, analistas, gestores e executivos.

---

## 2. Dashboards

### 2.1 Dashboard do Analista

**Objetivo:** Visão operacional — quais startups analisar, status do pipeline, distribuições.

#### KPI Cards (topo)
| KPI | Cálculo | Ícone | Cor |
|-----|---------|-------|-----|
| Total de Startups | COUNT(*) startups | RocketIcon | Primary |
| Pendentes de Análise | WHERE status='pendente' | ClockIcon | Orange |
| Score Médio | AVG(total_score) | TrendingUpIcon | Green |
| Aprovadas (mês) | WHERE status='aprovado' AND mês atual | CheckCircleIcon | Green |

#### Gráficos
1. **Pipeline Funnel** — Funil horizontal (inscricao → acompanhamento) com contagem por estágio
2. **Distribuição por Setor** — Donut chart com top 8 setores + "outros"
3. **Distribuição por Estágio** — Bar chart horizontal (ideacao → consolidado)
4. **Score Distribution** — Histogram (faixas de 100: 0-200, 201-400, etc.) com cores da classificação
5. **Startups Recentes** — Tabela com últimas 10 cadastradas (nome, setor, data, status)

#### Filtros Globais
- Período (7d, 30d, 90d, 1y, custom)
- Setor (multi-select)
- Status (multi-select)

---

### 2.2 Dashboard Executivo

**Objetivo:** Visão estratégica — trends, rankings, decisões de investimento.

#### KPI Cards (premium, grandes)
| KPI | Descrição | Variação |
|-----|-----------|----------|
| Pipeline Total | Total de startups ativas | ↑ 12% vs mês anterior |
| Taxa de Aprovação | % aprovadas / total analisadas | Trend line sparkline |
| Score Médio Top 10 | Média do score das top 10 | vs mês anterior |
| Deals em Negociação | Startups no estágio "negociação" | Count absoluto |

#### Gráficos
1. **Ranking Top 10** — Tabela premium: Rank, Nome, Setor, Score, Classificação (badge colorido), Sparkline de evolução
2. **Tendência Temporal** — Area chart: cadastros/mês vs aprovações/mês (últimos 12 meses)
3. **Distribuição por Classificação** — Donut chart (S/A/B/C/D/E com cores temáticas)
4. **Mapa Geográfico** — Mapa do Brasil com heatmap por cidade/estado
5. **Funil de Conversão** — Inscrição → Triagem → Avaliação → Shortlist → Deal (com % de conversão entre estágios)

#### Interatividade
- Click no ranking abre detalhes da startup
- Click no mapa filtra por estado
- Click no funil filtra por estágio
- Período selecionável com calendar picker

---

### 2.3 Dashboard de Pipeline (Kanban)

**Objetivo:** Gestão visual do funil de inovação.

#### Colunas
```
Inscrição (23) → Triagem (18) → Avaliação (12) → Shortlist (8) →
Negociação (5) → Aprovação (3) → Onboarding (2) → Acompanhamento (7)
```

#### Cards do Kanban
```
┌─────────────────────────┐
│ A2I Tech                │
│ 🏷️ Deeptech  📊 742 (A) │
│ 👤 Ana Silva   ⏱️ 3d    │
│ 🔴 SLA: Vencido         │
└─────────────────────────┘
```

Campos do card: nome_startup, setor (tag), score (badge), analista (avatar), dias no estágio, SLA indicator.

#### SLA por Estágio
| Estágio | SLA | Verde | Amarelo | Vermelho |
|---------|-----|-------|---------|----------|
| Inscrição → Triagem | 3 dias | ≤2d | 3d | >3d |
| Triagem → Avaliação | 5 dias | ≤3d | 4-5d | >5d |
| Avaliação → Shortlist | 10 dias | ≤7d | 8-10d | >10d |
| Shortlist → Negociação | 15 dias | ≤10d | 11-15d | >15d |

---

## 3. Rankings

### 3.1 Ranking Geral

Tabela ordenada por score (DESC) com:

| Coluna | Descrição |
|--------|-----------|
| # | Posição no ranking |
| Nome | nome_startup |
| Setor | Tag colorida |
| Estágio | Badge |
| Score | Número + barra de progresso (0-1000) |
| Classificação | Badge (S/A/B/C/D/E) |
| Top Dimensão | A dimensão com maior score |
| Fraqueza | A dimensão com menor score |
| Status | Pendente/Em análise/Aprovado |
| Ações | Ver detalhes, Comparar, Relatório |

### 3.2 Ranking por Setor

- Selector de setor no topo
- Mesma tabela, filtrada por setor
- Contexto: "X de Y startups no setor Fintech"

### 3.3 Ranking por Dimensão

- Selector de dimensão (Inovação, Mercado, etc.)
- Ordenado pelo score da dimensão selecionada
- Útil para encontrar startups fortes em áreas específicas

---

## 4. Comparativo de Startups

### 4.1 Seleção
- Checkbox na lista de startups (max 5)
- Botão "Comparar Selecionadas" abre a view

### 4.2 Layout Comparativo

```
┌─────────┬─────────┬─────────┬─────────┐
│ A2I Tech│ XYZ Corp│ StartX  │ DataCo  │
│ 742 (A) │ 685 (B) │ 820 (A) │ 590 (C) │
├─────────┼─────────┼─────────┼─────────┤
│ Deeptech│ Fintech │ AI/ML   │ SaaS    │
│ Ideação │ MVP     │ Tração  │ Cresc.  │
├─────────┴─────────┴─────────┴─────────┤
│        Radar Chart Sobreposto          │
│        (4 startups no mesmo gráfico)   │
├────────────────────────────────────────┤
│ Inovação    │ 82 🏆│ 65   │ 88 🏆│ 55 │
│ Mercado     │ 70   │ 72 🏆│ 68   │ 60 │
│ Tração      │ 42   │ 58   │ 75 🏆│ 65 │
│ Equipe      │ 80 🏆│ 70   │ 72   │ 55 │
│ ...         │      │      │      │    │
├────────────────────────────────────────┤
│ [Exportar PDF]  [Remover Startup]     │
└────────────────────────────────────────┘
```

- 🏆 indica o melhor valor na dimensão (highlight verde)
- Células com menor valor ficam em tom mais claro

---

## 5. Relatórios

### 5.1 Relatório Individual de Startup (PDF)

**Estrutura do PDF:**

```
Página 1: Capa
  - Logo BCI Ventures
  - "Relatório de Avaliação"
  - Nome da startup
  - Data de geração
  - Classificação: Badge grande (ex: A — 742/1000)
  - "Confidencial"

Página 2: Resumo Executivo
  - Score total + classificação
  - Radar chart (10 dimensões)
  - Top 3 pontos fortes
  - Top 3 pontos de atenção
  - Recomendação: "Recomendado para avaliação profunda"

Página 3: Dados da Startup
  - Fundador, cidade, setor, estágio
  - Descrição do negócio
  - Problema que resolve
  - Tecnologia utilizada

Página 4: Análise de Mercado
  - TAM / SAM / SOM (visual de funil)
  - Público-alvo
  - Canais de distribuição
  - Concorrentes identificados

Página 5: Score Detalhado
  - Tabela com cada dimensão: score, peso, contribuição, justificativa
  - Gráfico de barras horizontais

Página 6: Equipe e Estrutura
  - Número de integrantes
  - Nível de envolvimento
  - Estrutura jurídica
  - Experiência declarada

Página 7: Finanças
  - Faturamento atual
  - Previsão de faturamento
  - Valuation declarado
  - Investimento desejado
  - Captação anterior

Rodapé: "Gerado pela BCI Ventures Platform em DD/MM/AAAA — Confidencial"
```

**Implementação:** WeasyPrint (Python) com template HTML/CSS → PDF.

### 5.2 Relatório Comparativo (PDF)

- Tabela comparativa (até 5 startups)
- Radar chart sobreposto
- Análise por dimensão com destaque do melhor

### 5.3 Relatório de Pipeline (Excel)

- Aba 1: Visão geral (KPIs, contagens por estágio)
- Aba 2: Lista completa (todas as startups com todos os campos)
- Aba 3: Scores (todas as dimensões)
- Aba 4: Auditoria (últimas movimentações)

**Implementação:** openpyxl (Python).

---

## 6. Visualizações (Recharts)

### Componentes de Gráfico

```typescript
// Radar Chart — Score por dimensão
<ResponsiveContainer width="100%" height={400}>
  <RadarChart data={dimensions}>
    <PolarGrid stroke="var(--color-neutral-200)" />
    <PolarAngleAxis dataKey="dimension" />
    <PolarRadiusAxis angle={30} domain={[0, 100]} />
    <Radar name="Score" dataKey="value" stroke="var(--color-primary-500)"
           fill="var(--color-primary-500)" fillOpacity={0.15} strokeWidth={2} />
  </RadarChart>
</ResponsiveContainer>

// Donut Chart — Distribuição por setor
<PieChart>
  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
       paddingAngle={2} dataKey="value" label>
    {sectorData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>

// Area Chart — Tendências
<AreaChart data={trendData}>
  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
  <XAxis dataKey="month" />
  <YAxis />
  <Area type="monotone" dataKey="registrations" stackId="1"
        stroke="var(--color-primary-500)" fill="var(--color-primary-100)" />
  <Area type="monotone" dataKey="approvals" stackId="2"
        stroke="var(--color-score-a)" fill="#00C48C22" />
</AreaChart>
```

---

## 7. Exportação

| Formato | Uso | Biblioteca |
|---------|-----|-----------|
| PDF | Relatórios individuais/comparativos | WeasyPrint (backend) |
| Excel | Relatórios de pipeline, dados tabulares | openpyxl (backend) |
| CSV | Exportação de dados brutos | csv nativo (backend) |
| PNG | Screenshot de gráficos | html2canvas (frontend) |

Todos os relatórios são gerados assincronamente via Celery, com notificação quando prontos para download.
