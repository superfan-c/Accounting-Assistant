import { Modal } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { markBudgetPopup, peekBudgetAlert } from '../budgetStorage'
import { useSettings } from '../context/SettingsContext'
import { BUDGET_CHANGED_EVENT } from '../utils/budget'
import type { BudgetAlert } from '../types'

export default function BudgetAlertModal() {
  const { t } = useSettings()
  const [alert, setAlert] = useState<BudgetAlert | null>(null)
  const busy = useRef(false)
  const openRef = useRef(false)

  const check = useCallback(async () => {
    if (busy.current || openRef.current) return
    busy.current = true
    try {
      const next = await peekBudgetAlert()
      if (!next) return
      openRef.current = true
      setAlert(next)
      try {
        await markBudgetPopup(next)
      } catch {
        /* 标记失败时下次进入仍会再提示 */
      }
    } catch {
      /* 无预算表或未登录时静默 */
    } finally {
      busy.current = false
    }
  }, [])

  useEffect(() => {
    void check()
    const onChange = () => void check()
    window.addEventListener(BUDGET_CHANGED_EVENT, onChange)
    return () => window.removeEventListener(BUDGET_CHANGED_EVENT, onChange)
  }, [check])

  const text = (() => {
    if (!alert) return ''
    const key =
      alert.level === 'over'
        ? alert.kind === 'month'
          ? 'budgetAlertOver'
          : 'budgetAlertCatOver'
        : alert.level === 'warn'
          ? alert.kind === 'month'
            ? 'budgetAlertWarn'
            : 'budgetAlertCatWarn'
          : alert.kind === 'month'
            ? 'budgetAlertHalf'
            : 'budgetAlertCatHalf'
    const tpl = t(key)
    return alert.kind === 'category' ? tpl.replace('{name}', alert.categoryName ?? '') : tpl
  })()

  const dismiss = () => {
    openRef.current = false
    setAlert(null)
    void check()
  }

  return (
    <Modal
      title={`💰 ${t('budgetAlertTitle')}`}
      open={Boolean(alert)}
      onOk={dismiss}
      onCancel={dismiss}
      okText={t('budgetAlertOk')}
      cancelButtonProps={{ style: { display: 'none' } }}
      closable
      centered
      width={420}
      maskClosable={false}
    >
      <p className="budget-alert-body">{text}</p>
    </Modal>
  )
}
