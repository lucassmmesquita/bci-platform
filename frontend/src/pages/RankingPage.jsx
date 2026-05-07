import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowUpDown, Search, Medal, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { ScoreBadge, StatusBadge } from '../components/ui';
import { mockStartups } from '../mocks/startups';
import { SETORES, ESTAGIOS, getScoreClass } from '../constants';

export default function RankingPage() {
  const navigate = useNavigate();
  const [filterSetor, setFilterSetor] = useState('');
  const [filterEstagio, setFilterEstagio] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const ranked = useMemo(() => {
    let data = [...mockStartups].sort((a, b) => b.score - a.score);
    if (filterSetor) data = data.filter(s => s.setorStartup === filterSetor);
    if (filterEstagio) data = data.filter(s => s.estagio === filterEstagio);
    return data;
  }, [filterSetor, filterEstagio]);

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  const classGuide = [
    { cls: 'S', range: '86–100', label: 'Excepcional', color: '#7C5CFC', desc: 'Forte candidato para due diligence e investimento' },
    { cls: 'A', range: '70–85', label: 'Excelente', color: '#00C48C', desc: 'Bom candidato, avançar com validações pontuais' },
    { cls: 'B', range: '55–69', label: 'Bom', color: '#0A5DC2', desc: 'Potencial moderado, considerar consultoria ou preparação' },
    { cls: 'C', range: '40–54', label: 'Regular', color: '#FFB020', desc: 'Alto risco, acompanhar ou solicitar melhorias' },
    { cls: 'D', range: '20–39', label: 'Baixo', color: '#FF8C42', desc: 'Não recomendado no momento, salvo exceção estratégica' },
    { cls: 'E', range: '0–19', label: 'Crítico', color: '#FF4757', desc: 'Informações insuficientes ou impeditivas' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Ranking de Startups</h1>
        <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>Classificação geral por score</p>
      </div>

      {/* Scoring Guide */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--g200)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <button onClick={() => setShowGuide(!showGuide)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ padding: 6, borderRadius: 8, background: 'rgba(10,93,194,0.08)' }}>
            <Info style={{ width: 16, height: 16, color: 'var(--primary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>Como funciona o Score?</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--g500)' }}>Entenda a classificação por letra e a pontuação numérica</p>
          </div>
          {showGuide
            ? <ChevronUp style={{ width: 18, height: 18, color: 'var(--g400)' }} />
            : <ChevronDown style={{ width: 18, height: 18, color: 'var(--g400)' }} />}
        </button>

        {showGuide && (
          <div className="animate-fadeIn" style={{ padding: '0 20px 20px', borderTop: '1px solid var(--g100)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginTop: 16 }}>
              {/* Left: Explanation */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: 'var(--g900)' }}>Pontuação (0–100)</h4>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--g600)', lineHeight: 1.6 }}>
                  O score é calculado automaticamente a partir de <strong>14 dimensões</strong> agrupadas em dois eixos:
                  <strong> Startup</strong> (time, mercado, tração, modelo econômico, jurídico e execução) e
                  <strong> Produto</strong> (problema, tecnologia, go-to-market, diferenciação e validação).
                  Cada dimensão recebe uma nota de 0 a 5, ponderada pelo seu peso, gerando um score final de 0 a 100.
                </p>
                <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: 'var(--g900)' }}>Classificação (Letra)</h4>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--g600)', lineHeight: 1.6 }}>
                  A letra representa a <strong>faixa de performance</strong> da startup com base no score final.
                  Ela indica o nível de maturidade e atratividade para investimento, aquisição ou consultoria.
                </p>
              </div>

              {/* Right: Classification Table */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: 'var(--g900)' }}>Tabela de Classificação</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {classGuide.map(c => (
                    <div key={c.cls} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: `${c.color}08`, border: `1px solid ${c.color}20` }}>
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{c.cls}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>{c.label}</span>
                          <span style={{ fontSize: 11, color: 'var(--g400)', fontWeight: 500 }}>{c.range} pts</span>
                        </div>
                        <p style={{ margin: '1px 0 0', fontSize: 11, color: 'var(--g500)' }}>{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {ranked.slice(0, 3).map((s, i) => {
          const cls = getScoreClass(s.score);
          return (
            <div key={s.id} onClick={() => navigate(`/startups/${s.id}`)} className="animate-fadeUp" style={{
              background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', position: 'relative',
              animationDelay: `${i * 0.1}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ height: 4, background: cls.bg }} />
              <div style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 999, background: medalColors[i], display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: `0 4px 12px ${medalColors[i]}44` }}>
                  <Medal style={{ width: 24, height: 24, color: '#fff' }} />
                </div>
                <p className="font-display" style={{ fontSize: 14, fontWeight: 800, color: 'var(--g400)', margin: '0 0 4px', letterSpacing: '0.05em' }}>#{i + 1}</p>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--primary-gradient)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{s.nome_startup.charAt(0)}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', margin: '0 0 4px' }}>{s.nome_startup}</h3>
                <p style={{ fontSize: 13, color: 'var(--g500)', margin: '0 0 12px' }}>{SETORES.find(x => x.value === s.setorStartup)?.label} • {s.cidade}</p>
                <ScoreBadge score={s.score} size="lg" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <select value={filterSetor} onChange={e => setFilterSetor(e.target.value)} style={{ padding: '8px 14px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--g700)' }}>
          <option value="">Todos os Setores</option>
          {SETORES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterEstagio} onChange={e => setFilterEstagio(e.target.value)} style={{ padding: '8px 14px', border: '1.5px solid var(--g200)', borderRadius: 10, fontSize: 13, background: '#fff', color: 'var(--g700)' }}>
          <option value="">Todos os Estágios</option>
          {ESTAGIOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Full Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--g100)' }}>
                {['#', 'Startup', 'Setor', 'Estágio', 'Score', 'Classe', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((s, i) => {
                const cls = getScoreClass(s.score);
                return (
                  <tr key={s.id} onClick={() => navigate(`/startups/${s.id}`)} style={{ borderBottom: '1px solid var(--g100)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--g50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="font-display" style={{ fontSize: 16, fontWeight: 800, color: i < 3 ? cls.bg : 'var(--g400)' }}>#{i + 1}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{s.nome_startup.charAt(0)}</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, color: 'var(--g900)' }}>{s.nome_startup}</p>
                          <p style={{ margin: 0, fontSize: 12, color: 'var(--g500)' }}>{s.nome}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--g600)' }}>{SETORES.find(x => x.value === s.setorStartup)?.label}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--g600)' }}>{ESTAGIOS.find(x => x.value === s.estagio)?.label}</td>
                    <td style={{ padding: '12px 14px' }}><ScoreBadge score={s.score} size="sm" /></td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: cls.bg }}>{cls.label}</span>
                    </td>
                    <td style={{ padding: '12px 14px' }}><StatusBadge status={s.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
