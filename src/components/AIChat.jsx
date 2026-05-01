import { useState, useRef, useEffect } from 'react'
import { useAI } from '../hooks/useAI'
import LoadingSpinner from './LoadingSpinner'

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Soy tu entrenador IA. ¿En qué puedo ayudarte hoy?' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const { sendChat } = useAI()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 24, zIndex: 1000,
      width: 380, maxHeight: 520,
      background: '#0b1120', border: '1px solid #1f2937', borderRadius: 16,
      display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    }}>
      <div style={{
        padding: '1rem 1.25rem', borderBottom: '1px solid #1f2937',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
          cursor: 'pointer', fontSize: 20, lineHeight: 1,
        }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          msg.role === 'loading'
            ? <div key={i} style={{ alignSelf: 'flex-start' }}><LoadingSpinner size={24} /></div>
            : (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                background: msg.role === 'user' ? '#f97316' : '#1f2937',
                color: '#f1f5f9',
                borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                padding: '10px 14px',
                fontSize: 13,
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

      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #1f2937', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1, background: '#030712', border: '1px solid #1f2937',
            borderRadius: 8, padding: '8px 12px', color: '#f1f5f9',
            fontFamily: 'Space Mono', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={send} disabled={sending || !input.trim()} style={{
          background: '#f97316', border: 'none', borderRadius: 8,
          padding: '8px 14px', color: '#030712', fontFamily: 'Syne',
          fontWeight: 700, fontSize: 13, cursor: 'pointer',
          opacity: sending || !input.trim() ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}>
          →
        </button>
      </div>
    </div>
  )
}
