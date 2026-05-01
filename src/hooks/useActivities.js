import { useState, useEffect, useCallback } from 'react'
import client from '../api/client'

export function useActivities(limit = 20, page = 1) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    client.get('/api/activities', { params: { limit, page } })
      .then((res) => setActivities(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Error cargando actividades'))
      .finally(() => setLoading(false))
  }, [limit, page])

  useEffect(() => { load() }, [load])

  const sync = useCallback(async () => {
    setSyncing(true)
    try {
      const res = await client.post('/api/activities/sync')
      load()
      return res.data
    } catch (err) {
      setError('Error sincronizando')
      throw err
    } finally {
      setSyncing(false)
    }
  }, [load])

  return { activities, loading, syncing, error, sync, refetch: load }
}
