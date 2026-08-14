import type { Lang } from '../settings'

export type AchievementI18nKey =
  | 'heatmapTitle'
  | 'heatmapLess'
  | 'heatmapMore'
  | 'streakCurrent'
  | 'streakLongest'
  | 'streakTotalDays'
  | 'achMainSection'
  | 'achBonusSection'
  | 'achHint'
  | 'achStreakDays'
  | 'achUnlockTitle'
  | 'achUnlockOk'
  | 'achUnlockTitleHint'
  | 'achWearNow'
  | 'achWear'
  | 'badgeWorn'
  | 'myBadges'
  | 'myBadgesOk'
  | 'myBadgesEmpty'
  | 'myBadgesHint'
  | 'myBadgesReq'
  | 'myBadgesIntro'
  | 'myBadgesUnlockedAt'
  | 'myBadgesUnlockedAtLabel'
  | 'myBadgesLocked'
  | 'myBadgesUnlocked'
  | 'titleProgress'
  | 'achName_streak_1'
  | 'achTitle_streak_1'
  | 'achUnlock_streak_1'
  | 'achReq_streak_1'
  | 'achName_streak_7'
  | 'achTitle_streak_7'
  | 'achUnlock_streak_7'
  | 'achReq_streak_7'
  | 'achName_streak_30'
  | 'achTitle_streak_30'
  | 'achUnlock_streak_30'
  | 'achReq_streak_30'
  | 'achName_streak_182'
  | 'achTitle_streak_182'
  | 'achUnlock_streak_182'
  | 'achReq_streak_182'
  | 'achName_streak_365'
  | 'achTitle_streak_365'
  | 'achUnlock_streak_365'
  | 'achReq_streak_365'
  | 'achName_total_100_days'
  | 'achTitle_total_100_days'
  | 'achUnlock_total_100_days'
  | 'achReq_total_100_days'
  | 'achName_total_100_entries'
  | 'achTitle_total_100_entries'
  | 'achUnlock_total_100_entries'
  | 'achReq_total_100_entries'
  | 'achName_four_seasons'
  | 'achTitle_four_seasons'
  | 'achUnlock_four_seasons'
  | 'achReq_four_seasons'
  | 'achName_perfect_year'
  | 'achTitle_perfect_year'
  | 'achUnlock_perfect_year'
  | 'achReq_perfect_year'

const zh: Record<AchievementI18nKey, string> = {
  heatmapTitle: '记账打卡',
  heatmapLess: '少',
  heatmapMore: '多',
  streakCurrent: '当前连续',
  streakLongest: '最长连续',
  streakTotalDays: '累计记账',
  achMainSection: '账房勋章',
  achBonusSection: '彩蛋称号',
  achHint: '主勋章看最长连续天数；彩蛋看累计天数 / 笔数，断签也不清零。',
  achStreakDays: '{n} DAYS STREAK',
  achUnlockTitle: '成就解锁',
  achUnlockOk: '确定',
  achUnlockTitleHint: '可佩戴称号：{title}',
  achWearNow: '现在佩戴',
  achWear: '佩戴',
  badgeWorn: '已佩戴该勋章',
  myBadges: '我的勋章',
  myBadgesOk: '确定',
  myBadgesEmpty: '还没有勋章，坚持记账就能解锁。',
  myBadgesHint: '悬停查看介绍，点击选中。已点亮可佩戴，未点亮不可佩戴。',
  myBadgesReq: '获得要求',
  myBadgesIntro: '勋章介绍',
  myBadgesUnlockedAt: '获得时间：{date}',
  myBadgesUnlockedAtLabel: '获得时间',
  myBadgesLocked: '尚未解锁，达成要求后会自动点亮。',
  myBadgesUnlocked: '已解锁',
  titleProgress: '已解锁 {n}/{total}',
  achName_streak_1: '开笔入账',
  achTitle_streak_1: '记账书童',
  achUnlock_streak_1: '第一笔，就是账房生涯的开笔。路再长，也是从这一记开始。',
  achReq_streak_1: '完成任意一天记账打卡（连续 1 天）',
  achName_streak_7: '七日笔耕',
  achTitle_streak_7: '萌芽账手',
  achUnlock_streak_7:
    '一周了，你已经甩开 70% 的人。记账的小习惯，开始生根。',
  achReq_streak_7: '最长连续记账达到 7 天',
  achName_streak_30: '三十而立',
  achTitle_streak_30: '月下账房',
  achUnlock_streak_30: '一个月不间断。所谓习惯，就是三十次「再记一笔」。',
  achReq_streak_30: '最长连续记账达到 30 天',
  achName_streak_182: '半载不辍',
  achTitle_streak_182: '铁算盘',
  achUnlock_streak_182: '182 天，半年如一日。你的账本已经厚到能当砖头了。',
  achReq_streak_182: '最长连续记账达到 182 天',
  achName_streak_365: '滴水穿石',
  achTitle_streak_365: '一代账王',
  achUnlock_streak_365: '一整年，365 天，从未断签。账王，受我一拜 👑',
  achReq_streak_365: '最长连续记账达到 365 天',
  achName_total_100_days: '老账房',
  achTitle_total_100_days: '老账房',
  achUnlock_total_100_days: '累计记账满 100 天，账房里的老面孔了。',
  achReq_total_100_days: '累计记账天数达到 100 天（可断签）',
  achName_total_100_entries: '百分百',
  achTitle_total_100_entries: '百分百',
  achUnlock_total_100_entries: '累计 100 笔，每一笔都算数。',
  achReq_total_100_entries: '累计记账笔数达到 100 笔',
  achName_four_seasons: '四季掌柜',
  achTitle_four_seasons: '四季掌柜',
  achUnlock_four_seasons: '连续四个自然月都有记录，四季轮转不停笔。',
  achReq_four_seasons: '连续 4 个自然月都有至少一笔记账',
  achName_perfect_year: '零断签',
  achTitle_perfect_year: '零断签',
  achUnlock_perfect_year: '最长连续满 365 天，完美主义者的账房传说。',
  achReq_perfect_year: '最长连续记账达到 365 天',
}

