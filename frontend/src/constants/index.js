// ═══════════ BCI VENTURES — CONSTANTS (v2 — Regra de Negócio) ═══════════

export const SETORES = [
  { value: 'deeptech', label: 'Deeptech' },
  { value: 'retailtech', label: 'RetailTech' },
  { value: 'fintech', label: 'FinTech' },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'agritech', label: 'AgriTech' },
  { value: 'legaltech', label: 'LegalTech' },
  { value: 'proptech', label: 'PropTech' },
  { value: 'foodtech', label: 'FoodTech' },
  { value: 'logtech', label: 'LogTech' },
  { value: 'insurtech', label: 'InsurTech' },
  { value: 'govtech', label: 'GovTech' },
  { value: 'hrtech', label: 'HRTech' },
  { value: 'martech', label: 'MarTech' },
  { value: 'cleantech', label: 'CleanTech' },
  { value: 'biotech', label: 'BioTech' },
  { value: 'cybersecurity', label: 'CyberSecurity' },
  { value: 'ai_ml', label: 'AI/ML' },
  { value: 'iot', label: 'IoT' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'saas', label: 'SaaS' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'social_impact', label: 'Social Impact' },
  { value: 'outro', label: 'Outro' },
];

export const ESTAGIOS = [
  { value: 'ideacao', label: 'Ideação' },
  { value: 'prototipo', label: 'Protótipo' },
  { value: 'mvp', label: 'MVP' },
  { value: 'mvp_validado', label: 'MVP Validado' },
  { value: 'operacao', label: 'Operação' },
  { value: 'tracao', label: 'Tração' },
  { value: 'escala', label: 'Escala' },
];

export const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente', color: 'var(--status-pending)' },
  { value: 'em_analise', label: 'Em Análise', color: 'var(--status-analysis)' },
  { value: 'aprovado', label: 'Aprovado', color: 'var(--status-approved)' },
  { value: 'rejeitado', label: 'Rejeitado', color: 'var(--status-rejected)' },
];

export const PROBLEMAS = [
  { value: 'altos_custos', label: 'Altos Custos' },
  { value: 'acesso_limitado', label: 'Acesso Limitado' },
  { value: 'ineficiencia_processos', label: 'Ineficiência de Processos' },
  { value: 'falta_tecnologia', label: 'Falta de Tecnologia' },
  { value: 'regulatorio', label: 'Regulatório' },
  { value: 'outro', label: 'Outro' },
];

export const TECNOLOGIAS = [
  { value: 'saas', label: 'SaaS' },
  { value: 'iot', label: 'IoT' },
  { value: 'ia_ml', label: 'IA/ML' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'biotech', label: 'Biotech' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'deeptech', label: 'Deeptech' },
  { value: 'servico', label: 'Serviço' },
  { value: 'outro', label: 'Outro' },
];

export const PUBLICOS = [
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
  { value: 'b2g', label: 'B2G' },
  { value: 'b2b2c', label: 'B2B2C' },
  { value: 'outro', label: 'Outro' },
];

// ═══════════ PIPELINE (6 etapas simplificadas) ═══════════

export const PIPELINE_STAGES = [
  { key: 'inscricao', label: 'Inscrição', color: '#9AA1B4' },
  { key: 'triagem', label: 'Triagem', color: '#0A5DC2' },
  { key: 'avaliacao', label: 'Avaliação', color: '#7C5CFC' },
  { key: 'negociacao', label: 'Negociação', color: '#FFB020' },
  { key: 'aprovado', label: 'Aprovado', color: '#00C48C' },
  { key: 'arquivado', label: 'Arquivado', color: '#6B7280' },
];

// Flags internas (badges no card, não colunas do kanban)
export const PIPELINE_FLAGS = [
  { key: 'solicitar_docs', label: 'Solicitar Documentos', color: '#FFB020', icon: '📄' },
  { key: 'solicitar_info', label: 'Solicitar Informações', color: '#FF8C42', icon: '⚠️' },
  { key: 'revisao_manual', label: 'Revisão Manual', color: '#FF4757', icon: '🔒' },
  { key: 'preparar_captacao', label: 'Preparar Captação', color: '#7C5CFC', icon: '📋' },
];

// ═══════════ SCORING — DIMENSÕES (Regra de Negócio v1.0) ═══════════

