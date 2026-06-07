import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { connectDB } from '../db.js'
import { Message } from '../models/Message.js'
import mongoose from 'mongoose'

const BACKUP_DIR = path.resolve('backups')

async function main() {
  await connectDB(process.env.MONGODB_URI)
  await fs.mkdir(BACKUP_DIR, { recursive: true })

  const messages = await Message.find().sort({ createdAt: 1 }).lean()
  const stamp = new Date().toISOString().slice(0, 10)
  const file = path.join(BACKUP_DIR, `messages-${stamp}.json`)

  await fs.writeFile(file, JSON.stringify({ exportedAt: new Date().toISOString(), count: messages.length, messages }, null, 2))

  console.log(`✓ Backed up ${messages.length} messages → ${file}`)
  await mongoose.connection.close()
}

main().catch((err) => {
  console.error('✗ Backup failed:', err.message)
  process.exit(1)
})
