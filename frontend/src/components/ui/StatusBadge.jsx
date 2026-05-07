import { getStatusInfo } from '../../constants';

export default function StatusBadge({ status }) {
  const info = getStatusInfo(status);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: info.bg, color: info.color, border: `1px solid ${info.border}`, whiteSpace: 'nowrap' }}>
      {info.label}
    </span>
  );
}