const en: Record<AchievementI18nKey, string> = {
  heatmapTitle: 'Check-in calendar',
  heatmapLess: 'Less',
  heatmapMore: 'More',
  streakCurrent: 'Current streak',
  streakLongest: 'Best streak',
  streakTotalDays: 'Total days',
  achMainSection: 'Ledger badges',
  achBonusSection: 'Bonus titles',
  achHint: 'Main badges use your best streak; bonuses use totals and never reset on a miss.',
  achStreakDays: '{n} DAYS STREAK',
  achUnlockTitle: 'Achievement unlocked',
  achUnlockOk: 'OK',
  achUnlockTitleHint: 'Title: {title}',
  achWearNow: 'Wear now',
  achWear: 'Wear',
  badgeWorn: 'Badge equipped',
  myBadges: 'My badges',
  myBadgesOk: 'OK',
  myBadgesEmpty: 'No badges yet — keep logging to unlock.',
  myBadgesHint: 'Hover for intro, click to select. Lit badges can be worn.',
  myBadgesReq: 'Requirement',
  myBadgesIntro: 'About',
  myBadgesUnlockedAt: 'Unlocked: {date}',
  myBadgesUnlockedAtLabel: 'Unlocked on',
  myBadgesLocked: 'Not unlocked yet. Meet the requirement to light it up.',
  myBadgesUnlocked: 'Unlocked',
  titleProgress: '{n}/{total} unlocked',
  achName_streak_1: 'First Stroke',
  achTitle_streak_1: 'Ledger Apprentice',
  achUnlock_streak_1: 'Your first entry opens the ledger. Every journey starts with one stroke.',
  achReq_streak_1: 'Log at least one day (1-day streak)',
  achName_streak_7: 'Seven Days Writing',
  achTitle_streak_7: 'Sprout Scribe',
  achUnlock_streak_7:
    'One week in. The habit is taking root — you are ahead of most people.',
  achReq_streak_7: 'Best streak reaches 7 days',
  achName_streak_30: 'Thirty & Steady',
  achTitle_streak_30: 'Moonlit Clerk',
  achUnlock_streak_30: 'A full month without a miss. Habit is thirty “one more entries”.',
  achReq_streak_30: 'Best streak reaches 30 days',
  achName_streak_182: 'Half-Year Ledger',
  achTitle_streak_182: 'Iron Abacus',
  achUnlock_streak_182: '182 days — half a year like one day. Your ledger weighs a ton.',
  achReq_streak_182: 'Best streak reaches 182 days',
  achName_streak_365: 'Stone Pierced by Drops',
  achTitle_streak_365: 'Ledger King',
  achUnlock_streak_365: '365 days, never broken. All hail the Ledger King 👑',
  achReq_streak_365: 'Best streak reaches 365 days',
  achName_total_100_days: 'Old Clerk',
  achTitle_total_100_days: 'Old Clerk',
  achUnlock_total_100_days: '100 active days logged — a veteran of the books.',
  achReq_total_100_days: '100 total active days (streak can break)',
  achName_total_100_entries: 'Century Mark',
  achTitle_total_100_entries: 'Century Mark',
  achUnlock_total_100_entries: '100 entries total. Every line counts.',
  achReq_total_100_entries: '100 total entries',
  achName_four_seasons: 'Four-Season Keeper',
  achTitle_four_seasons: 'Four-Season Keeper',
  achUnlock_four_seasons: 'Four calendar months in a row with entries — seasons covered.',
  achReq_four_seasons: 'Entries in 4 consecutive calendar months',
  achName_perfect_year: 'Zero Miss',
  achTitle_perfect_year: 'Zero Miss',
  achUnlock_perfect_year: 'A 365-day best streak. Flawless ledger discipline.',
  achReq_perfect_year: 'Best streak reaches 365 days',
}

