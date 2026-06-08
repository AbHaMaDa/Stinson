import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Trash2, Search, Globe, Shield, Users } from 'lucide-react'
import { api } from '../lib/api'
import ConfirmModal from '../components/ConfirmModal'
import { useDocumentTitle } from '../lib/useDocumentTitle'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function flagEmoji(code) {
  if (!code || code.length !== 2) return ''
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

function formatLocation(v) {
  const parts = [v.city, v.region, v.country].filter(Boolean)
  return parts.join(', ') || 'Unknown'
}

export default function Visitors() {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({ total: 0, last24h: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useDocumentTitle('Visitors')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/visitors')
      setVisitors(data.visitors)
      setStats(data.stats)
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to load visitors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return visitors
    return visitors.filter((v) =>
      [v._id, v.country, v.city, v.region, v.userAgent, v.lastPath]
        .filter(Boolean)
        .some((s) => s.toLowerCase().includes(q))
    )
  }, [visitors, query])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await api.delete(`/visitors/${encodeURIComponent(deleteTarget._id)}`)
      setVisitors((vs) => vs.filter((v) => v._id !== deleteTarget._id))
      setStats((s) => ({ ...s, total: Math.max(0, s.total - 1) }))
      setDeleteTarget(null)
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to delete')
    } finally {
      setBusy(false)
    }
  }

  const confirmClearAll = async () => {
    setBusy(true)
    try {
      await api.delete('/visitors')
      setVisitors([])
      setStats({ total: 0, last24h: 0 })
      setClearAllOpen(false)
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to clear')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Visitors</h1>
          <p className="text-slate-300 text-sm mt-1">
            Every IP that's hit the API.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/30 text-slate-200 text-sm transition-colors duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {visitors.length > 0 && (
            <button
              onClick={() => setClearAllOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 text-sm transition-colors duration-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-400/15 border border-cyan-400/30 grid place-items-center">
            <Users className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total unique</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-400/15 border border-purple-400/30 grid place-items-center">
            <Globe className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Last 24h</p>
            <p className="text-2xl font-bold text-white">{stats.last24h}</p>
          </div>
        </div>
      </div>

      <label className="relative block mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search IP, location, path, user agent..."
          className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200"
        />
      </label>

      {error && (
        <p className="text-red-300 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Globe className="w-10 h-10 mx-auto mb-3 opacity-60" />
          {query ? 'No matches.' : 'No visitors logged yet.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((v) => (
            <li
              key={v._id}
              className="rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-mono text-white text-sm">{v._id}</span>
                    {v.countryCode && (
                      <span className="text-base" title={v.country}>
                        {flagEmoji(v.countryCode)}
                      </span>
                    )}
                    {v.isAdmin && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-400/20 text-purple-200 border border-purple-400/30">
                        <Shield className="w-3 h-3" /> admin
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                      {v.hits} hit{v.hits === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-1">{formatLocation(v)}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    First seen {timeAgo(v.firstSeen)} · Last seen {timeAgo(v.lastSeen)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1 truncate">
                    <span className="text-slate-400">{v.lastMethod}</span> {v.lastPath}
                  </p>
                  {v.userAgent && (
                    <p className="text-slate-500 text-[11px] mt-1 truncate" title={v.userAgent}>
                      {v.userAgent}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setDeleteTarget(v)}
                  className="shrink-0 p-2 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors duration-200 cursor-pointer"
                  aria-label="Delete"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this visitor record?"
        description={
          deleteTarget && (
            <p>
              Removes the log for{' '}
              <span className="font-mono text-white">{deleteTarget._id}</span>. They'll be
              re-added the next time they hit the API.
            </p>
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => !busy && setDeleteTarget(null)}
      />

      <ConfirmModal
        open={clearAllOpen}
        title="Clear all visitor records?"
        description={
          <p>
            This deletes every visitor log. New visits will start being tracked again from
            scratch.
          </p>
        }
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        destructive
        loading={busy}
        onConfirm={confirmClearAll}
        onCancel={() => !busy && setClearAllOpen(false)}
      />
    </div>
  )
}
