import dayjs from 'dayjs'
import type { Record } from '../types'
import type { AchievementId } from './achievements'

export interface HeatmapCell {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface HeatmapWeek {
  days: (HeatmapCell | null)[]
}

export interface StreakGamificationStats {
  activeDates: Set<string>
  countsByDate: Map<string, number>
  currentStreak: number
  longestStreak: number
  totalDays: number
  totalEntries: number
  fourSeasonMonths: boolean
  perfectYear: boolean
  heatmapWeeks: HeatmapWeek[]
}

function dateKey(d: dayjs.Dayjs) {
  return d.format('YYYY-MM-DD')
}

function countToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

function computeLongestStreak(sortedDates: string[]) {
  if (sortedDates.length === 0) return 0
  let max = 1
  let cur = 1
  for (let i = 1; i < sortedDates.length; i += 1) {
    const diff = dayjs(sortedDates[i]).diff(dayjs(sortedDates[i - 1]), 'day')
    if (diff === 1) {
      cur += 1
      max = Math.max(max, cur)
    } else if (diff > 1) {
      cur = 1
    }
  }
  return max
}

function computeCurrentStreak(activeDates: Set<string>) {
  let streak = 0
  let cursor = dayjs().startOf('day')
  while (activeDates.has(dateKey(cursor))) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }
  return streak
}

function hasFourConsecutiveMonths(months: string[]) {
  if (months.length < 4) return false
  const sorted = [...new Set(months)].sort()
  let run = 1
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = dayjs(`${sorted[i - 1]}-01`)
    const next = dayjs(`${sorted[i]}-01`)
    if (next.diff(prev, 'month') === 1) {
      run += 1
      if (run >= 4) return true
    } else {
      run = 1
    }
  }
  return false
}

function buildHeatmap(countsByDate: Map<string, number>): HeatmapWeek[] {
  const end = dayjs().startOf('day')
  const start = end.subtract(364, 'day')
  const startSunday = start.day() === 0 ? start : start.subtract(start.day(), 'day')
  const weeks: HeatmapWeek[] = []
  let cursor = startSunday
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const days: (HeatmapCell | null)[] = []
    for (let i = 0; i < 7; i += 1) {
      if (cursor.isAfter(end)) {
        days.push(null)
      } else if (cursor.isBefore(start)) {
        days.push(null)
      } else {
        const key = dateKey(cursor)
        const count = countsByDate.get(key) ?? 0
        days.push({ date: key, count, level: countToLevel(count) })
      }
      cursor = cursor.add(1, 'day')
    }
    weeks.push({ days })
  }
  return weeks
}

/** 指定自然月：按日从左到右的打卡格子（横坐标为当月日期） */
export function buildMonthHeatmapDays(
  countsByDate: Map<string, number>,
  month: dayjs.Dayjs,
): HeatmapCell[] {
  const start = month.startOf('month')
  const daysInMonth = month.daysInMonth()
  const cells: HeatmapCell[] = []
  for (let i = 0; i < daysInMonth; i += 1) {
    const d = start.add(i, 'day')
    const key = dateKey(d)
    const count = countsByDate.get(key) ?? 0
    cells.push({ date: key, count, level: countToLevel(count) })
  }
  return cells
}

export function buildStreakGamificationStats(records: Record[]): StreakGamificationStats {
  const countsByDate = new Map<string, number>()
  const months: string[] = []
  for (const r of records) {
    const key = r.date.slice(0, 10)
    countsByDate.set(key, (countsByDate.get(key) ?? 0) + 1)
    months.push(key.slice(0, 7))
  }
  const activeDates = new Set(countsByDate.keys())
  const sortedDates = Array.from(activeDates).sort()
  const longestStreak = computeLongestStreak(sortedDates)
  return {
    activeDates,
    countsByDate,
    currentStreak: computeCurrentStreak(activeDates),
    longestStreak,
    totalDays: activeDates.size,
    totalEntries: records.length,
    fourSeasonMonths: hasFourConsecutiveMonths(months),
    perfectYear: longestStreak >= 365,
    heatmapWeeks: buildHeatmap(countsByDate),
  }
}

export function isAchievementUnlocked(id: AchievementId, stats: StreakGamificationStats) {
  switch (id) {
    case 'streak_1':
      return stats.longestStreak >= 1 || stats.totalDays >= 1
    case 'streak_7':
      return stats.longestStreak >= 7
    case 'streak_30':
      return stats.longestStreak >= 30
    case 'streak_182':
      return stats.longestStreak >= 182
    case 'streak_365':
      return stats.longestStreak >= 365
    case 'total_100_days':
      return stats.totalDays >= 100
    case 'total_100_entries':
      return stats.totalEntries >= 100
    case 'four_seasons':
      return stats.fourSeasonMonths
    case 'perfect_year':
      return stats.perfectYear
    default:
      return false
  }
}

export function getUnlockedAchievements(stats: StreakGamificationStats): AchievementId[] {
  return ALL_ACHIEVEMENT_IDS.filter((id) => isAchievementUnlocked(id, stats))
}

/** 优先展示连续主勋章，再展示彩蛋 */
const UNLOCK_ORDER: AchievementId[] = [
  'streak_1',
  'streak_7',
  'streak_30',
  'streak_182',
  'streak_365',
  'total_100_days',
  'total_100_entries',
  'four_seasons',
  'perfect_year',
]

const ALL_ACHIEVEMENT_IDS = UNLOCK_ORDER

export function getPendingUnlocks(
  stats: StreakGamificationStats,
  seen: Set<string>,
): AchievementId[] {
  return UNLOCK_ORDER.filter(
    (id) => isAchievementUnlocked(id, stats) && !seen.has(id),
  )
}
