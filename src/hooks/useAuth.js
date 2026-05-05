import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'

export function useAuth() {
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendDown, setBackendDown] = useState(false)

  useEffect(() => {
    client.get('/api/athlete')
      .then((res) => setAthlete(res.data))
      .catch((err) => {
        if (!err.response) setBackendDown(true)
        // 401 → el interceptor dispara 'auth:logout' → setAthlete(null) ya está null
      })
      .finally(() => setLoading(false))
  }, [])

  // El interceptor de client.js emite este evento ante cualquier 401
  useEffect(() => {
    const handle = () => setAthlete(null)
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [])

  const logout = useCallback(async () => {
    try { await client.post('/logout') } catch {}
    setAthlete(null)
  }, [])

  return { athlete, loading, backendDown, logout }
}
