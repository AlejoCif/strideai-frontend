import { useState, useEffect } from 'react'
import client from '../api/client'

export const WELCOME = { role: 'assistant', content: '¡Hola! Soy tu entrenador IA. ¿En qué puedo ayudarte hoy?' }

export function dayLabel(isoStr) {
  if (!isoStr) return null
  const d         = new Date(isoStr).toDateString()
  const today     = new Date().toDateString()
  const yesterday = new Date(Date.now() - 864e5).toDateString()
  if (d === today)     return 'Hoy'
  if (d === yesterday) return 'Ayer'
  return new Date(isoStr).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function withDateSeps(msgs) {
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

export function useChatMessages() {
  const [messages,       setMessages]       = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sending,        setSending]        = useState(false)
  const [usage,          setUsage]          = useState(null)
  const [syncStatus,     setSyncStatus]     = useState('syncing')

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

  const exhausted  = !!(usage && !usage.isAdmin && usage.chatRemaining === 0)
  const usageColor = !usage || usage.isAdmin ? '#10b981'
    : usage.chatRemaining === 0 ? '#ef4444'
    : usage.chatRemaining <= 3  ? '#f59e0b'
    : '#6b7280'

  const sendMessage = async (text) => {
    if (!text || sending || exhausted) return
    const now = new Date().toISOString()
    setMessages(prev => [
      ...prev,
      { role: 'user', content: text, createdAt: now },
      { role: 'loading', content: '' },
    ])
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

  const clearHistory = async () => {
    try {
      await client.delete('/api/ai/chat/history')
      setMessages([{ ...WELCOME, createdAt: new Date().toISOString() }])
    } catch { /* silencioso */ }
  }

  return {
    messages, setMessages,
    loadingHistory, sending, usage, syncStatus,
    exhausted, usageColor,
    sendMessage, clearHistory,
  }
}
