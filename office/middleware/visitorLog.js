import { Visitor } from '../models/Visitor.js'
import { Device } from '../models/Device.js'
import { lookupGeo } from '../lib/geo.js'
import { ensureClientId, softFingerprint } from '../lib/clientId.js'

const SKIP_PREFIXES = ['/visitors', '/health']
const AUTH_COOKIE_NAME = process.env.COOKIE_NAME || 'stinson_token'

function shouldSkip(path) {
  return SKIP_PREFIXES.some((p) => path.startsWith(p))
}

async function logVisit(ip, info) {
  const existing = await Visitor.findById(ip).select('_id landingPage').lean()
  const update = {
    $set: {
      lastSeen: info.now,
      userAgent: info.userAgent,
      lastPath: info.path,
      lastMethod: info.method,
      lastReferer: info.referer,
      isAdmin: info.isAdmin,
    },
    $inc: { hits: 1 },
    $setOnInsert: {
      firstSeen: info.now,
      landingPage: info.landingPage,
    },
  }
  // Only update landingPage if it hasn't been set yet
  if (existing && !existing.landingPage && info.landingPage) {
    update.$set.landingPage = info.landingPage
  }
  if (!existing) {
    const geo = await lookupGeo(ip)
    if (geo) Object.assign(update.$set, geo)
  }
  await Visitor.findByIdAndUpdate(ip, update, { upsert: true })
}

async function logDevice(cid, info) {
  await Device.findByIdAndUpdate(
    cid,
    {
      $set: {
        ip: info.ip,
        fingerprint: info.fingerprint,
        userAgent: info.userAgent,
        lastSeen: info.now,
        lastPath: info.path,
      },
      $inc: { hits: 1 },
      $setOnInsert: { firstSeen: info.now },
    },
    { upsert: true }
  )
}

export async function visitorLogger(req, res, next) {
  if (shouldSkip(req.path)) return next()
  if (req.cookies?.[AUTH_COOKIE_NAME]) return next()
  const cid = ensureClientId(req, res)
  const ip = req.ip || 'unknown'
  const landingPage = req.get('x-landing-page') || ''
  const info = {
    now: new Date(),
    ip,
    fingerprint: softFingerprint(req),
    userAgent: req.get('user-agent') || '',
    referer: req.get('referer') || '',
    path: (req.baseUrl || '') + req.path,
    method: req.method,
    isAdmin: false,
    landingPage,
  }
  await Promise.all([
    logVisit(ip, info).catch((e) => console.warn('[visitor-log] failed:', e?.message)),
    logDevice(cid, info).catch((e) => console.warn('[device-log] failed:', e?.message)),
  ])
  next()
}
