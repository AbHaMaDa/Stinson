import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const token = req.cookies?.[process.env.COOKIE_NAME || 'stinson_token']
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}
