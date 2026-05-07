import { Rocket, TrendingUp, CheckCircle2, Target, Trophy, ArrowUpRight } from 'lucide-react';
import { KPICard, Card, ScoreBadge } from '../components/ui';
import { mockDashboardKPIs, mockDistribuicaoClasse, mockDistribuicaoEstagio, mockTrendCadastros, mockPipelineFunnel } from '../mocks/dashboard';
import { mockStartups } from '../mocks/startups';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

export default function ExecutiveDashboard() {
  const kpis = mockDashboardKPIs;
  const top10 = [...mockStartups].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fadeIn">
      <div>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: 'var(--g900)', margin: 0 }}>Dashboard Executivo</h1>
        <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>Visão consolidada do portfólio BCI Ventures</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <KPICard title="Total Startups" value={kpis.total_startups} subtitle={`+${kpis.variacao_startups}%`} subtitleColor="var(--accent-green)" icon={Rocket} color="blue" />
        <KPICard title="Score Médio" value={kpis.score_medio} subtitle={`+${kpis.variacao_score}%`} subtitleColor="var(--accent-green)" icon={TrendingUp} color="purple" />
        <KPICard title="Taxa Aprovação" value={`${kpis.taxa_aprovacao}%`} subtitle="do total avaliado" icon={CheckCircle2} color="green" />
        <KPICard title="Investidas" value={kpis.investidas} subtitle="no portfólio ativo" icon={Target} color="gold" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
        {/* Top 10 */}
        <Card title="Top 10 por Score" icon={Trophy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {top10.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 9 ? '1px solid var(--g100)' : 'none' }}>
                <span className="font-display" style={{ fontSize: 16, fontWeight: 800, color: i < 3 ? 'var(--primary)' : 'var(--g400)', width: 24, textAlign: 'center' }}>#{i + 1}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{s.nome_startup.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--g900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nome_startup}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--g500)' }}>{s.cidade}</p>
                </div>
                <ScoreBadge score={s.score} size="sm" />
              </div>
            ))}
          </div>
        </Card>

        {/* Distribuição por Classe */}
        <Card title="Distribuição por Classe" icon={Target}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={mockDistribuicaoClasse} dataKey="quantidade" nameKey="classe" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} label={({ classe, quantidade }) => `${classe} (${quantidade})`} labelLine={false}>
                {mockDistribuicaoClasse.map((entry, i) => <Cell key={i} fill={entry.cor} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--g200)', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Tendência de Cadastros */}
        <Card title="Cadastros por Mês" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockTrendCadastros}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--g100)" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickFormatter={v => { const m = v.split('-')[1]; const months = ['', 'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']; return months[parseInt(m)]; }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--g200)', fontSize: 13 }} />
              <defs><linearGradient id="colorCad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs>
              <Area type="monotone" dataKey="cadastros" stroke="var(--primary)" fill="url(#colorCad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Estágio */}
        <Card title="Distribuição por Estágio" icon={Rocket}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mockDistribuicaoEstagio} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--g100)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="estagio" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--g200)', fontSize: 13 }} />
              <Bar dataKey="quantidade" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
