import { Visitor } from '../models/Visitor.js'
import { lookupGeo } from '../lib/geo.js'
import { runInBackground } from '../lib/background.js'

const SKIP_PREFIXES = ['/visitors', '/health']
const COOKIE_NAME = process.env.COOKIE_NAME || 'stinson_token'

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

export function visitorLogger(req, _res, next) {
  if (shouldSkip(req.path)) return next()
  const ip = req.ip || 'unknown'
  const info = {
    now: new Date(),
    userAgent: req.get('user-agent') || '',
    referer: req.get('referer') || '',
    path: (req.baseUrl || '') + req.path,
    method: req.method,
    isAdmin: !!req.cookies?.[COOKIE_NAME],
  }
  runInBackground(logVisit(ip, info), 'visitor-log')
  next()
}
