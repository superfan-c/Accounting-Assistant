import { Button, Modal, message } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ACHIEVEMENT_BY_ID } from '../gamification/achievements'
import type { AchievementId } from '../gamification/achievements'
import {
  getPendingUnlocks,
  type StreakGamificationStats,
} from '../gamification/streakStats'
import {
  ensureUnlockTime,
  getSeenAchievements,
  markAchievementSeen,
  setEquippedBadge,
} from '../gamification/gamificationStorage'
import { useGamificationStats } from '../gamification/useGamificationStats'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import type { I18nKey } from '../i18n/translations'
import BadgeCard from './BadgeCard'

export default function AchievementUnlockModal() {
  const { user } = useAuth()
  const { t } = useSettings()
  const { stats } = useGamificationStats(true)
  const [current, setCurrent] = useState<AchievementId | null>(null)
  const busy = useRef(false)
  const openRef = useRef(false)

  const check = useCallback(
    (data: StreakGamificationStats | null) => {
      if (!user?.id || !data || busy.current || openRef.current) return
      busy.current = true
      try {
        const seen = getSeenAchievements(user.id)
        const pending = getPendingUnlocks(data, seen)
        if (pending.length === 0) return
        openRef.current = true
        setCurrent(pending[0])
        ensureUnlockTime(user.id, pending[0])
      } finally {
        busy.current = false
      }
    },
    [user?.id],
  )

  useEffect(() => {
    check(stats)
  }, [stats, check])

  const dismiss = () => {
    if (user?.id && current) markAchievementSeen(user.id, current)
    openRef.current = false
    setCurrent(null)
    if (stats) setTimeout(() => check(stats), 0)
  }

  const wear = () => {
    if (user?.id && current) {
      markAchievementSeen(user.id, current)
      setEquippedBadge(user.id, current)
      message.success(t('badgeWorn'))
    }
    openRef.current = false
    setCurrent(null)
    if (stats) setTimeout(() => check(stats), 0)
  }

  if (!current) return null
  const def = ACHIEVEMENT_BY_ID[current]
  const unlockText = t(def.unlockKey as I18nKey)

  return (
    <Modal
      title={`🎖 ${t('achUnlockTitle')}`}
      open
      onCancel={dismiss}
      footer={[
        <Button key="ok" onClick={dismiss}>
          {t('achUnlockOk')}
        </Button>,
        <Button key="wear" type="primary" onClick={wear}>
          {t('achWearNow')}
        </Button>,
      ]}
      closable
      centered
      width={420}
      maskClosable={false}
      className="achievement-unlock-modal"
    >
      <div className="achievement-unlock-body">
        <BadgeCard def={def} unlocked compact />
        <p className="achievement-unlock-text">{unlockText}</p>
      </div>
    </Modal>
  )
}
