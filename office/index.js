import 'dotenv/config'
import app, { ensureDB } from './app.js'

const PORT = process.env.PORT || 4000

ensureDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[api] listening on http://localhost:${PORT}`))
  })
  .catch((e) => {
    console.error('[db] failed to connect', e)
    process.exit(1)
  })
