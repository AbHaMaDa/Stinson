import rateLimit from 'express-rate-limit'
import { sendAlert } from '../lib/mailer.js'
import { runInBackground } from '../lib/background.js'

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'too many messages — slow down a bit and try again in a minute.' },
})

export const messageHourlyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'hourly message limit reached.' },
})

const ALERT_COOLDOWN_MS = 30 * 60 * 1000
const recentLoginAlerts = new Map()

function shouldAlert(ip) {
  const now = Date.now()
  for (const [k, t] of recentLoginAlerts) {
    if (now - t > ALERT_COOLDOWN_MS) recentLoginAlerts.delete(k)
  }
  const last = recentLoginAlerts.get(ip)
  if (last && now - last < ALERT_COOLDOWN_MS) return false
  recentLoginAlerts.set(ip, now)
  return true
}

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res, next, options) => {
    const ip = req.ip || 'unknown'
    if (shouldAlert(ip)) {
      const body = [
        '5+ failed login attempts were just blocked on your Stinson backend.',
        '',
        `IP:            ${ip}`,
        `Time:          ${new Date().toISOString()}`,
        `User-Agent:    ${req.get('user-agent') || 'unknown'}`,
        `Tried email:   ${req.body?.email || 'n/a'}`,
        '',
        'That IP is now blocked from logging in for 15 minutes.',
        'You will not receive another alert from this IP for 30 minutes.',
      ].join('\n')
      runInBackground(
        sendAlert('[Stinson] Failed login attempts blocked', body),
        'login-alert'
      )
    }
    res.status(options.statusCode).json(options.message)
  },
  message: { error: 'too many login attempts — try again in 15 minutes.' },
})
