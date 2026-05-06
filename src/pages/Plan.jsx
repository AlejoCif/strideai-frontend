import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'
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

function formatDate(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`
}

// ── Grid de 7 días ──────────────────────────────────────────────────────────
function DayGrid({ days }) {
  if (!days?.length) return null
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
        gap: 10,
        minWidth: 700,
      }}>
        {days.map((day, i) => {
          const type = (day.type || 'rest').toLowerCase()
          const bg     = SESSION_BG[type]     ?? SESSION_BG.easy
          const border = SESSION_BORDER[type] ?? SESSION_BORDER.easy
          const zone     = day.zone && day.zone !== 'null' ? day.zone : null
          const duration = day.duration != null
            ? (typeof day.duration === 'number' ? `${day.duration} min` : day.duration)
            : null

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
                {duration && (
                  <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 11 }}>⏱ {duration}</div>
                )}
                {zone && (
                  <div style={{ color: '#3b82f6', fontFamily: 'Space Mono', fontSize: 11 }}>Z: {zone}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Tarjeta acordeón de un plan ─────────────────────────────────────────────
function PlanCard({ plan, expanded, onToggle }) {
  const days = Array.isArray(plan.plan) ? plan.plan : []
  const recommendations = Array.isArray(plan.recommendations) ? plan.recommendations : []

  return (
    <div style={{
      background: '#0b1120',
      border: `1px solid ${expanded ? '#f9731644' : '#1f2937'}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      {/* Cabecera clicable */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '1rem 1.25rem', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 3 }}>
            {plan.title || plan.focus || 'Plan sin título'}
          </div>
          <div style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 11 }}>
            Semana del {formatDate(plan.weekStartDate)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {plan.weekTSS != null && (
            <div style={{ background: '#a855f722', border: '1px solid #a855f744', borderRadius: 6, padding: '3px 10px' }}>
              <span style={{ color: '#a855f7', fontFamily: 'Space Mono', fontSize: 11 }}>TSS {plan.weekTSS}</span>
            </div>
          )}
          <span style={{
            color: expanded ? '#f97316' : '#6b7280',
            fontSize: 20, lineHeight: 1, fontFamily: 'monospace',
            transition: 'color 0.15s',
          }}>
            {expanded ? '−' : '+'}
          </span>
        </div>
      </button>

      {/* Contenido expandible */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1f2937', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DayGrid days={days} />
          {recommendations.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#f1f5f9', marginBottom: 10 }}>
                💡 Recomendaciones
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recommendations.map((rec, i) => (
                  <li key={i} style={{
                    color: '#94a3b8', fontFamily: 'Space Mono', fontSize: 12, lineHeight: 1.6,
                    paddingLeft: 14, borderLeft: '2px solid #f9731644',
                  }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────────────
export default function Plan() {
  const [history, setHistory]       = useState([])
  const [expandedId, setExpandedId] = useState(null)
  const [goal, setGoal]             = useState('')
  const [weeks, setWeeks]           = useState('')
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [generating, setGenerating]         = useState(false)
  const [error, setError]                   = useState(null)

  // Carga el historial. silent=true omite el spinner (usado tras generar)
  const fetchHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoadingHistory(true)
    try {
      const res = await client.get('/api/ai/plan/history')
      const plans = Array.isArray(res.data) ? res.data : []
      setHistory(plans)
      // Expande el plan más reciente automáticamente
      setExpandedId(plans[0]?.id ?? null)
    } catch (err) {
      if (err.response?.status !== 404) setError('Error cargando historial de planes')
    } finally {
      if (!silent) setLoadingHistory(false)
    }
  }, [])

  // Solo al montar — GET, nunca POST
  useEffect(() => { fetchHistory() }, [fetchHistory])

  // Solo desde el botón — POST + refetch silencioso
  const handleGenerate = async () => {
    if (generating) return
    setGenerating(true)
    setError(null)
    try {
      await client.post('/api/ai/plan', {
        goal: goal || undefined,
        weeksToEvent: weeks ? parseInt(weeks, 10) : undefined,
      })
      // Refetch para obtener el nuevo plan con id, weekStartDate, etc.
      await fetchHistory({ silent: true })
    } catch {
      setError('Error generando plan. Intenta de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleExpanded = (id) =>
    setExpandedId((prev) => (prev === id ? null : id))

  const showSpinner = loadingHistory || generating

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}>
        Planes de Entrenamiento
      </h1>

      {/* Formulario — único punto de entrada para POST */}
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

      {error && (
        <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 13, padding: '12px 16px', background: '#f9731611', borderRadius: 8, border: '1px solid #f9731633' }}>
          {error}
        </div>
      )}

      {showSpinner && <LoadingSpinner />}

      {/* Historial en acordeón */}
      {!showSpinner && history.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              expanded={expandedId === p.id}
              onToggle={() => toggleExpanded(p.id)}
            />
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!showSpinner && history.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13 }}>
          No hay planes generados aún. Usa el botón para crear uno con IA.
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
