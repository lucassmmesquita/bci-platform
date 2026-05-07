import { mockStartups } from './startups';

// ═══════════ Score por dimensão (S1-S7 Startup + P1-P7 Produto) ═══════════
// Notas de 0-5 conforme regra de negócio, convertidas para 0-100 para exibição

const scoringResults = {
  1: { // A2I Tech — Ideação, deeptech
    startup: { S1: 4.5, S2: 3.5, S3: 4.0, S4: 1.5, S5: 2.0, S6: 3.0, S7: 4.0 },
    product: { P1: 4.0, P2: 3.5, P3: 3.0, P4: 4.0, P5: 4.5, P6: 1.5, P7: 3.0 },
    risk_penalty: 8, confidence: 52, valuation_fit: 45,
    risk_level: 'medio', recommended_action: 'acompanhar_maturacao',
    flags: ['solicitar_docs'],
  },
  2: { // NuHealth — Tração, healthtech
    startup: { S1: 5.0, S2: 4.5, S3: 4.5, S4: 4.0, S5: 3.5, S6: 4.5, S7: 4.0 },
    product: { P1: 4.5, P2: 4.0, P3: 4.0, P4: 4.5, P5: 3.5, P6: 4.0, P7: 4.0 },
    risk_penalty: 5, confidence: 78, valuation_fit: 72,
    risk_level: 'baixo', recommended_action: 'avancar_due_diligence_equity',
    flags: [],
  },
  3: { // AgriSmart — MVP Validado, agritech
    startup: { S1: 5.0, S2: 4.0, S3: 4.5, S4: 3.0, S5: 2.5, S6: 3.0, S7: 4.0 },
    product: { P1: 4.0, P2: 3.5, P3: 3.5, P4: 4.5, P5: 4.0, P6: 2.5, P7: 3.0 },
    risk_penalty: 6, confidence: 61, valuation_fit: 55,
    risk_level: 'baixo', recommended_action: 'oferecer_consultoria',
    flags: ['solicitar_docs'],
  },
  4: { // FinPay — Crescimento, fintech
    startup: { S1: 5.0, S2: 5.0, S3: 5.0, S4: 4.5, S5: 4.5, S6: 5.0, S7: 4.5 },
    product: { P1: 4.5, P2: 4.5, P3: 4.5, P4: 5.0, P5: 3.5, P6: 4.5, P7: 4.0 },
    risk_penalty: 8, confidence: 88, valuation_fit: 82,
    risk_level: 'medio', recommended_action: 'avancar_due_diligence_equity',
    flags: [],
  },
  5: { // EduSpark — Tração, edtech
    startup: { S1: 5.0, S2: 3.5, S3: 3.0, S4: 2.5, S5: 2.5, S6: 3.0, S7: 3.5 },
    product: { P1: 3.5, P2: 3.5, P3: 3.0, P4: 3.0, P5: 3.0, P6: 2.5, P7: 3.5 },
    risk_penalty: 4, confidence: 58, valuation_fit: 48,
    risk_level: 'baixo', recommended_action: 'oferecer_consultoria',
    flags: ['solicitar_docs'],
  },
  6: { // LegalFlow — MVP Validado, legaltech
    startup: { S1: 5.0, S2: 3.0, S3: 3.0, S4: 2.0, S5: 2.0, S6: 3.0, S7: 4.0 },
    product: { P1: 4.0, P2: 3.5, P3: 2.5, P4: 3.0, P5: 4.0, P6: 1.5, P7: 3.0 },
    risk_penalty: 5, confidence: 48, valuation_fit: 42,
    risk_level: 'baixo', recommended_action: 'acompanhar_maturacao',
    flags: ['solicitar_docs', 'solicitar_info'],
  },
  7: { // LogMove — Tração, logtech
    startup: { S1: 5.0, S2: 4.0, S3: 4.0, S4: 3.5, S5: 3.0, S6: 3.0, S7: 3.5 },
    product: { P1: 4.0, P2: 3.5, P3: 3.5, P4: 4.0, P5: 2.5, P6: 3.5, P7: 3.5 },
    risk_penalty: 4, confidence: 65, valuation_fit: 60,
    risk_level: 'baixo', recommended_action: 'oferecer_consultoria',
    flags: [],
  },
  8: { // GreenErgy — Crescimento, cleantech
    startup: { S1: 5.0, S2: 4.5, S3: 4.5, S4: 4.0, S5: 4.0, S6: 4.5, S7: 4.0 },
    product: { P1: 4.5, P2: 4.0, P3: 4.0, P4: 4.5, P5: 3.5, P6: 4.0, P7: 3.5 },
    risk_penalty: 6, confidence: 82, valuation_fit: 75,
    risk_level: 'baixo', recommended_action: 'avancar_due_diligence_equity',
    flags: [],
  },
  9: { // CyberShield — MVP Validado, cybersecurity
    startup: { S1: 5.0, S2: 3.5, S3: 3.0, S4: 2.0, S5: 2.0, S6: 3.0, S7: 4.0 },
    product: { P1: 4.0, P2: 4.0, P3: 3.0, P4: 3.0, P5: 4.0, P6: 1.5, P7: 3.5 },
    risk_penalty: 7, confidence: 50, valuation_fit: 44,
    risk_level: 'baixo', recommended_action: 'acompanhar_maturacao',
    flags: ['solicitar_docs'],
  },
  10: { // PropView — Tração, proptech
    startup: { S1: 5.0, S2: 3.5, S3: 3.5, S4: 3.0, S5: 3.0, S6: 3.0, S7: 3.5 },
    product: { P1: 3.5, P2: 3.5, P3: 3.5, P4: 3.0, P5: 3.0, P6: 3.0, P7: 3.5 },
    risk_penalty: 4, confidence: 63, valuation_fit: 58,
    risk_level: 'baixo', recommended_action: 'oferecer_consultoria',
    flags: [],
  },
  11: { // FoodChain — Ideação, foodtech/blockchain
    startup: { S1: 3.0, S2: 2.0, S3: 2.5, S4: 1.0, S5: 1.0, S6: 1.5, S7: 2.5 },
    product: { P1: 3.0, P2: 2.0, P3: 2.0, P4: 2.5, P5: 3.0, P6: 0.5, P7: 2.0 },
    risk_penalty: 12, confidence: 28, valuation_fit: 20,
    risk_level: 'alto', recommended_action: 'nao_recomendado',
    flags: ['solicitar_docs', 'solicitar_info'],
  },
  12: { // HRHub — Tração, hrtech
    startup: { S1: 5.0, S2: 3.5, S3: 3.0, S4: 3.0, S5: 2.5, S6: 3.0, S7: 3.5 },
    product: { P1: 3.5, P2: 3.5, P3: 3.5, P4: 3.0, P5: 3.0, P6: 2.5, P7: 3.5 },
    risk_penalty: 4, confidence: 62, valuation_fit: 55,
    risk_level: 'baixo', recommended_action: 'oferecer_consultoria',
    flags: [],
  },
  13: { // BioDetect — Pré-seed, biotech
    startup: { S1: 5.0, S2: 3.5, S3: 3.0, S4: 1.0, S5: 1.5, S6: 2.5, S7: 3.5 },
    product: { P1: 4.0, P2: 3.0, P3: 2.0, P4: 3.0, P5: 4.5, P6: 0.5, P7: 2.0 },
    risk_penalty: 14, confidence: 38, valuation_fit: 30,
    risk_level: 'alto', recommended_action: 'acompanhar_maturacao',
    flags: ['solicitar_docs', 'solicitar_info'],
  },
  14: { // GovDigital — Tração, govtech
    startup: { S1: 5.0, S2: 4.0, S3: 3.5, S4: 3.5, S5: 3.0, S6: 3.5, S7: 3.5 },
    product: { P1: 4.0, P2: 3.5, P3: 3.5, P4: 3.0, P5: 2.5, P6: 3.5, P7: 4.0 },
    risk_penalty: 4, confidence: 71, valuation_fit: 65,
    risk_level: 'baixo', recommended_action: 'avancar_due_diligence_equity',
    flags: [],
  },
  15: { // Insurify — MVP Validado, insurtech
    startup: { S1: 5.0, S2: 3.5, S3: 4.0, S4: 2.0, S5: 2.0, S6: 2.5, S7: 3.5 },
    product: { P1: 3.5, P2: 3.0, P3: 3.0, P4: 4.0, P5: 3.0, P6: 1.5, P7: 2.5 },
    risk_penalty: 10, confidence: 42, valuation_fit: 35,
    risk_level: 'medio', recommended_action: 'solicitar_documentos',
    flags: ['solicitar_docs'],
  },
};

