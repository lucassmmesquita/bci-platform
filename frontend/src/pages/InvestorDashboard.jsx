import { useState, useMemo } from 'react';
import { Briefcase, Search, Filter, Heart, ExternalLink } from 'lucide-react';
import { KPICard, Card, ScoreBadge, StatusBadge } from '../components/ui';
import { mockStartups } from '../mocks/startups';
import { SETORES, ESTAGIOS, getScoreClass } from '../constants';

export default function InvestorDashboard() {
  const [filterSetor, setFilterSetor] = useState('');
  const [minScore, setMinScore] = useState(50);
  const [interested, setInterested] = useState([]);

  const deals = useMemo(() => {
    let data = mockStartups.filter(s => s.status === 'aprovado' || s.status === 'em_analise');
    if (filterSetor) data = data.filter(s => s.setorStartup === filterSetor);
    data = data.filter(s => s.score >= minScore);
    return data.sort((a, b) => b.score - a.score);
  }, [filterSetor, minScore]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fadeIn">
      <div>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: 'var(--g900)', margin: 0 }}>Deal Flow</h1>
        <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>Oportunidades de investimento qualificadas</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <KPICard title="Deals Disponíveis" value={deals.length} icon={Briefcase} color="blue" />
        <KPICard title="Score Médio" value={Math.round(deals.reduce((a, b) => a + b.score, 0) / (deals.length || 1))} icon={Briefcase} color="purple" />
        <KPICard title="Interesse Manifestado" value={interested.length} icon={Heart} color="red" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <select value={filterSetor} onChange={e => setFilterSetor(e.target.value)} style={{ padding: '10px 14px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--g700)' }}>
          <option value="">Todos os Setores</option>
          {SETORES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--g500)' }}>Score mín:</span>
          <input type="range" min={0} max={100} step={5} value={minScore} onChange={e => setMinScore(Number(e.target.value))} style={{ accentColor: 'var(--primary)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{minScore}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {deals.map(s => {
          const cls = getScoreClass(s.score);
          return (
            <div key={s.id} className="animate-fadeUp" style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ height: 4, background: cls.bg }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--g900)' }}>{s.nome_startup}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--g500)' }}>{SETORES.find(x => x.value === s.setorStartup)?.label} • {s.cidade}</p>
                  </div>
                  <ScoreBadge score={s.score} size="md" />
                </div>
                <p style={{ fontSize: 13, color: 'var(--g600)', lineHeight: 1.5, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.descricao}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--g100)', color: 'var(--g600)', fontWeight: 500 }}>{ESTAGIOS.find(x => x.value === s.estagio)?.label}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--g100)', color: 'var(--g600)', fontWeight: 500 }}>{s.publico?.toUpperCase()}</span>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'var(--g100)', color: 'var(--g600)', fontWeight: 500 }}>Inv: R$ {s.investimento_desejado}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setInterested(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${interested.includes(s.id) ? 'var(--accent-red)' : 'var(--g200)'}`, background: interested.includes(s.id) ? 'rgba(255,71,87,0.05)' : '#fff', color: interested.includes(s.id) ? 'var(--accent-red)' : 'var(--g600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    <Heart style={{ width: 14, height: 14, fill: interested.includes(s.id) ? 'var(--accent-red)' : 'none' }} />
                    {interested.includes(s.id) ? 'Interessado' : 'Interesse'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
