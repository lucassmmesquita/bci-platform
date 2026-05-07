import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Rocket, X, Loader2 } from 'lucide-react';
import { ScoreBadge, StatusBadge, Card } from '../components/ui';
import { fetchStartups } from '../services/startupService';
import { SETORES, ESTAGIOS, STATUS_OPTIONS } from '../constants';
import { formatDate } from '../utils/formatters';

export default function StartupList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('data_criacao');
  const [sortDir, setSortDir] = useState('desc');
  const [filterSetor, setFilterSetor] = useState('');
  const [filterEstagio, setFilterEstagio] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const perPage = 10;

  // ── API state ──────────────────────────────────────
  const [startups, setStartups] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch data ─────────────────────────────────────
  const loadStartups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchStartups({
        page,
        per_page: perPage,
        sort_by: sortKey,
        sort_order: sortDir,
        setor: filterSetor || undefined,
        estagio: filterEstagio || undefined,
        status: filterStatus || undefined,
        search: search || undefined,
      });
      setStartups(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.total_pages || 0);
    } catch (err) {
      console.error('Erro ao carregar startups:', err);
      setError('Erro ao carregar startups. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortKey, sortDir, filterSetor, filterEstagio, filterStatus, search]);

  useEffect(() => {
    loadStartups();
  }, [loadStartups]);

  // ── Debounce da busca ──────────────────────────────
  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearchChange = (value) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      setPage(1);
    }, 400));
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev);
  };

  const hasFilters = filterSetor || filterEstagio || filterStatus;

  const columns = [
    { key: 'select', label: '', width: 40 },
    { key: 'nome_startup', label: 'Startup', sortable: true },
    { key: 'setorStartup', label: 'Setor', sortable: true },
    { key: 'estagio', label: 'Estágio', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'cidade', label: 'Cidade', sortable: true },
    { key: 'data_criacao', label: 'Data', sortable: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Startups</h1>
          <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>{total} startups cadastradas</p>
        </div>
        {selected.length >= 2 && (
          <button onClick={() => navigate(`/comparison?ids=${selected.join(',')}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}>
            Comparar {selected.length} selecionadas
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--g400)' }} />
          <input type="text" value={search} onChange={e => handleSearchChange(e.target.value)} placeholder="Buscar por nome, fundador, cidade..." style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 14, background: '#fff', outline: 'none', color: 'var(--g900)' }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: `1.5px solid ${hasFilters ? 'var(--primary)' : 'var(--g200)'}`, borderRadius: 10, background: hasFilters ? 'rgba(10,93,194,0.05)' : '#fff', color: hasFilters ? 'var(--primary)' : 'var(--g600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Filter style={{ width: 16, height: 16 }} /> Filtros {hasFilters && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 999, padding: '1px 6px', fontSize: 11, fontWeight: 700 }}>{[filterSetor, filterEstagio, filterStatus].filter(Boolean).length}</span>}
        </button>
        {hasFilters && (
          <button onClick={() => { setFilterSetor(''); setFilterEstagio(''); setFilterStatus(''); setPage(1); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', border: 'none', borderRadius: 8, background: 'rgba(255,71,87,0.08)', color: 'var(--accent-red)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <X style={{ width: 14, height: 14 }} /> Limpar
          </button>
        )}
      </div>

      {showFilters && (
        <div className="animate-fadeIn" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid var(--g200)' }}>
          <select value={filterSetor} onChange={e => { setFilterSetor(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 13, color: 'var(--g700)', background: '#fff', minWidth: 160 }}>
            <option value="">Todos os Setores</option>
            {SETORES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterEstagio} onChange={e => { setFilterEstagio(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 13, color: 'var(--g700)', background: '#fff', minWidth: 160 }}>
            <option value="">Todos os Estágios</option>
            {ESTAGIOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 13, color: 'var(--g700)', background: '#fff', minWidth: 160 }}>
            <option value="">Todos os Status</option>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,71,87,0.06)', border: '1px solid rgba(255,71,87,0.15)', color: 'var(--accent-red)', fontSize: 14 }}>
          {error}
          <button onClick={loadStartups} style={{ marginLeft: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid var(--accent-red)', background: 'transparent', color: 'var(--accent-red)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Tentar novamente</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--g100)' }}>
                {columns.map(col => (
                  <th key={col.key} onClick={() => col.sortable && toggleSort(col.key)} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '0.08em', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap', width: col.width, background: sortKey === col.key ? 'var(--g50)' : 'transparent' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {col.sortable && sortKey === col.key && <ArrowUpDown style={{ width: 12, height: 12, color: 'var(--primary)' }} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 48, color: 'var(--g400)' }}>
                  <Loader2 style={{ width: 32, height: 32, margin: '0 auto 12px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                  <p>Carregando startups...</p>
                </td></tr>
              ) : startups.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: 48, color: 'var(--g400)' }}>
                  <Rocket style={{ width: 40, height: 40, margin: '0 auto 12px', color: 'var(--g300)' }} />
                  <p>Nenhuma startup encontrada</p>
                </td></tr>
              ) : startups.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--g100)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--g50)'} onMouseLeave={e => e.currentTarget.style.background = selected.includes(s.id) ? 'rgba(10,93,194,0.03)' : 'transparent'}>
                  <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggleSelect(s.id)} style={{ width: 16, height: 16, accentColor: 'var(--primary)', cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--g900)' }} onClick={() => navigate(`/startups/${s.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{(s.nome_startup || '?').charAt(0)}</div>
                      <div><p style={{ margin: 0 }}>{s.nome_startup || 'Sem nome'}</p><p style={{ margin: 0, fontSize: 12, fontWeight: 400, color: 'var(--g500)' }}>{s.nome}</p></div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--g600)' }} onClick={() => navigate(`/startups/${s.id}`)}>{SETORES.find(x => x.value === (s.setor || s.setorStartup))?.label || s.setor || s.setorStartup}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--g600)', textTransform: 'capitalize' }} onClick={() => navigate(`/startups/${s.id}`)}>{ESTAGIOS.find(x => x.value === s.estagio)?.label || s.estagio?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px 14px' }} onClick={() => navigate(`/startups/${s.id}`)}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: '12px 14px', color: 'var(--g600)' }} onClick={() => navigate(`/startups/${s.id}`)}>{s.cidade}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--g500)', fontSize: 13 }} onClick={() => navigate(`/startups/${s.id}`)}>{formatDate(s.data_criacao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--g100)', fontSize: 13, color: 'var(--g500)' }}>
            <span>{(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} de {total}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 10px', border: '1px solid var(--g200)', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 10px', border: '1px solid var(--g200)', borderRadius: 8, background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
