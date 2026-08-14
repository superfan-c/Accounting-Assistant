import { useCallback, useEffect, useState } from 'react'
import { getRecords } from '../storage'
import type { StreakGamificationStats } from './streakStats'
import { buildStreakGamificationStats } from './streakStats'
import { GAMIFICATION_CHANGED_EVENT } from './achievements'

export function useGamificationStats(active = true) {
  const [stats, setStats] = useState<StreakGamificationStats | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const records = await getRecords()
      setStats(buildStreakGamificationStats(records))
    } catch {
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!active) return
    void load()
    const onChange = () => void load()
    window.addEventListener(GAMIFICATION_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(GAMIFICATION_CHANGED_EVENT, onChange)
  }, [active, load])

  return { stats, loading, reload: load }
}
