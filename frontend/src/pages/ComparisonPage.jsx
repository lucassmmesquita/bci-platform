import { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Building2, Package } from 'lucide-react';
import { Card, ScoreBadge, StatusBadge } from '../components/ui';
import { mockStartups } from '../mocks/startups';
import { getStartupScore } from '../mocks/scores';
import { SETORES, ESTAGIOS, STARTUP_DIMENSIONS, PRODUCT_DIMENSIONS, getScoreClass } from '../constants';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

const COMPARE_COLORS = ['#0A5DC2', '#7C5CFC', '#00C48C', '#FF8C42', '#FF4757'];

export default function ComparisonPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ids = (searchParams.get('ids') || '').split(',').map(Number).filter(Boolean);

  const startups = useMemo(() => ids.map(id => mockStartups.find(s => s.id === id)).filter(Boolean), [ids]);
  const scores = useMemo(() => ids.map(id => getStartupScore(id)).filter(Boolean), [ids]);

  const startupRadarData = useMemo(() => {
    if (!scores.length) return [];
    return STARTUP_DIMENSIONS.map(dim => {
      const entry = { dimension: dim.label };
      scores.forEach((sc, i) => {
        const d = sc.startupDimensions.find(d => d.key === dim.key);
        entry[`startup_${i}`] = d?.value || 0;
      });
      return entry;
    });
  }, [scores]);

  const productRadarData = useMemo(() => {
    if (!scores.length) return [];
    return PRODUCT_DIMENSIONS.map(dim => {
      const entry = { dimension: dim.label };
      scores.forEach((sc, i) => {
        const d = sc.productDimensions.find(d => d.key === dim.key);
        entry[`startup_${i}`] = d?.value || 0;
      });
      return entry;
    });
  }, [scores]);

  if (!startups.length) {
    return (
      <div className="animate-fadeIn" style={{ textAlign: 'center', paddingTop: 80 }}>
        <BarChart3 style={{ width: 48, height: 48, color: 'var(--g300)', margin: '0 auto 16px' }} />
        <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--g900)', margin: '0 0 8px' }}>Comparativo de Startups</h2>
        <p style={{ color: 'var(--g500)', margin: '0 0 20px' }}>Selecione 2+ startups na lista para comparar.</p>
        <button onClick={() => navigate('/startups')} style={{ padding: '10px 24px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Ir para Lista</button>
      </div>
    );
  }

  const comparisonFields = [
    { label: 'Setor', getValue: s => SETORES.find(x => x.value === s.setorStartup)?.label },
    { label: 'Estágio', getValue: s => ESTAGIOS.find(x => x.value === s.estagio)?.label },
    { label: 'Cidade', getValue: s => s.cidade },
    { label: 'Público', getValue: s => s.publico?.toUpperCase() },
    { label: 'Equipe', getValue: s => `${s.numero_integrantes} integrantes` },
    { label: 'Tecnologia', getValue: s => s.tecnologia?.replace(/_/g, ' ') },
    { label: 'TAM', getValue: s => s.tam?.replace(/_/g, ' ') },
    { label: 'Faturamento', getValue: s => s.faturamento_atual?.replace(/_/g, ' ') },
    { label: 'Investimento', getValue: s => `R$ ${s.investimento_desejado}` },
    { label: 'Captação', getValue: s => s.captacao_anterior?.replace(/_/g, ' ') },
  ];

  function renderRadarSection(title, Icon, data, dims, accentColor) {
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon style={{ width: 18, height: 18, color: accentColor }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>{title}</h3>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--g200)" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'var(--g600)' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
            {startups.map((s, i) => (
              <Radar key={s.id} name={s.nome_startup} dataKey={`startup_${i}`} stroke={COMPARE_COLORS[i]} fill={COMPARE_COLORS[i]} fillOpacity={0.08} strokeWidth={2} />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
        {/* Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {dims.map(dim => (
            <div key={dim.key}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: 'var(--g700)' }}>
                <span style={{ fontWeight: 700, color: accentColor, marginRight: 4 }}>{dim.key}</span>{dim.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {startups.map((s, i) => {
                  const dimKey = dim.key.startsWith('S') ? 'startupDimensions' : 'productDimensions';
                  const sc = scores[i]?.[dimKey]?.find(d => d.key === dim.key);
                  const val = sc?.value || 0;
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: COMPARE_COLORS[i], width: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{s.nome_startup}</span>
                      <div style={{ flex: 1, height: 8, background: 'var(--g100)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 999, background: COMPARE_COLORS[i], width: `${val}%`, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', width: 28, textAlign: 'right' }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <button onClick={() => navigate('/startups')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--g500)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Voltar para lista
      </button>

      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Comparativo de Startups</h1>
        <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>{startups.length} startups selecionadas</p>
      </div>

      {/* Startup Headers */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${startups.length}, 1fr)`, gap: 12 }}>
        {startups.map((s, i) => {
          const sc = scores[i];
          return (
            <div key={s.id} onClick={() => navigate(`/startups/${s.id}`)} className="animate-fadeUp" style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid var(--g200)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', borderTop: `3px solid ${COMPARE_COLORS[i]}`, animationDelay: `${i * 0.1}s` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: COMPARE_COLORS[i], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{s.nome_startup.charAt(0)}</div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--g900)' }}>{s.nome_startup}</h3>
              <ScoreBadge score={s.score} size="md" />
              <div style={{ marginTop: 8 }}><StatusBadge status={s.status} /></div>
              {sc && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10, fontSize: 11 }}>
                  <span style={{ color: '#0A5DC2', fontWeight: 700 }}>S:{sc.startupScoreFinal}</span>
                  <span style={{ color: '#7C5CFC', fontWeight: 700 }}>P:{sc.productScoreFinal}</span>
                  <span style={{ color: '#00C48C', fontWeight: 700 }}>C:{sc.confidence}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dual Radar Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 16 }}>
        {renderRadarSection('Startup Score', Building2, startupRadarData, STARTUP_DIMENSIONS, '#0A5DC2')}
        {renderRadarSection('Product Score', Package, productRadarData, PRODUCT_DIMENSIONS, '#7C5CFC')}
      </div>

      {/* Comparison Table */}
      <Card title="Dados Comparativos">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--g100)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--g500)', width: 140 }}>Campo</th>
                {startups.map((s, i) => (
                  <th key={s.id} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: COMPARE_COLORS[i] }}>{s.nome_startup}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map(field => (
                <tr key={field.label} style={{ borderBottom: '1px solid var(--g100)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--g700)' }}>{field.label}</td>
                  {startups.map(s => (
                    <td key={s.id} style={{ padding: '10px 14px', color: 'var(--g600)' }}>{field.getValue(s) || '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