const ja: Record<AchievementI18nKey, string> = {
  heatmapTitle: '記帳カレンダー',
  heatmapLess: '少',
  heatmapMore: '多',
  streakCurrent: '現在の連続',
  streakLongest: '最長連続',
  streakTotalDays: '累計日数',
  achMainSection: '帳房バッジ',
  achBonusSection: 'ボーナス称号',
  achHint: 'メダルは最長連続日数、ボーナスは累計。途切れても消えません。',
  achStreakDays: '{n} DAYS STREAK',
  achUnlockTitle: '実績解除',
  achUnlockOk: '確定',
  achUnlockTitleHint: '称号：{title}',
  achWearNow: '今すぐ装備',
  achWear: '装備',
  badgeWorn: 'バッジを装備しました',
  myBadges: 'マイバッジ',
  myBadgesOk: '確定',
  myBadgesEmpty: 'まだバッジがありません。記帳を続けて解除しましょう。',
  myBadgesHint: 'ホバーで紹介、クリックで選択。点灯のみ装備できます。',
  myBadgesReq: '条件',
  myBadgesIntro: '紹介',
  myBadgesUnlockedAt: '獲得日：{date}',
  myBadgesUnlockedAtLabel: '獲得日',
  myBadgesLocked: '未解除。条件を満たすと点灯します。',
  myBadgesUnlocked: '解除済み',
  titleProgress: '{n}/{total} 解除',
  achName_streak_1: '開筆入帳',
  achTitle_streak_1: '記帳簿童',
  achUnlock_streak_1: '最初の一筆が帳房の始まり。長い道も、この一記から。',
  achReq_streak_1: 'いずれか1日記帳する（連続1日）',
  achName_streak_7: '七日筆耕',
  achTitle_streak_7: '芽生え帳手',
  achUnlock_streak_7: '一週間。習慣の芽が育っています。',
  achReq_streak_7: '最長連続記帳が7日',
  achName_streak_30: '三十而立',
  achTitle_streak_30: '月下帳房',
  achUnlock_streak_30: '一か月ノーストップ。習慣は30回の「もう一筆」。',
  achReq_streak_30: '最長連続記帳が30日',
  achName_streak_182: '半載不輟',
  achTitle_streak_182: '鉄算盤',
  achUnlock_streak_182: '182日、半年如一日。帳簿はもう辞書並み。',
  achReq_streak_182: '最長連続記帳が182日',
  achName_streak_365: '滴水穿石',
  achTitle_streak_365: '一代帳王',
  achUnlock_streak_365: '365日、一度も途切れず。帳王、敬礼 👑',
  achReq_streak_365: '最長連続記帳が365日',
  achName_total_100_days: '老帳房',
  achTitle_total_100_days: '老帳房',
  achUnlock_total_100_days: '累計100日記帳。帳房のベテラン。',
  achReq_total_100_days: '累計記帳日数100日（途切れ可）',
  achName_total_100_entries: '百笔',
  achTitle_total_100_entries: '百笔',
  achUnlock_total_100_entries: '累計100件。一筆一筆が証拠。',
  achReq_total_100_entries: '累計記帳100件',
  achName_four_seasons: '四季掌柜',
  achTitle_four_seasons: '四季掌柜',
  achUnlock_four_seasons: '4か月連続で記録。四季を通して帳簿係。',
  achReq_four_seasons: '連続4か月それぞれに記録がある',
  achName_perfect_year: '零断签',
  achTitle_perfect_year: '零断签',
  achUnlock_perfect_year: '最長連続365日。完璧な帳付け。',
  achReq_perfect_year: '最長連続記帳が365日',
}

export function translateAchievement(lang: Lang, key: AchievementI18nKey): string {
  const table = lang === 'en' ? en : lang === 'ja' ? ja : zh
  return table[key] ?? zh[key] ?? key
}