// ═══════════ Justificativas por dimensão ═══════════
const justificativas = {
  S1: { high: 'Cadastro completo e em conformidade.', mid: 'Cadastro com campos pendentes.', low: 'Cadastro incompleto ou termos não aceitos.' },
  S2: { high: 'Equipe complementar com experiência comprovada no setor.', mid: 'Equipe com conhecimento técnico, mas gaps em negócios.', low: 'Equipe muito enxuta com gaps críticos.' },
  S3: { high: 'Mercado grande com timing favorável e tese alinhada.', mid: 'Mercado em crescimento mas com competição significativa.', low: 'Mercado limitado ou tese pouco clara.' },
  S4: { high: 'Faturamento consistente com crescimento mês a mês.', mid: 'Primeiros clientes conquistados, validação em andamento.', low: 'Pré-receita, sem validação comercial.' },
  S5: { high: 'Unit economics comprovado, valuation fundamentado.', mid: 'Modelo definido mas ainda sem validação completa.', low: 'Modelo de negócio indefinido, valuation sem fundamento.' },
  S6: { high: 'Estrutura jurídica madura, cap table e docs disponíveis.', mid: 'Estrutura básica presente, documentos parciais.', low: 'Sem estrutura jurídica adequada, docs ausentes.' },
  S7: { high: 'Time dedicado, gargalos claros, alta coachability.', mid: 'Envolvimento parcial, gargalos identificados.', low: 'Baixo envolvimento, recursos insuficientes.' },
  P1: { high: 'Problema crítico, urgente e com disposição de pagamento.', mid: 'Problema claro para um público definido.', low: 'Problema genérico ou sem público claro.' },
  P2: { high: 'Tecnologia escalável, MVP validado com usuários.', mid: 'Protótipo funcional, tecnologia adequada.', low: 'Ideia sem protótipo ou tecnologia imatura.' },
  P3: { high: 'Canais coerentes com público, estratégia GTM clara.', mid: 'Canais parcialmente definidos.', low: 'Sem estratégia de go-to-market.' },
  P4: { high: 'TAM/SAM/SOM consistentes e com evidência.', mid: 'Mercado estimado, mas sem validação.', low: 'Mercado mal dimensionado ou inconsistente.' },
  P5: { high: 'Diferencial defensável por tecnologia, dados ou rede.', mid: 'Diferencial existente mas replicável.', low: 'Sem diferencial claro.' },
  P6: { high: 'Clientes pagantes, faturamento recorrente.', mid: 'Validação inicial com primeiros usuários.', low: 'Sem evidência de demanda.' },
  P7: { high: 'Recursos adequados, riscos técnicos mapeados.', mid: 'Recursos mínimos, riscos parcialmente mapeados.', low: 'Recursos insuficientes, alto risco técnico.' },
};

