import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Rocket, Globe, DollarSign, FileText, GitBranch, MessageSquare, History, BarChart3, Shield, TrendingUp, Building2, Package, AlertTriangle, CheckCircle2, Loader2, Download, ExternalLink } from 'lucide-react';
import { Card, ScoreBadge, StatusBadge } from '../components/ui';
import { fetchStartup, fetchStartupDocuments, getFileDownloadUrl } from '../services/startupService';
import { getStartupScore } from '../mocks/scores';
import { SETORES, ESTAGIOS, STARTUP_DIMENSIONS, PRODUCT_DIMENSIONS, RISK_LEVELS, RECOMMENDED_ACTIONS, getScoreClass } from '../constants';
import { formatCPF, formatPhone, formatDate } from '../utils/formatters';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const TABS = [
  { key: 'dados', label: 'Dados', icon: User },
  { key: 'score', label: 'Score', icon: BarChart3 },
  { key: 'docs', label: 'Documentos', icon: FileText },
  { key: 'pipeline', label: 'Pipeline', icon: GitBranch },
  { key: 'notas', label: 'Notas', icon: MessageSquare },
  { key: 'historico', label: 'Histórico', icon: History },
];

function FieldRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--g100)' }}>
      <span style={{ fontSize: 13, color: 'var(--g500)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--g900)', fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {Icon && <div style={{ padding: 8, borderRadius: 10, background: 'rgba(10,93,194,0.08)' }}><Icon style={{ width: 18, height: 18, color: 'var(--primary)' }} /></div>}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function ScoreCard({ label, value, color, subtitle }) {
  const cls = getScoreClass(value);
  return (
    <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--g200)', background: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color || cls.bg }} />
      <p style={{ margin: '4px 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--g500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: color || cls.bg }}>{value}</p>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--g400)' }}>{subtitle}</p>}
    </div>
  );
}

