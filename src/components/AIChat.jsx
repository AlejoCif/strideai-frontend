import { useState, useRef, useEffect } from 'react'
import { useAI } from '../hooks/useAI'
import { useIsMobile } from '../hooks/useIsMobile'
import LoadingSpinner from './LoadingSpinner'

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu entrenador IA. ¿En qué puedo ayudarte hoy?' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const { sendChat } = useAI()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // En mobile, hacer focus al input al abrir
  useEffect(() => {
    if (!isMobile) inputRef.current?.focus()
  }, [isMobile])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg = { role: 'user', content: text }
    const history = messages.filter((m) => m.role !== 'loading')
    setMessages((prev) => [...prev, userMsg, { role: 'loading', content: '' }])
    setInput('')
    setSending(true)

    try {
      const reply = await sendChat(text, history)
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== 'loading'),
        { role: 'assistant', content: reply },
      ])
    } catch {
      setMessages((prev) => [
        ...prev.filter((m) => m.role !== 'loading'),
        { role: 'assistant', content: 'Error al conectar. Intenta de nuevo.' },
      ])
    } finally {
      setSending(false)
    }
  }

  const panelStyle = isMobile
    ? {
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        height: 'calc(100dvh - 60px)',
        background: '#0b1120', border: 'none', borderTop: '1px solid #1f2937',
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
      <div style={{
        padding: '1rem 1.25rem', borderBottom: '1px solid #1f2937',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            background: '#f9731622', border: '1px solid #f9731644',
            borderRadius: 8, padding: '4px 8px', fontSize: 16,
          }}>🤖</span>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>Entrenador IA</span>
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#6b7280',
          cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: '4px 8px',
        }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          msg.role === 'loading'
            ? <div key={i} style={{ alignSelf: 'flex-start' }}><LoadingSpinner size={24} /></div>
            : (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                background: msg.role === 'user' ? '#f97316' : '#1f2937',
                color: '#f1f5f9',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '10px 14px',
                fontSize: isMobile ? 14 : 13,
                fontFamily: 'Space Mono',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            )
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: '0.75rem 1rem',
        paddingBottom: isMobile ? 'max(0.75rem, env(safe-area-inset-bottom))' : '0.75rem',
        borderTop: '1px solid #1f2937',
        display: 'flex', gap: 8, flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1, background: '#030712', border: '1px solid #1f2937',
            borderRadius: 8, padding: isMobile ? '10px 14px' : '8px 12px',
            color: '#f1f5f9', fontFamily: 'Space Mono',
            fontSize: isMobile ? 16 : 13, // ≥16px evita zoom en iOS
            outline: 'none',
          }}
        />
        <button onClick={send} disabled={sending || !input.trim()} style={{
          background: '#f97316', border: 'none', borderRadius: 8,
          padding: '8px 16px', color: '#030712', fontFamily: 'Syne',
          fontWeight: 700, fontSize: 16, cursor: 'pointer',
          opacity: sending || !input.trim() ? 0.5 : 1,
          transition: 'opacity 0.2s', flexShrink: 0,
        }}>
          →
        </button>
      </div>
    </div>
  )
}
