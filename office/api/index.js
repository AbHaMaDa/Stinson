import app, { ensureDB } from '../app.js'

export default async function handler(req, res) {
  await ensureDB()
  return app(req, res)
}
