import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivities } from '../hooks/useActivities'
import { useStats } from '../hooks/useStats'
import ActivityCard from '../components/ActivityCard'
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
  const navigate     = useNavigate()
  const fileInputRef = useRef(null)

  const [customImage, setCustomImage] = useState(
    () => localStorage.getItem('strideai_header_image')
  )

  const fitness  = stats?.fitness
  const weekly   = stats?.weekly || []
  const currWeek = weekly.at(-1)
  const prevWeek = weekly.at(-2)

  const weeklyKm  = currWeek?.totalDistanceKm?.toFixed(1) ?? '—'
  const weeklyTss = currWeek?.estimatedTss ?? fitness?.weeklyTss ?? '—'

  const pctChange = (curr, prev) => {
    if (curr == null || !prev) return null
    return Math.round(((curr - prev) / prev) * 100)
  }

  const kmDiff  = pctChange(currWeek?.totalDistanceKm,  prevWeek?.totalDistanceKm)
  const tssDiff = pctChange(currWeek?.estimatedTss,     prevWeek?.estimatedTss)

  const diffLabel = (pct) => {
    if (pct == null) return null
    if (pct > 0)  return { text: `↑ ${pct}% vs semana pasada`,   color: '#10b981' }
    if (pct < 0)  return { text: `↓ ${Math.abs(pct)}% vs semana pasada`, color: '#ef4444' }
    return          { text: '= igual que la semana pasada',       color: '#6b7280' }
  }

  const kmLabel  = diffLabel(kmDiff)
  const tssLabel = diffLabel(tssDiff)

  const tsbColor = fitness?.tsb > 10 ? '#10b981' : fitness?.tsb < -10 ? '#ef4444' : '#f59e0b'

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

      {/* ── Coach IA ─────────────────────────────────────────────────── */}
      <div
        onClick={() => navigate('/coach')}
        style={{
          background: '#111827',
          borderLeft: '3px solid #f97316',
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 24, flexShrink: 0 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>
            Pregúntale a tu entrenador
          </div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            Analiza tus actividades con IA
          </div>
        </div>
        <span style={{ color: '#f97316', fontSize: 18, flexShrink: 0 }}>→</span>
      </div>

      {/* ── NIVEL 1 — Distancia y TSS ────────────────────────────────── */}
      {loadingStats ? <LoadingSpinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'DISTANCIA SEMANA', value: weeklyKm, unit: 'km', diff: kmLabel },
            { label: 'TSS SEMANA',       value: weeklyTss, unit: null, diff: tssLabel },
          ].map(({ label, value, unit, diff }) => (
            <div key={label} style={{
              background: '#0b1120', border: '1px solid #1f2937',
              borderRadius: 12, padding: '16px 18px',
            }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#6b7280', letterSpacing: 1, marginBottom: 8 }}>
                {label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 48, color: '#f1f5f9', lineHeight: 1 }}>
                  {value}
                </span>
                {unit && (
                  <span style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 20, color: '#6b7280' }}>
                    {unit}
                  </span>
                )}
              </div>
              {diff && (
                <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: diff.color, marginTop: 8 }}>
                  {diff.text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── NIVEL 2 — CTL / ATL / TSB ────────────────────────────────── */}
      {loadingStats ? null : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'CTL',   sublabel: 'FITNESS',  value: fitness?.ctl, icon: '📈' },
            { label: 'ATL',   sublabel: 'FATIGA',   value: fitness?.atl, icon: '🔥' },
            { label: 'TSB',   sublabel: 'FORMA',    value: fitness?.tsb, icon: '⚖️' },
          ].map(({ label, sublabel, value, icon }) => (
            <div key={label} style={{
              background: '#0b1120', border: '1px solid #1f2937',
              borderRadius: 12, padding: '14px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#6b7280', letterSpacing: 1 }}>
                    {label}
                  </span>
                  <br />
                  <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#4b5563', letterSpacing: 0.5 }}>
                    {sublabel}
                  </span>
                </div>
                <span style={{ fontSize: 16 }}>{icon}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 32, color: '#f1f5f9', lineHeight: 1 }}>
                  {value ?? '—'}
                </span>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: tsbColor, flexShrink: 0,
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

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
