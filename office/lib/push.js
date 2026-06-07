import webpush from 'web-push'
import { PushSubscription } from '../models/PushSubscription.js'

let configured = false

function configure() {
  if (configured) return true
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false
  webpush.setVapidDetails(
    VAPID_SUBJECT || 'mailto:admin@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
  configured = true
  return true
}

export const isPushEnabled = () => configure()

export function getPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || ''
}

export async function sendNotification(payload) {
  if (!configure()) return { sent: 0, reason: 'disabled' }
  const subs = await PushSubscription.find().lean()
  if (!subs.length) return { sent: 0, reason: 'no-subscribers' }

  const body = JSON.stringify(payload)
  const stale = []
  let sent = 0

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          body
        )
        sent += 1
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          stale.push(s.endpoint)
        } else {
          console.warn('[push] send failed:', err.statusCode, err.body || err.message)
        }
      }
    })
  )

  if (stale.length) {
    await PushSubscription.deleteMany({ endpoint: { $in: stale } })
    console.log(`[push] removed ${stale.length} stale subscription(s)`)
  }

  return { sent, stale: stale.length }
}
