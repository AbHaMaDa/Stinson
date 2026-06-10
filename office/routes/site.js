import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { SiteSettings, SITE_SETTINGS_ID } from '../models/SiteSettings.js'
import { invalidateBlockCache } from '../middleware/ipBlock.js'

const router = Router()

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

function parseDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null
  const match = dataUrl.match(/^data:([a-z]+\/[a-z0-9+.-]+);base64,(.+)$/i)
  if (!match) return null
  return { contentType: match[1].toLowerCase(), base64: match[2] }
}

router.get('/avatar', async (_req, res) => {
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID)
  const raw = doc?.avatar?.data
  if (!raw) return res.status(404).end()
  const buf = Buffer.isBuffer(raw)
    ? raw
    : raw.buffer
      ? Buffer.from(raw.buffer)
      : Buffer.from(raw)
  res.set('Content-Type', doc.avatar.contentType || 'image/jpeg')
  res.set('Cache-Control', 'public, max-age=60, must-revalidate')
  res.end(buf)
})

router.post('/avatar', requireAuth, async (req, res) => {
  const parsed = parseDataUrl(req.body?.dataUrl)
  if (!parsed) return res.status(400).json({ error: 'expected dataUrl with image/* mime' })
  if (!ALLOWED_MIME.has(parsed.contentType)) {
    return res.status(400).json({ error: 'only jpeg, png, or webp' })
  }
  const buf = Buffer.from(parsed.base64, 'base64')
  if (buf.length === 0) return res.status(400).json({ error: 'empty image' })
  if (buf.length > MAX_BYTES) {
    return res.status(413).json({ error: `image too large (max ${MAX_BYTES / 1024 / 1024}MB)` })
  }
  const now = new Date()
  await SiteSettings.findByIdAndUpdate(
    SITE_SETTINGS_ID,
    { avatar: { data: buf, contentType: parsed.contentType, updatedAt: now } },
    { upsert: true, new: true }
  )
  res.json({ ok: true, updatedAt: now.toISOString(), bytes: buf.length })
})

router.delete('/avatar', requireAuth, async (_req, res) => {
  await SiteSettings.findByIdAndUpdate(
    SITE_SETTINGS_ID,
    { $unset: { avatar: '' } }
  )
  res.json({ ok: true })
})

router.get('/blocked-ips', requireAuth, async (req, res) => {
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).select('blockedIps').lean()
  res.json({ blockedIps: doc?.blockedIps || [], yourIp: req.ip })
})

router.put('/blocked-ips', requireAuth, async (req, res) => {
  const { blockedIps } = req.body || {}
  if (!Array.isArray(blockedIps) || !blockedIps.every((s) => typeof s === 'string')) {
    return res.status(400).json({ error: 'blockedIps must be a string array' })
  }
  const cleaned = [...new Set(blockedIps.map((s) => s.trim()).filter(Boolean))]
  if (cleaned.includes(req.ip)) {
    return res.status(400).json({ error: "can't block your own IP" })
  }
  await SiteSettings.findByIdAndUpdate(
    SITE_SETTINGS_ID,
    { $set: { blockedIps: cleaned } },
    { upsert: true }
  )
  invalidateBlockCache()
  res.json({ blockedIps: cleaned, yourIp: req.ip })
})

export default router
