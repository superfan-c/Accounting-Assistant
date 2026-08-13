import { supabase } from './lib/supabaseClient'
import { serializeSubscription, subscribeWebPush } from './lib/push'
import type { ReminderSettings, ReminderTemplateKey } from './types'

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('请先登录')
  return data.user.id
}

function padTime(value: string) {
  const [h = '21', m = '00'] = value.split(':')
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

function mapSettings(row: {
  enabled: boolean
  remind_time: string
  template_key: string
  message_body: string
}): ReminderSettings {
  return {
    enabled: row.enabled,
    remindTime: padTime(row.remind_time).slice(0, 5),
    templateKey: (row.template_key as ReminderTemplateKey) || 'casual',
    messageBody: row.message_body,
  }
}

export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  remindTime: '21:00',
  templateKey: 'casual',
  messageBody: '今天还没记账，有事没事记一笔',
}

export async function getReminderSettings(): Promise<ReminderSettings> {
  await requireUserId()
  const { data, error } = await supabase
    .from('reminder_settings')
    .select('enabled, remind_time, template_key, message_body')
    .maybeSingle()
  if (error) throw error
  if (!data) return { ...DEFAULT_REMINDER }
  return mapSettings(data)
}

export async function saveReminderSettings(
  patch: Partial<ReminderSettings>,
): Promise<ReminderSettings> {
  const userId = await requireUserId()
  const current = await getReminderSettings()
  const next: ReminderSettings = { ...current, ...patch }
  const { data, error } = await supabase
    .from('reminder_settings')
    .upsert(
      {
        user_id: userId,
        enabled: next.enabled,
        remind_time: `${next.remindTime}:00`,
        template_key: next.templateKey,
        message_body: next.messageBody,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('enabled, remind_time, template_key, message_body')
    .single()
  if (error) throw error
  return mapSettings(data)
}

export async function savePushSubscription() {
  const userId = await requireUserId()
  const sub = await subscribeWebPush()
  if (!sub) return false
  const keys = serializeSubscription(sub)
  const { error } = await supabase.from('reminder_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: keys.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    { onConflict: 'endpoint' },
  )
  if (error) throw error
  return true
}
