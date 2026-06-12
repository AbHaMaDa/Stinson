import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Admin } from '../models/Admin.js'
import { requireAuth } from '../middleware/auth.js'
import { loginLimiter } from '../middleware/rateLimit.js'

const router = Router()

const isProd = process.env.NODE_ENV === 'production'
const cookieOptions = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }
  const admin = await Admin.findOne({ email: email.toLowerCase().trim() })
  if (!admin) return res.status(401).json({ error: 'invalid credentials' })

  const ok = await bcrypt.compare(password, admin.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid credentials' })

  const token = jwt.sign(
    { sub: admin._id.toString(), email: admin.email, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  res.cookie(process.env.COOKIE_NAME || 'stinson_token', token, cookieOptions)
  res.json({ ok: true, user: { email: admin.email } })
})

router.post('/logout', (req, res) => {
  res.clearCookie(process.env.COOKIE_NAME || 'stinson_token', {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
  })
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { email: req.user.email } })
})

export default router
