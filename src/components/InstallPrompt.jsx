import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'

// Captura el evento antes de que el componente monte
let _deferred = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _deferred = e
})

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (localStorage.getItem('pwa-dismissed')) return

    // Usa el evento ya capturado si existe
    if (_deferred) {
      setPrompt(_deferred)
      return
    }

    // Escucha si llega después de montar
    const handler = (e) => {
      e.preventDefault()
      _deferred = e
      if (!localStorage.getItem('pwa-dismissed')) setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Ocultar si ya está instalada como PWA
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) setPrompt(null)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') _deferred = null
    setPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-dismissed', '1')
    setPrompt(null)
  }

  if (!prompt) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: isMobile ? 70 : 0,  // sobre el bottom nav en mobile
      left: 0, right: 0,
      zIndex: 150,
      background: '#0b1120',
      borderTop: '1px solid #1f2937',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>📱</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 12, color: '#f1f5f9', lineHeight: 1.4 }}>
          Instala StrideAI en tu celular
        </span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleInstall}
          style={{
            background: '#f97316', border: 'none', borderRadius: 8,
            padding: '7px 16px', color: '#030712',
            fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none', border: '1px solid #1f2937', borderRadius: 8,
            padding: '7px 10px', color: '#6b7280',
            fontFamily: 'Space Mono', fontSize: 16, lineHeight: 1,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}
