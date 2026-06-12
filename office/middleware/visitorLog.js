import { Visitor } from '../models/Visitor.js'
import { Device } from '../models/Device.js'
import { lookupGeo } from '../lib/geo.js'
import { runInBackground } from '../lib/background.js'
import { ensureClientId, softFingerprint } from '../lib/clientId.js'

const SKIP_PREFIXES = ['/visitors', '/health']
const AUTH_COOKIE_NAME = process.env.COOKIE_NAME || 'stinson_token'

function shouldSkip(path) {
  return SKIP_PREFIXES.some((p) => path.startsWith(p))
}

async function logVisit(ip, info) {
  const existing = await Visitor.findById(ip).select('_id').lean()
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
    $setOnInsert: { firstSeen: info.now },
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

export function visitorLogger(req, res, next) {
  if (shouldSkip(req.path)) return next()
  if (req.cookies?.[AUTH_COOKIE_NAME]) return next()
  const cid = ensureClientId(req, res)
  const ip = req.ip || 'unknown'
  const info = {
    now: new Date(),
    ip,
    fingerprint: softFingerprint(req),
    userAgent: req.get('user-agent') || '',
    referer: req.get('referer') || '',
    path: (req.baseUrl || '') + req.path,
    method: req.method,
    isAdmin: false,
  }
  runInBackground(logVisit(ip, info), 'visitor-log')
  runInBackground(logDevice(cid, info), 'device-log')
  next()
}
