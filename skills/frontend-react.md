# Frontend React — BCI Ventures Platform

## 1. Arquitetura

### Stack
- **React 18+** com TypeScript
- **Vite** como bundler
- **React Router v6** para roteamento
- **Zustand** para estado global
- **React Query (TanStack Query)** para cache de API
- **Axios** para HTTP
- **Recharts** para gráficos
- **React Hook Form + Zod** para formulários e validação
- **Framer Motion** para animações
- **Material UI v5** (customizado com tema BCI)

### Estrutura de Pastas

```
src/
├── api/                  # Serviços de API (Axios instances, endpoints)
│   ├── client.ts         # Axios instance configurado
│   ├── startups.ts       # Endpoints de startups
│   ├── auth.ts           # Endpoints de autenticação
│   ├── score.ts          # Endpoints de score
│   ├── reports.ts        # Endpoints de relatórios
│   └── users.ts          # Endpoints de usuários
├── assets/               # Imagens, ícones, fontes
├── components/           # Componentes reutilizáveis
│   ├── ui/               # Primitivos (Button, Input, Card, Modal)
│   ├── layout/           # Header, Sidebar, Footer, PageContainer
│   ├── forms/            # FormStep, FileUpload, SelectField
│   ├── charts/           # ScoreRadar, PipelineChart, DistributionBar
│   ├── tables/           # DataTable, RankingTable, ComparisonTable
│   └── feedback/         # Toast, Loading, EmptyState, ErrorBoundary
├── features/             # Módulos por funcionalidade
│   ├── auth/             # Login, Register, ForgotPassword
│   ├── startup-portal/   # Portal read-only para fundadores (dados, feedback, relatório)
│   ├── dashboard/        # Dashboards (analista, executivo, investidor)
│   ├── startups/         # Listagem, detalhe, comparativo
│   ├── pipeline/         # Kanban de pipeline
│   ├── reports/          # Geração e visualização de relatórios
│   ├── scoring/          # Visualização de score e dimensões
│   └── admin/            # Gestão de usuários e configurações
├── hooks/                # Custom hooks
├── store/                # Zustand stores
├── types/                # TypeScript interfaces e types
├── utils/                # Helpers e utilitários
├── theme/                # Tema MUI customizado (cores, tipografia)
├── routes/               # Definição de rotas e guards
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

## 2. Tema e Design System

### Paleta de Cores (baseada no site BCI Ventures)

```typescript
// theme/colors.ts
export const colors = {
  primary: {
    50: '#E8F0FE',
    100: '#B8D4FC',
    200: '#88B8FA',
    300: '#589CF8',
    400: '#2880F6',
    500: '#0A5DC2',  // Primary — azul BCI
    600: '#084A9B',
    700: '#063874',
    800: '#04254D',
    900: '#021326',
  },
  secondary: {
    500: '#1B1F3B',  // Dark navy — backgrounds
  },
  accent: {
    green: '#00C48C',   // Sucesso, aprovado
    orange: '#FF8C42',  // Atenção, em análise
    red: '#FF4757',     // Erro, rejeitado
    purple: '#7C5CFC',  // Score alto (S/A)
    gold: '#FFD700',    // Destaque premium
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F8F9FC',
    100: '#F1F3F8',
    200: '#E4E7EF',
    300: '#C8CDD9',
    400: '#9AA1B4',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};
```

### Tipografia

```typescript
// theme/typography.ts — Google Fonts: Inter + Plus Jakarta Sans
export const typography = {
  fontFamily: "'Inter', 'Plus Jakarta Sans', -apple-system, sans-serif",
  h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
  h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3 },
  h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
  h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.04em' },
};
```

### Espaçamento e Bordas (inspiração Apple)

```typescript
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 };
export const borderRadius = { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 };
export const shadows = {
  card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  elevated: '0 10px 25px rgba(0,0,0,0.08)',
  modal: '0 25px 50px rgba(0,0,0,0.15)',
};
```

---

## 3. Rotas

```typescript
// routes/index.tsx
const routes = [
  // Públicas
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },

  // Portal da Startup (somente leitura)
  { path: '/startup/portal', element: <StartupPortal />, role: 'startup' },
  { path: '/startup/portal/project', element: <StartupProjectView />, role: 'startup' },
  { path: '/startup/portal/feedback', element: <StartupFeedbackView />, role: 'startup' },
  { path: '/startup/portal/report', element: <StartupReportDownload />, role: 'startup' },

  // Analista
  { path: '/analyst/dashboard', element: <AnalystDashboard />, role: 'analyst' },
  { path: '/analyst/startups', element: <StartupList />, role: 'analyst' },
  { path: '/analyst/startups/:id', element: <StartupDetail />, role: 'analyst' },
  { path: '/analyst/compare', element: <ComparisonView />, role: 'analyst' },
  { path: '/analyst/pipeline', element: <PipelineKanban />, role: 'analyst' },

  // Executivo
  { path: '/executive/dashboard', element: <ExecutiveDashboard />, role: 'executive' },
  { path: '/executive/ranking', element: <RankingPage />, role: 'executive' },
  { path: '/executive/reports', element: <ReportsPage />, role: 'executive' },

  // Investidor
  { path: '/investor/dealflow', element: <DealFlowPage />, role: 'investor' },
  { path: '/investor/startups/:id', element: <InvestorStartupView />, role: 'investor' },

  // Admin
  { path: '/admin/users', element: <UserManagement />, role: 'admin' },
  { path: '/admin/settings', element: <SystemSettings />, role: 'admin' },
  { path: '/admin/scoring', element: <ScoringConfig />, role: 'admin' },
  { path: '/admin/audit', element: <AuditLog />, role: 'admin' },
];
```

---

## 4. Componentes Principais

### 4.1 Portal da Startup (`StartupPortal`) — Somente Leitura

```typescript
// features/startup-portal/StartupPortal.tsx
// Portal read-only para fundadores visualizarem seu projeto
// Nenhum formulário de edição — dados importados do site externo
```

**Telas do Portal:**
- **Meus Dados** — Exibe todos os dados cadastrados (fundador + startup) em formato read-only com layout de cards organizados por seção
- **Status da Avaliação** — Badge visual com status atual (pendente / em análise / aprovado / rejeitado) e timeline de mudanças de status
- **Feedback da Equipe BCI** — Lista de notas públicas (`is_internal = false`) da equipe de inovação sobre o projeto, com data e autor
- **Score de Avaliação** — Score total + radar chart por dimensão + justificativas (visível somente quando `score_visible_to_startup = true`)
- **Relatório de Análise** — Botão "Baixar Relatório (PDF)" quando disponível

**Requisitos:**
- Todos os campos são **somente leitura** (nenhum input editável)
- Layout clean e premium (Apple-inspired) para impressionar o fundador
- Score e relatório exibidos somente quando liberados pelo analista
- Sidebar simplificada com apenas os itens do portal
- Mensagem amigável se ainda não há feedback/score disponível

### 4.2 Score Visualization (`ScoreCard`)

```typescript
// components/charts/ScoreCard.tsx
// Exibe: score total, classificação (S/A/B/C/D/E), radar chart por dimensão
interface ScoreCardProps {
  totalScore: number;         // 0-1000
  classification: string;     // S, A, B, C, D, E
  dimensions: ScoreDimension[];
  showDetails?: boolean;
}
```

**Elementos visuais:**
- Número grande animado (counter-up) com a pontuação
- Badge de classificação com cor (S=roxo, A=verde, B=azul, C=amarelo, D=laranja, E=vermelho)
- Radar/Spider chart com as 10 dimensões
- Barra de progresso por dimensão com tooltip
- Botão "Ver justificativas" expandindo texto explicativo

### 4.3 Dashboard Executivo

**Componentes:**
- `KPIRow` — 4 cards com métricas principais (total startups, score médio, aprovadas, investidas)
- `RankingTable` — Top 10 com score, setor, estágio, classificação
- `SectorDistribution` — Donut chart por setor
- `StageDistribution` — Bar chart horizontal por estágio
- `PipelineFunnel` — Funil de conversão
- `TrendLine` — Gráfico de linha temporal (cadastros/mês)
- `GeoMap` — Mapa do Brasil com distribuição por cidade

### 4.4 Pipeline Kanban

```typescript
// features/pipeline/PipelineKanban.tsx
// Drag-and-drop entre colunas, filtros, busca
const PIPELINE_STAGES = [
  'inscricao', 'triagem', 'avaliacao', 'shortlist',
  'negociacao', 'aprovacao', 'onboarding', 'acompanhamento'
];
```

**Requisitos:**
- React DnD ou dnd-kit para drag-and-drop
- Cards com: nome, setor, score, responsável, SLA
- Indicador visual de SLA (verde/amarelo/vermelho)
- Modal de detalhes ao clicar no card
- Filtro por responsável, setor, score mínimo

### 4.5 Comparison View

```typescript
// features/startups/ComparisonView.tsx
// Comparativo lado a lado de até 5 startups
interface ComparisonProps {
  startupIds: number[];  // max 5
}
```

**Elementos:**
- Tabela comparativa com linhas por dimensão
- Radar chart sobreposto (overlay)
- Highlight da melhor startup por dimensão
- Exportar como PDF

---

## 5. Estado da Aplicação (Zustand)

```typescript
// store/authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole;
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// store/startupFormStore.ts
interface StartupFormState {
  currentStep: number;
  formData: Partial<StartupFormDTO>;
  isDraft: boolean;
  setStep: (step: number) => void;
  updateField: (field: string, value: any) => void;
  saveDraft: () => Promise<void>;
  submitForm: () => Promise<void>;
  resetForm: () => void;
}

