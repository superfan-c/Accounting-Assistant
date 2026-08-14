import { InputNumber, Modal, Switch, message } from 'antd'
import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { getCategories } from '../storage'
import {
  getBudgetSettings,
  getCategoryBudgets,
  saveBudgetSettings,
} from '../budgetStorage'
import { notifyBudgetChanged } from '../utils/budget'
import { fenToYuan, yuanToFen } from '../utils/format'
import type { BudgetSettings, Category } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: (next: BudgetSettings) => void
}

export default function BudgetModal({ open, onClose, onSaved }: Props) {
  const { t } = useSettings()
  const [enabled, setEnabled] = useState(false)
  const [monthYuan, setMonthYuan] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [catYuan, setCatYuan] = useState<Record<string, number | null>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    void Promise.all([getBudgetSettings(), getCategoryBudgets(), getCategories()])
      .then(([settings, budgets, cats]) => {
        setEnabled(settings.enabled)
        setMonthYuan(settings.monthAmount > 0 ? fenToYuan(settings.monthAmount) : null)
        const expense = cats.filter((c) => c.type === 'expense')
        setCategories(expense)
        const map: Record<string, number | null> = {}
        for (const c of expense) {
          const found = budgets.find((b) => b.categoryId === c.id)
          map[c.id] = found ? fenToYuan(found.amount) : null
        }
        setCatYuan(map)
      })
      .catch((e) => message.error(e instanceof Error ? e.message : '加载预算失败'))
      .finally(() => setLoading(false))
  }, [open])

  const handleOk = async () => {
    const monthAmount = monthYuan && monthYuan > 0 ? yuanToFen(monthYuan) : 0
    if (enabled && monthAmount <= 0) {
      message.warning(t('budgetNeedAmount'))
      return
    }
    setSaving(true)
    try {
      const next = await saveBudgetSettings({
        enabled,
        monthAmount,
        categories: Object.entries(catYuan)
          .filter(([, yuan]) => yuan != null && yuan > 0)
          .map(([categoryId, yuan]) => ({
            categoryId,
            amount: yuanToFen(yuan as number),
          })),
      })
      onSaved?.(next)
      notifyBudgetChanged()
      message.success(t('budgetSaved'))
      onClose()
    } catch (e) {
      message.error(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`💰 ${t('budget')}`}
      open={open}
      onOk={() => void handleOk()}
      onCancel={onClose}
      okText={t('budgetOk')}
      cancelText={t('budgetCancel')}
      confirmLoading={saving}
      okButtonProps={{ disabled: loading }}
      closable
      maskClosable={false}
      destroyOnHidden
      centered
      width={420}
    >
      {loading ? (
        <p className="reminder-hint">{t('budgetLoading')}</p>
      ) : (
        <>
          <div className="reminder-row">
            <span>{t('budgetEnable')}</span>
            <Switch
              checked={enabled}
              checkedChildren={t('budgetOn')}
              unCheckedChildren={t('budgetOff')}
              onChange={setEnabled}
            />
          </div>
          <div className="reminder-row" style={{ marginTop: 14 }}>
            <span>{t('budgetMonth')}</span>
            <InputNumber
              min={0.01}
              step={100}
              precision={2}
              prefix="¥"
              placeholder={t('budgetMonthPh')}
              disabled={!enabled}
              value={monthYuan}
              onChange={(v) => setMonthYuan(typeof v === 'number' ? v : null)}
              style={{ width: 160 }}
            />
          </div>
          <div className="budget-cat-head">{t('budgetCategories')}</div>
          <p className="reminder-hint">{t('budgetCategoryHint')}</p>
          <div className="budget-cat-editor">
            {categories.map((cat) => (
              <div className="budget-cat-edit-row" key={cat.id}>
                <span className="budget-cat-edit-name">
                  {cat.icon} {cat.name}
                </span>
                <InputNumber
                  min={0}
                  step={50}
                  precision={2}
                  prefix="¥"
                  placeholder="—"
                  disabled={!enabled}
                  value={catYuan[cat.id]}
                  onChange={(v) =>
                    setCatYuan((prev) => ({
                      ...prev,
                      [cat.id]: typeof v === 'number' ? v : null,
                    }))
                  }
                  style={{ width: 132 }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  )
}
