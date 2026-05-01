import { useState, useEffect } from 'react'
import { useAI } from '../hooks/useAI'
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

function parsePlan(planData) {
  if (!planData) return null
  try {
    const raw = planData.planJson || planData.plan || planData
    const str = typeof raw === 'string' ? raw : JSON.stringify(raw)
    const match = str.match(/```json\n?([\s\S]*?)\n?```/) || str.match(/\{[\s\S]*\}/)
    const jsonStr = match ? (match[1] || match[0]) : str
    return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
  } catch {
    return null
  }
}

export default function Plan() {
  const [goal, setGoal] = useState('')
  const [weeks, setWeeks] = useState('')
  const { plan, loadingPlan, error, fetchLatestPlan, generatePlan } = useAI()

  useEffect(() => { fetchLatestPlan() }, [fetchLatestPlan])

  const parsed = parsePlan(plan)
  const days = parsed?.days || parsed?.week || []
  const weekTss = plan?.weekTss
  const focus = plan?.focus || parsed?.focus

  const handleGenerate = async () => {
    await generatePlan({
      goal: goal || undefined,
      weeksToEvent: weeks ? parseInt(weeks) : undefined,
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}>Plan de Entrenamiento</h1>
          {focus && <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13, marginTop: 4 }}>Foco: {focus}</p>}
        </div>
        {weekTss && (
          <div style={{ background: '#a855f722', border: '1px solid #a855f744', borderRadius: 8, padding: '6px 14px' }}>
            <span style={{ color: '#a855f7', fontFamily: 'Space Mono', fontSize: 13 }}>TSS Semana: {weekTss}</span>
          </div>
        )}
      </div>

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
            placeholder="Semanas para el evento"
            type="number"
            style={{ ...inputStyle, width: 180 }}
          />
          <button
            onClick={handleGenerate}
            disabled={loadingPlan}
            style={{
              padding: '10px 20px',
              background: loadingPlan ? '#1f2937' : '#f97316',
              border: 'none', borderRadius: 8,
              color: loadingPlan ? '#6b7280' : '#030712',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 14,
              cursor: loadingPlan ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {loadingPlan ? '⟳ Generando...' : '🤖 Generar con IA'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 13, padding: '12px 16px', background: '#f9731611', borderRadius: 8, border: '1px solid #f9731633' }}>
          {error}
        </div>
      )}

      {loadingPlan && <LoadingSpinner />}

      {days.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))', gap: 10, minWidth: 700 }}>
          {DAY_LABELS.map((label, i) => {
            const day = days[i] || {}
            const type = (day.type || day.sessionType || 'rest').toLowerCase()
            const bg = SESSION_BG[type] ?? SESSION_BG.easy
            const border = SESSION_BORDER[type] ?? SESSION_BORDER.easy
            return (
              <div key={label} style={{
                background: bg,
                border: `1px solid ${border}44`,
                borderTop: `3px solid ${border}`,
                borderRadius: 10,
                padding: '0.75rem',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                <div style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: '#f1f5f9', textTransform: 'capitalize' }}>
                  {type === 'rest' ? 'Descanso' : type}
                </div>
                {day.description && (
                  <div style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 11, lineHeight: 1.5 }}>
                    {day.description}
                  </div>
                )}
                {day.duration && (
                  <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 11, marginTop: 'auto' }}>
                    ⏱ {day.duration}
                  </div>
                )}
                {day.tss != null && (
                  <div style={{ color: '#a855f7', fontFamily: 'Space Mono', fontSize: 11 }}>
                    TSS: {day.tss}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        </div>
      )}

      {!loadingPlan && days.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13 }}>
          No hay plan generado. Usa el botón para crear uno con IA.
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  flex: 1, minWidth: 200,
  background: '#030712', border: '1px solid #1f2937',
  borderRadius: 8, padding: '10px 14px',
  color: '#f1f5f9', fontFamily: 'Space Mono', fontSize: 13, outline: 'none',
}