// store/filterStore.ts
interface FilterState {
  sector: string[];
  stage: string[];
  scoreMin: number;
  scoreMax: number;
  city: string;
  dateRange: [Date, Date];
  applyFilters: () => void;
  resetFilters: () => void;
}
```

---

## 6. Integração com API

```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptors: token injection, refresh, error handling
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().refreshToken();
      return apiClient(error.config);
    }
    throw error;
  }
);
```

```typescript
// api/startups.ts — React Query hooks
export const useStartups = (filters: FilterParams) =>
  useQuery(['startups', filters], () => apiClient.get('/startups', { params: filters }));

export const useStartupDetail = (id: number) =>
  useQuery(['startup', id], () => apiClient.get(`/startups/${id}`));

export const useStartupScore = (id: number) =>
  useQuery(['startup-score', id], () => apiClient.get(`/startups/${id}/score`));

export const useCreateStartup = () =>
  useMutation((data: StartupFormDTO) => apiClient.post('/startups', data));

export const useRanking = (params: RankingParams) =>
  useQuery(['ranking', params], () => apiClient.get('/rankings', { params }));
```

---

## 7. Responsividade

### Breakpoints
```typescript
const breakpoints = {
  xs: 0,      // Mobile portrait
  sm: 640,    // Mobile landscape
  md: 768,    // Tablet
  lg: 1024,   // Desktop
  xl: 1280,   // Desktop wide
  '2xl': 1536 // Desktop ultrawide
};
```

### Regras de Layout
- **Mobile (< 768px):** Sidebar collapsa em hamburger menu, tabelas viram cards, Kanban em modo lista vertical
- **Tablet (768-1024px):** Sidebar colapsada por padrão, grid 2 colunas
- **Desktop (> 1024px):** Layout completo com sidebar fixa, grid 3-4 colunas

---

## 8. Animações (Framer Motion)

```typescript
// Transição entre pages
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeInOut' },
};

// Score counter animation
export const scoreCounter = {
  from: 0,
  to: score,
  duration: 1.5,
  ease: 'easeOut',
};

// Card hover
export const cardHover = {
  whileHover: { y: -4, boxShadow: shadows.elevated },
  transition: { duration: 0.2 },
};
```

---

## 9. Performance

- **Code splitting:** `React.lazy()` por rota/feature
- **Virtualização:** `react-window` para listas longas (> 100 itens)
- **Image optimization:** WebP com fallback, lazy loading
- **Bundle:** Vite com tree-shaking, chunk splitting
- **Cache:** React Query com staleTime de 5min para listagens
- **Prefetch:** Pré-carregar dados da próxima página no hover

---

## 10. Acessibilidade (a11y)

- Contraste WCAG AA (mínimo 4.5:1 para texto)
- Navegação completa por teclado (Tab, Enter, Escape)
- Labels em todos os inputs
- ARIA attributes em componentes customizados
- Skip links para conteúdo principal
- Foco visível em elementos interativos
