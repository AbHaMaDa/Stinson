import { waitUntil } from '@vercel/functions'

export function runInBackground(promise, label = 'task') {
  const safe = promise.catch((err) =>
    console.warn(`[bg:${label}] failed:`, err?.message || err)
  )
  try {
    waitUntil(safe)
  } catch {
    // not on Vercel — express keeps running, the promise completes on its own
  }
}
