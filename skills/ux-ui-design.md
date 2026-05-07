# UX/UI Design — BCI Ventures Platform

## 1. Filosofia de Design

A plataforma BCI Ventures é uma **ferramenta gerencial interna** para o time de inovação. As startups cadastram seus projetos no site externo (bciventures.com.br); a plataforma consome esses dados para avaliação, scoring e tomada de decisão. O design deve ser:

- **Premium e executivo** — impressionar C-Level e investidores
- **Funcional e eficiente** — produtividade para analistas
- **Limpo e minimalista** — inspiração Apple (whitespace, tipografia, clareza)
- **Data-driven** — dashboards, gráficos e rankings como protagonistas
- **Consistente com a marca BCI** — cores, logo e identidade do site

---

## 2. Referência Visual — BCI Ventures Website

### Elementos-chave do site a manter:
- **Azul principal** como cor institucional
- **Fundo escuro (navy/dark)** em seções de destaque
- **Gradientes sutis** em CTAs e headers
- **Tipografia moderna** sem serifa
- **Logo BCI** no header da plataforma

### Inspiração Apple a incorporar:
- Espaço em branco generoso (padding 24-48px entre seções)
- Cards com border-radius grande (16-20px) e sombras suaves
- Tipografia com hierarquia clara (SF Pro-like → Inter/Plus Jakarta Sans)
- Transições suaves (300ms ease-in-out)
- Micro-animações em hover, focus e transições de estado
- Glassmorphism sutil em modais e overlays
- Iconografia line-style consistente (Lucide Icons ou Phosphor)

---

## 3. Design Tokens

### 3.1 Cores

```css
:root {
  /* Primary — Azul BCI */
  --color-primary-50: #E8F0FE;
  --color-primary-100: #B8D4FC;
  --color-primary-500: #0A5DC2;
  --color-primary-600: #084A9B;
  --color-primary-700: #063874;

  /* Secondary — Dark Navy */
  --color-secondary-900: #0D1117;
  --color-secondary-800: #161B22;
  --color-secondary-700: #1B1F3B;

  /* Neutral */
  --color-neutral-0: #FFFFFF;
  --color-neutral-50: #F8F9FC;
  --color-neutral-100: #F1F3F8;
  --color-neutral-200: #E4E7EF;
  --color-neutral-400: #9AA1B4;
  --color-neutral-500: #6B7280;
  --color-neutral-700: #374151;
  --color-neutral-900: #111827;

  /* Status / Score Classes */
  --color-score-s: #7C5CFC;
  --color-score-a: #00C48C;
  --color-score-b: #0A5DC2;
  --color-score-c: #FFB020;
  --color-score-d: #FF8C42;
  --color-score-e: #FF4757;

  /* Surfaces */
  --surface-primary: #FFFFFF;
  --surface-secondary: #F8F9FC;
  --surface-dark: #0D1117;
  --surface-glass: rgba(255, 255, 255, 0.72);

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-elevated: 0 10px 25px rgba(0,0,0,0.08);
  --shadow-modal: 0 25px 50px rgba(0,0,0,0.15);

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

### 3.2 Tipografia

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

:root {
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;

  --text-xs: 0.75rem;    /* 12px — labels, badges */
  --text-sm: 0.875rem;   /* 14px — body secundário */
  --text-base: 1rem;     /* 16px — body principal */
  --text-lg: 1.125rem;   /* 18px — subtítulos */
  --text-xl: 1.25rem;    /* 20px — títulos de seção */
  --text-2xl: 1.5rem;    /* 24px — títulos de página */
  --text-3xl: 2rem;      /* 32px — dashboard KPIs */
  --text-4xl: 2.5rem;    /* 40px — hero numbers */
}
```

---

## 4. Layout da Plataforma

### 4.1 Estrutura Global

```
┌─────────────────────────────────────────────┐
│  Header (64px) — Logo BCI + Search + User   │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │         Main Content             │
│ (260px)  │         (fluid)                  │
│          │                                  │
│ • Dashboard                                 │
│ • Startups                                  │
│ • Pipeline                                  │
│ • Rankings                                  │
│ • Relatórios                                │
│ • Configurações                             │
│          │                                  │
├──────────┴──────────────────────────────────┤
│  (sem footer — app-like)                    │
└─────────────────────────────────────────────┘
```

