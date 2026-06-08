import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MessageSquare,
  Clock,
  ArrowUpDown,
  RefreshCw,
  CheckCircle2,
  Hourglass,
  EyeOff,
} from 'lucide-react'
import { api } from '../lib/api'
import { useDocumentTitle } from '../lib/useDocumentTitle'

const TABS = [
  { value: 'all', label: 'All answers' },
  { value: 'mine', label: 'My questions' },
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}

function PublicCard({ item }) {
  return (
    <li className="rounded-xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-white font-medium truncate">
          {item.name || 'Anonymous'}
        </span>
        <span className="text-slate-500 text-xs">·</span>
        <span className="text-slate-400 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(item.createdAt)}
        </span>
      </div>
      <p className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
        {item.content}
      </p>
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-xs font-medium text-cyan-200">Reply</span>
          {item.answeredAt && (
            <span className="text-[11px] text-slate-500 ml-auto">
              {formatDate(item.answeredAt)}
            </span>
          )}
        </div>
        <p className="text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
          {item.answer}
        </p>
      </div>
    </li>
  )
}

function MineCard({ item }) {
  const answered = !!item.answer
  const hidden = answered && !item.published
  return (
    <li className="rounded-xl bg-white/5 border border-white/10 p-5">
      <div className="flex items-center flex-wrap gap-2 mb-2">
        <span className="text-slate-400 text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(item.createdAt)}
        </span>
        {answered ? (
          hidden ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-400/15 text-slate-300 border border-slate-400/30">
              <EyeOff className="w-3 h-3" /> private reply
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-400/15 text-green-200 border border-green-400/30">
              <CheckCircle2 className="w-3 h-3" /> answered
            </span>
          )
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-200 border border-amber-400/30">
            <Hourglass className="w-3 h-3" /> waiting
          </span>
        )}
      </div>
      <p className="text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
        {item.content}
      </p>
      {answered && item.published && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-xs font-medium text-cyan-200">Reply</span>
            {item.answeredAt && (
              <span className="text-[11px] text-slate-500 ml-auto">
                {formatDate(item.answeredAt)}
              </span>
            )}
          </div>
          <p className="text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
            {item.answer}
          </p>
        </div>
      )}
    </li>
  )
}

export default function Answers() {
  const [tab, setTab] = useState('all')
  const [sort, setSort] = useState('newest')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useDocumentTitle('Answers')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const path = tab === 'mine' ? '/answers/mine' : '/answers'
      const { data } = await api.get(path, { params: { sort } })
      setItems(data.items || [])
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [tab, sort])

  return (
    <div className="max-w-3xl mx-auto px-4 pt-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Answers</h1>
          <p className="text-slate-300 text-sm mt-1">
            Public replies. Filter to your own questions with the tab below.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white/5 hover:bg-cyan-400/15 border border-white/10 hover:border-cyan-400/30 text-slate-200 text-sm transition-colors duration-200 cursor-pointer self-start"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="inline-flex rounded-lg bg-white/5 border border-white/15 p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 cursor-pointer ${
                tab === t.value
                  ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-400/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-sm transition-colors duration-200 cursor-pointer"
          title="Toggle sort"
        >
          <ArrowUpDown className="w-4 h-4" /> {sort === 'newest' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

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
              className="h-32 rounded-xl bg-white/5 border border-white/10 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-60" />
          {tab === 'mine' ? (
            <>
              <p>You haven't asked anything yet.</p>
              <Link
                to="/contact"
                className="inline-block mt-3 text-cyan-300 hover:text-cyan-200 text-sm font-medium"
              >
                Ask a question →
              </Link>
            </>
          ) : (
            <p>No answers yet.</p>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((it) =>
            tab === 'mine' ? (
              <MineCard key={it._id} item={it} />
            ) : (
              <PublicCard key={it._id} item={it} />
            )
          )}
        </ul>
      )}
    </div>
  )
}
