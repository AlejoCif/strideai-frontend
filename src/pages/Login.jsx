import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Login() {
  const handleConnect = () => {
    window.location.href = `${API_URL}/auth/strava`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030712',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
        <h1 style={{
          fontFamily: 'Syne',
          fontWeight: 800,
          fontSize: 48,
          color: '#f97316',
          letterSpacing: -1,
          marginBottom: 8,
        }}>
          StrideAI
        </h1>
        <p style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 14, lineHeight: 1.7 }}>
          Tu entrenador deportivo inteligente.<br />
          Conecta con Strava y optimiza tu rendimiento.
        </p>
      </div>

      <div style={{
        background: '#0b1120',
        border: '1px solid #1f2937',
        borderRadius: 16,
        padding: '2rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        width: '100%',
        maxWidth: 360,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
          {['📊 Análisis de rendimiento IA', '📅 Planes de entrenamiento personalizados', '⚡ Sync automático con Strava'].map((f) => (
            <div key={f} style={{ color: '#6b7280', fontFamily: 'Space Mono', fontSize: 12 }}>{f}</div>
          ))}
        </div>

        <button
          onClick={handleConnect}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: '#f97316',
            border: 'none',
            borderRadius: 10,
            color: '#030712',
            fontFamily: 'Syne',
            fontWeight: 800,
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Conectar con Strava
        </button>

        {/* Links legales */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <Link to="/legal?tab=privacy" style={{ color: '#4b5563', fontFamily: 'Space Mono', fontSize: 11, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
          >
            Privacidad
          </Link>
          <span style={{ color: '#1f2937', fontFamily: 'Space Mono', fontSize: 11 }}>·</span>
          <Link to="/legal?tab=terms" style={{ color: '#4b5563', fontFamily: 'Space Mono', fontSize: 11, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
          >
            Términos de Servicio
          </Link>
        </div>
      </div>
    </div>
  )
}
