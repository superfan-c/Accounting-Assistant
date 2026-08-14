export type RecordType = 'income' | 'expense'

export interface Category {
  id: string
  userId?: string
  name: string
  icon: string
  type: RecordType
}

export interface Record {
  id: string
  userId?: string
  amount: number // 单位：分
  type: RecordType
  categoryId: string
  date: string // YYYY-MM-DD 或 ISO
  note?: string
  createdAt: string
}

export interface RecordStats {
  expenseTotal: number
  incomeTotal: number
  byCategory: { categoryId: string; type: RecordType; amount: number }[]
}

export interface RecordSummary {
  totalCount: number
  dayCount: number
  earliestDate: string | null
}

export type ReminderTemplateKey = 'gentle' | 'casual' | 'custom'

export interface ReminderSettings {
  enabled: boolean
  remindTime: string
  templateKey: ReminderTemplateKey
  messageBody: string
}

export interface BudgetSettings {
  enabled: boolean
  monthAmount: number
  popupHalfMonth: string | null
  popupYellowMonth: string | null
  popupRedMonth: string | null
}

export interface CategoryBudget {
  categoryId: string
  amount: number
  popupHalfMonth: string | null
  popupYellowMonth: string | null
  popupRedMonth: string | null
}

export type BudgetAlertKind = 'month' | 'category'
export type BudgetAlertLevel = 'half' | 'warn' | 'over'

export interface BudgetAlert {
  kind: BudgetAlertKind
  level: BudgetAlertLevel
  categoryId?: string
  categoryName?: string
}
