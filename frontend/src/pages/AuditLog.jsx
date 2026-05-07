import { useState, useMemo } from 'react';
import { Shield, Search, Filter, ChevronLeft, ChevronRight, User, Settings, GitBranch, BarChart3, FileText } from 'lucide-react';
import { Card } from '../components/ui';
import { formatDateTime } from '../utils/formatters';

const mockAuditLogs = [
  { id: 1, action: 'Score recalculado', entity: 'FinPay', entityType: 'startup', user: 'Sistema', date: '2025-08-22T14:30:00Z', details: 'Score: 742 → 912', icon: BarChart3, color: 'var(--primary)' },
  { id: 2, action: 'Status alterado', entity: 'NuHealth', entityType: 'startup', user: 'Ana Souza', date: '2025-08-22T10:15:00Z', details: 'em_analise → aprovado', icon: GitBranch, color: 'var(--accent-green)' },
  { id: 3, action: 'Usuário criado', entity: 'Investidor Alfa', entityType: 'user', user: 'Admin BCI', date: '2025-08-21T16:00:00Z', details: 'Papel: Investidor', icon: User, color: 'var(--accent-purple)' },
  { id: 4, action: 'Pipeline movido', entity: 'AgriSmart', entityType: 'startup', user: 'Carlos Mendes', date: '2025-08-21T14:20:00Z', details: 'Triagem → Avaliação Profunda', icon: GitBranch, color: 'var(--primary)' },
  { id: 5, action: 'Nota adicionada', entity: 'A2I Tech', entityType: 'startup', user: 'Ana Souza', date: '2025-08-20T11:30:00Z', details: 'Nota interna sobre potencial técnico', icon: FileText, color: 'var(--status-pending)' },
  { id: 6, action: 'Pesos alterados', entity: 'Score Config', entityType: 'system', user: 'Admin BCI', date: '2025-08-20T09:00:00Z', details: 'Mercado: 15% → 18%, Risco: 7% → 4%', icon: Settings, color: 'var(--accent-red)' },
  { id: 7, action: 'Startup importada', entity: 'CyberShield', entityType: 'startup', user: 'Sistema', date: '2025-08-19T08:00:00Z', details: 'Importação automática do site', icon: BarChart3, color: 'var(--g500)' },
  { id: 8, action: 'Status alterado', entity: 'GovDigital', entityType: 'startup', user: 'Gestor BCI', date: '2025-08-18T15:45:00Z', details: 'em_analise → aprovado', icon: GitBranch, color: 'var(--accent-green)' },
  { id: 9, action: 'Score ajustado', entity: 'EduSpark', entityType: 'startup', user: 'Carlos Mendes', date: '2025-08-18T10:00:00Z', details: 'Ajuste manual: Equipe 55 → 62', icon: BarChart3, color: 'var(--status-pending)' },
  { id: 10, action: 'Login realizado', entity: 'Admin BCI', entityType: 'user', user: 'Admin BCI', date: '2025-08-17T08:30:00Z', details: 'IP: 192.168.1.100', icon: User, color: 'var(--g400)' },
  { id: 11, action: 'Relatório gerado', entity: 'Pipeline Report', entityType: 'report', user: 'Diretor BCI', date: '2025-08-16T14:00:00Z', details: 'Relatório de Pipeline - PDF', icon: FileText, color: 'var(--primary)' },
  { id: 12, action: 'Usuário desativado', entity: 'Teste User', entityType: 'user', user: 'Admin BCI', date: '2025-08-15T09:00:00Z', details: 'Motivo: conta de teste', icon: User, color: 'var(--accent-red)' },
];

export default function AuditLog() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    let data = [...mockAuditLogs];
    if (search) { const q = search.toLowerCase(); data = data.filter(l => l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q) || l.user.toLowerCase().includes(q)); }
    if (filterType) data = data.filter(l => l.entityType === filterType);
    return data;
  }, [search, filterType]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Log de Auditoria</h1>
        <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>{mockAuditLogs.length} registros</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--g400)' }} />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar ação, entidade, usuário..." style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 14, background: '#fff', outline: 'none' }} />
        </div>
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} style={{ padding: '10px 14px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--g700)' }}>
          <option value="">Todos os tipos</option>
          <option value="startup">Startup</option>
          <option value="user">Usuário</option>
          <option value="system">Sistema</option>
          <option value="report">Relatório</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {paginated.map((log, i) => {
          const Icon = log.icon;
          return (
            <div key={log.id} className="animate-slideIn" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', background: '#fff', borderRadius: 12, border: '1px solid var(--g200)', transition: 'all 0.15s', animationDelay: `${i * 0.03}s` }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${log.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 16, height: 16, color: log.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 12px' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>{log.action}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)' }}>{log.entity}</span>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--g500)' }}>{log.details}</p>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12, color: 'var(--g400)' }}>
                  <span>{log.user}</span>
                  <span>{formatDateTime(log.date)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ padding: '6px 10px', border: '1px solid var(--g200)', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}><ChevronLeft style={{ width: 16, height: 16 }} /></button>
          <span style={{ fontSize: 13, color: 'var(--g500)' }}>Página {page} de {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} style={{ padding: '6px 10px', border: '1px solid var(--g200)', borderRadius: 8, background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}><ChevronRight style={{ width: 16, height: 16 }} /></button>
        </div>
      )}
    </div>
  );
}
