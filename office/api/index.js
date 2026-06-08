import app, { ensureDB } from '../app.js'

ensureDB().catch((e) => console.error('[db] connect failed:', e.message))

export default function handler(req, res) {
  return app(req, res)
}
