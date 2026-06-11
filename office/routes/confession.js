import { Router } from 'express'
import { SiteSettings, SITE_SETTINGS_ID } from '../models/SiteSettings.js'
import { ConfessionAnswer } from '../models/ConfessionAnswer.js'
import { requireAuth } from '../middleware/auth.js'
import { isAdmin } from '../lib/adminCheck.js'

const router = Router()

const VALID_MODES = new Set(['hidden', 'public', 'allowlist'])
const VALID_Q = new Set(['q1', 'q2'])
const VALID_ANSWER = new Set(['yes', 'no'])

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

router.post('/answer', async (req, res) => {
  const { q, answer } = req.body || {}
  if (!VALID_Q.has(q)) return res.status(400).json({ error: 'q must be q1 or q2' })
  if (!VALID_ANSWER.has(answer)) return res.status(400).json({ error: 'answer must be yes or no' })

  const ip = req.ip || ''
  if (!ip) return res.status(400).json({ error: 'no ip' })

  const conf = await getConfession()
  if (!isAdmin(req) && !isVisibleTo(conf, ip)) {
    return res.status(403).json({ error: 'forbidden' })
  }

  const now = new Date()
  const update = {
    $set: {
      [q]: answer,
      [`${q}At`]: now,
      userAgent: req.get('user-agent') || '',
    },
  }
  if (q === 'q1' && answer === 'no') {
    update.$inc = { q1NoCount: 1 }
  }
  await ConfessionAnswer.findByIdAndUpdate(ip, update, { upsert: true })
  res.json({ ok: true })
})

router.get('/answers', requireAuth, async (_req, res) => {
  const items = await ConfessionAnswer.find().sort({ updatedAt: -1 }).lean()
  const tally = items.reduce(
    (acc, it) => {
      if (it.q1 === 'yes') acc.q1.yes++
      else if (it.q1 === 'no') acc.q1.no++
      if (it.q2 === 'yes') acc.q2.yes++
      else if (it.q2 === 'no') acc.q2.no++
      return acc
    },
    { q1: { yes: 0, no: 0 }, q2: { yes: 0, no: 0 } }
  )
  res.json({ items, tally })
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