function DimensionBars({ dimensions, dimDefs, accentColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {dimensions.map((d, i) => {
        const def = dimDefs.find(x => x.key === d.key);
        const barColor = d.value >= 75 ? 'var(--accent-green)' : d.value >= 50 ? accentColor : d.value >= 30 ? 'var(--status-pending)' : 'var(--accent-red)';
        return (
          <div key={d.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--g700)', fontWeight: 500 }}>
                <span style={{ fontWeight: 700, color: accentColor, marginRight: 6 }}>{d.key}</span>
                {def?.label} <span style={{ fontSize: 11, color: 'var(--g400)' }}>({def?.peso}%)</span>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{d.value}</span>
            </div>
            <div style={{ height: 8, background: 'var(--g100)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, background: barColor, width: `${d.value}%`, transition: 'width 0.6s ease', animation: 'slideRight 0.5s ease both', animationDelay: `${i * 0.04}s` }} />
            </div>
            <p style={{ fontSize: 11, color: 'var(--g400)', margin: '3px 0 0' }}>{d.justificativa}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function StartupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dados');
  const [startup, setStartup] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchStartup(id),
      fetchStartupDocuments(id),
    ]).then(([s, docs]) => {
      if (!cancelled) { setStartup(s); setDocuments(docs); }
    }).catch(err => {
      if (!cancelled) setError('Erro ao carregar startup.');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const scoreData = useMemo(() => getStartupScore(Number(id)), [id]);

  if (loading) return <div className="animate-fadeIn" style={{ textAlign: 'center', paddingTop: 80 }}><Loader2 style={{ width: 32, height: 32, margin: '0 auto 12px', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} /><p style={{ color: 'var(--g500)' }}>Carregando...</p></div>;
  if (error || !startup) return <div className="animate-fadeIn" style={{ textAlign: 'center', paddingTop: 80 }}><p style={{ color: 'var(--g500)' }}>{error || 'Startup não encontrada'}</p></div>;

  const startupRadar = scoreData?.startupDimensions?.map(d => ({
    dimension: STARTUP_DIMENSIONS.find(x => x.key === d.key)?.label || d.key,
    value: d.value, fullMark: 100,
  })) || [];

  const productRadar = scoreData?.productDimensions?.map(d => ({
    dimension: PRODUCT_DIMENSIONS.find(x => x.key === d.key)?.label || d.key,
    value: d.value, fullMark: 100,
  })) || [];

  const riskInfo = RISK_LEVELS.find(r => r.value === scoreData?.riskLevel);
  const actionInfo = RECOMMENDED_ACTIONS.find(a => a.value === scoreData?.recommendedAction);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <button onClick={() => navigate('/startups')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--g500)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} /> Voltar para lista
      </button>

      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{startup.nome_startup.charAt(0)}</div>
            <div>
              <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>{startup.nome_startup}</h1>
              <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>{SETORES.find(x => x.value === (startup.setor || startup.setorStartup))?.label || startup.setor || startup.setorStartup} • {startup.cidade}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {scoreData && <ScoreBadge score={scoreData.startupScoreFinal} size="lg" />}
            <StatusBadge status={startup.status} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, overflowX: 'auto', background: '#fff', borderRadius: 12, border: '1px solid var(--g200)', padding: 4 }} className="scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 500,
            background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
            color: activeTab === tab.key ? '#fff' : 'var(--g500)', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            <tab.icon style={{ width: 16, height: 16 }} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn" key={activeTab}>
        {activeTab === 'dados' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <Section title="Fundador" icon={User}>
              <FieldRow label="Nome" value={startup.nome} />
              <FieldRow label="CPF" value={formatCPF(startup.cpf)} />
              <FieldRow label="Nascimento" value={formatDate(startup.nascimento)} />
              <FieldRow label="Telefone" value={formatPhone(startup.telefone)} />
              <FieldRow label="E-mail" value={startup.email} />
              <FieldRow label="Cidade" value={startup.cidade} />
            </Section>
            <Section title="Startup" icon={Rocket}>
              <FieldRow label="Nome" value={startup.nome_startup} />
              <FieldRow label="Setor" value={SETORES.find(x => x.value === (startup.setor || startup.setorStartup))?.label || startup.setor || startup.setorStartup} />
              <FieldRow label="Problema" value={startup.problema?.replace(/_/g, ' ')} />
              <FieldRow label="Tecnologia" value={startup.tecnologia?.replace(/_/g, ' ')} />
              <FieldRow label="Estágio" value={ESTAGIOS.find(x => x.value === startup.estagio)?.label} />
              <FieldRow label="Equipe" value={`${startup.numero_integrantes} integrantes`} />
              <FieldRow label="Estrutura Jurídica" value={startup.estrutura_juridica} />
            </Section>
            <Section title="Mercado" icon={Globe}>
              <FieldRow label="Público" value={startup.publico?.toUpperCase()} />
              <FieldRow label="TAM" value={startup.tam?.replace(/_/g, ' ')} />
              <FieldRow label="SAM" value={startup.sam?.replace(/_/g, ' ')} />
              <FieldRow label="SOM" value={startup.som?.replace(/_/g, ' ')} />
              <FieldRow label="Concorrentes" value={startup.concorrentes} />
              <FieldRow label="Diferencial" value={startup.diferencial?.replace(/_/g, ' ')} />
            </Section>
            <Section title="Finanças" icon={DollarSign}>
              <FieldRow label="Faturamento" value={startup.faturamento_atual?.replace(/_/g, ' ')} />
              <FieldRow label="Previsão" value={startup.previsao_faturamento?.replace(/_/g, ' ')} />
              <FieldRow label="Valuation" value={startup.valuation?.replace(/_/g, ' ')} />
              <FieldRow label="Investimento" value={startup.investimento_desejado} />
              <FieldRow label="Captação anterior" value={startup.captacao_anterior?.replace(/_/g, ' ')} />
            </Section>
          </div>
        )}

        {activeTab === 'score' && scoreData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Score overview cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              <ScoreCard label="Startup" value={scoreData.startupScoreFinal} color="#0A5DC2" subtitle={`Base: ${scoreData.startupScoreBase}`} />
              <ScoreCard label="Produto" value={scoreData.productScoreFinal} color="#7C5CFC" subtitle={`Base: ${scoreData.productScoreBase}`} />
              <ScoreCard label="Confiança" value={scoreData.confidence} color="#00C48C" subtitle="Confidence Score" />
              <ScoreCard label="Equity" value={scoreData.equityScore} color="#7C5CFC" />
              <ScoreCard label="Aquisição" value={scoreData.acquisitionScore} color="#0A5DC2" />
              <ScoreCard label="Consultoria" value={scoreData.consultingScore} color="#00C48C" />
            </div>

            {/* Risk + Recommendation */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--g200)', background: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ padding: 10, borderRadius: 10, background: `${riskInfo?.color || '#9AA1B4'}15` }}>
                  <Shield style={{ width: 22, height: 22, color: riskInfo?.color }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--g500)', fontWeight: 500 }}>Nível de Risco</p>
                  <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: riskInfo?.color }}>{riskInfo?.label} <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--g400)' }}>• Penalidade: -{scoreData.riskPenalty}pts</span></p>
                </div>
              </div>
              <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--g200)', background: '#fff', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ padding: 10, borderRadius: 10, background: `${actionInfo?.color || '#9AA1B4'}15` }}>
                  <TrendingUp style={{ width: 22, height: 22, color: actionInfo?.color }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--g500)', fontWeight: 500 }}>Recomendação</p>
                  <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: actionInfo?.color }}>{actionInfo?.label}</p>
                </div>
              </div>
            </div>

            {/* Flags */}
            {scoreData.flags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {scoreData.flags.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,176,32,0.08)', border: '1px solid rgba(255,176,32,0.2)', fontSize: 12, fontWeight: 600, color: '#B8860B' }}>
                    <AlertTriangle style={{ width: 14, height: 14 }} /> {f === 'solicitar_docs' ? 'Solicitar Documentos' : f === 'solicitar_info' ? 'Solicitar Informações' : f}
                  </div>
                ))}
              </div>
            )}

            {/* Dual Radar + Bars */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Building2 style={{ width: 18, height: 18, color: '#0A5DC2' }} />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Startup Score</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={startupRadar}>
                    <PolarGrid stroke="var(--g200)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'var(--g600)' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Startup" dataKey="value" stroke="#0A5DC2" fill="#0A5DC2" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <DimensionBars dimensions={scoreData.startupDimensions} dimDefs={STARTUP_DIMENSIONS} accentColor="#0A5DC2" />
              </Card>

              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Package style={{ width: 18, height: 18, color: '#7C5CFC' }} />
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Product Score</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={productRadar}>
                    <PolarGrid stroke="var(--g200)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: 'var(--g600)' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <Radar name="Produto" dataKey="value" stroke="#7C5CFC" fill="#7C5CFC" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
                <DimensionBars dimensions={scoreData.productDimensions} dimDefs={PRODUCT_DIMENSIONS} accentColor="#7C5CFC" />
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'docs' && (
          <Card title="Documentos" icon={FileText}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[{ key: 'pitch_deck', name: 'Pitch Deck' }, { key: 'cap_table', name: 'Cap Table' }, { key: 'plano_financeiro', name: 'Plano Financeiro' }].map(docDef => {
                const doc = documents?.[docDef.key];
                const uploaded = !!doc;
                const size = uploaded ? `${(doc.size / 1024).toFixed(1)} KB` : '—';
                const ext = uploaded ? doc.original_name?.split('.').pop()?.toUpperCase() : '—';
                return (
                  <div key={docDef.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 10, border: '1px solid var(--g200)', background: uploaded ? '#fff' : 'var(--g50)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <FileText style={{ width: 18, height: 18, color: uploaded ? 'var(--primary)' : 'var(--g400)' }} />
                      <div><p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>{docDef.name}</p><p style={{ margin: 0, fontSize: 12, color: 'var(--g400)' }}>{ext} • {size}{uploaded ? ` • ${doc.original_name}` : ''}</p></div>
                    </div>
                    {uploaded
                      ? <a href={getFileDownloadUrl(doc.stored_name)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--g200)', background: '#fff', fontSize: 12, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', textDecoration: 'none' }}><Download style={{ width: 14, height: 14 }} /> Download</a>
                      : <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent-red)', background: 'rgba(255,71,87,0.08)', padding: '4px 10px', borderRadius: 6 }}>Pendente</span>}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {activeTab === 'pipeline' && (
          <Card title="Histórico de Pipeline" icon={GitBranch}>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, background: 'var(--g200)' }} />
              {[{ stage: 'Inscrição', date: startup.data_criacao, user: 'Sistema' }, { stage: 'Triagem', date: '2025-08-05', user: 'Ana Souza' }, { stage: 'Avaliação', date: '2025-08-12', user: 'Carlos Mendes' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -20, top: 16, width: 16, height: 16, borderRadius: '50%', background: i === 2 ? 'var(--primary)' : 'var(--g300)', border: '3px solid #fff', boxShadow: '0 0 0 2px var(--g200)' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>{item.stage}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--g400)' }}>{formatDate(item.date)} • {item.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'notas' && (
          <Card title="Notas do Analista" icon={MessageSquare}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[{ author: 'Ana Souza', date: '2025-08-15', text: 'Startup com potencial técnico forte. Equipe precisa de reforço na área comercial.', internal: true }, { author: 'Carlos Mendes', date: '2025-08-18', text: 'Pitch deck bem estruturado. Valuation parece razoável para o estágio.', internal: false }].map((note, i) => (
                <div key={i} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--g200)', background: note.internal ? 'rgba(255,176,32,0.04)' : '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g900)' }}>{note.author}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {note.internal && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--status-pending)', background: 'rgba(255,176,32,0.1)', padding: '2px 8px', borderRadius: 4 }}>INTERNO</span>}
                      <span style={{ fontSize: 12, color: 'var(--g400)' }}>{formatDate(note.date)}</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--g700)', lineHeight: 1.5 }}>{note.text}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'historico' && (
          <Card title="Log de Auditoria" icon={History}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{ action: 'Score recalculado', detail: `Startup: ${scoreData?.startupScoreFinal} | Produto: ${scoreData?.productScoreFinal}`, date: '2025-08-20', user: 'Sistema' }, { action: 'Status alterado', detail: `→ ${startup.status}`, date: '2025-08-18', user: 'Ana Souza' }, { action: 'Movido no pipeline', detail: '→ Avaliação', date: '2025-08-12', user: 'Carlos Mendes' }, { action: 'Startup cadastrada', detail: 'Importação automática', date: startup.data_criacao, user: 'Sistema' }].map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--g100)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--primary)' : 'var(--g300)', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--g900)' }}>{log.action} <span style={{ fontWeight: 400, color: 'var(--g500)' }}>{log.detail}</span></p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--g400)' }}>{formatDate(log.date)} • {log.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
