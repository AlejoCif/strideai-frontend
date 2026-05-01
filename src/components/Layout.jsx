import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import AIChat from './AIChat'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/activities', label: 'Actividades', icon: '⚡' },
  { to: '/plan', label: 'Plan', icon: '📅' },
  { to: '/analysis', label: 'Análisis', icon: '🔍' },
]

export default function Layout({ children, athlete }) {
  const [chatOpen, setChatOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030712' }}>
      <header style={{
        background: '#0b1120',
        borderBottom: '1px solid #1f2937',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#f97316', letterSpacing: -0.5 }}>
            ⚡ StrideAI
          </div>
          <nav style={{ display: 'flex', gap: 4 }}>
            {NAV_LINKS.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontFamily: 'Space Mono',
                  fontSize: 13,
                  textDecoration: 'none',
                  color: isActive ? '#f97316' : '#6b7280',
                  background: isActive ? '#f9731622' : 'transparent',
                  border: isActive ? '1px solid #f9731644' : '1px solid transparent',
                  transition: 'all 0.15s',
                })}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {athlete && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {athlete.profileImageUrl && (
              <img
                src={athlete.profileImageUrl}
                alt={athlete.name}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #f97316' }}
              />
            )}
            <div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>
                {athlete.name}
              </div>
              {athlete.city && (
                <div style={{ color: '#6b7280', fontSize: 11, fontFamily: 'Space Mono' }}>
                  {athlete.city}, {athlete.country}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        {children}
      </main>

      <button
        onClick={() => setChatOpen((v) => !v)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          width: 52, height: 52, borderRadius: '50%',
          background: '#f97316', border: 'none',
          fontSize: 22, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s',
        }}
        title="Hablar con entrenador IA"
      >
        {chatOpen ? '×' : '🤖'}
      </button>

      {chatOpen && <AIChat onClose={() => setChatOpen(false)} />}
    </div>
  )
}
