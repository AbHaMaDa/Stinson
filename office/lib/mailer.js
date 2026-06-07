import nodemailer from 'nodemailer'

const isEnabled = () =>
  !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.ALERT_EMAIL
  )

let transporter = null

function getTransporter() {
  if (!isEnabled()) return null
  if (transporter) return transporter
  const port = Number(process.env.SMTP_PORT) || 587
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  return transporter
}

export async function sendAlert(subject, body) {
  const t = getTransporter()
  if (!t) {
    console.warn('[mailer] alerts disabled — SMTP_* env vars are not all set')
    return { sent: false, reason: 'disabled' }
  }
  try {
    const info = await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL,
      subject,
      text: body,
    })
    console.log(`[mailer] alert sent (${info.messageId}): ${subject}`)
    return { sent: true, messageId: info.messageId }
  } catch (err) {
    console.error('[mailer] failed to send alert:', err.message)
    return { sent: false, reason: err.message }
  }
}
