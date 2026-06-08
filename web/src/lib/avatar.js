import { api } from './api'

export function avatarUrl(version) {
  const base = api.defaults.baseURL || '/api'
  const q = version ? `?v=${encodeURIComponent(version)}` : ''
  return `${base}/site/avatar${q}`
}

export function resizeToDataUrl(file, { maxSize = 400, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('failed to read file'))
    reader.onload = () => {
      img.onerror = () => reject(new Error('failed to decode image'))
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export async function uploadAvatar(file) {
  const dataUrl = await resizeToDataUrl(file)
  const { data } = await api.post('/site/avatar', { dataUrl })
  return data
}
