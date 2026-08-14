import { useCallback, useEffect, useState } from 'react'
import { getBudgetSnapshot, type BudgetSnapshot } from '../budgetStorage'
import { useSettings } from '../context/SettingsContext'
import {
  BUDGET_CHANGED_EVENT,
  budgetBarLevel,
  budgetBarSegments,
  budgetPercent,
  type BudgetBarLevel,
} from '../utils/budget'
import { formatYuan } from '../utils/format'

function Bar({ spent, budget }: { spent: number; budget: number }) {
  const pct = Math.min(100, budgetPercent(spent, budget))
  const segs = budgetBarSegments(spent, budget)
  return (
    <div className="budget-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      {segs.green > 0 ? (
        <div className="budget-bar-seg green" style={{ width: `${segs.green}%` }} />
      ) : null}
      {segs.yellow > 0 ? (
        <div className="budget-bar-seg yellow" style={{ width: `${segs.yellow}%` }} />
      ) : null}
      {segs.red > 0 ? (
        <div className="budget-bar-seg red" style={{ width: `${segs.red}%` }} />
      ) : null}
    </div>
  )
}

function Meta({ spent, budget, level }: { spent: number; budget: number; level: BudgetBarLevel }) {
  const { t } = useSettings()
  return (
    <div className={`budget-meta is-${level}`}>
      {t('budgetUsed')} ¥{formatYuan(spent)} / ¥{formatYuan(budget)}
    </div>
  )
}

export default function BudgetProgressCard() {
  const { t } = useSettings()
  const [snap, setSnap] = useState<BudgetSnapshot | null>(null)

  const load = useCallback(async () => {
    try {
      setSnap(await getBudgetSnapshot())
    } catch {
      setSnap(null)
    }
  }, [])

  useEffect(() => {
    void load()
    const onChange = () => void load()
    window.addEventListener(BUDGET_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(BUDGET_CHANGED_EVENT, onChange)
  }, [load])

  if (!snap?.enabled || snap.monthAmount <= 0) return null

  const monthLevel = budgetBarLevel(snap.monthSpent, snap.monthAmount)

  return (
    <div className="budget-card">
      <Meta spent={snap.monthSpent} budget={snap.monthAmount} level={monthLevel} />
      <div className="budget-bar-row">
        <span className="budget-bar-label">{t('budgetTitle')}</span>
        <Bar spent={snap.monthSpent} budget={snap.monthAmount} />
      </div>
      {snap.categories.length > 0 ? (
        <div className="budget-cat-list">
          {snap.categories.map((cat) => {
            const level = budgetBarLevel(cat.spent, cat.amount)
            return (
              <div className="budget-cat-row" key={cat.categoryId}>
                <div className="budget-cat-row-head">
                  <span>
                    {cat.icon} {cat.name}
                  </span>
                </div>
                <Meta spent={cat.spent} budget={cat.amount} level={level} />
                <Bar spent={cat.spent} budget={cat.amount} />
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