function getJustificativa(dim, val) {
  const j = justificativas[dim];
  if (!j) return '';
  if (val >= 3.5) return j.high;
  if (val >= 2.0) return j.mid;
  return j.low;
}

// ═══════════ Cálculo dos scores compostos ═══════════
function calcWeighted(dims, weights) {
  return Object.entries(weights).reduce((sum, [key, weight]) => {
    const nota = dims[key] || 0;
    return sum + weight * (nota / 5) * 100;
  }, 0);
}

const STARTUP_WEIGHTS = { S1: 0.05, S2: 0.17, S3: 0.16, S4: 0.20, S5: 0.20, S6: 0.12, S7: 0.10 };
const PRODUCT_WEIGHTS = { P1: 0.15, P2: 0.20, P3: 0.15, P4: 0.15, P5: 0.15, P6: 0.15, P7: 0.05 };

export function getStartupScore(startupId) {
  const result = scoringResults[startupId];
  if (!result) return null;
  const startup = mockStartups.find(s => s.id === startupId);

  const startupBase = calcWeighted(result.startup, STARTUP_WEIGHTS);
  const productBase = calcWeighted(result.product, PRODUCT_WEIGHTS);
  const startupFinal = Math.max(0, startupBase - Math.min(result.risk_penalty, 30));
  const productFinal = Math.max(0, productBase - Math.min(result.risk_penalty * 0.6, 20));

  const equityScore = Math.round(0.40 * startupFinal + 0.30 * productFinal + 0.15 * result.valuation_fit + 0.15 * result.confidence);
  const acquisitionScore = Math.round(0.30 * startupFinal + 0.35 * productFinal + 0.20 * 50 + 0.15 * result.confidence);
  const consultingScore = Math.round(0.25 * startupFinal + 0.25 * productFinal + 0.20 * 60 + 0.20 * 55 + 0.10 * result.confidence);

  const startupDimensions = Object.entries(result.startup).map(([key, value]) => ({
    key,
    value: Math.round(value / 5 * 100),
    raw: value,
    justificativa: getJustificativa(key, value),
  }));

  const productDimensions = Object.entries(result.product).map(([key, value]) => ({
    key,
    value: Math.round(value / 5 * 100),
    raw: value,
    justificativa: getJustificativa(key, value),
  }));

  return {
    startupId,
    startupScoreBase: Math.round(startupBase),
    startupScoreFinal: Math.round(startupFinal),
    productScoreBase: Math.round(productBase),
    productScoreFinal: Math.round(productFinal),
    confidence: result.confidence,
    valuationFit: result.valuation_fit,
    riskPenalty: result.risk_penalty,
    riskLevel: result.risk_level,
    recommendedAction: result.recommended_action,
    equityScore,
    acquisitionScore,
    consultingScore,
    flags: result.flags || [],
    startupDimensions,
    productDimensions,
    // Combined for backwards compat
    totalScore: startup?.score || Math.round((startupFinal + productFinal) / 2),
    calculatedAt: '2025-08-20T10:30:00Z',
    algorithmVersion: '1.0',
  };
}

export const mockScoreSummary = mockStartups.map(s => ({
  id: s.id,
  nome_startup: s.nome_startup,
  score: s.score,
  setor: s.setorStartup,
  estagio: s.estagio,
  status: s.status,
})).sort((a, b) => b.score - a.score);
