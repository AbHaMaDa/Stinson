import jwt from 'jsonwebtoken'

export function isAdmin(req) {
  const token = req.cookies?.[process.env.COOKIE_NAME || 'stinson_token']
  if (!token) return false
  try {
    jwt.verify(token, process.env.JWT_SECRET)
    return true
  } catch {
    return false
  }
}
