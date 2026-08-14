export const BAR_GREEN_END = 0.5
export const BAR_YELLOW_END = 0.8
export const BUDGET_CHANGED_EVENT = 'ledger-budget-changed'

export type BudgetBarLevel = 'green' | 'yellow' | 'red'
export type BudgetAlertLevel = 'half' | 'warn' | 'over'

export function beijingYearMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}`
}

export function nextYearMonth(yearMonth: string) {
  const [y, m] = yearMonth.split('-').map(Number)
  const nextM = m === 12 ? 1 : m + 1
  const nextY = m === 12 ? y + 1 : y
  return `${nextY}-${String(nextM).padStart(2, '0')}`
}

export function budgetPercent(spent: number, budget: number) {
  if (budget <= 0) return 0
  return Math.round((spent / budget) * 100)
}

export function budgetBarLevel(spent: number, budget: number): BudgetBarLevel {
  if (budget <= 0) return 'green'
  const ratio = spent / budget
  if (ratio >= BAR_YELLOW_END) return 'red'
  if (ratio >= BAR_GREEN_END) return 'yellow'
  return 'green'
}

/** 各段占整条宽度的百分比：0–50 绿、50–80 黄、80–100 红 */
export function budgetBarSegments(spent: number, budget: number) {
  if (budget <= 0) return { green: 0, yellow: 0, red: 0 }
  const ratio = Math.min(spent / budget, 1)
  return {
    green: Math.min(ratio, BAR_GREEN_END) * 100,
    yellow: Math.max(0, Math.min(ratio, BAR_YELLOW_END) - BAR_GREEN_END) * 100,
    red: Math.max(0, Math.min(ratio, 1) - BAR_YELLOW_END) * 100,
  }
}

export function pendingBudgetAlert(
  spent: number,
  budget: number,
  flags: { half: string | null; warn: string | null; over: string | null },
  month: string,
): BudgetAlertLevel | null {
  if (budget <= 0) return null
  const ratio = spent / budget
  if (ratio >= 1 && flags.over !== month) return 'over'
  if (ratio >= BAR_YELLOW_END && flags.warn !== month) return 'warn'
  if (ratio >= BAR_GREEN_END && flags.half !== month) {
    if (flags.warn === month || flags.over === month) return null
    return 'half'
  }
  return null
}

export function notifyBudgetChanged() {
  window.dispatchEvent(new Event(BUDGET_CHANGED_EVENT))
}