// Startup Score: 7 dimensões, total = 100 pontos
export const STARTUP_DIMENSIONS = [
  { key: 'S1', label: 'Qualidade Cadastral', peso: 5, description: 'Termos, contato válido, status processável' },
  { key: 'S2', label: 'Time e Governança', peso: 17, description: 'Tamanho, experiência, LinkedIn, conflito de interesse' },
  { key: 'S3', label: 'Mercado e Tese', peso: 16, description: 'Setor, público-alvo, TAM/SAM/SOM' },
  { key: 'S4', label: 'Tração e Maturidade', peso: 20, description: 'Estágio, faturamento, captação, canais' },
  { key: 'S5', label: 'Modelo Econômico', peso: 20, description: 'Previsão, valuation, investimento, plano financeiro' },
  { key: 'S6', label: 'Prontidão Jurídica', peso: 12, description: 'Estrutura jurídica, cap table, pitch deck, compliance' },
  { key: 'S7', label: 'Capacidade de Execução', peso: 10, description: 'Tipo de apoio, envolvimento, recursos' },
];

// Product Score: 7 dimensões, total = 100 pontos
export const PRODUCT_DIMENSIONS = [
  { key: 'P1', label: 'Clareza do Problema', peso: 15, description: 'Intensidade da dor, público definido, urgência' },
  { key: 'P2', label: 'Solução e Tecnologia', peso: 20, description: 'Tipo, maturidade, MVP links' },
  { key: 'P3', label: 'Público e GTM', peso: 15, description: 'B2B/B2C, coerência de canais, go-to-market' },
  { key: 'P4', label: 'Mercado do Produto', peso: 15, description: 'TAM/SAM/SOM com checagem de realismo' },
  { key: 'P5', label: 'Diferenciação', peso: 15, description: 'Diferencial competitivo, defensibilidade' },
  { key: 'P6', label: 'Validação de Demanda', peso: 15, description: 'Faturamento, captação, evidências de uso' },
  { key: 'P7', label: 'Viabilidade Técnica', peso: 5, description: 'Recursos vs riscos técnicos declarados' },
];

// Backward-compatible: all dimensions combined for Score Config
export const SCORE_DIMENSIONS = [...STARTUP_DIMENSIONS, ...PRODUCT_DIMENSIONS];

// ═══════════ SCORES COMPOSTOS ═══════════

export const COMPOSITE_SCORES = [
  { key: 'equity', label: 'Equity Score', description: 'Atratividade para investimento em equity/SAFE/conversível', color: '#7C5CFC' },
  { key: 'acquisition', label: 'Acquisition Score', description: 'Atratividade para aquisição/acquihire/IP', color: '#0A5DC2' },
  { key: 'consulting', label: 'Consulting Score', description: 'Atratividade para consultoria/venture building', color: '#00C48C' },
];

// ═══════════ CLASSIFICAÇÃO ═══════════

export const SCORE_CLASSES = [
  { class: 'S', min: 86, max: 100, color: 'var(--score-s)', label: 'Excepcional' },
  { class: 'A', min: 70, max: 85, color: 'var(--score-a)', label: 'Excelente' },
  { class: 'B', min: 55, max: 69, color: 'var(--score-b)', label: 'Bom' },
  { class: 'C', min: 40, max: 54, color: 'var(--score-c)', label: 'Regular' },
  { class: 'D', min: 20, max: 39, color: 'var(--score-d)', label: 'Baixo' },
  { class: 'E', min: 0, max: 19, color: 'var(--score-e)', label: 'Crítico' },
];

export const RISK_LEVELS = [
  { value: 'baixo', label: 'Baixo', color: '#00C48C' },
  { value: 'medio', label: 'Médio', color: '#FFB020' },
  { value: 'alto', label: 'Alto', color: '#FF8C42' },
  { value: 'critico', label: 'Crítico', color: '#FF4757' },
];

