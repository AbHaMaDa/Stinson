import { Router } from 'express'
import { SiteSettings, SITE_SETTINGS_ID } from '../models/SiteSettings.js'
import { requireAuth } from '../middleware/auth.js'
import { isAdmin } from '../lib/adminCheck.js'

const router = Router()

const VALID_MODES = new Set(['hidden', 'public', 'allowlist'])

function defaultConfession() {
  return { mode: 'hidden', allowedIps: [] }
}

async function getConfession() {
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).lean()
  return doc?.confession || defaultConfession()
}

function isVisibleTo(conf, ip) {
  if (conf.mode === 'public') return true
  if (conf.mode === 'allowlist' && Array.isArray(conf.allowedIps)) {
    return conf.allowedIps.includes(ip)
  }
  return false
}

router.get('/access', async (req, res) => {
  const conf = await getConfession()
  const admin = isAdmin(req)
  if (admin) return res.json({ visible: true, admin: true })
  res.json({ visible: isVisibleTo(conf, req.ip || '') })
})

router.get('/settings', requireAuth, async (_req, res) => {
  const conf = await getConfession()
  res.json(conf)
})

router.put('/settings', requireAuth, async (req, res) => {
  const { mode, allowedIps } = req.body || {}
  const update = {}
  if (mode !== undefined) {
    if (!VALID_MODES.has(mode)) {
      return res.status(400).json({ error: 'invalid mode' })
    }
    update['confession.mode'] = mode
  }
  if (allowedIps !== undefined) {
    if (!Array.isArray(allowedIps) || !allowedIps.every((s) => typeof s === 'string')) {
      return res.status(400).json({ error: 'allowedIps must be string array' })
    }
    update['confession.allowedIps'] = [...new Set(allowedIps)]
  }
  await SiteSettings.findByIdAndUpdate(
    SITE_SETTINGS_ID,
    { $set: update },
    { upsert: true, new: true }
  )
  const conf = await getConfession()
  res.json(conf)
})

export default router
