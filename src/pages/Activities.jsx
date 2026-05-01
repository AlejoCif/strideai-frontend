import { useState } from 'react'
import { useActivities } from '../hooks/useActivities'
import ActivityCard from '../components/ActivityCard'
import LoadingSpinner from '../components/LoadingSpinner'

const FILTERS = ['Todas', 'Ride', 'Run', 'Swim']

export default function Activities() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('Todas')
  const { activities, loading, error, syncing, sync } = useActivities(20, page)

  const filtered = filter === 'Todas' ? activities : activities.filter((a) => a.type === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}>Actividades</h1>
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
          }}
        >
          {syncing ? '⟳ Sincronizando...' : '⟳ Sincronizar'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            style={{
              padding: '6px 16px',
              background: filter === f ? '#f97316' : '#0b1120',
              border: `1px solid ${filter === f ? '#f97316' : '#1f2937'}`,
              borderRadius: 8,
              color: filter === f ? '#030712' : '#6b7280',
              fontFamily: 'Space Mono', fontSize: 12,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 13, padding: '12px 16px', background: '#f9731611', borderRadius: 8, border: '1px solid #f9731633' }}>
          {error}
        </div>
      )}

      {loading
        ? <LoadingSpinner />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0
              ? <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13 }}>No hay actividades para este filtro.</p>
              : filtered.map((a) => <ActivityCard key={a.stravaId} activity={a} />)
            }
          </div>
        )
      }

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          style={pageBtnStyle(page === 1)}
        >
          ← Anterior
        </button>
        <span style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13, alignSelf: 'center' }}>
          Página {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={activities.length < 20}
          style={pageBtnStyle(activities.length < 20)}
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}

const pageBtnStyle = (disabled) => ({
  padding: '8px 16px',
  background: '#0b1120',
  border: '1px solid #1f2937',
  borderRadius: 8,
  color: disabled ? '#374151' : '#f1f5f9',
  fontFamily: 'Space Mono', fontSize: 12,
  cursor: disabled ? 'not-allowed' : 'pointer',
})
