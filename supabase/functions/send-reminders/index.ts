import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const TZ = 'Asia/Shanghai'

type SettingsRow = {
  user_id: string
  remind_time: string
  message_body: string
  last_sent_on: string | null
}

type SubRow = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
}

function beijingStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const day = `${get('year')}-${get('month')}-${get('day')}`
  const hm = `${get('hour')}:${get('minute')}`
  const [h, m] = hm.split(':').map(Number)
  return { day, minutes: h * 60 + m, hm }
}

function timeToMinutes(value: string) {
  const [h, m] = value.split(':').map((n) => Number(n))
  if (!Number.isFinite(h) || !Number.isFinite(m)) return -1
  return h * 60 + m
}

function inSendWindow(remindMinutes: number, nowMinutes: number) {
  const diff = (nowMinutes - remindMinutes + 24 * 60) % (24 * 60)
  return diff < 5
}

function normalizeVapidSubject(raw: string) {
  const value = raw.trim()
  if (/^https?:\/\//i.test(value) || /^mailto:/i.test(value)) return value
  if (value.includes('@')) return `mailto:${value}`
  return 'mailto:reminder@localhost'
}

function isCronRequest(req: Request) {
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (!cronSecret) return false
  const auth = req.headers.get('Authorization') ?? ''
  const custom = req.headers.get('x-cron-secret') ?? ''
  return auth === `Bearer ${cronSecret}` || custom === cronSecret
}

Deno.serve(async (req) => {
  if (!isCronRequest(req)) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = normalizeVapidSubject(
    Deno.env.get('VAPID_SUBJECT') ?? 'mailto:reminder@localhost',
  )

  if (!supabaseUrl || !serviceKey || !vapidPublic || !vapidPrivate) {
    return new Response(JSON.stringify({ error: 'missing env' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)

  const supabase = createClient(supabaseUrl, serviceKey)
  const { day, minutes } = beijingStamp()

  const { data: settings, error: settingsError } = await supabase
    .from('reminder_settings')
    .select('user_id, remind_time, message_body, last_sent_on')
    .eq('enabled', true)

  if (settingsError) {
    return new Response(JSON.stringify({ error: settingsError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const due = ((settings ?? []) as SettingsRow[]).filter((row) => {
    if (row.last_sent_on === day) return false
    return inSendWindow(timeToMinutes(row.remind_time), minutes)
  })

  if (due.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0, day, skipped: 'not-due' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const dueIds = due.map((row) => row.user_id)
  const { data: todayRows } = await supabase
    .from('records')
    .select('user_id')
    .in('user_id', dueIds)
    .eq('date', day)

  const recorded = new Set((todayRows ?? []).map((r: { user_id: string }) => r.user_id))
  const targets = due.filter((row) => !recorded.has(row.user_id))

  if (targets.length === 0) {
    await supabase
      .from('reminder_settings')
      .update({ last_sent_on: day })
      .in(
        'user_id',
        due.filter((row) => recorded.has(row.user_id)).map((row) => row.user_id),
      )
    return new Response(JSON.stringify({ ok: true, sent: 0, skipped: 'already-recorded' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: subs } = await supabase
    .from('reminder_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in(
      'user_id',
      targets.map((row) => row.user_id),
    )

  const byUser = new Map<string, SubRow[]>()
  for (const sub of (subs ?? []) as SubRow[]) {
    const list = byUser.get(sub.user_id) ?? []
    list.push(sub)
    byUser.set(sub.user_id, list)
  }

  let sent = 0
  const staleIds: string[] = []
  const marked: string[] = []

  for (const row of targets) {
    const userSubs = byUser.get(row.user_id) ?? []
    if (userSubs.length === 0) continue
    const payload = JSON.stringify({
      title: '记账助手',
      body: row.message_body,
      url: '/',
    })
    let ok = false
    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
        )
        ok = true
        sent += 1
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) staleIds.push(sub.id)
      }
    }
    if (ok) marked.push(row.user_id)
  }

  if (staleIds.length > 0) {
    await supabase.from('reminder_subscriptions').delete().in('id', staleIds)
  }
  if (marked.length > 0) {
    await supabase.from('reminder_settings').update({ last_sent_on: day }).in('user_id', marked)
  }
  if (recorded.size > 0) {
    await supabase
      .from('reminder_settings')
      .update({ last_sent_on: day })
      .in('user_id', [...recorded])
  }

  return new Response(JSON.stringify({ ok: true, sent, day }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
