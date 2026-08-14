import type { AchievementId } from './achievements'
import { STREAK_BADGES, notifyGamificationChanged } from './achievements'
import type { StreakGamificationStats } from './streakStats'
import { isAchievementUnlocked } from './streakStats'

const SEEN_KEY = 'ledger_seen_achievements'
const UNLOCK_AT_KEY = 'ledger_achievement_unlocked_at'
const EQUIPPED_KEY = 'ledger_equipped_badge'

function readListMap(key: string): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string[]>
  } catch {
    return {}
  }
}

function readDateMap(): Record<string, Record<string, string>> {
  try {
    const raw = localStorage.getItem(UNLOCK_AT_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, Record<string, string>>
  } catch {
    return {}
  }
}

export function getSeenAchievements(userId: string): Set<string> {
  const map = readListMap(SEEN_KEY)
  return new Set(map[userId] ?? [])
}

export function markAchievementSeen(userId: string, id: AchievementId) {
  const map = readListMap(SEEN_KEY)
  const set = new Set(map[userId] ?? [])
  set.add(id)
  map[userId] = Array.from(set)
  localStorage.setItem(SEEN_KEY, JSON.stringify(map))
  ensureUnlockTime(userId, id)
}

export function getUnlockTimes(userId: string): Record<string, string> {
  return { ...(readDateMap()[userId] ?? {}) }
}

export function getUnlockTime(userId: string, id: AchievementId): string | null {
  return readDateMap()[userId]?.[id] ?? null
}

export function ensureUnlockTime(userId: string, id: AchievementId, when = new Date()) {
  const all = readDateMap()
  const userMap = { ...(all[userId] ?? {}) }
  if (userMap[id]) return userMap[id]
  userMap[id] = when.toISOString().slice(0, 10)
  all[userId] = userMap
  localStorage.setItem(UNLOCK_AT_KEY, JSON.stringify(all))
  return userMap[id]
}

/** 已解锁但还没记时间的补上今天（兼容老数据） */
export function syncUnlockTimes(
  userId: string,
  unlockedIds: AchievementId[],
) {
  for (const id of unlockedIds) ensureUnlockTime(userId, id)
}

function readEquippedMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(EQUIPPED_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

export function getEquippedBadge(userId: string): AchievementId | null {
  const value = readEquippedMap()[userId]
  return value ? (value as AchievementId) : null
}

export function setEquippedBadge(userId: string, id: AchievementId) {
  const map = readEquippedMap()
  map[userId] = id
  localStorage.setItem(EQUIPPED_KEY, JSON.stringify(map))
  notifyGamificationChanged()
}

/** 未手动佩戴时，取已解锁的最高档主勋章 */
export function getAutoTitleId(stats: StreakGamificationStats): AchievementId | null {
  for (let i = STREAK_BADGES.length - 1; i >= 0; i -= 1) {
    const id = STREAK_BADGES[i].id
    if (isAchievementUnlocked(id, stats)) return id
  }
  return null
}

/** 头像右下展示：已佩戴且仍有效，否则自动最高档 */
export function getDisplayBadgeId(
  userId: string,
  stats: StreakGamificationStats,
): AchievementId | null {
  const worn = getEquippedBadge(userId)
  if (worn && isAchievementUnlocked(worn, stats)) return worn
  return getAutoTitleId(stats)
}
