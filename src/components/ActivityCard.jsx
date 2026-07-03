import polyline from '@mapbox/polyline'
import { useIsMobile } from '../hooks/useIsMobile'

function GpsTrace({ encoded }) {
  if (!encoded) return null
  const coords = polyline.decode(encoded)
  if (coords.length < 2) return null

  const lats = coords.map(c => c[0])
  const lngs = coords.map(c => c[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)

  const toX = (lng) => ((lng - minLng) / (maxLng - minLng || 1)) * 240 + 30
  const toY = (lat) => ((maxLat - lat) / (maxLat - minLat || 1)) * 80 + 20

  const pathD = coords.map((c, i) =>
    (i === 0 ? 'M' : 'L') + toX(c[1]).toFixed(2) + ',' + toY(c[0]).toFixed(2)
  ).join(' ')

  return (
    <svg viewBox="0 0 300 120" overflow="visible" style={{ width: '100%', height: 120, display: 'block' }}>
      <path d={pathD} stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const TYPE_ICONS = { Ride: '🚴', Run: '🏃', Swim: '🏊', Walk: '🚶', Hike: '🥾' }
const TYPE_COLORS = { Ride: '#3b82f6', Run: '#10b981', Swim: '#a855f7', Walk: '#6b7280', Hike: '#f97316' }

export default function ActivityCard({ activity }) {
  const isMobile = useIsMobile()
  const { name, type, date, distanceKm, movingTimeFormatted, elevationGain, avgHeartrate, avgWatts, weightedAvgWatts, tss, avgCadence, calories, summaryPolyline } = activity
  const icon = TYPE_ICONS[type] || '🏅'
  const color = TYPE_COLORS[type] || '#6b7280'
  // Parsear con año/mes/día explícitos para evitar interpretación UTC
  // new Date("2026-05-11") → UTC → en Colombia muestra "2026-05-10"
  // new Date(2026, 4, 11)  → hora local → muestra "2026-05-11"
  const dateStr = date ? (() => {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
  })() : ''

  return (
    <div style={{
      background: '#0b1120',
      border: '1px solid #1f2937',
      borderRadius: 10,
      padding: '1rem 1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {summaryPolyline && (
        <div style={{ margin: '-1rem -1.25rem 0', borderRadius: '10px 10px 0 0', overflow: 'hidden', background: '#0b1120' }}>
          <GpsTrace encoded={summaryPolyline} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: `${color}22`,
            border: `1px solid ${color}44`,
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 18,
          }}>{icon}</span>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{name}</div>
            <div style={{ color: '#6b7280', fontSize: 11, fontFamily: 'Space Mono', marginTop: 2 }}>
              {type} · {dateStr}
            </div>
          </div>
        </div>
        {tss != null && (
          <div style={{
            background: '#f9731622',
            border: '1px solid #f9731644',
            borderRadius: 6,
            padding: '2px 8px',
            color: '#f97316',
            fontSize: 12,
            fontFamily: 'Space Mono',
          }}>
            TSS {tss}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
        <Metric label="Dist." value={distanceKm != null ? `${distanceKm.toFixed(1)} km` : '—'} />
        <Metric label="Tiempo" value={movingTimeFormatted || '—'} />
        <Metric label="Desnivel" value={elevationGain != null ? `${Math.round(elevationGain)} m` : '—'} />
        <Metric label="FC avg" value={avgHeartrate ? `${Math.round(avgHeartrate)} bpm` : '—'} />
      </div>

      {(avgWatts != null || avgCadence != null || calories != null) && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {avgWatts   != null && (
            <span style={extraMetricStyle}>
              ⚡ {Math.round(avgWatts)} W
              {weightedAvgWatts != null && (
                <span style={{ color: '#4b5563', marginLeft: 4 }}>· NP {Math.round(weightedAvgWatts)} W</span>
              )}
            </span>
          )}
          {avgCadence != null && <span style={extraMetricStyle}>🔄 {Math.round(avgCadence)} rpm</span>}
          {calories   != null && <span style={extraMetricStyle}>🔥 {Math.round(calories)} kcal</span>}
        </div>
      )}
    </div>
  )
}

const extraMetricStyle = { color: '#6b7280', fontSize: 11, fontFamily: 'Space Mono' }

function Metric({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: '#6b7280', fontSize: 10, fontFamily: 'Space Mono', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: '#f1f5f9', fontSize: 13, fontFamily: 'Space Mono' }}>{value}</span>
    </div>
  )
}