### 4.2 Sidebar

- Fundo: `--surface-dark` (#0D1117) ou branco clean
- Logo BCI no topo (32px height)
- Itens de menu: ícone + label, 48px height
- Hover: background sutil, indicador azul na borda esquerda
- Item ativo: fundo `--color-primary-50`, texto `--color-primary-500`
- Collapsa em 72px (apenas ícones) no tablet
- Hamburger menu no mobile

### 4.3 Header

- Background: branco com `--shadow-sm`
- Breadcrumb (Home > Startups > Detalhes)
- Search bar centralizado (cmd+K para atalho)
- Notificações (bell icon com badge)
- Avatar + dropdown do usuário
- Height: 64px

---

## 5. Telas Principais

### 5.1 Dashboard do Analista

```
┌────────────────────────────────────────────────┐
│ Bom dia, [Nome] 👋                             │
│ Últimas 24h no pipeline                        │
├────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │ 127  │ │ 23   │ │ 68.4 │ │ 12   │          │
│ │Total │ │Pend. │ │Score │ │Aprov.│          │
│ │Stars │ │Análi.│ │Médio │ │Mês   │          │
│ └──────┘ └──────┘ └──────┘ └──────┘          │
├────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌────────────────────┐    │
│ │ Pipeline Funnel  │ │ Distribuição Setor │    │
│ │ ████████████ 127│ │ 🟦 Fintech   25%   │    │
│ │ ██████████   98 │ │ 🟩 Health    18%   │    │
│ │ ████████     64 │ │ 🟨 DeepTech  15%   │    │
│ │ ██████       35 │ │ 🟪 SaaS     12%   │    │
│ │ ████         18 │ │ ⬜ Outros    30%   │    │
│ └─────────────────┘ └────────────────────┘    │
├────────────────────────────────────────────────┤
│ Startups Pendentes de Análise                  │
│ ┌──────────────────────────────────────────┐   │
│ │ A2I Tech  │ Deeptech │ 742 │ ● Pendente │   │
│ │ XYZ Corp  │ Fintech  │ 685 │ ● Pendente │   │
│ │ ...                                      │   │
│ └──────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

### 5.2 Lista de Startups

- Tabela com colunas: Rank, Nome, Setor, Estágio, Score, Classificação, Status, Data, Ações
- Filtros: setor, estágio, score range, status, período
- Busca textual (nome, descrição)
- Sort por qualquer coluna
- Paginação (20 por página)
- Checkbox para selecionar e comparar (max 5)
- Botão "Comparar Selecionadas"

### 5.3 Detalhe da Startup

```
┌───────────────────────────────────────────┐
│ ← Voltar    A2I Tech           ● Pendente│
├───────────────────────────────────────────┤
│ ┌─────────────────┐ ┌──────────────────┐ │
│ │ SCORE: 742      │ │ Radar Chart      │ │
│ │ Classe: A 🟢    │ │ (10 dimensões)   │ │
│ │ Rank: #3 de 127 │ │                  │ │
│ └─────────────────┘ └──────────────────┘ │
├───────────────────────────────────────────┤
│ Tabs: [Dados] [Score] [Docs] [Pipeline]  │
│         [Notas] [Histórico]              │
├───────────────────────────────────────────┤
│ Tab: Dados                                │
│ • Fundador: Lucas Mesquita               │
│ • Setor: Deeptech                        │
│ • Tecnologia: SaaS                       │
│ • Estágio: Ideação                       │
│ • ...                                    │
├───────────────────────────────────────────┤
│ Tab: Score (barras de progresso)          │
│ Inovação     ████████░░ 82/100           │
│ Mercado      ██████░░░░ 65/100           │
│ Tração       ████░░░░░░ 42/100           │
│ ...                                      │
│ [Justificativa expandível por dimensão]  │
├───────────────────────────────────────────┤
│ Ações: [Aprovar] [Rejeitar] [Recalcular] │
│        [Gerar Relatório] [Mover Pipeline]│
└───────────────────────────────────────────┘
```

### 5.4 Comparativo

- Layout em colunas (2 a 5 startups lado a lado)
- Header com nome + score + classe
- Radar chart overlay (todas no mesmo gráfico)
- Linha por dimensão com highlight do melhor valor
- Botão "Exportar PDF"

### 5.5 Pipeline Kanban

- 8 colunas (estágios do pipeline)
- Cards resumidos: nome, setor, score badge, avatar do responsável
- Drag-and-drop entre colunas
- Badge de SLA (verde/amarelo/vermelho)
- Filtro por responsável, setor, score
- Contador por coluna

### 5.6 Dashboard Executivo

- KPIs grandes no topo (estilo Apple Watch complications)
- Ranking Top 10 com sparklines
- Mapa geográfico do Brasil (heatmap por cidade)
- Tendências temporais (gráfico de área)
- Distribuição por classe (S/A/B/C/D/E) em donut chart

---

## 6. Componentes UI

### 6.1 Score Badge

```
Classe S: fundo roxo (#7C5CFC), texto branco, brilho sutil
Classe A: fundo verde (#00C48C), texto branco
Classe B: fundo azul (#0A5DC2), texto branco
Classe C: fundo amarelo (#FFB020), texto dark
Classe D: fundo laranja (#FF8C42), texto branco
Classe E: fundo vermelho (#FF4757), texto branco
```

- Border-radius: 8px
- Padding: 4px 12px
- Font: 14px, weight 700
- Formato: "A • 742"

### 6.2 KPI Card

- Background branco, border-radius 16px, shadow-card
- Número grande (32-40px, weight 700, font-display)
- Label pequeno (12px, uppercase, letter-spacing 0.04em, neutral-400)
- Ícone à esquerda (24px, cor primária)
- Indicador de variação (↑ 12% verde, ↓ 3% vermelho)

### 6.3 Data Table

- Header: fundo neutral-50, texto neutral-500, uppercase, 12px
- Linhas: hover sutil (neutral-50), border-bottom neutral-200
- Células: 14px, padding 12px 16px
- Ações: icon buttons (eye, edit, trash) visíveis no hover
- Ordenação: ícone de seta no header

---

## 7. Animações

| Elemento | Animação | Duração | Easing |
|----------|----------|---------|--------|
| Page transition | Fade + slide up (20px) | 300ms | ease-in-out |
| Card hover | translateY(-4px) + shadow elevate | 200ms | ease |
| Score counter | Count-up numérico | 1500ms | ease-out |
| Sidebar expand | Width 72px → 260px | 250ms | ease-in-out |
| Modal | Fade + scale(0.95→1) | 200ms | ease-out |
| Toast | Slide from right | 300ms | ease |
| Radar chart | Draw path sequencial | 800ms | ease-out |
| Progress bar | Width 0→n% | 600ms | ease-out |

---

## 8. Responsividade

| Breakpoint | Layout |
|-----------|--------|
| Desktop (>1280px) | Sidebar 260px + content fluid |
| Laptop (1024-1280px) | Sidebar 260px colapsável |
| Tablet (768-1024px) | Sidebar 72px (ícones), grid 2col |
| Mobile (<768px) | Sidebar oculta (hamburger), grid 1col, tabelas → cards |

---

## 9. Dark Mode (futuro)

- Toggle no header (sol/lua)
- Superfícies: #0D1117 (bg), #161B22 (cards), #1B1F3B (sidebar)
- Textos: #F1F3F8 (primary), #9AA1B4 (secondary)
- Bordas: rgba(255,255,255,0.08)
- Gráficos: manter cores vibrantes, ajustar opacidade

---

## 10. Acessibilidade

- Contraste WCAG AA (4.5:1 mínimo)
- Todas as ações com label descritivo
- Focus ring visível (2px solid primary-500, offset 2px)
- Skip to main content link
- Aria-labels em gráficos e badges
- Sem dependência exclusiva de cor (ícones + texto como complemento)
