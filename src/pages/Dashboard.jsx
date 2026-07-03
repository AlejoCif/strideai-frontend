import { useState, useRef } from 'react'
import { useActivities } from '../hooks/useActivities'
import { useStats } from '../hooks/useStats'
import StatCard from '../components/StatCard'
import ActivityCard from '../components/ActivityCard'
import WeeklyChart from '../components/WeeklyChart'
import LoadingSpinner from '../components/LoadingSpinner'

const SPORT_IMAGES = {
  Ride:  '/bici-header.jpg',
  Run:   '/running-header.jpg',
  Swim:  '/natacion-header.jpg',
}

const getGreeting = () => {
  const h = parseInt(
    new Date().toLocaleString('en-US', { timeZone: 'America/Bogota', hour: 'numeric', hour12: false })
  )
  if (h >= 6  && h < 12) return 'Buenos días'
  if (h >= 12 && h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const compressImage = (file, callback) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 800
      let { width, height } = img
      if (width > MAX)  { height = Math.round((height * MAX) / width);  width  = MAX }
      if (height > MAX) { width  = Math.round((width  * MAX) / height); height = MAX }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      callback(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

export default function Dashboard({ athlete }) {
  const { activities, loading: loadingActs, syncing, sync } = useActivities(6)
  const { stats, loading: loadingStats } = useStats()
  const fileInputRef = useRef(null)

  const [customImage, setCustomImage] = useState(
    () => localStorage.getItem('strideai_header_image')
  )

  const fitness   = stats?.fitness
  const weekly    = stats?.weekly || []
  const weeklyKm  = weekly[0]?.totalDistanceKm?.toFixed(0) || '—'

  const autoImage = SPORT_IMAGES[activities[0]?.type] || '/bici-header.jpg'
  const heroImage = customImage || autoImage
  const greeting  = getGreeting()
  const firstName = athlete?.name?.split(' ')[0] ?? athlete?.name

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    compressImage(file, (dataUrl) => {
      localStorage.setItem('strideai_header_image', dataUrl)
      setCustomImage(dataUrl)
    })
  }

  const handleResetImage = () => {
    localStorage.removeItem('strideai_header_image')
    setCustomImage(null)
  }

  const iconBtn = {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 8, padding: '4px 8px',
    cursor: 'pointer', fontSize: 14, lineHeight: 1,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', height: 180,
        borderRadius: 16, overflow: 'hidden',
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(3,7,18,0.95) 100%)',
        }} />

        {/* Controles de imagen — arriba derecha */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, zIndex: 1 }}>
          <input
            ref={fileInputRef} type="file" accept="image/*"
            onChange={handleImageUpload} style={{ display: 'none' }}
          />
          <button onClick={() => fileInputRef.current?.click()} style={iconBtn}>📷</button>
          <button onClick={handleResetImage} style={iconBtn}>🔄</button>
        </div>

        {/* Sync — arriba izquierda */}
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
          <button
            onClick={sync} disabled={syncing}
            style={{
              padding: '6px 14px',
              background: syncing ? 'rgba(31,41,55,0.8)' : 'rgba(249,115,22,0.9)',
              border: 'none', borderRadius: 8,
              color: syncing ? '#6b7280' : '#030712',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 12,
              cursor: syncing ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            {syncing ? '⟳ Sincronizando...' : '⟳ Sincronizar'}
          </button>
        </div>

        {/* Saludo — abajo izquierda */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: '#ffffff', margin: 0 }}>
            {athlete ? `${greeting}, ${firstName}` : greeting}
          </h1>
          <p style={{ color: '#9ca3af', fontFamily: 'Space Mono', fontSize: 13, margin: '4px 0 0' }}>
            Tu entrenamiento, tu progreso
          </p>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
        <StatCard label="Distancia semana" value={weeklyKm}       unit="km" color="#3b82f6" icon="🏃" />
        <StatCard label="CTL (Fitness)"    value={fitness?.ctl}   unit=""   color="#10b981" icon="📈" />
        <StatCard label="TSB (Forma)"      value={fitness?.tsb}   unit=""
          color={fitness?.tsb >= 0 ? '#10b981' : '#f97316'} icon="⚖️" />
        <StatCard label="TSS semana"       value={fitness?.weeklyTss} unit="" color="#a855f7" icon="⚡" />
      </div>

      {/* ── Carga semanal ─────────────────────────────────────────────── */}
      <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
          Carga semanal (TSS)
        </h2>
        {loadingStats ? <LoadingSpinner /> : <WeeklyChart data={weekly} />}
      </div>

      {/* ── Actividades recientes ─────────────────────────────────────── */}
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
