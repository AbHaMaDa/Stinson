import mongoose from 'mongoose'

const SETTINGS_ID = 'site'

const siteSettingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: SETTINGS_ID },
    avatar: {
      data: Buffer,
      contentType: String,
      updatedAt: Date,
    },
    confession: {
      mode: {
        type: String,
        enum: ['hidden', 'public', 'allowlist'],
        default: 'hidden',
      },
      allowedIps: { type: [String], default: [] },
    },
  },
  { _id: false, timestamps: true }
)

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema)
export const SITE_SETTINGS_ID = SETTINGS_ID
