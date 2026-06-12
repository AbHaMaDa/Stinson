import crypto from 'node:crypto'

const COOKIE_NAME = 'stinson_cid'
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
const isProd = process.env.NODE_ENV === 'production'

const cookieOptions = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
  maxAge: ONE_YEAR_MS,
  path: '/',
}

export function softFingerprint(req) {
  const ua = req.get('user-agent') || ''
  const lang = req.get('accept-language') || ''
  const enc = req.get('accept-encoding') || ''
  const ip = req.ip || ''
  return crypto.createHash('sha256').update(`${ip}|${ua}|${lang}|${enc}`).digest('hex').slice(0, 16)
}

function deriveCid(req) {
  const fp = softFingerprint(req)
  const salt = process.env.JWT_SECRET || 'stinson-cid-salt'
  return crypto.createHash('sha256').update(`${fp}|${salt}`).digest('hex').slice(0, 32)
}

export function ensureClientId(req, res) {
  if (req.cid) return req.cid
  const existing = req.cookies?.[COOKIE_NAME]
  if (existing && /^[0-9a-f-]{20,}$/i.test(existing)) {
    req.cid = existing
    return existing
  }
  const cid = deriveCid(req)
  res.cookie(COOKIE_NAME, cid, cookieOptions)
  req.cid = cid
  return cid
}
