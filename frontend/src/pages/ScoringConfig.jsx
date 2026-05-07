import { useState } from 'react';
import { Settings, Save, RotateCcw, AlertTriangle, CheckCircle2, Building2, Package } from 'lucide-react';
import { Card } from '../components/ui';
import { STARTUP_DIMENSIONS, PRODUCT_DIMENSIONS } from '../constants';

function DimensionGroup({ title, icon: Icon, dimensions, onUpdate, accentColor }) {
  const total = dimensions.reduce((s, d) => s + d.peso, 0);
  const isValid = total === 100;
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: 8, borderRadius: 10, background: `${accentColor}15` }}>
          <Icon style={{ width: 18, height: 18, color: accentColor }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>{title}</h3>
          <p style={{ fontSize: 12, color: 'var(--g400)', margin: '2px 0 0' }}>7 dimensões • Total deve ser 100</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isValid
            ? <CheckCircle2 style={{ width: 16, height: 16, color: 'var(--accent-green)' }} />
            : <AlertTriangle style={{ width: 16, height: 16, color: 'var(--accent-red)' }} />}
          <span style={{ fontSize: 14, fontWeight: 700, color: isValid ? 'var(--accent-green)' : 'var(--accent-red)' }}>{total}%</span>
        </div>
      </div>
      <div style={{ height: 4, background: 'var(--g100)', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ height: '100%', borderRadius: 999, background: isValid ? 'var(--accent-green)' : total > 100 ? 'var(--accent-red)' : accentColor, width: `${Math.min(total, 100)}%`, transition: 'all 0.3s' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dimensions.map((dim, i) => (
          <div key={dim.key} className="animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: i < dimensions.length - 1 ? '1px solid var(--g100)' : 'none', animationDelay: `${i * 0.03}s` }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${accentColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: accentColor, flexShrink: 0 }}>{dim.key}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>{dim.label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--g400)' }}>{dim.description}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <input type="range" min={0} max={30} value={dim.peso} onChange={e => onUpdate(dim.key, e.target.value)} style={{ width: 100, accentColor }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <input type="number" min={0} max={100} value={dim.peso} onChange={e => onUpdate(dim.key, e.target.value)} style={{ width: 48, padding: '5px 6px', border: '1.5px solid var(--g200)', borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'center', color: 'var(--g900)', outline: 'none' }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--g400)' }}>%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ScoringConfig() {
  const [startupDims, setStartupDims] = useState(STARTUP_DIMENSIONS.map(d => ({ ...d })));
  const [productDims, setProductDims] = useState(PRODUCT_DIMENSIONS.map(d => ({ ...d })));
  const [saved, setSaved] = useState(false);

  const totalStartup = startupDims.reduce((s, d) => s + d.peso, 0);
  const totalProduct = productDims.reduce((s, d) => s + d.peso, 0);
  const isValid = totalStartup === 100 && totalProduct === 100;

  const updateDim = (setter) => (key, value) => {
    const v = Math.max(0, Math.min(100, Number(value) || 0));
    setter(prev => prev.map(d => d.key === key ? { ...d, peso: v } : d));
    setSaved(false);
  };

  const handleSave = () => { if (!isValid) return; setSaved(true); setTimeout(() => setSaved(false), 3000); };
  const handleReset = () => { setStartupDims(STARTUP_DIMENSIONS.map(d => ({ ...d }))); setProductDims(PRODUCT_DIMENSIONS.map(d => ({ ...d }))); setSaved(false); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Configuração de Score</h1>
          <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>Defina os pesos das dimensões de avaliação — Startup e Produto</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: '1.5px solid var(--g200)', borderRadius: 10, background: '#fff', color: 'var(--g600)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <RotateCcw style={{ width: 14, height: 14 }} /> Resetar
          </button>
          <button onClick={handleSave} disabled={!isValid} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: 'none', borderRadius: 10, background: isValid ? 'var(--primary-gradient)' : 'var(--g300)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: isValid ? 'pointer' : 'not-allowed', boxShadow: isValid ? 'var(--shadow-primary)' : 'none' }}>
            <Save style={{ width: 14, height: 14 }} /> Salvar
          </button>
        </div>
      </div>

      {saved && (
        <div className="animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(0,196,140,0.08)', border: '1px solid rgba(0,196,140,0.2)', borderRadius: 12, color: '#00966B', fontSize: 14, fontWeight: 500 }}>
          <CheckCircle2 style={{ width: 18, height: 18 }} /> Configuração salva com sucesso!
        </div>
      )}

      {/* Composite formula reference */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Settings style={{ width: 18, height: 18, color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Fórmulas dos Scores Compostos</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {[
            { label: 'Equity Score', formula: '40% Startup + 30% Produto + 15% Valuation Fit + 15% Confiança', color: '#7C5CFC' },
            { label: 'Acquisition Score', formula: '30% Startup + 35% Produto + 20% Fit Estratégico + 15% Prontidão', color: '#0A5DC2' },
            { label: 'Consulting Score', formula: '25% Startup + 25% Produto + 20% Coachability + 20% Gargalos + 10% Confiança', color: '#00C48C' },
          ].map(s => (
            <div key={s.label} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--g200)', background: `${s.color}06` }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: s.color }}>{s.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--g500)', lineHeight: 1.4 }}>{s.formula}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Dual dimension editors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 16 }}>
        <DimensionGroup title="Startup Score" icon={Building2} dimensions={startupDims} onUpdate={updateDim(setStartupDims)} accentColor="#0A5DC2" />
        <DimensionGroup title="Product Score" icon={Package} dimensions={productDims} onUpdate={updateDim(setProductDims)} accentColor="#7C5CFC" />
      </div>
    </div>
  );
}
