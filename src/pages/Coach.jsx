import { useState, useRef, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { useChatMessages, withDateSeps } from '../hooks/useChatMessages'
import LoadingSpinner from '../components/LoadingSpinner'

const COACH_SUGGESTIONS = [
  { icon: '📊', text: 'Analiza mi última salida' },
  { icon: '⏱️', text: '¿Cómo estuvo mi recuperación?' },
  { icon: '⚡', text: 'Compara mis últimas 2 salidas' },
]

export default function Coach() {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const didLoad   = useRef(false)
  const isMobile  = useIsMobile()

  const {
    messages, loadingHistory, sending, usage,
    exhausted, usageColor, sendMessage,
  } = useChatMessages()

  useEffect(() => {
    if (loadingHistory) return
    bottomRef.current?.scrollIntoView({ behavior: didLoad.current ? 'smooth' : 'instant' })
    didLoad.current = true
  }, [messages, loadingHistory])

  useEffect(() => {
    if (!isMobile && !loadingHistory) inputRef.current?.focus()
  }, [isMobile, loadingHistory])

  const realMsgs   = messages.filter(m => m.role !== 'loading')
  const loadingMsg = messages.find(m => m.role === 'loading') ?? null
  const displayed  = loadingMsg ? [...realMsgs, loadingMsg] : realMsgs
  const isEmpty    = !realMsgs.some(m => m.role === 'user')

  const send = () => { sendMessage(input.trim()); setInput('') }

  const chatHeight = isMobile
    ? 'calc(100dvh - 60px - 72px - 2rem)'
    : 'calc(100dvh - 60px - 3rem)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: chatHeight, gap: 0 }}>

      {/* ── Header del coach ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '1rem 0', borderBottom: '1px solid #1f2937', flexShrink: 0,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#064e3b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
        }}>🤖</div>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#ffffff' }}>
            Coach StrideAI
          </div>
          <div style={{ color: '#10b981', fontFamily: 'Space Mono', fontSize: 12, marginTop: 2 }}>
            ● En línea
          </div>
        </div>
        {usage && (
          <div style={{ marginLeft: 'auto', fontFamily: 'Space Mono', fontSize: 11, color: usageColor }}>
            {usage.isAdmin ? '✨ Admin' : `${usage.chatRemaining}/${usage.chatLimit} restantes`}
          </div>
        )}
      </div>

      {/* ── Descripción + sugerencias (solo cuando vacío) ────────────────── */}
      {isEmpty && !loadingHistory && (
        <div style={{ padding: '1.25rem 0', flexShrink: 0 }}>
          <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 13, lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            Tu entrenador personal conoce tu historial y tus actividades de Strava.
          </p>
          <div style={{ color: '#f97316', fontFamily: 'Space Mono', fontSize: 13, marginBottom: 10 }}>
            Sugerencias rápidas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COACH_SUGGESTIONS.map(({ icon, text }) => (
              <button
                key={text}
                onClick={() => sendMessage(text)}
                disabled={exhausted}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#111827', border: '1px solid #1f2937', borderRadius: 12,
                  padding: 14, cursor: exhausted ? 'not-allowed' : 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => { if (!exhausted) e.currentTarget.style.borderColor = '#f97316' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f2937' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ color: '#f1f5f9', fontFamily: 'Space Mono', fontSize: 13 }}>{text}</span>
                </span>
                <span style={{ color: '#6b7280', fontSize: 16 }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Área de mensajes ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '1rem 0' }}>

        {loadingHistory && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner />
          </div>
        )}

        {!loadingHistory && withDateSeps(displayed).map((item, i) => {
          if (item.role === 'sep') return (
            <div key={`sep-${i}`} style={{ textAlign: 'center', fontFamily: 'Space Mono', fontSize: 10, color: '#4b5563', padding: '2px 0' }}>
              — {item.content} —
            </div>
          )
          if (item.role === 'loading') return (
            <div key="loading" style={{ alignSelf: 'flex-start' }}>
              <LoadingSpinner size={24} />
            </div>
          )
          return (
            <div key={i} style={{
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
              background: item.role === 'user' ? '#10b981' : '#1f2937',
              color: item.role === 'user' ? '#030712' : '#f1f5f9',
              borderRadius: item.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              padding: '10px 14px',
              fontSize: isMobile ? 14 : 13,
              fontFamily: 'Space Mono', lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>
              {item.content}
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ────────────────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid #1f2937',
        paddingTop: '0.75rem',
        paddingBottom: isMobile ? 'max(0.75rem, env(safe-area-inset-bottom))' : '0.75rem',
        display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={exhausted || loadingHistory}
            placeholder={exhausted ? '🌙 Límite diario alcanzado' : 'Escribe tu pregunta...'}
            style={{
              flex: 1, background: '#0b1120',
              border: `1px solid ${exhausted ? '#374151' : '#1f2937'}`,
              borderRadius: 10, padding: isMobile ? '12px 14px' : '10px 14px',
              color: exhausted ? '#6b7280' : '#f1f5f9',
              fontFamily: 'Space Mono', fontSize: isMobile ? 16 : 13,
              outline: 'none',
            }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim() || exhausted || loadingHistory}
            style={{
              background: exhausted ? '#1f2937' : '#10b981',
              border: 'none', borderRadius: 10, padding: '10px 20px',
              color: exhausted ? '#374151' : '#030712',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 16,
              cursor: sending || !input.trim() || exhausted ? 'not-allowed' : 'pointer',
              opacity: sending || !input.trim() ? 0.5 : 1,
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >→</button>
        </div>

        {usage && !usage.isAdmin && (
          <div style={{ textAlign: 'center', fontFamily: 'Space Mono', fontSize: 11, color: usageColor }}>
            {exhausted
              ? '🌙 Has alcanzado tu límite diario. Vuelve mañana.'
              : `💬 ${usage.chatUsed}/${usage.chatLimit} mensajes hoy · Renueva a medianoche`
            }
          </div>
        )}
      </div>

    </div>
  )
}
