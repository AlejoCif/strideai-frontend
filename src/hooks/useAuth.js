import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'

const TOKEN_KEY = 'strideai_token'

export function useAuth() {
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendDown, setBackendDown] = useState(false)

  useEffect(() => {
    // 1. Capturar token si el backend redirigió con ?token=JWT
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken)
      window.history.replaceState({}, '', window.location.pathname)
    }

    // 2. Sin token → no autenticado, no hay llamada al backend
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false)
      return
    }

    // 3. Verificar token con el backend
    client.get('/api/athlete')
      .then((res) => setAthlete(res.data))
      .catch((err) => {
        // 401 → interceptor ya borró el token y disparó 'auth:logout'
        if (!err.response) setBackendDown(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // Reaccionar a 401 de cualquier llamada API mientras se usa la app
  useEffect(() => {
    const handle = () => setAthlete(null)
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setAthlete(null)
  }, [])

  return { athlete, loading, backendDown, logout }
}
