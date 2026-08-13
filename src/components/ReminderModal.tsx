import { Input, Modal, Select, Switch, TimePicker, message } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import {
  canUseWebPush,
  ensureNotificationPermission,
  mapPushError,
  vapidPublicKey,
} from '../lib/push'
import {
  DEFAULT_REMINDER,
  getReminderSettings,
  savePushSubscription,
  saveReminderSettings,
} from '../reminderStorage'
import type { ReminderSettings, ReminderTemplateKey } from '../types'

const TEMPLATE_BODIES: Record<Exclude<ReminderTemplateKey, 'custom'>, string> = {
  gentle: '该记账啦，记一笔记账助手更清晰～',
  casual: '今天还没记账，有事没事记一笔',
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved?: (next: ReminderSettings) => void
}

export default function ReminderModal({ open, onClose, onSaved }: Props) {
  const { t } = useSettings()
  const [draft, setDraft] = useState<ReminderSettings>(DEFAULT_REMINDER)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    void getReminderSettings()
      .then(setDraft)
      .catch((e) => message.error(e instanceof Error ? e.message : '加载提醒设置失败'))
      .finally(() => setLoading(false))
  }, [open])

  const setTemplate = (key: ReminderTemplateKey) => {
    setDraft((prev) => ({
      ...prev,
      templateKey: key,
      messageBody: key === 'custom' ? prev.messageBody : TEMPLATE_BODIES[key],
    }))
  }

  const handleOk = async () => {
    setSaving(true)
    try {
      if (draft.enabled) {
        if (!canUseWebPush() || !vapidPublicKey()) {
          message.warning(t('reminderNoPush'))
        } else {
          const ok = await ensureNotificationPermission()
          if (!ok) {
            message.warning(t('permDenied'))
            return
          }
          const subscribed = await savePushSubscription()
          if (!subscribed) {
            message.warning(t('reminderNoPush'))
            return
          }
        }
      }
      const next = await saveReminderSettings({
        ...draft,
        messageBody: draft.messageBody.trim() || TEMPLATE_BODIES.casual,
      })
      onSaved?.(next)
      message.success(t('reminderSaved'))
      onClose()
    } catch (e) {
      message.error(mapPushError(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      title={`⏰ ${t('reminder')}`}
      open={open}
      onOk={() => void handleOk()}
      onCancel={onClose}
      okText={t('reminderOk')}
      cancelText={t('reminderCancel')}
      confirmLoading={saving}
      okButtonProps={{ disabled: loading }}
      closable
      maskClosable={false}
      destroyOnHidden
      centered
      width={420}
    >
      {loading ? (
        <p className="reminder-hint">{t('reminderLoading')}</p>
      ) : (
        <>
          <div className="reminder-row">
            <span>{t('reminderEnable')}</span>
            <Switch
              checked={draft.enabled}
              checkedChildren={t('reminderOn')}
              unCheckedChildren={t('reminderOff')}
              onChange={(checked) => setDraft((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>
          <div className="reminder-row" style={{ marginTop: 12 }}>
            <span>{t('reminderTime')}</span>
            <TimePicker
              format="HH:mm"
              allowClear={false}
              needConfirm={false}
              disabled={!draft.enabled}
              value={dayjs(draft.remindTime, 'HH:mm')}
              onChange={(time: Dayjs | null) => {
                if (!time) return
                setDraft((prev) => ({ ...prev, remindTime: time.format('HH:mm') }))
              }}
            />
          </div>
          <div className="reminder-row" style={{ marginTop: 12 }}>
            <span>{t('reminderTemplate')}</span>
            <Select
              style={{ minWidth: 160 }}
              disabled={!draft.enabled}
              value={draft.templateKey}
              onChange={setTemplate}
              options={[
                { value: 'gentle', label: t('reminderTplGentle') },
                { value: 'casual', label: t('reminderTplCasual') },
                { value: 'custom', label: t('reminderTplCustom') },
              ]}
            />
          </div>
          <Input.TextArea
            style={{ marginTop: 12 }}
            autoSize={{ minRows: 2, maxRows: 4 }}
            disabled={!draft.enabled}
            readOnly={draft.templateKey !== 'custom'}
            value={draft.messageBody}
            placeholder={t('reminderCustomPh')}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, messageBody: e.target.value }))
            }
          />
        </>
      )}
    </Modal>
  )
}
