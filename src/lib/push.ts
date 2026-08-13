const VAPID_PUBLIC_KEY = import.meta.env.REACT_APP_VAPID_PUBLIC_KEY as string | undefined

export function vapidPublicKey() {
  return VAPID_PUBLIC_KEY?.trim() || ''
}

export function canUseWebPush() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i)
  return output
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export async function registerPushWorker() {
  if (!canUseWebPush()) return null
  return navigator.serviceWorker.register('/sw.js')
}

export async function subscribeWebPush(): Promise<PushSubscription | null> {
  const key = vapidPublicKey()
  if (!key || !canUseWebPush()) return null
  const allowed = await ensureNotificationPermission()
  if (!allowed) return null
  const reg = await registerPushWorker()
  if (!reg) return null
  await navigator.serviceWorker.ready
  const existing = await reg.pushManager.getSubscription()
  if (existing) return existing
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
  })
}

export function mapPushError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  if (/push service not available|push service error|abort/i.test(msg)) {
    return '当前浏览器连不上系统推送服务。国内 Chrome 常因无法访问 Google FCM 失败。可改用 Firefox，或给浏览器开可访问外网的代理后再打开开关。'
  }
  if (/denied|not allowed|permission/i.test(msg)) {
    return '通知权限未开。请在浏览器站点设置里允许通知。'
  }
  return msg || '订阅推送失败'
}

export function serializeSubscription(sub: PushSubscription) {
  const json = sub.toJSON()
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth
  if (!json.endpoint || !p256dh || !auth) {
    throw new Error('推送订阅不完整')
  }
  return { endpoint: json.endpoint, p256dh, auth }
}
