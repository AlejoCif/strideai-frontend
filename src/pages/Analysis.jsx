import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useAI } from '../hooks/useAI'
import { useStats } from '../hooks/useStats'
import { useIsMobile } from '../hooks/useIsMobile'
import WeeklyChart from '../components/WeeklyChart'
import LoadingSpinner from '../components/LoadingSpinner'
import AIChat from '../components/AIChat'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export default function Analysis() {
  const [chatOpen, setChatOpen] = useState(false)
  const { analysis, loadingAnalysis, error, fetchAnalysis } = useAI()
  const { stats, loading: loadingStats } = useStats()
  const isMobile = useIsMobile()

  useEffect(() => { fetchAnalysis() }, [fetchAnalysis])

  const weekly = stats?.weekly || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}>Análisis</h1>
        <button
          onClick={() => setChatOpen(true)}
          style={{
            padding: '8px 18px',
            background: '#f97316', border: 'none', borderRadius: 8,
            color: '#030712', fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
            cursor: 'pointer',
          }}
        >
          🤖 Hablar con entrenador
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
            Carga semanal (TSS)
          </h2>
          {loadingStats ? <LoadingSpinner /> : <WeeklyChart data={weekly} />}
        </div>

        <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
            Volumen por semana (km)
          </h2>
          {loadingStats ? <LoadingSpinner /> : (
            <div style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <BarChart
                  data={weekly.map((w) => ({
                    weekLabel: w.weekLabel || '',
                    km: Math.round(w.totalDistanceKm || 0),
                    isEmpty: w.activityCount === 0,
                  }))}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis dataKey="weekLabel" tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Space Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 8, fontFamily: 'Space Mono', fontSize: 12 }}
                    formatter={(v, _n, props) => props.payload.isEmpty ? ['Sin actividad', ''] : [`${v} km`, 'Distancia']}
                    cursor={{ fill: '#1f293780' }}
                  />
                  <Bar dataKey="km" radius={[4, 4, 0, 0]}>
                    {weekly.map((w, i) => (
                      <Cell key={i} fill={w.activityCount === 0 ? '#1f2937' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
          💡 Análisis IA
        </h2>
        {error && (
          <p style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 13 }}>{error}</p>
        )}
        {loadingAnalysis
          ? <LoadingSpinner />
          : analysis
            ? (
              <div style={{
                color: '#94a3b8', fontFamily: 'Space Mono', fontSize: 13, lineHeight: 1.8,
                borderLeft: '3px solid #f97316',
                paddingLeft: 16,
              }}>
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            )
            : (
              <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13 }}>
                No hay análisis disponible. Asegúrate de tener actividades sincronizadas.
              </p>
            )
        }
      </div>

      {weekly.length > 0 && (
        <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
            Resumen por semana
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Mono', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Semana', 'Km', 'Horas', 'Actividades', 'TSS', 'Desnivel',
                    ...(weekly.some(w => w.avgWatts      != null) ? ['Potencia'] : []),
                    ...(weekly.some(w => w.avgCadence    != null) ? ['Cadencia'] : []),
                    ...(weekly.some(w => w.totalCalories != null) ? ['Calorías'] : []),
                  ].map((h) => (
                    <th key={h} style={{ color: '#6b7280', textAlign: 'left', padding: '6px 12px', borderBottom: '1px solid #1f2937', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekly.map((w) => (
                  <tr key={w.weekLabel} style={{ borderBottom: '1px solid #1f293740' }}>
                    <td style={tdStyle}>{w.weekLabel}</td>
                    <td style={tdStyle}>{w.totalDistanceKm?.toFixed(1)}</td>
                    <td style={tdStyle}>{w.totalTimeHours?.toFixed(1)}h</td>
                    <td style={tdStyle}>{w.activityCount}</td>
                    <td style={{ ...tdStyle, color: '#f97316' }}>{w.estimatedTss}</td>
                    <td style={tdStyle}>{Math.round(w.totalElevation || 0)}m</td>
                    {weekly.some(w2 => w2.avgWatts      != null) && <td style={tdStyle}>{w.avgWatts      != null ? `${Math.round(w.avgWatts)} W`        : '—'}</td>}
                    {weekly.some(w2 => w2.avgCadence   != null) && <td style={tdStyle}>{w.avgCadence   != null ? `${Math.round(w.avgCadence)} rpm`   : '—'}</td>}
                    {weekly.some(w2 => w2.totalCalories != null) && <td style={tdStyle}>{w.totalCalories != null ? `${Math.round(w.totalCalories)} kcal` : '—'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
    </div>
  )
}

const tdStyle = { color: '#f1f5f9', padding: '8px 12px' }
