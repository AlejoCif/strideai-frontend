import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Activities from './pages/Activities'
import Plan from './pages/Plan'
import Analysis from './pages/Analysis'
import LoadingSpinner from './components/LoadingSpinner'

function ProtectedRoute({ children, athlete }) {
  return athlete ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { athlete, loading, backendDown, logout } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={48} />
      </div>
    )
  }

  return (
    <BrowserRouter>
      {backendDown && (
        <div style={{
          background: '#f9731622', border: '1px solid #f9731644',
          color: '#f97316', fontFamily: 'Space Mono', fontSize: 13,
          padding: '10px 20px', textAlign: 'center',
        }}>
          ⚠ Backend desconectado — asegúrate de que el servidor esté corriendo en localhost:3001
        </div>
      )}
      <Routes>
        <Route path="/login" element={athlete ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute athlete={athlete}>
              <Layout athlete={athlete} onLogout={logout}>
                <Dashboard athlete={athlete} />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute athlete={athlete}>
              <Layout athlete={athlete} onLogout={logout}>
                <Activities />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan"
          element={
            <ProtectedRoute athlete={athlete}>
              <Layout athlete={athlete} onLogout={logout}>
                <Plan />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute athlete={athlete}>
              <Layout athlete={athlete} onLogout={logout}>
                <Analysis />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to={athlete ? '/dashboard' : '/login'} replace />} />
        <Route path="*" element={<Navigate to={athlete ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
