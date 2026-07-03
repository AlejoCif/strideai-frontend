import { useState, useRef, useEffect } from 'react'
import client from '../api/client'
import { useIsMobile } from '../hooks/useIsMobile'
import LoadingSpinner from './LoadingSpinner'

const WELCOME = { role: 'assistant', content: '¡Hola! Soy tu entrenador IA. ¿En qué puedo ayudarte hoy?' }
const PREVIEW = 20  // máximo de mensajes visibles sin expandir

const SUGGESTIONS = [
  'Revisa mi última actividad',
  '¿Cómo estuvo mi recuperación esta semana?',
  'Compara mis últimas 2 salidas',
  '¿Cuándo debo encerar la cadena?',
]

// Etiqueta de fecha para separadores
function dayLabel(isoStr) {
  if (!isoStr) return null
  const d         = new Date(isoStr).toDateString()
  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now() - 864e5).toDateString()
  if (d === today)     return 'Hoy'
  if (d === yesterday) return 'Ayer'
  return new Date(isoStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Inserta separadores de fecha entre mensajes de días distintos
function withDateSeps(msgs) {
  const out = []
  let lastDay = null
  for (const m of msgs) {
    if (m.role === 'loading') { out.push(m); continue }
    const day = m.createdAt ? new Date(m.createdAt).toDateString() : null
    if (day && day !== lastDay) {
      out.push({ role: 'sep', content: dayLabel(m.createdAt) })
      lastDay = day
    }
    out.push(m)
  }
  return out
}

export default function AIChat({ onClose }) {
  const [messages,       setMessages]       = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [showAll,        setShowAll]        = useState(false)
  const [confirmClear,   setConfirmClear]   = useState(false)
  const [input,          setInput]          = useState('')
  const [sending,        setSending]        = useState(false)
  const [usage,          setUsage]          = useState(null)
  const [syncStatus,     setSyncStatus]     = useState('syncing')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const didLoad   = useRef(false)   // distingue scroll inicial vs. nuevos mensajes
  const isMobile  = useIsMobile()

  // Carga historial + uso al abrir (en paralelo)
  useEffect(() => {
    Promise.all([
      client.get('/api/ai/chat/history').catch(() => ({ data: [] })),
      client.get('/api/ai/usage').catch(() => ({ data: null })),
    ]).then(([histRes, usageRes]) => {
      const hist = Array.isArray(histRes.data) ? histRes.data : []
      setMessages(hist.length ? hist : [WELCOME])
      setUsage(usageRes.data)
    }).finally(() => {
      setLoadingHistory(false)
      setSyncStatus('done')
      setTimeout(() => setSyncStatus(null), 2000)
    })
  }, [])

  // Scroll instant al cargar historial, smooth en mensajes nuevos
  useEffect(() => {
    if (loadingHistory) return
    bottomRef.current?.scrollIntoView({ behavior: didLoad.current ? 'smooth' : 'instant' })
    didLoad.current = true
  }, [messages, loadingHistory])

  // Focus input en desktop cuando el historial esté listo
  useEffect(() => {
    if (!isMobile && !loadingHistory) inputRef.current?.focus()
  }, [isMobile, loadingHistory])

  // ── Derived state ───────────────────────────────────────────────────────
  const exhausted  = !!(usage && !usage.isAdmin && usage.chatRemaining === 0)
  const usageColor = !usage || usage.isAdmin ? '#10b981'
    : usage.chatRemaining === 0 ? '#ef4444'
    : usage.chatRemaining <= 3  ? '#f59e0b'
    : '#6b7280'

  // Paginación: últimos PREVIEW mensajes reales + indicador de carga
  const realMsgs    = messages.filter(m => m.role !== 'loading')
  const loadingMsg  = messages.find(m => m.role === 'loading') ?? null
  const hasMore     = !showAll && realMsgs.length > PREVIEW
  const visibleReal = showAll ? realMsgs : realMsgs.slice(-PREVIEW)
  const displayed   = loadingMsg ? [...visibleReal, loadingMsg] : visibleReal

  // ── Send ─────────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text || sending || exhausted) return

    const now = new Date().toISOString()
    setMessages(prev => [
      ...prev,
      { role: 'user', content: text, createdAt: now },
      { role: 'loading', content: '' },
    ])
    setInput('')
    setSending(true)

    try {
      const res = await client.post('/api/ai/chat', { message: text })
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'loading'),
        { role: 'assistant', content: res.data.reply, createdAt: new Date().toISOString() },
      ])
      setUsage(prev => prev && !prev.isAdmin
        ? { ...prev, chatRemaining: Math.max(0, prev.chatRemaining - 1), chatUsed: prev.chatUsed + 1 }
        : prev
      )
    } catch (err) {
      const is429 = err.response?.status === 429
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'loading'),
        {
          role: 'assistant',
          content: is429
            ? (err.response.data?.message || '🌙 Has alcanzado tu límite diario. Vuelve mañana.')
            : 'Error al conectar. Intenta de nuevo.',
          createdAt: new Date().toISOString(),
        },
      ])
      if (is429) setUsage(prev => prev ? { ...prev, chatRemaining: 0 } : prev)
    } finally {
      setSending(false)
    }
  }

  const send = () => sendMessage(input.trim())

  // ── Clear history ────────────────────────────────────────────────────────
  const clearHistory = async () => {
    try {
      await client.delete('/api/ai/chat/history')
      setMessages([{ ...WELCOME, createdAt: new Date().toISOString() }])
      setShowAll(false)
    } catch { /* fallo silencioso */ } finally {
      setConfirmClear(false)
    }
  }

  // ── Panel style ──────────────────────────────────────────────────────────
  const panelStyle = isMobile
    ? {
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        height: 'calc(100dvh - 60px)',
        background: '#0b1120', borderTop: '1px solid #1f2937',
        borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
      }
    : {
        position: 'fixed', bottom: 80, right: 24, zIndex: 1000,
        width: 380, maxHeight: 520,
        background: '#0b1120', border: '1px solid #1f2937', borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }

  return (
    <div style={panelStyle}>

      {/* ── Cabecera ─────────────────────────────────────────────────────── */}
      <div style={{
        padding: '0.875rem 1.25rem', borderBottom: '1px solid #1f2937',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: '#f9731622', border: '1px solid #f9731644',
            borderRadius: 8, padding: '4px 8px', fontSize: 16,
          }}>🤖</span>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>Entrenador IA</div>
            {usage && (
              <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: usageColor, marginTop: 1 }}>
                {usage.isAdmin ? '✨ Admin' : `${usage.chatRemaining} / ${usage.chatLimit} restantes`}
              </div>
            )}
          </div>
        </div>

        {/* Controles: borrar historial + cerrar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {confirmClear ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#f59e0b', whiteSpace: 'nowrap' }}>
                ¿Borrar historial?
              </span>
              <button onClick={clearHistory} style={{
                background: '#ef4444', border: 'none', borderRadius: 6,
                padding: '3px 8px', color: '#fff', fontFamily: 'Syne', fontWeight: 700,
                fontSize: 11, cursor: 'pointer',
              }}>Sí</button>
              <button onClick={() => setConfirmClear(false)} style={{
                background: 'none', border: '1px solid #374151', borderRadius: 6,
                padding: '3px 8px', color: '#6b7280', fontFamily: 'Space Mono',
                fontSize: 11, cursor: 'pointer',
              }}>No</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              title="Borrar historial"
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 16, padding: '4px 6px', lineHeight: 1, transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
            >
              🗑
            </button>
          )}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#6b7280',
            cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: '4px 8px',
          }}>×</button>
        </div>
      </div>

      {/* ── Banner de sync ───────────────────────────────────────────────── */}
      {syncStatus && (
        <div style={{
          padding: '4px 1.25rem',
          fontFamily: 'Space Mono',
          fontSize: 10,
          color: syncStatus === 'syncing' ? '#f97316' : '#10b981',
          borderBottom: '1px solid #1f2937',
          flexShrink: 0,
          transition: 'color 0.3s',
        }}>
          {syncStatus === 'syncing' ? '⚡ Sincronizando tus actividades...' : '● Datos actualizados'}
        </div>
      )}

      {/* ── Área de mensajes ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Spinner de carga inicial */}
        {loadingHistory && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingSpinner />
          </div>
        )}

        {!loadingHistory && (
          <>
            {/* Botón para ver historial completo (aparece al inicio del scroll) */}
            {hasMore && (
              <button
                onClick={() => setShowAll(true)}
                style={{
                  alignSelf: 'center',
                  background: 'none', border: '1px solid #1f2937', borderRadius: 20,
                  padding: '4px 14px', color: '#6b7280',
                  fontFamily: 'Space Mono', fontSize: 10,
                  cursor: 'pointer', marginBottom: 4,
                }}
              >
                Ver historial completo ({realMsgs.length} mensajes)
              </button>
            )}

            {/* Mensajes con separadores de fecha */}
            {withDateSeps(displayed).map((item, i) => {
              if (item.role === 'sep') {
                return (
                  <div key={`sep-${i}`} style={{
                    textAlign: 'center', fontFamily: 'Space Mono',
                    fontSize: 10, color: '#4b5563', padding: '2px 0',
                  }}>
                    — {item.content} —
                  </div>
                )
              }
              if (item.role === 'loading') {
                return (
                  <div key="loading" style={{ alignSelf: 'flex-start' }}>
                    <LoadingSpinner size={24} />
                  </div>
                )
              }
              return (
                <div key={i} style={{
                  alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: item.role === 'user' ? '#f97316' : '#1f2937',
                  color: '#f1f5f9',
                  borderRadius: item.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  padding: '10px 14px',
                  fontSize: isMobile ? 14 : 13,
                  fontFamily: 'Space Mono',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {item.content}
                </div>
              )
            })}
            {/* Sugerencias rápidas — solo cuando no hay mensajes del usuario */}
            {!realMsgs.some(m => m.role === 'user') && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8,
              }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    disabled={exhausted}
                    style={{
                      background: '#1f2937', border: '1px solid #374151',
                      borderRadius: 12, padding: 12,
                      color: '#f1f5f9', fontFamily: 'Space Mono', fontSize: 12,
                      textAlign: 'left', lineHeight: 1.5,
                      cursor: exhausted ? 'not-allowed' : 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => { if (!exhausted) e.currentTarget.style.borderColor = '#f97316' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#374151' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Footer: input + contador ─────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid #1f2937',
        padding: '0.75rem 1rem',
        paddingBottom: isMobile ? 'max(0.75rem, env(safe-area-inset-bottom))' : '0.75rem',
        display: 'flex', flexDirection: 'column', gap: 6,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            disabled={exhausted || loadingHistory}
            placeholder={exhausted ? '🌙 Límite diario alcanzado' : 'Escribe un mensaje...'}
            style={{
              flex: 1,
              background: '#030712',
              border: `1px solid ${exhausted ? '#374151' : '#1f2937'}`,
              borderRadius: 8,
              padding: isMobile ? '10px 14px' : '8px 12px',
              color: exhausted ? '#6b7280' : '#f1f5f9',
              fontFamily: 'Space Mono',
              fontSize: isMobile ? 16 : 13,
              outline: 'none',
              cursor: exhausted ? 'not-allowed' : 'text',
            }}
          />
          <button
            onClick={send}
            disabled={sending || !input.trim() || exhausted || loadingHistory}
            style={{
              background: exhausted ? '#1f2937' : '#f97316',
              border: 'none', borderRadius: 8,
              padding: '8px 16px',
              color: exhausted ? '#374151' : '#030712',
              fontFamily: 'Syne', fontWeight: 700, fontSize: 16,
              cursor: sending || !input.trim() || exhausted ? 'not-allowed' : 'pointer',
              opacity: sending || !input.trim() ? 0.5 : 1,
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            →
          </button>
        </div>

        {usage && (
          <div style={{ textAlign: 'center', fontFamily: 'Space Mono', fontSize: 11, color: usageColor, lineHeight: 1.4 }}>
            {usage.isAdmin
              ? '✨ Admin — sin límite'
              : exhausted
                ? '🌙 Has alcanzado tu límite diario. Vuelve mañana.'
                : `💬 ${usage.chatUsed}/${usage.chatLimit} mensajes hoy · Renueva a medianoche`
            }
          </div>
        )}
      </div>

    </div>
  )
}
