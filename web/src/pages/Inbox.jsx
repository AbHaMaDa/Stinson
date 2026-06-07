import { useEffect, useMemo, useState } from 'react'
import {
  Trash2,
  MailOpen,
  Mail,
  RefreshCw,
  LogOut,
  Search,
  Bell,
  BellOff,
  CheckSquare,
  Square,
} from 'lucide-react'
import { api } from '../lib/api'
import ConfirmModal from '../components/ConfirmModal'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import {
  getSubscriptionState,
  subscribeToPush,
  unsubscribeFromPush,
} from '../lib/push'

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString()
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
]

export default function Inbox({ onLogout }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(() => new Set())
  const [bulkConfirm, setBulkConfirm] = useState(false)
  const [bulkBusy, setBulkBusy] = useState(false)
  const [push, setPush] = useState({ supported: false, permission: 'default', subscribed: false })
  const [pushBusy, setPushBusy] = useState(false)

  const unread = useMemo(() => messages.filter((m) => !m.read).length, [messages])
  const visibleIds = useMemo(() => messages.map((m) => m._id), [messages])
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  useDocumentTitle(unread ? `Inbox (${unread})` : 'Inbox')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/messages', {
        params: { q: query.trim() || undefined, filter: filter === 'all' ? undefined : filter },
      })
      setMessages(data.messages)
      setSelected((prev) => {
        const ids = new Set(data.messages.map((m) => m._id))
        const next = new Set()
        for (const id of prev) if (ids.has(id)) next.add(id)
        return next
      })
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [query, filter])

  useEffect(() => {
    getSubscriptionState().then(setPush).catch(() => {})
  }, [])

  const togglePush = async () => {
    setError('')
    setPushBusy(true)
    try {
      if (push.subscribed) {
        await unsubscribeFromPush()
      } else {
        await subscribeToPush()
      }
      setPush(await getSubscriptionState())
    } catch (err) {
      setError(err.message || 'failed to toggle notifications')
    } finally {
      setPushBusy(false)
    }
  }

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(visibleIds))
  }

  const bulkMarkRead = async () => {
    if (!selected.size) return
    setBulkBusy(true)
    try {
      const ids = [...selected]
      await api.post('/messages/bulk', { action: 'mark-read', ids })
      setMessages((m) => m.map((x) => (selected.has(x._id) ? { ...x, read: true } : x)))
      setSelected(new Set())
    } catch (err) {
      setError(err?.response?.data?.error || 'bulk action failed')
    } finally {
      setBulkBusy(false)
    }
  }

  const bulkDelete = async () => {
    if (!selected.size) return
    setBulkBusy(true)
    try {
      const ids = [...selected]
      await api.post('/messages/bulk', { action: 'delete', ids })
      setMessages((m) => m.filter((x) => !selected.has(x._id)))
      setSelected(new Set())
      setBulkConfirm(false)
    } catch (err) {
      setError(err?.response?.data?.error || 'bulk delete failed')
    } finally {
      setBulkBusy(false)
    }
  }

  const markRead = async (id) => {
    await api.patch(`/messages/${id}/read`)
    setMessages((m) => m.map((x) => (x._id === id ? { ...x, read: true } : x)))
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.delete(`/messages/${deleteTarget._id}`)
      setMessages((m) => m.filter((x) => x._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const logout = async () => {
    await api.post('/auth/logout')
    onLogout?.()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inbox</h1>
          <p className="text-slate-300 text-sm mt-1">
            {messages.length} shown · {unread} unread
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {push.supported && (
            <button
              onClick={togglePush}
              disabled={pushBusy}
              title={push.subscribed ? 'Disable browser notifications' : 'Enable browser notifications'}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm transition-colors duration-200 cursor-pointer disabled:opacity-50 ${
                push.subscribed
                  ? 'bg-cyan-400/15 border-cyan-400/30 text-cyan-100 hover:bg-cyan-400/25'
                  : 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
              }`}
            >
              {push.subscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {push.subscribed ? 'Notifications on' : 'Enable alerts'}
            </button>
          )}
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/30 text-slate-200 text-sm transition-colors duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm transition-colors duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or content..."
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 pl-10 pr-3 py-2.5 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200"
          />
        </label>
        <div className="inline-flex rounded-lg bg-white/5 border border-white/15 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 cursor-pointer ${
                filter === f.value
                  ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {messages.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 px-1">
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors duration-200 cursor-pointer"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-cyan-300" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
          {selected.size > 0 && (
            <>
              <span className="text-xs text-slate-400">{selected.size} selected</span>
              <button
                onClick={bulkMarkRead}
                disabled={bulkBusy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 text-cyan-100 text-xs transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                <MailOpen className="w-3.5 h-3.5" /> Mark read
              </button>
              <button
                onClick={() => setBulkConfirm(true)}
                disabled={bulkBusy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-200 text-xs transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-300 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-60" />
          {query || filter !== 'all' ? 'No matches.' : 'No messages yet.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const isSelected = selected.has(m._id)
            return (
              <li
                key={m._id}
                className={`rounded-xl border p-5 transition-colors duration-200 ${
                  isSelected
                    ? 'bg-cyan-400/10 border-cyan-400/50 ring-1 ring-cyan-400/30'
                    : m.read
                    ? 'bg-white/5 border-white/10'
                    : 'bg-cyan-400/5 border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleOne(m._id)}
                    className="mt-0.5 shrink-0 p-1 cursor-pointer"
                    aria-label={isSelected ? 'Deselect' : 'Select'}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-cyan-300" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400 hover:text-slate-200" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">
                        {m.name || 'Anonymous'}
                      </span>
                      {!m.read && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                          new
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">{formatDate(m.createdAt)}</p>
                    <p className="text-slate-200 mt-3 whitespace-pre-wrap break-words leading-relaxed">
                      {m.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!m.read && (
                      <button
                        onClick={() => markRead(m._id)}
                        className="p-2.5 rounded-lg hover:bg-cyan-400/15 text-cyan-300 transition-colors duration-200 cursor-pointer"
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <MailOpen className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(m)}
                      className="p-2.5 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors duration-200 cursor-pointer"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this message?"
        description={
          deleteTarget && (
            <div className="space-y-2">
              <p>This will permanently delete the message. This action can't be undone.</p>
              <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-200">
                <p className="text-xs text-slate-400 mb-1">
                  From {deleteTarget.name || 'Anonymous'}
                </p>
                <p className="text-sm line-clamp-3 whitespace-pre-wrap break-words">
                  {deleteTarget.content}
                </p>
              </div>
            </div>
          )
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
      />

      <ConfirmModal
        open={bulkConfirm}
        title={`Delete ${selected.size} message${selected.size === 1 ? '' : 's'}?`}
        description={
          <p>This will permanently delete the selected messages. This action can't be undone.</p>
        }
        confirmLabel="Delete all"
        cancelLabel="Cancel"
        destructive
        loading={bulkBusy}
        onConfirm={bulkDelete}
        onCancel={() => !bulkBusy && setBulkConfirm(false)}
      />
    </div>
  )
}
