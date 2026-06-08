import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { connectDB } from './db.js'
import authRoutes from './routes/auth.js'
import messageRoutes from './routes/messages.js'
import pushRoutes from './routes/push.js'
import siteRoutes from './routes/site.js'
import visitorRoutes from './routes/visitors.js'
import confessionRoutes from './routes/confession.js'
import answerRoutes from './routes/answers.js'
import { visitorLogger } from './middleware/visitorLog.js'

const app = express()

app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
)
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use('/api', async (_req, res, next) => {
  try {
    await ensureDB()
    next()
  } catch (err) {
    console.error('[db] connect failed:', err.message)
    res.status(503).json({ error: 'database unavailable' })
  }
})

app.get('/', (_req, res) => {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Stinson API</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 2rem 1rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    color: #e2e8f0;
    background:
      radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168,85,247,.45), transparent 60%),
      radial-gradient(ellipse 60% 50% at 90% 20%, rgba(34,211,238,.35), transparent 60%),
      radial-gradient(ellipse 70% 50% at 10% 80%, rgba(59,130,246,.4), transparent 60%),
      linear-gradient(135deg, #0f172a 0%, #172554 50%, #0f172a 100%);
  }
  .card {
    width: 100%;
    max-width: 28rem;
    background: rgba(255,255,255,.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 1.25rem;
    padding: 2.5rem 2rem;
    box-shadow: 0 25px 50px -12px rgba(15,23,42,.6);
    text-align: center;
  }
  .icon {
    width: 56px; height: 56px; margin: 0 auto 1.25rem;
    border-radius: 1rem;
    background: rgba(34,211,238,.12);
    border: 1px solid rgba(34,211,238,.35);
    display: grid; place-items: center;
  }
  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -.02em;
    background: linear-gradient(90deg, #67e8f9, #60a5fa, #c084fc);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .sub { color: #94a3b8; margin-top: .5rem; font-size: .95rem; }
  .pill {
    display: inline-flex; align-items: center; gap: .4rem;
    margin-top: 1.25rem;
    padding: .35rem .8rem;
    border-radius: 999px;
    background: rgba(34,197,94,.12);
    border: 1px solid rgba(34,197,94,.4);
    color: #86efac;
    font-size: .8rem; font-weight: 600;
  }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80; }
  .actions {
    display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem;
    margin-top: 1.75rem;
  }
  .btn {
    display: inline-flex; align-items: center; gap: .5rem;
    padding: .7rem 1.1rem;
    border-radius: .6rem;
    font-weight: 600; font-size: .9rem;
    text-decoration: none;
    transition: all .2s;
  }
  .btn-primary {
    background: #9333ea; color: white;
    box-shadow: 0 10px 25px -5px rgba(168,85,247,.4);
  }
  .btn-primary:hover { background: #7e22ce; box-shadow: 0 10px 25px -5px rgba(168,85,247,.6); }
  .btn-ghost {
    background: rgba(34,211,238,.1); color: #cffafe;
    border: 1px solid rgba(34,211,238,.4);
  }
  .btn-ghost:hover { background: rgba(34,211,238,.2); }
  .note {
    margin-top: 1.75rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255,255,255,.08);
    font-size: .8rem;
    color: #64748b;
    line-height: 1.5;
  }
  code {
    font-family: "SF Mono", ui-monospace, Menlo, monospace;
    font-size: .78rem;
    background: rgba(255,255,255,.06);
    padding: .1rem .4rem;
    border-radius: .25rem;
    color: #cbd5e1;
  }
</style>
</head>
<body>
  <main class="card">
    <div class="icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>
        <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
      </svg>
    </div>
    <h1>Stinson API</h1>
    <p class="sub">Backend for the Stinson contact app.</p>
    <div class="pill"><span class="dot"></span> Running</div>
    <div class="actions">
      <a class="btn btn-primary" href="${clientOrigin}">Open Stinson →</a>
      <a class="btn btn-ghost" href="/api/health">Health check</a>
    </div>
    <p class="note">
      Visitors should go to <code>${clientOrigin}</code>. This page is the API root —
      endpoints live under <code>/api/*</code>.
    </p>
  </main>
</body>
</html>`)
})

app.use('/api', visitorLogger)

app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/push', pushRoutes)
app.use('/api/site', siteRoutes)
app.use('/api/visitors', visitorRoutes)
app.use('/api/confession', confessionRoutes)
app.use('/api/answers', answerRoutes)

app.use((err, _req, res, _next) => {
  console.error('[error]', err)
  res.status(500).json({ error: 'server error' })
})

let dbPromise = null
export function ensureDB() {
  const state = mongoose.connection.readyState
  if (state === 1) return Promise.resolve()
  if (state === 2 && dbPromise) return dbPromise
  dbPromise = connectDB(process.env.MONGODB_URI).catch((err) => {
    dbPromise = null
    throw err
  })
  return dbPromise
}

mongoose.connection.on('disconnected', () => {
  dbPromise = null
})

export default app
