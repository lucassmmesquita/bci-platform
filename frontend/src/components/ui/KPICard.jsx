export default function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', subtitleColor, onClick }) {
  const colorMap = {
    blue: { bg: 'rgba(10,93,194,0.1)', text: 'var(--primary)' },
    green: { bg: 'rgba(0,196,140,0.1)', text: 'var(--accent-green)' },
    purple: { bg: 'rgba(124,92,252,0.1)', text: 'var(--accent-purple)' },
    gold: { bg: 'rgba(255,176,32,0.1)', text: 'var(--status-pending)' },
    red: { bg: 'rgba(255,71,87,0.1)', text: 'var(--accent-red)' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div onClick={onClick} className="animate-fadeUp" style={{
      background: '#fff', borderRadius: 16, padding: 20, border: '1px solid var(--g200)',
      boxShadow: 'var(--shadow-sm)', cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, color: 'var(--g500)', margin: 0, fontWeight: 500 }}>{title}</p>
          <p className="font-display animate-countUp" style={{ fontSize: 28, fontWeight: 700, color: 'var(--g900)', margin: '4px 0 0' }}>{value}</p>
        </div>
        {Icon && <div style={{ padding: 10, borderRadius: 12, background: c.bg }}>
          <Icon style={{ width: 20, height: 20, color: c.text }} />
        </div>}
      </div>
      {subtitle && <p style={{ fontSize: 13, color: subtitleColor || 'var(--g500)', margin: '8px 0 0', fontWeight: 500 }}>{subtitle}</p>}
    </div>
  );
}
