import type { CSSProperties } from 'react'
import type { HeatmapCell } from '../gamification/streakStats'
import { useSettings } from '../context/SettingsContext'

interface Props {
  days: HeatmapCell[]
}

function axisLabel(day: number, last: number) {
  if (day === 1 || day === last || day % 5 === 0) return String(day)
  return ''
}

export default function StreakHeatmap({ days }: Props) {
  const { t } = useSettings()
  const last = days.length

  return (
    <div
      className="streak-heatmap-wrap"
      style={{ '--days': last } as CSSProperties}
    >
      <div className="streak-heatmap-head">
        <span>{t('heatmapTitle')}</span>
        <span className="streak-heatmap-legend">
          <span>{t('heatmapLess')}</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span key={level} className={`heatmap-cell level-${level}`} />
          ))}
          <span>{t('heatmapMore')}</span>
        </span>
      </div>
      <div className="heatmap-month-bar">
        {days.map((cell) => (
          <span
            key={cell.date}
            className={`heatmap-cell level-${cell.level}`}
            title={`${cell.date} · ${cell.count}`}
          />
        ))}
      </div>
      <div className="heatmap-month-axis">
        {days.map((cell, i) => (
          <span key={cell.date}>{axisLabel(i + 1, last)}</span>
        ))}
      </div>
    </div>
  )
}
