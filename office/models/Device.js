import mongoose from 'mongoose'

const deviceSchema = new mongoose.Schema(
  {
    _id: { type: String },
    ip: { type: String, default: '' },
    fingerprint: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    hits: { type: Number, default: 0 },
    lastPath: { type: String, default: '' },
  },
  { _id: false, timestamps: false }
)

deviceSchema.index({ ip: 1, lastSeen: -1 })

export const Device = mongoose.model('Device', deviceSchema)
