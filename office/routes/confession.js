import { Router } from 'express'
import { SiteSettings, SITE_SETTINGS_ID } from '../models/SiteSettings.js'
import { requireAuth } from '../middleware/auth.js'
import { isAdmin } from '../lib/adminCheck.js'

const router = Router()

const VALID_MODES = new Set(['hidden', 'public', 'allowlist'])

function defaultConfession() {
  return { mode: 'hidden', allowedIps: [], question: '', yesReveal: '' }
}

async function getConfession() {
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).lean()
  return { ...defaultConfession(), ...(doc?.confession || {}) }
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
  const visible = admin || isVisibleTo(conf, req.ip || '')
  if (!visible) return res.json({ visible: false })
  res.json({
    visible: true,
    admin,
    question: conf.question,
    yesReveal: conf.yesReveal,
  })
})

router.get('/settings', requireAuth, async (_req, res) => {
  const conf = await getConfession()
  res.json(conf)
})

router.put('/settings', requireAuth, async (req, res) => {
  const { mode, allowedIps, question, yesReveal } = req.body || {}
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
  if (question !== undefined) {
    if (typeof question !== 'string' || question.length > 300) {
      return res.status(400).json({ error: 'question must be a string up to 300 chars' })
    }
    update['confession.question'] = question
  }
  if (yesReveal !== undefined) {
    if (typeof yesReveal !== 'string' || yesReveal.length > 1000) {
      return res.status(400).json({ error: 'yesReveal must be a string up to 1000 chars' })
    }
    update['confession.yesReveal'] = yesReveal
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
