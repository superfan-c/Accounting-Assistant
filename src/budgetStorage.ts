import { supabase } from './lib/supabaseClient'
import type { BudgetAlert, BudgetAlertLevel, BudgetSettings, CategoryBudget } from './types'
import {
  beijingYearMonth,
  nextYearMonth,
  pendingBudgetAlert,
} from './utils/budget'

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('请先登录')
  return data.user.id
}

function mapSettings(row: {
  enabled: boolean
  month_amount: number
  popup_half_month: string | null
  popup_yellow_month: string | null
  popup_red_month: string | null
}): BudgetSettings {
  return {
    enabled: row.enabled,
    monthAmount: row.month_amount,
    popupHalfMonth: row.popup_half_month ?? null,
    popupYellowMonth: row.popup_yellow_month,
    popupRedMonth: row.popup_red_month,
  }
}

export const DEFAULT_BUDGET: BudgetSettings = {
  enabled: false,
  monthAmount: 0,
  popupHalfMonth: null,
  popupYellowMonth: null,
  popupRedMonth: null,
}

export interface BudgetCategoryRow extends CategoryBudget {
  name: string
  icon: string
  spent: number
}

export interface BudgetSnapshot {
  enabled: boolean
  month: string
  monthAmount: number
  monthSpent: number
  popupHalfMonth: string | null
  popupYellowMonth: string | null
  popupRedMonth: string | null
  categories: BudgetCategoryRow[]
}

export async function getBudgetSettings(): Promise<BudgetSettings> {
  await requireUserId()
  const { data, error } = await supabase.from('budget_settings').select('*').maybeSingle()
  if (error) throw error
  if (!data) return { ...DEFAULT_BUDGET }
  return mapSettings(data)
}

export async function getCategoryBudgets(): Promise<CategoryBudget[]> {
  await requireUserId()
  const { data, error } = await supabase
    .from('budget_categories')
    .select('category_id, amount, popup_half_month, popup_yellow_month, popup_red_month')
  if (error) throw error
  return (data ?? []).map((row) => ({
    categoryId: row.category_id,
    amount: row.amount,
    popupHalfMonth: row.popup_half_month ?? null,
    popupYellowMonth: row.popup_yellow_month,
    popupRedMonth: row.popup_red_month,
  }))
}

export async function saveBudgetSettings(input: {
  enabled: boolean
  monthAmount: number
  categories: { categoryId: string; amount: number }[]
}): Promise<BudgetSettings> {
  const userId = await requireUserId()
  const current = await getBudgetSettings()
  const { data, error } = await supabase
    .from('budget_settings')
    .upsert(
      {
        user_id: userId,
        enabled: input.enabled,
        month_amount: input.monthAmount,
        popup_half_month: current.popupHalfMonth,
        popup_yellow_month: current.popupYellowMonth,
        popup_red_month: current.popupRedMonth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single()
  if (error) throw error

  const nextCats = input.categories.filter((c) => c.amount > 0)
  const nextIds = new Set(nextCats.map((c) => c.categoryId))
  const existing = await getCategoryBudgets()
  const removeIds = existing
    .filter((c) => !nextIds.has(c.categoryId))
    .map((c) => c.categoryId)

  if (removeIds.length > 0) {
    const { error: delError } = await supabase
      .from('budget_categories')
      .delete()
      .in('category_id', removeIds)
    if (delError) throw delError
  }

  if (nextCats.length > 0) {
    const prevById = new Map(existing.map((c) => [c.categoryId, c]))
    const { error: upsertError } = await supabase.from('budget_categories').upsert(
      nextCats.map((c) => {
        const prev = prevById.get(c.categoryId)
        return {
          user_id: userId,
          category_id: c.categoryId,
          amount: c.amount,
          popup_half_month: prev?.popupHalfMonth ?? null,
          popup_yellow_month: prev?.popupYellowMonth ?? null,
          popup_red_month: prev?.popupRedMonth ?? null,
        }
      }),
      { onConflict: 'user_id,category_id' },
    )
    if (upsertError) throw upsertError
  }

  return mapSettings(data)
}

export async function getBudgetSnapshot(): Promise<BudgetSnapshot> {
  const month = beijingYearMonth()
  const start = `${month}-01`
  const end = `${nextYearMonth(month)}-01`

  const [settings, categoryBudgets, recordsRes, categoriesRes] = await Promise.all([
    getBudgetSettings(),
    getCategoryBudgets(),
    supabase
      .from('records')
      .select('amount, category_id')
      .eq('type', 'expense')
      .gte('date', start)
      .lt('date', end),
    supabase.from('categories').select('id, name, icon, type').eq('type', 'expense'),
  ])

  if (recordsRes.error) throw recordsRes.error
  if (categoriesRes.error) throw categoriesRes.error

  const spentByCat = new Map<string, number>()
  let monthSpent = 0
  for (const row of recordsRes.data ?? []) {
    monthSpent += row.amount
    spentByCat.set(row.category_id, (spentByCat.get(row.category_id) ?? 0) + row.amount)
  }

  const catMap = new Map((categoriesRes.data ?? []).map((c) => [c.id, c]))

  const categories: BudgetCategoryRow[] = categoryBudgets
    .map((b) => {
      const cat = catMap.get(b.categoryId)
      if (!cat) return null
      return {
        ...b,
        name: cat.name,
        icon: cat.icon,
        spent: spentByCat.get(b.categoryId) ?? 0,
      }
    })
    .filter((row): row is BudgetCategoryRow => row !== null)

  return {
    enabled: settings.enabled,
    month,
    monthAmount: settings.monthAmount,
    monthSpent,
    popupHalfMonth: settings.popupHalfMonth,
    popupYellowMonth: settings.popupYellowMonth,
    popupRedMonth: settings.popupRedMonth,
    categories,
  }
}

export async function peekBudgetAlert(): Promise<BudgetAlert | null> {
  const snap = await getBudgetSnapshot()
  if (!snap.enabled || snap.monthAmount <= 0) return null
  const { month } = snap

  const monthAlert = pendingBudgetAlert(
    snap.monthSpent,
    snap.monthAmount,
    {
      half: snap.popupHalfMonth,
      warn: snap.popupYellowMonth,
      over: snap.popupRedMonth,
    },
    month,
  )
  if (monthAlert) return { kind: 'month', level: monthAlert }

  for (const cat of snap.categories) {
    const level = pendingBudgetAlert(
      cat.spent,
      cat.amount,
      {
        half: cat.popupHalfMonth,
        warn: cat.popupYellowMonth,
        over: cat.popupRedMonth,
      },
      month,
    )
    if (level) {
      return {
        kind: 'category',
        level,
        categoryId: cat.categoryId,
        categoryName: `${cat.icon} ${cat.name}`,
      }
    }
  }
  return null
}

function popupPatch(level: BudgetAlertLevel, month: string) {
  const patch: Record<string, string> = { popup_half_month: month }
  if (level === 'warn' || level === 'over') patch.popup_yellow_month = month
  if (level === 'over') patch.popup_red_month = month
  return patch
}

export async function markBudgetPopup(alert: BudgetAlert) {
  const userId = await requireUserId()
  const month = beijingYearMonth()
  const patch = popupPatch(alert.level, month)
  if (alert.kind === 'month') {
    const { error } = await supabase.from('budget_settings').update(patch).eq('user_id', userId)
    if (error) throw error
    return
  }
  if (!alert.categoryId) return
  const { error } = await supabase
    .from('budget_categories')
    .update(patch)
    .eq('user_id', userId)
    .eq('category_id', alert.categoryId)
  if (error) throw error
}
