import mongoose from 'mongoose'

const visitorSchema = new mongoose.Schema(
  {
    _id: { type: String },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    hits: { type: Number, default: 0 },
    userAgent: { type: String, default: '' },
    lastPath: { type: String, default: '' },
    lastMethod: { type: String, default: '' },
    lastReferer: { type: String, default: '' },
    country: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    city: { type: String, default: '' },
    region: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
  },
  { _id: false, timestamps: false }
)

export const Visitor = mongoose.model('Visitor', visitorSchema)
