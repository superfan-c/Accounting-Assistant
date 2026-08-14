export type StreakBadgeId =
  | 'streak_1'
  | 'streak_7'
  | 'streak_30'
  | 'streak_182'
  | 'streak_365'
export type BonusBadgeId =
  | 'total_100_days'
  | 'total_100_entries'
  | 'four_seasons'
  | 'perfect_year'
export type AchievementId = StreakBadgeId | BonusBadgeId
export type TitleId = AchievementId

export type BadgeTier = 'wood' | 'bronze' | 'silver' | 'gold' | 'diamond'
export type BadgeShape = 'circle' | 'shield'

export interface AchievementDef {
  id: AchievementId
  kind: 'streak' | 'bonus'
  tier?: BadgeTier
  shape: BadgeShape
  icon: string
  color: string
  streakDays?: number
  nameKey: `achName_${AchievementId}`
  titleKey: `achTitle_${AchievementId}`
  unlockKey: `achUnlock_${AchievementId}`
  reqKey: `achReq_${AchievementId}`
}

export const STREAK_BADGES: AchievementDef[] = [
  {
    id: 'streak_1',
    kind: 'streak',
    tier: 'wood',
    shape: 'circle',
    icon: '🪶',
    color: '#A1887F',
    streakDays: 1,
    nameKey: 'achName_streak_1',
    titleKey: 'achTitle_streak_1',
    unlockKey: 'achUnlock_streak_1',
    reqKey: 'achReq_streak_1',
  },
  {
    id: 'streak_7',
    kind: 'streak',
    tier: 'bronze',
    shape: 'circle',
    icon: '🌱',
    color: '#7CB342',
    streakDays: 7,
    nameKey: 'achName_streak_7',
    titleKey: 'achTitle_streak_7',
    unlockKey: 'achUnlock_streak_7',
    reqKey: 'achReq_streak_7',
  },
  {
    id: 'streak_30',
    kind: 'streak',
    tier: 'silver',
    shape: 'circle',
    icon: '🌙',
    color: '#B0BEC5',
    streakDays: 30,
    nameKey: 'achName_streak_30',
    titleKey: 'achTitle_streak_30',
    unlockKey: 'achUnlock_streak_30',
    reqKey: 'achReq_streak_30',
  },
  {
    id: 'streak_182',
    kind: 'streak',
    tier: 'gold',
    shape: 'shield',
    icon: '🧮',
    color: '#FFB300',
    streakDays: 182,
    nameKey: 'achName_streak_182',
    titleKey: 'achTitle_streak_182',
    unlockKey: 'achUnlock_streak_182',
    reqKey: 'achReq_streak_182',
  },
  {
    id: 'streak_365',
    kind: 'streak',
    tier: 'diamond',
    shape: 'shield',
    icon: '👑',
    color: '#7C4DFF',
    streakDays: 365,
    nameKey: 'achName_streak_365',
    titleKey: 'achTitle_streak_365',
    unlockKey: 'achUnlock_streak_365',
    reqKey: 'achReq_streak_365',
  },
]

export const BONUS_BADGES: AchievementDef[] = [
  {
    id: 'total_100_days',
    kind: 'bonus',
    shape: 'circle',
    icon: '🕰',
    color: '#8D6E63',
    nameKey: 'achName_total_100_days',
    titleKey: 'achTitle_total_100_days',
    unlockKey: 'achUnlock_total_100_days',
    reqKey: 'achReq_total_100_days',
  },
  {
    id: 'total_100_entries',
    kind: 'bonus',
    shape: 'circle',
    icon: '💯',
    color: '#26A69A',
    nameKey: 'achName_total_100_entries',
    titleKey: 'achTitle_total_100_entries',
    unlockKey: 'achUnlock_total_100_entries',
    reqKey: 'achReq_total_100_entries',
  },
  {
    id: 'four_seasons',
    kind: 'bonus',
    shape: 'circle',
    icon: '🌈',
    color: '#EC407A',
    nameKey: 'achName_four_seasons',
    titleKey: 'achTitle_four_seasons',
    unlockKey: 'achUnlock_four_seasons',
    reqKey: 'achReq_four_seasons',
  },
  {
    id: 'perfect_year',
    kind: 'bonus',
    shape: 'shield',
    icon: '🎯',
    color: '#5C6BC0',
    nameKey: 'achName_perfect_year',
    titleKey: 'achTitle_perfect_year',
    unlockKey: 'achUnlock_perfect_year',
    reqKey: 'achReq_perfect_year',
  },
]

export const ALL_ACHIEVEMENTS: AchievementDef[] = [...STREAK_BADGES, ...BONUS_BADGES]

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ALL_ACHIEVEMENTS.map((a) => [a.id, a]),
) as Record<AchievementId, AchievementDef>

export const GAMIFICATION_CHANGED_EVENT = 'ledger-gamification-changed'

export function notifyGamificationChanged() {
  window.dispatchEvent(new Event(GAMIFICATION_CHANGED_EVENT))
}
