import {
  ALL_ACHIEVEMENTS,
  BONUS_BADGES,
  STREAK_BADGES,
} from '../gamification/achievements'
import { isAchievementUnlocked } from '../gamification/streakStats'
import type { StreakGamificationStats } from '../gamification/streakStats'
import { useSettings } from '../context/SettingsContext'
import BadgeCard from './BadgeCard'

interface Props {
  stats: StreakGamificationStats
  compact?: boolean
}

export default function BadgeGrid({ stats, compact = false }: Props) {
  const { t } = useSettings()

  return (
    <div className={`badge-grid-wrap${compact ? ' is-compact' : ''}`}>
      <h3 className="badge-section-title">{t('achMainSection')}</h3>
      <div className="badge-grid">
        {STREAK_BADGES.map((def) => (
          <BadgeCard
            key={def.id}
            def={def}
            unlocked={isAchievementUnlocked(def.id, stats)}
            compact={compact}
          />
        ))}
      </div>
      <h3 className="badge-section-title">{t('achBonusSection')}</h3>
      <div className="badge-grid badge-grid-bonus">
        {BONUS_BADGES.map((def) => (
          <BadgeCard
            key={def.id}
            def={def}
            unlocked={isAchievementUnlocked(def.id, stats)}
            compact={compact}
          />
        ))}
      </div>
      {!compact ? (
        <p className="badge-grid-hint">{t('achHint')}</p>
      ) : null}
    </div>
  )
}

export function countUnlocked(stats: StreakGamificationStats) {
  return ALL_ACHIEVEMENTS.filter((a) => isAchievementUnlocked(a.id, stats)).length
}