export const RECOMMENDED_ACTIONS = [
  { value: 'avancar_due_diligence_equity', label: 'Avançar Due Diligence (Equity)', color: '#7C5CFC' },
  { value: 'avancar_due_diligence_aquisicao', label: 'Avançar Due Diligence (Aquisição)', color: '#0A5DC2' },
  { value: 'oferecer_consultoria', label: 'Oferecer Consultoria', color: '#00C48C' },
  { value: 'solicitar_documentos', label: 'Solicitar Documentos', color: '#FFB020' },
  { value: 'solicitar_informacoes', label: 'Solicitar Informações', color: '#FF8C42' },
  { value: 'preparar_para_captacao', label: 'Preparar para Captação', color: '#7C5CFC' },
  { value: 'acompanhar_maturacao', label: 'Acompanhar Maturação', color: '#9AA1B4' },
  { value: 'revisao_manual', label: 'Revisão Manual', color: '#FF4757' },
  { value: 'nao_recomendado', label: 'Não Recomendado', color: '#6B7280' },
];

export const USER_ROLES = [
  { value: 'startup', label: 'Startup' },
  { value: 'analyst', label: 'Analista' },
  { value: 'manager', label: 'Gestor' },
  { value: 'executive', label: 'Executivo' },
  { value: 'investor', label: 'Investidor' },
  { value: 'admin', label: 'Administrador' },
];

export const FATURAMENTO_FAIXAS = [
  { value: 'pre_revenue', label: 'Pré-receita' },
  { value: 'ate_10k', label: 'Até R$ 10 mil/mês' },
  { value: '10k_50k', label: 'R$ 10-50 mil/mês' },
  { value: '50k_200k', label: 'R$ 50-200 mil/mês' },
  { value: '200k_1mi', label: 'R$ 200 mil - 1 milhão/mês' },
  { value: 'acima_1mi', label: 'Acima de R$ 1 milhão/mês' },
];

export const TAM_FAIXAS = [
  { value: 'ate_10mi', label: 'Até R$ 10 milhões' },
  { value: '10_50mi', label: 'R$ 10-50 milhões' },
  { value: '50_200mi', label: 'R$ 50-200 milhões' },
  { value: '200mi_1bi', label: 'R$ 200 milhões - 1 bilhão' },
  { value: 'acima_1bi', label: 'Acima de R$ 1 bilhão' },
  { value: 'acima_200mi', label: 'Acima de R$ 200 milhões' },
];

export const VALUATION_FAIXAS = [
  { value: 'nao_definido', label: 'Não definido' },
  { value: 'ate_500k', label: 'Até R$ 500 mil' },
  { value: '500k_2mi', label: 'R$ 500 mil - 2 milhões' },
  { value: 'ate_2mi', label: 'Até R$ 2 milhões' },
  { value: '2mi_10mi', label: 'R$ 2-10 milhões' },
  { value: '10mi_50mi', label: 'R$ 10-50 milhões' },
  { value: 'acima_50mi', label: 'Acima de R$ 50 milhões' },
];

// ═══════════ HELPERS ═══════════

// Score class from 0-100 scale
export function getScoreClass(score) {
  if (score >= 86) return { class: 'S', color: 'var(--score-s)', bg: '#7C5CFC', label: 'Excepcional' };
  if (score >= 70) return { class: 'A', color: 'var(--score-a)', bg: '#00C48C', label: 'Excelente' };
  if (score >= 55) return { class: 'B', color: 'var(--score-b)', bg: '#0A5DC2', label: 'Bom' };
  if (score >= 40) return { class: 'C', color: 'var(--score-c)', bg: '#FFB020', label: 'Regular' };
  if (score >= 20) return { class: 'D', color: 'var(--score-d)', bg: '#FF8C42', label: 'Baixo' };
  return { class: 'E', color: 'var(--score-e)', bg: '#FF4757', label: 'Crítico' };
}

export function getStatusInfo(status) {
  const map = {
    pendente: { label: 'Pendente', bg: 'rgba(255,176,32,0.1)', color: '#B8860B', border: 'rgba(255,176,32,0.3)' },
    em_analise: { label: 'Em Análise', bg: 'rgba(10,93,194,0.1)', color: '#0A5DC2', border: 'rgba(10,93,194,0.3)' },
    aprovado: { label: 'Aprovado', bg: 'rgba(0,196,140,0.1)', color: '#00966B', border: 'rgba(0,196,140,0.3)' },
    rejeitado: { label: 'Rejeitado', bg: 'rgba(255,71,87,0.1)', color: '#CC3844', border: 'rgba(255,71,87,0.3)' },
  };
  return map[status] || map.pendente;
}

export function getRiskColor(level) {
  const r = RISK_LEVELS.find(r => r.value === level);
  return r?.color || '#9AA1B4';
}
