import { useState, useEffect } from 'react'
import client from '../api/client'

export function useStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    client.get('/api/activities/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error cargando estadísticas'))
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading, error }
}
