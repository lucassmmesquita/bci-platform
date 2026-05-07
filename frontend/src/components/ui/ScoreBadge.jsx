import { getScoreClass } from '../../constants';

export default function ScoreBadge({ score, size = 'md' }) {
  const cls = getScoreClass(score);
  const sizes = { sm: { fontSize: 12, padding: '2px 8px' }, md: { fontSize: 14, padding: '4px 12px' }, lg: { fontSize: 16, padding: '6px 16px' } };
  const s = sizes[size] || sizes.md;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: cls.bg, color: cls.class === 'C' ? 'var(--g900)' : '#fff', borderRadius: 8, padding: s.padding, fontSize: s.fontSize, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap' }}>
      {cls.class} • {score}
    </span>
  );
}
