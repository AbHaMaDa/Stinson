import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { PushSubscription } from '../models/PushSubscription.js'
import { getPublicKey, isPushEnabled } from '../lib/push.js'

const router = Router()

router.get('/public-key', requireAuth, (_req, res) => {
  res.json({ key: getPublicKey(), enabled: isPushEnabled() })
})

router.post('/subscribe', requireAuth, async (req, res) => {
  const { endpoint, keys } = req.body || {}
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: 'invalid subscription' })
  }
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { endpoint, keys },
    { upsert: true, new: true }
  )
  res.json({ ok: true })
})

router.post('/unsubscribe', requireAuth, async (req, res) => {
  const { endpoint } = req.body || {}
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' })
  await PushSubscription.deleteOne({ endpoint })
  res.json({ ok: true })
})

export default router
