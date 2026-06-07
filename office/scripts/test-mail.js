import 'dotenv/config'
import { sendAlert } from '../lib/mailer.js'

const result = await sendAlert(
  '[Stinson] Test alert',
  `This is a test from your Stinson backend.\n\nIf you got this, your SMTP setup is working.\n\nSent at: ${new Date().toISOString()}`
)

if (result.sent) {
  console.log('✓ Test email sent. Check', process.env.ALERT_EMAIL)
} else {
  console.error('✗ Could not send:', result.reason)
  process.exit(1)
}
