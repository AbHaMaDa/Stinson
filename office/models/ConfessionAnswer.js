import mongoose from 'mongoose'

const confessionAnswerSchema = new mongoose.Schema(
  {
    _id: { type: String },
    ip: { type: String, default: '' },
    q1: { type: String, default: null },
    q2: { type: String, default: null },
    q1At: { type: Date, default: null },
    q2At: { type: Date, default: null },
    q1NoCount: { type: Number, default: 0 },
    storyPath: { type: [String], default: [] },
    storyCompletedAt: { type: Date, default: null },
    userAgent: { type: String, default: '' },
  },
  { _id: false, timestamps: true }
)

export const ConfessionAnswer = mongoose.model('ConfessionAnswer', confessionAnswerSchema)
