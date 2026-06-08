import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80, default: '' },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    read: { type: Boolean, default: false },
    ip: { type: String, default: '' },
    answer: { type: String, trim: true, maxlength: 4000, default: '' },
    answeredAt: { type: Date, default: null },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)

messageSchema.index({ ip: 1, createdAt: -1 })
messageSchema.index({ answer: 1, published: 1, answeredAt: -1 })

export const Message = mongoose.model('Message', messageSchema)
