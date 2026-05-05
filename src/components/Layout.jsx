import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'
import AIChat from './AIChat'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/activities', label: 'Actividades', icon: '⚡' },
  { to: '/plan', label: 'Plan', icon: '📅' },
  { to: '/analysis', label: 'Análisis', icon: '🔍' },
]

export default function Layout({ children, athlete, onLogout }) {
  const [chatOpen, setChatOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div style={{ minHeight: '100vh', background: '#030712' }}>
      {/* Safe-area padding para el bottom nav en iOS */}
      <style>{`.stride-bottom-nav { padding-bottom: max(8px, env(safe-area-inset-bottom)); }`}</style>

      <header style={{
        background: '#0b1120',
        borderBottom: '1px solid #1f2937',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo + nav desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#f97316', letterSpacing: -0.5 }}>
            ⚡ StrideAI
          </div>
          {!isMobile && (
            <nav style={{ display: 'flex', gap: 4 }}>
              {NAV_LINKS.map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    fontFamily: 'Space Mono', fontSize: 13,
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
          )}
        </div>

        {/* Athlete info + logout */}
        {athlete && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {athlete.profileImageUrl && (
              <img
                src={athlete.profileImageUrl}
                alt={athlete.name}
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #f97316', flexShrink: 0 }}
              />
            )}
            {!isMobile && (
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
            )}
            <button
              onClick={onLogout}
              style={{
                background: 'none', border: '1px solid #1f2937',
                borderRadius: 8, padding: '5px 12px',
                color: '#6b7280', fontFamily: 'Space Mono', fontSize: 11,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1f2937'; e.currentTarget.style.color = '#6b7280' }}
            >
              Salir
            </button>
          </div>
        )}
      </header>

      <main style={{
        padding: isMobile ? '1rem' : '1.5rem',
        maxWidth: 1100,
        margin: '0 auto',
        paddingBottom: isMobile ? 'calc(72px + 1rem)' : '1.5rem',
      }}>
        {children}
      </main>

      {/* Navegación inferior en mobile */}
      {isMobile && (
        <nav
          className="stride-bottom-nav"
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
            background: '#0b1120', borderTop: '1px solid #1f2937',
            display: 'flex', justifyContent: 'space-around',
            paddingTop: 8,
          }}
        >
          {NAV_LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '4px 16px', textDecoration: 'none',
                color: isActive ? '#f97316' : '#6b7280',
                transition: 'color 0.15s',
                minWidth: 56,
              })}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <span style={{ fontFamily: 'Space Mono', fontSize: 9, letterSpacing: 0.3 }}>{label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      {/* Chat FAB — sube sobre el nav inferior en mobile */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: isMobile ? 76 : 24,
          right: 20,
          zIndex: 1001,
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
