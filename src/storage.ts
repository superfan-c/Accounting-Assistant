import { supabase } from './lib/supabaseClient'
import type {
  Category,
  Record,
  RecordStats,
  RecordSummary,
  RecordType,
} from './types'

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('请先登录')
  return data.user.id
}

function mapCategory(row: {
  id: string
  user_id: string
  name: string
  icon: string
  type: RecordType
}): Category {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    icon: row.icon,
    type: row.type,
  }
}

function mapRecord(row: {
  id: string
  user_id: string
  amount: number
  type: RecordType
  category_id: string
  date: string
  note: string | null
  created_at: string
}): Record {
  return {
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    type: row.type,
    categoryId: row.category_id,
    date: row.date,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  }
}

export async function getCategories(): Promise<Category[]> {
  await requireUserId()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('type')
    .order('name')
  if (error) throw error
  return (data ?? []).map(mapCategory)
}

export async function saveCategory(
  category: Omit<Category, 'id' | 'userId'> & { id?: string },
): Promise<Category> {
  const userId = await requireUserId()
  const payload = {
    user_id: userId,
    name: category.name,
    icon: category.icon,
    type: category.type,
  }
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error
  return mapCategory(data)
}

export async function updateCategory(
  id: string,
  changes: Partial<Pick<Category, 'name' | 'icon' | 'type'>>,
): Promise<Category> {
  await requireUserId()
  const payload: { [key: string]: string } = {}
  if (changes.name !== undefined) payload.name = changes.name
  if (changes.icon !== undefined) payload.icon = changes.icon
  if (changes.type !== undefined) payload.type = changes.type
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return mapCategory(data)
}

export async function deleteCategory(id: string): Promise<void> {
  await requireUserId()
  const { count, error: countError } = await supabase
    .from('records')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
  if (countError) throw countError
  if ((count ?? 0) > 0) {
    throw new Error(`该分类下有 ${count} 条记录，不可删除`)
  }
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}

export interface RecordFilter {
  /** YYYY-MM */
  month?: string
  /** YYYY */
  year?: string
  keyword?: string
  categoryId?: string
}

export async function getRecords(filter?: RecordFilter): Promise<Record[]> {
  await requireUserId()
  let query = supabase.from('records').select('*').order('date', { ascending: false })

  if (filter?.month) {
    const start = `${filter.month}-01`
    const endDate = new Date(`${filter.month}-01T00:00:00`)
    endDate.setMonth(endDate.getMonth() + 1)
    const end = endDate.toISOString().slice(0, 10)
    query = query.gte('date', start).lt('date', end)
  } else if (filter?.year) {
    query = query.gte('date', `${filter.year}-01-01`).lte('date', `${filter.year}-12-31`)
  }

  if (filter?.categoryId) {
    query = query.eq('category_id', filter.categoryId)
  }
  if (filter?.keyword?.trim()) {
    query = query.ilike('note', `%${filter.keyword.trim()}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(mapRecord)
}

export async function saveRecord(
  record: Omit<Record, 'id' | 'userId' | 'createdAt'> & {
    id?: string
    createdAt?: string
  },
): Promise<Record> {
  const userId = await requireUserId()
  const date =
    record.date.length > 10 ? record.date.slice(0, 10) : record.date
  const { data, error } = await supabase
    .from('records')
    .insert({
      user_id: userId,
      amount: record.amount,
      type: record.type,
      category_id: record.categoryId,
      date,
      note: record.note ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return mapRecord(data)
}

export async function updateRecord(
  id: string,
  changes: Partial<
    Pick<Record, 'amount' | 'type' | 'categoryId' | 'date' | 'note'>
  >,
): Promise<Record> {
  await requireUserId()
  const payload: { [key: string]: string | number | null } = {}
  if (changes.amount !== undefined) payload.amount = changes.amount
  if (changes.type !== undefined) payload.type = changes.type
  if (changes.categoryId !== undefined) payload.category_id = changes.categoryId
  if (changes.date !== undefined) {
    payload.date = changes.date.length > 10 ? changes.date.slice(0, 10) : changes.date
  }
  if (changes.note !== undefined) payload.note = changes.note ?? null

  const { data, error } = await supabase
    .from('records')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return mapRecord(data)
}

export async function deleteRecord(id: string): Promise<void> {
  await requireUserId()
  const { error } = await supabase.from('records').delete().eq('id', id)
  if (error) throw error
}

export async function getRecordStats(yearMonth: string): Promise<RecordStats> {
  const records = await getRecords({ month: yearMonth })
  let expenseTotal = 0
  let incomeTotal = 0
  const map = new Map<string, { categoryId: string; type: RecordType; amount: number }>()
  for (const r of records) {
    if (r.type === 'expense') expenseTotal += r.amount
    else incomeTotal += r.amount
    const cur = map.get(r.categoryId)
    if (cur) cur.amount += r.amount
    else map.set(r.categoryId, { categoryId: r.categoryId, type: r.type, amount: r.amount })
  }
  return {
    expenseTotal,
    incomeTotal,
    byCategory: Array.from(map.values()),
  }
}

export async function getRecordSummary(): Promise<RecordSummary> {
  const records = await getRecords()
  const dates = new Set(records.map((r) => r.date.slice(0, 10)))
  const sorted = Array.from(dates).sort()
  return {
    totalCount: records.length,
    dayCount: dates.size,
    earliestDate: sorted[0] ?? null,
  }
}

/** 从今天往前连续有记录的天数 */
export async function getStreakDays(): Promise<number> {
  const records = await getRecords()
  const dates = new Set(records.map((r) => r.date.slice(0, 10)))
  const toKey = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  let streak = 0
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  while (dates.has(toKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
