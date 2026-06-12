import { Router } from 'express'
import { Visitor } from '../models/Visitor.js'
import { Device } from '../models/Device.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 1000)
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [visitors, total, last24h, devices] = await Promise.all([
    Visitor.find().sort({ lastSeen: -1 }).limit(limit).lean(),
    Visitor.countDocuments(),
    Visitor.countDocuments({ lastSeen: { $gte: dayAgo } }),
    Device.find().sort({ lastSeen: -1 }).lean(),
  ])
  const devicesByIp = devices.reduce((acc, d) => {
    if (!d.ip) return acc
    if (!acc[d.ip]) acc[d.ip] = []
    acc[d.ip].push(d)
    return acc
  }, {})
  const withDevices = visitors.map((v) => ({
    ...v,
    devices: devicesByIp[v._id] || [],
  }))
  res.json({ visitors: withDevices, stats: { total, last24h } })
})

router.delete('/:ip', requireAuth, async (req, res) => {
  const deleted = await Visitor.findByIdAndDelete(req.params.ip)
  if (!deleted) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true })
})

router.delete('/', requireAuth, async (_req, res) => {
  const r = await Visitor.deleteMany({})
  res.json({ ok: true, deleted: r.deletedCount })
})

export default router
