import { useCallback, useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../lib/api'
import SuccessModal from './SuccessModal'
import Turnstile, { isTurnstileEnabled } from './Turnstile'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [website, setWebsite] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const captchaRequired = isTurnstileEnabled()
  const handleToken = useCallback((t) => setCaptchaToken(t), [])

  const submit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    if (captchaRequired && !captchaToken) {
      setError('please complete the captcha')
      return
    }
    setSending(true)
    setError('')
    try {
      await api.post('/messages', {
        name: name.trim(),
        content: content.trim(),
        website,
        captchaToken,
      })
      setName('')
      setContent('')
      setWebsite('')
      setCaptchaToken('')
      setShowSuccess(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to send')
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white tracking-tight">Send me a message</h2>
        <p className="text-slate-300 mt-2">
          Anything on your mind — feedback, hi, or a random thought.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl shadow-blue-950/40 max-w-2xl mx-auto"
      >
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] w-px h-px overflow-hidden"
        >
          <label>
            Website (leave blank)
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>

        <label className="block mb-4">
          <span className="block text-sm text-slate-300 mb-2">Your name (optional)</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Anonymous"
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200"
          />
        </label>

        <label className="block mb-5">
          <span className="block text-sm text-slate-300 mb-2">Message</span>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            maxLength={4000}
            placeholder="Write something nice..."
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200 resize-y"
          />
        </label>

        <Turnstile onToken={handleToken} />

        {error && (
          <p className="text-red-300 text-sm mb-3" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending || !content.trim() || (captchaRequired && !captchaToken)}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 cursor-pointer"
        >
          {sending ? (
            'Sending...'
          ) : (
            <>
              <Send className="w-5 h-5" /> Send message
            </>
          )}
        </button>
      </form>

      <SuccessModal
        open={showSuccess}
        title="Message sent!"
        description="Thanks for reaching out — I'll read every word soon."
        buttonLabel="You're welcome"
        onClose={() => setShowSuccess(false)}
      />
    </section>
  )
}
