import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { api } from '../lib/api'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function Login({ onLogin }) {
  useDocumentTitle('Login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/inbox'

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/login', { email, password })
      onLogin?.()
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-24">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl shadow-blue-950/40">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-cyan-400/10 rounded-2xl p-4 border border-cyan-400/30">
            <Lock className="w-8 h-8 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-semibold text-white mt-4">Admin login</h1>
          <p className="text-slate-300 text-sm mt-1">Only the owner can read messages.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="block text-sm text-slate-300 mb-2">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
              className="w-full rounded-lg bg-white/5 border border-white/15 text-white px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-slate-300 mb-2">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-white/5 border border-white/15 text-white px-4 py-3 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200"
            />
          </label>

          {error && (
            <p className="text-red-300 text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
