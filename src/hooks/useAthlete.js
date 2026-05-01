import { useState, useEffect } from 'react'
import client from '../api/client'

export function useAthlete() {
  const [athlete, setAthlete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    client.get('/api/athlete')
      .then((res) => setAthlete(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error cargando perfil'))
      .finally(() => setLoading(false))
  }, [])

  return { athlete, loading, error }
}
