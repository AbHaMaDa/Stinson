import { SiteSettings, SITE_SETTINGS_ID } from '../models/SiteSettings.js'

const TTL_MS = 30_000
let cache = { ips: new Set(), expiresAt: 0 }

async function getBlocked() {
  const now = Date.now()
  if (now < cache.expiresAt) return cache.ips
  const doc = await SiteSettings.findById(SITE_SETTINGS_ID).select('blockedIps').lean()
  cache = { ips: new Set(doc?.blockedIps || []), expiresAt: now + TTL_MS }
  return cache.ips
}

export async function ipBlock(req, res, next) {
  try {
    const blocked = await getBlocked()
    if (blocked.has(req.ip)) {
      return res.status(403).json({ error: 'forbidden' })
    }
  } catch (err) {
    console.error('[ipBlock] lookup failed:', err.message)
  }
  next()
}

export function invalidateBlockCache() {
  cache = { ips: new Set(), expiresAt: 0 }
}
