export default function Card({ children, title, subtitle, icon: Icon, action, className = '', padding = true, hover = false, onClick, style = {} }) {
  return (
    <div
      className={`${hover ? 'hover-card' : ''} ${className}`}
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 16, border: '1px solid var(--g200)',
        boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default', ...style
      }}
    >
      {(title || action) && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--g100)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {Icon && <div style={{ padding: 8, borderRadius: 10, background: 'rgba(10,93,194,0.08)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon style={{ width: 18, height: 18 }} /></div>}
            <div style={{ minWidth: 0 }}>
              {title && <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--g900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h3>}
              {subtitle && <p style={{ fontSize: 13, color: 'var(--g500)', margin: '2px 0 0' }}>{subtitle}</p>}
            </div>
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div style={{ padding: padding ? 20 : 0 }}>{children}</div>
    </div>
  );
}
