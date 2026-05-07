import { useState, useMemo } from 'react';
import { Eye, User, Rocket, Globe, DollarSign, FileText, BarChart3, MessageSquare, Clock } from 'lucide-react';
import { Card, ScoreBadge, StatusBadge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { mockStartups } from '../mocks/startups';
import { getStartupScore } from '../mocks/scores';
import { SETORES, ESTAGIOS, SCORE_DIMENSIONS } from '../constants';
import { formatCPF, formatPhone, formatDate } from '../utils/formatters';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--g100)' }}>
      <span style={{ fontSize: 13, color: 'var(--g500)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--g900)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
    </div>
  );
}

export default function StartupPortal() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState('dados');
  const startup = useMemo(() => mockStartups.find(s => s.id === (usuario?.startup_id || 1)), [usuario]);
  const scoreData = useMemo(() => startup ? getStartupScore(startup.id) : null, [startup]);

  if (!startup) return <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--g500)' }}>Nenhuma startup vinculada</div>;

  const tabs = [
    { key: 'dados', label: 'Meus Dados', icon: User },
    { key: 'status', label: 'Status', icon: Clock },
    { key: 'feedback', label: 'Feedback', icon: MessageSquare },
    { key: 'score', label: 'Score', icon: BarChart3 },
    { key: 'relatorio', label: 'Relatório', icon: FileText },
  ];

  const radarData = scoreData?.dimensions?.map(d => ({
    dimension: SCORE_DIMENSIONS.find(x => x.key === d.key)?.label || d.key, value: d.value, fullMark: 100,
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--g200)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Eye style={{ width: 16, height: 16, color: 'var(--g400)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--g400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Visualização Somente Leitura</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff' }}>{startup.nome_startup.charAt(0)}</div>
            <div>
              <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>{startup.nome_startup}</h1>
              <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>{SETORES.find(x => x.value === startup.setorStartup)?.label} • {startup.cidade}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <ScoreBadge score={startup.score} size="lg" />
            <StatusBadge status={startup.status} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 2, overflowX: 'auto', background: '#fff', borderRadius: 12, border: '1px solid var(--g200)', padding: 4 }} className="scrollbar-hide">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: tab === t.key ? 600 : 500, background: tab === t.key ? 'var(--primary)' : 'transparent', color: tab === t.key ? '#fff' : 'var(--g500)', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            <t.icon style={{ width: 16, height: 16 }} /> {t.label}
          </button>
        ))}
      </div>

      <div key={tab} className="animate-fadeIn">
        {tab === 'dados' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <Card title="Fundador" icon={User} padding>
              <Field label="Nome" value={startup.nome} />
              <Field label="CPF" value={formatCPF(startup.cpf)} />
              <Field label="Telefone" value={formatPhone(startup.telefone)} />
              <Field label="E-mail" value={startup.email} />
              <Field label="Cidade" value={startup.cidade} />
            </Card>
            <Card title="Startup" icon={Rocket} padding>
              <Field label="Nome" value={startup.nome_startup} />
              <Field label="Setor" value={SETORES.find(x => x.value === startup.setorStartup)?.label} />
              <Field label="Estágio" value={ESTAGIOS.find(x => x.value === startup.estagio)?.label} />
              <Field label="Tecnologia" value={startup.tecnologia} />
              <Field label="Equipe" value={`${startup.numero_integrantes} integrantes`} />
            </Card>
            <Card title="Mercado" icon={Globe} padding>
              <Field label="Público" value={startup.publico?.toUpperCase()} />
              <Field label="TAM" value={startup.tam} />
              <Field label="SAM" value={startup.sam} />
              <Field label="SOM" value={startup.som} />
            </Card>
            <Card title="Finanças" icon={DollarSign} padding>
              <Field label="Faturamento" value={startup.faturamento_atual} />
              <Field label="Valuation" value={startup.valuation} />
              <Field label="Investimento" value={startup.investimento_desejado} />
            </Card>
          </div>
        )}
        {tab === 'status' && (
          <Card title="Status da Avaliação" icon={Clock}>
            <div style={{ textAlign: 'center', padding: 32 }}>
              <StatusBadge status={startup.status} />
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--g900)', margin: '16px 0 4px' }}>Seu projeto está {startup.status === 'pendente' ? 'aguardando análise' : startup.status === 'em_analise' ? 'sendo avaliado' : startup.status === 'aprovado' ? 'aprovado!' : 'em revisão'}</p>
              <p style={{ fontSize: 14, color: 'var(--g500)' }}>Última atualização: {formatDate('2025-08-20')}</p>
            </div>
          </Card>
        )}
        {tab === 'feedback' && (
          <Card title="Feedback da Equipe BCI" icon={MessageSquare}>
            {[{ author: 'Ana Souza', date: '2025-08-18', text: 'Pitch deck bem estruturado. Solução inovadora com potencial de escala.', type: 'Avaliação Inicial' }].map((fb, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 10, border: '1px solid var(--g200)', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g900)' }}>{fb.author}</span>
                  <span style={{ fontSize: 12, color: 'var(--g400)' }}>{formatDate(fb.date)}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--g700)', lineHeight: 1.5 }}>{fb.text}</p>
              </div>
            ))}
          </Card>
        )}
        {tab === 'score' && scoreData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 16 }}>
            <Card title="Radar de Score" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}><PolarGrid stroke="var(--g200)" /><PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: 'var(--g600)' }} /><PolarRadiusAxis angle={90} domain={[0, 100]} /><Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} /></RadarChart>
              </ResponsiveContainer>
            </Card>
            <Card title="Score Total" icon={BarChart3}>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div className="font-display animate-countUp" style={{ fontSize: 64, fontWeight: 800, color: 'var(--g900)' }}>{startup.score}</div>
                <ScoreBadge score={startup.score} size="lg" />
                <p style={{ fontSize: 14, color: 'var(--g500)', marginTop: 16 }}>Calculado em {formatDate(scoreData.calculatedAt)}</p>
              </div>
            </Card>
          </div>
        )}
        {tab === 'relatorio' && (
          <Card title="Relatório de Análise" icon={FileText}>
            <div style={{ textAlign: 'center', padding: 32 }}>
              <FileText style={{ width: 48, height: 48, color: 'var(--g300)', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--g900)', margin: '0 0 8px' }}>Relatório disponível para download</p>
              <p style={{ fontSize: 14, color: 'var(--g500)', margin: '0 0 20px' }}>O relatório contém a análise completa do seu projeto.</p>
              <button style={{ padding: '12px 32px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}>Baixar PDF</button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
