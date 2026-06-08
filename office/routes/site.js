import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { SiteSettings, SITE_SETTINGS_ID } from '../models/SiteSettings.js'

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
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).lean()
  if (!doc?.avatar?.data) return res.status(404).end()
  res.set('Content-Type', doc.avatar.contentType || 'image/jpeg')
  res.set('Cache-Control', 'public, max-age=60, must-revalidate')
  res.send(doc.avatar.data)
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

export default router
