import { useState, useRef } from 'react';
import { FileText, Download, Eye, Printer, Calendar, Filter, FileBarChart } from 'lucide-react';
import { Card, ScoreBadge } from '../components/ui';
import { mockStartups } from '../mocks/startups';
import { mockDashboardKPIs, mockDistribuicaoClasse, mockDistribuicaoSetor, mockPipelineFunnel } from '../mocks/dashboard';
import { SETORES, ESTAGIOS, getScoreClass } from '../constants';
import { formatDate } from '../utils/formatters';
import LogoBCI from '../assets/logo/BCI_Logo_B.svg';

const REPORT_TYPES = [
  { key: 'portfolio', label: 'Relatório do Portfólio', description: 'Visão geral consolidada de todas as startups', icon: FileBarChart },
  { key: 'startup', label: 'Relatório Individual', description: 'Análise detalhada de uma startup específica', icon: FileText },
  { key: 'pipeline', label: 'Relatório de Pipeline', description: 'Status e movimentação do pipeline de venture building', icon: FileText },
  { key: 'ranking', label: 'Relatório de Ranking', description: 'Classificação das startups por score', icon: FileText },
];

function PortfolioReport({ reportRef }) {
  const kpis = mockDashboardKPIs;
  const top5 = [...mockStartups].sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    <div ref={reportRef} style={{ background: '#fff', padding: 32 }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #0A5DC2', paddingBottom: 20, marginBottom: 24 }}>
        <img src={LogoBCI} alt="BCI Ventures" style={{ width: 180, height: 'auto', marginBottom: 8 }} />
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Relatório do Portfólio</h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', margin: '0 0 12px' }}>KPIs Gerais</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[{ label: 'Total Startups', value: kpis.total_startups }, { label: 'Score Médio', value: kpis.score_medio }, { label: 'Taxa Aprovação', value: `${kpis.taxa_aprovacao}%` }, { label: 'Investidas', value: kpis.investidas }].map(k => (
          <div key={k.label} style={{ padding: 12, border: '1px solid var(--g200)', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--g500)' }}>{k.label}</p>
            <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: 'var(--g900)' }}>{k.value}</p>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', margin: '0 0 12px' }}>Distribuição por Classe</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {mockDistribuicaoClasse.map(c => (
          <div key={c.classe} style={{ flex: 1, padding: 10, borderRadius: 8, background: `${c.cor}15`, textAlign: 'center', border: `1px solid ${c.cor}30` }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: c.cor }}>{c.classe}</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--g600)' }}>{c.quantidade}</p>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', margin: '0 0 12px' }}>Top 5 Startups</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--g200)' }}>
            {['#', 'Startup', 'Setor', 'Score', 'Classe', 'Status'].map(h => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {top5.map((s, i) => {
            const cls = getScoreClass(s.score);
            return (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--g100)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--g400)' }}>#{i + 1}</td>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--g900)' }}>{s.nome_startup}</td>
                <td style={{ padding: '8px 10px', color: 'var(--g600)' }}>{SETORES.find(x => x.value === s.setorStartup)?.label}</td>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: cls.bg }}>{s.score}</td>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: cls.bg }}>{cls.label}</td>
                <td style={{ padding: '8px 10px', color: 'var(--g600)', textTransform: 'capitalize' }}>{s.status?.replace(/_/g, ' ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--g900)', margin: '0 0 12px' }}>Funil do Pipeline</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {mockPipelineFunnel.map(stage => {
          const max = Math.max(...mockPipelineFunnel.map(s => s.quantidade));
          return (
            <div key={stage.estagio} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, width: 100, textAlign: 'right', color: 'var(--g600)' }}>{stage.estagio}</span>
              <div style={{ flex: 1, height: 16, background: 'var(--g100)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--primary)', width: `${(stage.quantidade / max) * 100}%`, borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g700)', width: 24 }}>{stage.quantidade}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--g200)', textAlign: 'center', fontSize: 11, color: 'var(--g400)' }}>
        BCI Ventures © 2026 — Documento confidencial
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('portfolio');
  const [previewOpen, setPreviewOpen] = useState(false);
  const reportRef = useRef(null);

  const handleExportPDF = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const el = reportRef.current;
      if (!el) return;
      html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `bci_relatorio_${selectedReport}_${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(el).save();
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const content = reportRef.current?.innerHTML;
    if (printWindow && content) {
      printWindow.document.write(`<html><head><title>BCI Ventures — Relatório</title><style>body{font-family:'Inter',sans-serif;padding:20px;color:#1a1a2e}table{width:100%;border-collapse:collapse}th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #eee}th{font-size:11px;text-transform:uppercase;color:#666}@media print{body{padding:0}}</style></head><body>${content}</body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Relatórios</h1>
          <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>Gere e exporte relatórios da plataforma</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPreviewOpen(!previewOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: '1.5px solid var(--g200)', borderRadius: 10, background: '#fff', color: 'var(--g600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Eye style={{ width: 14, height: 14 }} /> {previewOpen ? 'Fechar Preview' : 'Preview'}
          </button>
          <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: '1.5px solid var(--g200)', borderRadius: 10, background: '#fff', color: 'var(--g600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Printer style={{ width: 14, height: 14 }} /> Imprimir
          </button>
          <button onClick={handleExportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: 'none', borderRadius: 10, background: 'var(--primary-gradient)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}>
            <Download style={{ width: 14, height: 14 }} /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {REPORT_TYPES.map(type => {
          const Icon = type.icon;
          const isActive = selectedReport === type.key;
          return (
            <div key={type.key} onClick={() => setSelectedReport(type.key)} style={{
              padding: 16, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
              border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--g200)'}`,
              background: isActive ? 'rgba(10,93,194,0.04)' : '#fff',
              boxShadow: isActive ? '0 0 0 3px rgba(10,93,194,0.1)' : 'none',
            }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--g300)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--g200)'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ padding: 8, borderRadius: 8, background: isActive ? 'rgba(10,93,194,0.1)' : 'var(--g100)' }}>
                  <Icon style={{ width: 18, height: 18, color: isActive ? 'var(--primary)' : 'var(--g500)' }} />
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>{type.label}</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--g500)', lineHeight: 1.4 }}>{type.description}</p>
            </div>
          );
        })}
      </div>

      {/* Report Preview */}
      {previewOpen && (
        <Card title="Preview do Relatório" icon={Eye}>
          <div style={{ border: '1px solid var(--g200)', borderRadius: 8, overflow: 'hidden', maxHeight: 600, overflowY: 'auto' }}>
            {selectedReport === 'portfolio' && <PortfolioReport reportRef={reportRef} />}
            {selectedReport === 'startup' && (
              <div ref={reportRef} style={{ background: '#fff', padding: 32, textAlign: 'center' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--g900)', margin: '0 0 8px' }}>Relatório Individual</h2>
                <p style={{ color: 'var(--g500)' }}>Selecione uma startup na lista para gerar o relatório individual.</p>
              </div>
            )}
            {selectedReport === 'pipeline' && (
              <div ref={reportRef} style={{ background: '#fff', padding: 32 }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: 20, marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--g900)', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>BCI Ventures — Relatório de Pipeline</h1>
                  <p style={{ fontSize: 13, color: 'var(--g500)', margin: 0 }}>Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: '2px solid var(--g200)' }}>
                    {['Estágio', 'Quantidade', 'Percentual'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{mockPipelineFunnel.map(s => (
                    <tr key={s.estagio} style={{ borderBottom: '1px solid var(--g100)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{s.estagio}</td>
                      <td style={{ padding: '8px 10px' }}>{s.quantidade}</td>
                      <td style={{ padding: '8px 10px' }}>{((s.quantidade / 15) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}</tbody>
                </table>
                <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'var(--g400)' }}>BCI Ventures © 2026</div>
              </div>
            )}
            {selectedReport === 'ranking' && (
              <div ref={reportRef} style={{ background: '#fff', padding: 32 }}>
                <div style={{ textAlign: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: 20, marginBottom: 24 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--g900)', margin: '0 0 4px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>BCI Ventures — Ranking de Startups</h1>
                  <p style={{ fontSize: 13, color: 'var(--g500)', margin: 0 }}>Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: '2px solid var(--g200)' }}>
                    {['#', 'Startup', 'Setor', 'Estágio', 'Score', 'Classe'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--g500)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{[...mockStartups].sort((a, b) => b.score - a.score).map((s, i) => {
                    const cls = getScoreClass(s.score);
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--g100)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: 'var(--g400)' }}>#{i + 1}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{s.nome_startup}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--g600)' }}>{SETORES.find(x => x.value === s.setorStartup)?.label}</td>
                        <td style={{ padding: '8px 10px', color: 'var(--g600)' }}>{ESTAGIOS.find(x => x.value === s.estagio)?.label}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, color: cls.bg }}>{s.score}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: cls.bg }}>{cls.label}</td>
                      </tr>
                    );
                  })}</tbody>
                </table>
                <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: 'var(--g400)' }}>BCI Ventures © 2026</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Recent Exports */}
      <Card title="Exportações Recentes" icon={FileText}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { name: 'bci_relatorio_portfolio_2025-08-20.pdf', date: '2025-08-20', size: '1.2 MB', user: 'Admin BCI' },
            { name: 'bci_relatorio_pipeline_2025-08-18.pdf', date: '2025-08-18', size: '845 KB', user: 'Diretor BCI' },
            { name: 'bci_relatorio_ranking_2025-08-15.pdf', date: '2025-08-15', size: '932 KB', user: 'Admin BCI' },
          ].map(doc => (
            <div key={doc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--g200)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--g50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileText style={{ width: 18, height: 18, color: 'var(--accent-red)' }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--g900)' }}>{doc.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--g400)' }}>{doc.size} • {doc.user} • {formatDate(doc.date)}</p>
                </div>
              </div>
              <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--g200)', background: '#fff', fontSize: 12, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
                <Download style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Download
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
