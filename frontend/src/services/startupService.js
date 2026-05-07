/**
 * BCI Ventures — Startup Service
 * Acesso à API real do backend para startups e arquivos.
 */
import api, { USE_MOCK } from './api';
import { mockStartups } from '../mocks/startups';

/**
 * Lista startups com filtros e paginação.
 * Retorna { items, total, page, per_page, total_pages }
 */
export async function fetchStartups({
  page = 1,
  per_page = 20,
  sort_by = 'data_criacao',
  sort_order = 'desc',
  setor,
  estagio,
  status,
  cidade,
  search,
} = {}) {
  if (USE_MOCK) {
    // Fallback mock — mantém compatibilidade
    let data = [...mockStartups];
    if (setor) data = data.filter(s => s.setorStartup === setor);
    if (estagio) data = data.filter(s => s.estagio === estagio);
    if (status) data = data.filter(s => s.status === status);
    if (cidade) data = data.filter(s => s.cidade?.toLowerCase().includes(cidade.toLowerCase()));
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(s =>
        s.nome_startup?.toLowerCase().includes(q) ||
        s.nome?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    }
    const total = data.length;
    const start = (page - 1) * per_page;
    const items = data.slice(start, start + per_page);
    return { items, total, page, per_page, total_pages: Math.ceil(total / per_page) };
  }

  const params = { page, per_page, sort_by, sort_order };
  if (setor) params.setor = setor;
  if (estagio) params.estagio = estagio;
  if (status) params.status = status;
  if (cidade) params.cidade = cidade;
  if (search) params.search = search;

  const { data } = await api.get('/startups', { params });
  return data;
}

/**
 * Busca startup completa por ID.
 */
export async function fetchStartup(id) {
  if (USE_MOCK) {
    return mockStartups.find(s => s.id === Number(id)) || null;
  }
  const { data } = await api.get(`/startups/${id}`);
  return data;
}

/**
 * Busca documentos de uma startup.
 */
export async function fetchStartupDocuments(id) {
  if (USE_MOCK) {
    return { startup_id: id, pitch_deck: null, cap_table: null, plano_financeiro: null, mvp_links: null };
  }
  const { data } = await api.get(`/startups/${id}/documents`);
  return data;
}

/**
 * Busca estatísticas (KPIs).
 */
export async function fetchStats() {
  if (USE_MOCK) {
    return {
      total_startups: mockStartups.length,
      by_status: mockStartups.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc; }, {}),
      by_setor: mockStartups.reduce((acc, s) => { acc[s.setorStartup] = (acc[s.setorStartup] || 0) + 1; return acc; }, {}),
      by_estagio: mockStartups.reduce((acc, s) => { acc[s.estagio] = (acc[s.estagio] || 0) + 1; return acc; }, {}),
    };
  }
  const { data } = await api.get('/startups/stats');
  return data;
}

/**
 * Lista arquivos no FTP.
 */
export async function fetchFiles() {
  const { data } = await api.get('/files');
  return data;
}

/**
 * URL de download de arquivo.
 */
export function getFileDownloadUrl(filename) {
  const baseUrl = api.defaults.baseURL;
  return `${baseUrl}/files/${encodeURIComponent(filename)}`;
}
