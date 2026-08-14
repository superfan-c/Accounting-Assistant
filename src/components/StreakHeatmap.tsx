import dayjs from 'dayjs'
import type { HeatmapCell } from '../gamification/streakStats'
import { useSettings } from '../context/SettingsContext'

interface Props {
  weeks: { days: (HeatmapCell | null)[] }[]
}

export default function StreakHeatmap({ weeks }: Props) {
  const { t } = useSettings()

  return (
    <div className="streak-heatmap-wrap">
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
      <div className="streak-heatmap-scroll">
        <div className="streak-heatmap">
          {weeks.map((week, wi) => (
            <div className="heatmap-week" key={wi}>
              {week.days.map((cell, di) =>
                cell ? (
                  <span
                    key={cell.date}
                    className={`heatmap-cell level-${cell.level}`}
                    title={`${cell.date} · ${cell.count}`}
                  />
                ) : (
                  <span key={`${wi}-${di}`} className="heatmap-cell is-empty" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="streak-heatmap-foot">
        {t('heatmapRange')
          .replace('{from}', dayjs().subtract(364, 'day').format('YYYY-MM-DD'))
          .replace('{to}', dayjs().format('YYYY-MM-DD'))}
      </div>
    </div>
  )
}
