const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const isCaptchaEnabled = () => !!process.env.TURNSTILE_SECRET

export async function verifyCaptcha(token, ip) {
  if (!isCaptchaEnabled()) return { ok: true, skipped: true }
  if (!token) return { ok: false, reason: 'missing-token' }
  try {
    const params = new URLSearchParams()
    params.set('secret', process.env.TURNSTILE_SECRET)
    params.set('response', token)
    if (ip) params.set('remoteip', ip)
    const res = await fetch(ENDPOINT, { method: 'POST', body: params })
    const data = await res.json()
    return { ok: !!data.success, reason: data['error-codes']?.[0] }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}
