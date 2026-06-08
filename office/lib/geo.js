const PRIVATE_PREFIXES = ['10.', '192.168.', '127.', '169.254.']

function isPrivate(ip) {
  if (!ip) return true
  if (ip === '::1' || ip === 'unknown') return true
  if (PRIVATE_PREFIXES.some((p) => ip.startsWith(p))) return true
  if (ip.startsWith('172.')) {
    const second = Number(ip.split('.')[1])
    if (second >= 16 && second <= 31) return true
  }
  return false
}

export async function lookupGeo(ip) {
  if (isPrivate(ip)) return null
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'stinson-backend/1.0' },
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) return null
    return {
      country: data.country_name || '',
      countryCode: data.country_code || '',
      city: data.city || '',
      region: data.region || '',
    }
  } catch {
    return null
  }
}
