import { useEffect, useRef } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function SuccessModal({
  open,
  title = 'Done!',
  description,
  buttonLabel = 'OK',
  autoCloseMs = 0,
  onClose,
}) {
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    buttonRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = autoCloseMs > 0 ? setTimeout(() => onClose?.(), autoCloseMs) : null
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      if (t) clearTimeout(t)
    }
  }, [open, autoCloseMs, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-slate-950/90 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/20 p-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-cyan-300" />
        </div>

        <h2
          id="success-title"
          className="mt-4 text-xl font-semibold text-white tracking-tight"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">{description}</p>
        )}

        <button
          ref={buttonRef}
          onClick={onClose}
          className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 cursor-pointer"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}
