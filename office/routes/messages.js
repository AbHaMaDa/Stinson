import { Router } from 'express'
import { Message } from '../models/Message.js'
import { requireAuth } from '../middleware/auth.js'
import { messageLimiter, messageHourlyLimiter } from '../middleware/rateLimit.js'
import { sendNotification } from '../lib/push.js'
import { verifyCaptcha } from '../lib/captcha.js'

const router = Router()

async function notifyNewMessage(msg) {
  const preview = msg.content.length > 140 ? msg.content.slice(0, 140) + '…' : msg.content
  try {
    await sendNotification({
      title: `New message from ${msg.name || 'Anonymous'}`,
      body: preview,
      url: '/inbox',
      messageId: msg._id.toString(),
    })
  } catch (e) {
    console.warn('[push] notifyNewMessage failed:', e.message)
  }
}

router.post('/', messageLimiter, messageHourlyLimiter, async (req, res) => {
  const { name, content, website, captchaToken } = req.body || {}

  if (website) {
    return res.status(201).json({ ok: true, id: null })
  }

  const captcha = await verifyCaptcha(captchaToken, req.ip)
  if (!captcha.ok) {
    return res.status(400).json({ error: 'captcha verification failed' })
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'message content is required' })
  }
  const visitorName = typeof name === 'string' ? name.trim() : ''
  const msg = await Message.create({ name: visitorName, content: content.trim() })
  await notifyNewMessage(msg)
  res.status(201).json({ ok: true, id: msg._id })
})

router.get('/', requireAuth, async (req, res) => {
  const { q, filter } = req.query
  const query = {}
  if (filter === 'unread') query.read = false
  if (filter === 'read') query.read = true
  if (q && typeof q === 'string' && q.trim()) {
    const re = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ name: re }, { content: re }]
  }
  const messages = await Message.find(query).sort({ createdAt: -1 }).lean()
  res.json({ messages })
})

router.get('/unread-count', requireAuth, async (_req, res) => {
  const count = await Message.countDocuments({ read: false })
  res.json({ count })
})

router.post('/bulk', requireAuth, async (req, res) => {
  const { action, ids } = req.body || {}
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids required' })
  }
  if (action === 'mark-read') {
    const r = await Message.updateMany({ _id: { $in: ids } }, { read: true })
    return res.json({ ok: true, modified: r.modifiedCount })
  }
  if (action === 'mark-unread') {
    const r = await Message.updateMany({ _id: { $in: ids } }, { read: false })
    return res.json({ ok: true, modified: r.modifiedCount })
  }
  if (action === 'delete') {
    const r = await Message.deleteMany({ _id: { $in: ids } })
    return res.json({ ok: true, deleted: r.deletedCount })
  }
  res.status(400).json({ error: 'invalid action' })
})

router.patch('/:id/read', requireAuth, async (req, res) => {
  const msg = await Message.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  )
  if (!msg) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true, message: msg })
})

router.delete('/:id', requireAuth, async (req, res) => {
  const deleted = await Message.findByIdAndDelete(req.params.id)
  if (!deleted) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true })
})

export default router
