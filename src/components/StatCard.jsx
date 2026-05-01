export default function StatCard({ label, value, unit, color = '#f97316', icon }) {
  return (
    <div style={{
      background: '#0b1120',
      border: '1px solid #1f2937',
      borderRadius: 12,
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: 12, fontFamily: 'Space Mono', textTransform: 'uppercase', letterSpacing: 1 }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color }}>
          {value ?? '—'}
        </span>
        {unit && (
          <span style={{ color: '#6b7280', fontSize: 13, fontFamily: 'Space Mono' }}>{unit}</span>
        )}
      </div>
    </div>
  )
}
