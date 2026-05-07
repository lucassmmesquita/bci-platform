import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Clock, TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, BarChart3, Network, Loader2 } from 'lucide-react';
import { KPICard, Card, ScoreBadge, StatusBadge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { fetchStartups, fetchStats } from '../services/startupService';
import { SETORES } from '../constants';
import ObsidianGraph from '../components/ObsidianGraph';

// ObsidianGraph imported from components


export default function AnalystDashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pendentes, setPendentes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStartups({ per_page: 6, sort_by: 'data_criacao', sort_order: 'desc' }),
      fetchStats(),
    ]).then(([startupsRes, statsRes]) => {
      setPendentes(startupsRes.items || []);
      setStats(statsRes);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  const barColors = ['#0A5DC2', '#7C5CFC', '#00C48C', '#FFB020', '#FF8C42', '#3B7DD8', '#9B59B6', '#E74C3C', '#1ABC9C', '#6B7280'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fadeIn">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {greeting}, {usuario?.nome?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>Visão geral da plataforma BCI Ventures</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KPICard title="Total Startups" value={stats?.total_startups || 0} subtitle="cadastradas" icon={Rocket} color="blue" />
        <KPICard title="Pendentes" value={stats?.by_status?.pendente || 0} subtitle="Aguardando avaliação" icon={Clock} color="gold" />
        <KPICard title="Setores" value={Object.keys(stats?.by_setor || {}).length} subtitle="diferentes" icon={TrendingUp} color="purple" />
        <KPICard title="Em Análise" value={stats?.by_status?.em_analise || 0} subtitle="em avaliação" icon={CheckCircle2} color="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
        {/* Pipeline by Estágio */}
        <Card title="Pipeline por Estágio" icon={BarChart3}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(stats?.by_estagio || {}).sort((a, b) => b[1] - a[1]).map(([estagio, qtd], i) => {
              const maxQtd = Math.max(...Object.values(stats?.by_estagio || { _: 1 }));
              const pct = maxQtd > 0 ? (qtd / maxQtd) * 100 : 0;
              return (
                <div key={estagio} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--g600)', width: 120, flexShrink: 0, textAlign: 'right', fontWeight: 500, textTransform: 'capitalize' }}>{estagio?.replace(/_/g, ' ')}</span>
                  <div style={{ flex: 1, height: 28, background: 'var(--g100)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      height: '100%', borderRadius: 8,
                      background: `linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)`,
                      width: `${pct}%`, transition: 'width 0.6s ease', minWidth: pct > 0 ? 32 : 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8,
                      animation: 'slideRight 0.6s ease both', animationDelay: `${i * 0.08}s`, transformOrigin: 'left',
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{qtd}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Distribuição por Setor — dados reais */}
        <Card title="Distribuição por Setor" icon={BarChart3}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Object.entries(stats?.by_setor || {}).sort((a, b) => b[1] - a[1]).map(([setor, qtd], i) => (
              <div key={setor} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--g600)', width: 90, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{setor}</span>
                <div style={{ flex: 1, height: 20, background: 'var(--g100)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 6, background: barColors[i],
                    width: `${stats?.total_startups ? (qtd / stats.total_startups) * 100 : 0}%`, transition: 'width 0.6s ease',
                    animation: 'slideRight 0.5s ease both', animationDelay: `${i * 0.05}s`, transformOrigin: 'left',
                  }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', width: 24, textAlign: 'right' }}>{qtd}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Network Graph — D3.js Obsidian Style */}
      <Card title="Ecossistema — Startups × Tendências Tecnológicas do Governo" icon={Network}>
        <p style={{ fontSize: 12, color: 'var(--g500)', margin: '0 0 8px' }}>
          Grafo interativo com física. Arraste os nós, use scroll para zoom. Passe o mouse para destacar conexões.
        </p>
        <ObsidianGraph />
      </Card>

      {/* Startups Pendentes */}
      <Card title="Startups Pendentes de Análise" icon={AlertTriangle} subtitle={`${pendentes.length} startups`}
        action={<button onClick={() => navigate('/startups')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Ver todas <ArrowRight style={{ width: 14, height: 14 }} /></button>}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--g200)' }}>
                {['Startup', 'Setor', 'Estágio', 'Score', 'Status', 'Data'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendentes.slice(0, 6).map((s) => (
                <tr key={s.id} onClick={() => navigate(`/startups/${s.id}`)} style={{ borderBottom: '1px solid var(--g100)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--g50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 12px', fontWeight: 600, color: 'var(--g900)' }}>{s.nome_startup}</td>
                  <td style={{ padding: '12px 12px', color: 'var(--g600)' }}>{SETORES.find(x => x.value === (s.setor || s.setorStartup))?.label || s.setor || s.setorStartup}</td>
                  <td style={{ padding: '12px 12px', color: 'var(--g600)', textTransform: 'capitalize' }}>{s.estagio?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '12px 12px' }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: '12px 12px', color: 'var(--g500)', fontSize: 13 }}>{new Date(s.data_criacao).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
