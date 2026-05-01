import { useState, useCallback } from 'react'
import client from '../api/client'

export function useAI() {
  const [plan, setPlan] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [error, setError] = useState(null)

  const fetchLatestPlan = useCallback(async () => {
    try {
      const res = await client.get('/api/ai/plan/latest')
      setPlan(res.data)
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Error cargando plan')
      }
    }
  }, [])

  const generatePlan = useCallback(async ({ goal, weeksToEvent } = {}) => {
    setLoadingPlan(true)
    setError(null)
    try {
      const res = await client.post('/api/ai/plan', { goal, weeksToEvent })
      setPlan(res.data)
      return res.data
    } catch (err) {
      setError('Error generando plan')
      throw err
    } finally {
      setLoadingPlan(false)
    }
  }, [])

  const fetchAnalysis = useCallback(async () => {
    setLoadingAnalysis(true)
    try {
      const res = await client.get('/api/ai/analysis')
      setAnalysis(res.data.analysis)
    } catch (err) {
      setError('Error cargando análisis')
    } finally {
      setLoadingAnalysis(false)
    }
  }, [])

  const sendChat = useCallback(async (message, conversationHistory) => {
    const res = await client.post('/api/ai/chat', { message, conversationHistory })
    return res.data.reply
  }, [])

  return {
    plan, analysis,
    loadingPlan, loadingAnalysis, error,
    fetchLatestPlan, generatePlan, fetchAnalysis, sendChat,
  }
}
