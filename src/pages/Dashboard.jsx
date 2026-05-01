import { useEffect } from 'react'
import { useActivities } from '../hooks/useActivities'
import { useStats } from '../hooks/useStats'
import StatCard from '../components/StatCard'
import ActivityCard from '../components/ActivityCard'
import WeeklyChart from '../components/WeeklyChart'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard({ athlete }) {
  const { activities, loading: loadingActs, syncing, sync } = useActivities(6)
  const { stats, loading: loadingStats } = useStats()

  const fitness = stats?.fitness
  const weekly = stats?.weekly || []
  const weeklyKm = weekly[0]?.totalDistanceKm?.toFixed(0) || '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: '#f1f5f9' }}>
            {athlete ? `Hola, ${athlete.name.split(' ')[0]} 👋` : 'Dashboard'}
          </h1>
          <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13, marginTop: 4 }}>
            Resumen de tu entrenamiento
          </p>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          style={{
            padding: '8px 18px',
            background: syncing ? '#1f2937' : '#f97316',
            border: 'none', borderRadius: 8,
            color: syncing ? '#6b7280' : '#030712',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
            cursor: syncing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {syncing ? '⟳ Sincronizando...' : '⟳ Sincronizar'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard label="Distancia semana" value={weeklyKm} unit="km" color="#3b82f6" icon="🏃" />
        <StatCard label="CTL (Fitness)" value={fitness?.ctl} unit="" color="#10b981" icon="📈" />
        <StatCard label="TSB (Forma)" value={fitness?.tsb} unit=""
          color={fitness?.tsb >= 0 ? '#10b981' : '#f97316'} icon="⚖️" />
        <StatCard label="TSS semana" value={fitness?.weeklyTss} unit="" color="#a855f7" icon="⚡" />
      </div>

      <div style={{
        background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem',
      }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Carga semanal (TSS)
        </h2>
        {loadingStats ? <LoadingSpinner /> : <WeeklyChart data={weekly} />}
      </div>

      <div>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 14 }}>
          Actividades recientes
        </h2>
        {loadingActs
          ? <LoadingSpinner />
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activities.slice(0, 3).map((a) => (
                <ActivityCard key={a.stravaId} activity={a} />
              ))}
              {activities.length === 0 && (
                <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13 }}>
                  No hay actividades. Sincroniza con Strava.
                </p>
              )}
            </div>
          )
        }
      </div>
    </div>
  )
}
