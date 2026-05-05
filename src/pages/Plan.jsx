import { useState, useEffect } from 'react'
import client from '../api/client'
import { useIsMobile } from '../hooks/useIsMobile'
import LoadingSpinner from '../components/LoadingSpinner'

const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

const SESSION_BG = {
  rest: '#0b1120', recovery: '#10b98118', easy: '#3b82f618',
  tempo: '#f9731618', intervals: '#a855f718', long: '#f9731612',
  race: '#ef444418', strength: '#6b728018',
}

const SESSION_BORDER = {
  rest: '#374151', recovery: '#10b981', easy: '#3b82f6',
  tempo: '#f97316', intervals: '#a855f7', long: '#f97316',
  race: '#ef4444', strength: '#6b7280',
}

/**
 * Normaliza cualquier variante del response a la forma canónica:
 * { plan: Day[], weekTSS: number|null, focus: string|null, recommendations: string[] }
 */
function normalizePlan(raw) {
  if (!raw) return null

  let days = []
  let weekTSS = raw.weekTSS ?? raw.weekTss ?? null
  let focus = raw.focus ?? null
  let recommendations = Array.isArray(raw.recommendations) ? raw.recommendations : []

  if (Array.isArray(raw.plan)) {
    // Nuevo formato: plan ya es el array de días
    days = raw.plan
  } else if (typeof raw.plan === 'string') {
    // Legado: plan es string JSON (con o sin fences de markdown)
    try {
      const clean = raw.plan.replace(/```json\n?|```/g, '').trim()
      const parsed = JSON.parse(clean)
      if (Array.isArray(parsed)) {
        days = parsed
      } else {
        days = parsed.days || parsed.week || []
        if (weekTSS == null) weekTSS = parsed.weekTSS ?? parsed.weekTss ?? null
        if (focus == null) focus = parsed.focus ?? null
      }
    } catch { /* string no parseable, days queda vacío */ }
  } else if (raw.planJson) {
    // Fallback más antiguo
    try {
      const parsed = typeof raw.planJson === 'string' ? JSON.parse(raw.planJson) : raw.planJson
      days = parsed.days || parsed.week || []
      if (weekTSS == null) weekTSS = parsed.weekTSS ?? parsed.weekTss ?? null
      if (focus == null) focus = parsed.focus ?? null
    } catch { /* ignorar */ }
  }

  return { plan: days, weekTSS, focus, recommendations }
}

export default function Plan() {
  const [plan, setPlan] = useState(null)      // datos normalizados del plan
  const [goal, setGoal] = useState('')
  const [weeks, setWeeks] = useState('')
  const [loadingLatest, setLoadingLatest] = useState(true)  // carga inicial GET
  const [generating, setGenerating] = useState(false)       // POST en curso
  const [error, setError] = useState(null)
  const isMobile = useIsMobile()

  // Solo al montar: carga el último plan guardado (GET, nunca POST)
  useEffect(() => {
    client.get('/api/ai/plan/latest')
      .then((res) => setPlan(normalizePlan(res.data)))
      .catch((err) => {
        if (err.response?.status !== 404) setError('Error cargando plan guardado')
        // 404 = no hay plan aún, es OK
      })
      .finally(() => setLoadingLatest(false))
  }, []) // deps vacíos: se ejecuta una sola vez, nunca llama a POST

  // Solo se llama desde onClick del botón
  const handleGenerate = async () => {
    if (generating) return // guard contra doble click
    setGenerating(true)
    setError(null)
    try {
      const res = await client.post('/api/ai/plan', {
        goal: goal || undefined,
        weeksToEvent: weeks ? parseInt(weeks, 10) : undefined,
      })
      setPlan(normalizePlan(res.data))
    } catch {
      setError('Error generando plan. Intenta de nuevo.')
    } finally {
      setGenerating(false) // siempre se desactiva, incluso si hay error
    }
  }

  // Extraer campos del plan normalizado para el render
  const days = plan?.plan ?? []
  const weekTSS = plan?.weekTSS
  const focus = plan?.focus
  const recommendations = plan?.recommendations ?? []

  const showSpinner = loadingLatest || generating

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}>Plan de Entrenamiento</h1>
          {focus && (
            <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13, marginTop: 4 }}>
              Foco: {focus}
            </p>
          )}
        </div>
        {weekTSS != null && (
          <div style={{ background: '#a855f722', border: '1px solid #a855f744', borderRadius: 8, padding: '6px 14px', flexShrink: 0 }}>
            <span style={{ color: '#a855f7', fontFamily: 'Space Mono', fontSize: 13 }}>TSS Semana: {weekTSS}</span>
          </div>
        )}
      </div>

      {/* Formulario — el botón es el único punto de entrada para POST */}
      <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem' }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
          Generar con IA
        </h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="Objetivo (ej: media maratón)"
            style={inputStyle}
          />
          <input
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
            placeholder="Semanas al evento"
            type="number"
            min="1"
            style={{ ...inputStyle, flex: 'none', width: 170 }}
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '10px 20px',
              background: generating ? '#1f2937' : '#f97316',
              border: 'none', borderRadius: 8,
              color: generating ? '#6b7280' : '#030712',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 14,
              cursor: generating ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {generating ? '⟳ Generando...' : '🤖 Generar con IA'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 13, padding: '12px 16px', background: '#f9731611', borderRadius: 8, border: '1px solid #f9731633' }}>
          {error}
        </div>
      )}

      {/* Spinner unificado (carga inicial o generación) */}
      {showSpinner && <LoadingSpinner />}

      {/* Grid de 7 días */}
      {!showSpinner && days.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
            gap: 10,
            minWidth: 700,
          }}>
            {days.map((day, i) => {
              const type = (day.type || 'rest').toLowerCase()
              const bg = SESSION_BG[type] ?? SESSION_BG.easy
              const border = SESSION_BORDER[type] ?? SESSION_BORDER.easy
              const zone = day.zone && day.zone !== 'null' ? day.zone : null

              return (
                <div key={i} style={{
                  background: bg,
                  border: `1px solid ${border}44`,
                  borderTop: `3px solid ${border}`,
                  borderRadius: 10,
                  padding: '0.75rem',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                    {DAY_LABELS[i] ?? day.day}
                  </div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>
                    {day.label || (type === 'rest' ? 'Descanso' : type)}
                  </div>
                  {day.note && (
                    <div style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 11, lineHeight: 1.5 }}>
                      {day.note}
                    </div>
                  )}
                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {day.duration && (
                      <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 11 }}>
                        ⏱ {day.duration}
                      </div>
                    )}
                    {zone && (
                      <div style={{ color: '#3b82f6', fontFamily: 'Space Mono', fontSize: 11 }}>
                        Z: {zone}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {!showSpinner && recommendations.length > 0 && (
        <div style={{ background: '#0b1120', border: '1px solid #1f2937', borderRadius: 12, padding: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
            💡 Recomendaciones
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recommendations.map((rec, i) => (
              <li key={i} style={{
                color: '#94a3b8', fontFamily: 'Space Mono', fontSize: 13, lineHeight: 1.6,
                paddingLeft: 14, borderLeft: '2px solid #f9731644',
              }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Estado vacío — solo si no hay días Y no está cargando */}
      {!showSpinner && days.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13 }}>
          No hay plan generado. Usa el botón para crear uno con IA.
        </div>
      )}

    </div>
  )
}

const inputStyle = {
  flex: 1, minWidth: 160,
  background: '#030712', border: '1px solid #1f2937',
  borderRadius: 8, padding: '10px 14px',
  color: '#f1f5f9', fontFamily: 'Space Mono', fontSize: 13, outline: 'none',
}
