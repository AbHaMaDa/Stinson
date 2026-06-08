import { Router } from 'express'
import { Message } from '../models/Message.js'

const router = Router()

const PUBLIC_FIELDS = 'name content answer answeredAt createdAt published'

function parseSort(s) {
  return s === 'oldest' ? 1 : -1
}

router.get('/', async (req, res) => {
  const sort = parseSort(req.query.sort)
  const limit = Math.min(Number(req.query.limit) || 100, 500)
  const items = await Message.find({
    answer: { $ne: '' },
    published: true,
  })
    .select(PUBLIC_FIELDS)
    .sort({ answeredAt: sort })
    .limit(limit)
    .lean()
  res.json({ items })
})

router.get('/mine', async (req, res) => {
  const ip = req.ip || ''
  if (!ip) return res.json({ items: [] })
  const sort = parseSort(req.query.sort)
  const limit = Math.min(Number(req.query.limit) || 100, 500)
  const items = await Message.find({ ip })
    .select(PUBLIC_FIELDS)
    .sort({ createdAt: sort })
    .limit(limit)
    .lean()
  res.json({ items })
})

export default router
