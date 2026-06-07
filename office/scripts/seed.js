import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB } from '../db.js'
import { Admin } from '../models/Admin.js'
import mongoose from 'mongoose'

const email = process.env.ADMIN_EMAIL?.toLowerCase().trim()
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
  console.error('[seed] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env')
  process.exit(1)
}

try {
  await connectDB(process.env.MONGODB_URI)
  const passwordHash = await bcrypt.hash(password, 10)
  const result = await Admin.findOneAndUpdate(
    { email },
    { email, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
  console.log(`[seed] admin upserted: ${result.email} (id=${result._id})`)
} catch (err) {
  console.error('[seed] failed:', err)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
