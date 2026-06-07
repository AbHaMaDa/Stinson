import { api } from './api'

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buf = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i)
  return buf
}

async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration('/sw.js')
  if (existing) return existing
  return navigator.serviceWorker.register('/sw.js')
}

export async function getSubscriptionState() {
  if (!isPushSupported()) return { supported: false, permission: 'unsupported', subscribed: false }
  const reg = await getRegistration()
  const sub = await reg.pushManager.getSubscription()
  return {
    supported: true,
    permission: Notification.permission,
    subscribed: !!sub,
  }
}

export async function subscribeToPush() {
  if (!isPushSupported()) throw new Error('push not supported in this browser')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('notification permission denied')
  }

  const { data } = await api.get('/push/public-key')
  if (!data.enabled || !data.key) {
    throw new Error('push not configured on the server')
  }

  const reg = await getRegistration()
  await navigator.serviceWorker.ready

  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.key),
    })
  }

  await api.post('/push/subscribe', sub.toJSON())
  return true
}

export async function unsubscribeFromPush() {
  if (!isPushSupported()) return
  const reg = await getRegistration()
  const sub = await reg.pushManager.getSubscription()
  if (sub) {
    await api.post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {})
    await sub.unsubscribe()
  }
}
