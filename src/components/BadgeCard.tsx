import type { CSSProperties } from 'react'
import type { AchievementDef } from '../gamification/achievements'
import { useSettings } from '../context/SettingsContext'
import type { I18nKey } from '../i18n/translations'

interface Props {
  def: AchievementDef
  unlocked: boolean
  compact?: boolean
}

export default function BadgeCard({ def, unlocked, compact = false }: Props) {
  const { t } = useSettings()
  const name = t(def.nameKey as I18nKey)
  const title = t(def.titleKey as I18nKey)
  const showTitle = !compact && title !== name

  return (
    <div
      className={`badge-card ${unlocked ? 'is-unlocked' : 'is-locked'} tier-${def.tier ?? 'bonus'} shape-${def.shape}${compact ? ' is-compact' : ''}`}
      style={{ '--badge-color': def.color } as CSSProperties}
    >
      <div className="badge-visual">
        <span className="badge-icon" aria-hidden>
          {def.icon}
        </span>
      </div>
      <div className="badge-body">
        <div className="badge-name">{name}</div>
        {showTitle ? <div className="badge-title-label">{title}</div> : null}
      </div>
    </div>
  )
}
