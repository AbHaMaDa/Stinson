import { useEffect, useMemo, useState } from 'react'
import {
  RefreshCw,
  Trash2,
  Search,
  Globe,
  Shield,
  Users,
  Eye,
  EyeOff,
  Lock,
  Check,
  X,
  Ban,
  BarChart3,
  Smartphone,
  ChevronDown,
} from 'lucide-react'
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

function answerPillClass(v) {
  if (v === 'yes') return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
  if (v === 'no') return 'bg-rose-500/15 border-rose-500/30 text-rose-200'
  return 'bg-white/5 border-white/10 text-slate-500'
}

function shortCid(cid) {
  return cid ? cid.slice(0, 8) : ''
}

const STORY_STEP_META = {
  A: { label: 'A', cls: 'bg-pink-500/15 border-pink-500/30 text-pink-200', title: 'Picked A' },
  B: { label: 'B', cls: 'bg-purple-500/15 border-purple-500/30 text-purple-200', title: 'Picked B' },
  C: { label: 'C', cls: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200', title: 'Picked C' },
  gate: { label: '✦ gate', cls: 'bg-amber-500/15 border-amber-500/30 text-amber-200', title: 'Passed through the gate' },
  done: { label: '✓ done', cls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200', title: 'Finished the reveal' },
}

function describePath(path) {
  if (!path || path.length === 0) return 'never started the story'
  const choices = path.filter((s) => s === 'A' || s === 'B' || s === 'C')
  if (path.includes('done')) return `finished story (${choices.join('')})`
  if (path.includes('gate')) return `reached the reveal (${choices.join('')})`
  return `stopped at step ${choices.length} (${choices.join('')})`
}

const CONFESSION_MODES = [
  { value: 'hidden', label: 'Hidden', icon: EyeOff, hint: 'No one sees the tab.' },
  { value: 'public', label: 'Public', icon: Eye, hint: 'Everyone sees the tab.' },
  { value: 'allowlist', label: 'Allowlist', icon: Lock, hint: 'Only checked IPs see it.' },
]

export default function Visitors() {
  const [visitors, setVisitors] = useState([])
  const [stats, setStats] = useState({ total: 0, last24h: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confession, setConfession] = useState({
    mode: 'hidden',
    allowedIps: [],
    name: '',
    question: '',
    yesReveal: '',
    finalYes: '',
    finalNo: '',
  })
  const [savingConfession, setSavingConfession] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [questionDraft, setQuestionDraft] = useState('')
  const [revealDraft, setRevealDraft] = useState('')
  const [finalYesDraft, setFinalYesDraft] = useState('')
  const [finalNoDraft, setFinalNoDraft] = useState('')
  const [blockedIps, setBlockedIps] = useState([])
  const [savingBlocked, setSavingBlocked] = useState(false)
  const [yourIp, setYourIp] = useState('')
  const [confessionAnswers, setConfessionAnswers] = useState([])
  const [confessionTally, setConfessionTally] = useState({
    q1: { yes: 0, no: 0 },
    q2: { yes: 0, no: 0 },
  })
  const [answersOpen, setAnswersOpen] = useState(false)
  const [expandedIps, setExpandedIps] = useState(() => new Set())

  useDocumentTitle('Visitors')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [vRes, cRes, bRes, aRes] = await Promise.all([
        api.get('/visitors'),
        api.get('/confession/settings'),
        api.get('/site/blocked-ips'),
        api.get('/confession/answers'),
      ])
      setVisitors(vRes.data.visitors)
      setStats(vRes.data.stats)
      const conf = {
        mode: cRes.data.mode || 'hidden',
        allowedIps: cRes.data.allowedIps || [],
        name: cRes.data.name || '',
        question: cRes.data.question || '',
        yesReveal: cRes.data.yesReveal || '',
        finalYes: cRes.data.finalYes || '',
        finalNo: cRes.data.finalNo || '',
      }
      setConfession(conf)
      setNameDraft(conf.name)
      setQuestionDraft(conf.question)
      setRevealDraft(conf.yesReveal)
      setFinalYesDraft(conf.finalYes)
      setFinalNoDraft(conf.finalNo)
      setBlockedIps(bRes.data.blockedIps || [])
      setYourIp(bRes.data.yourIp || '')
      setConfessionAnswers(aRes.data.items || [])
      setConfessionTally(
        aRes.data.tally || { q1: { yes: 0, no: 0 }, q2: { yes: 0, no: 0 } }
      )
    } catch (err) {
      setError(err?.response?.data?.error || 'failed to load visitors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const allowedSet = useMemo(() => new Set(confession.allowedIps), [confession.allowedIps])
  const blockedSet = useMemo(() => new Set(blockedIps), [blockedIps])

  const saveConfession = async (patch) => {
    const prev = confession
    const next = { ...confession, ...patch }
    setConfession(next)
    setSavingConfession(true)
    try {
      const { data } = await api.put('/confession/settings', patch)
      setConfession({
        mode: data.mode || 'hidden',
        allowedIps: data.allowedIps || [],
        name: data.name || '',
        question: data.question || '',
        yesReveal: data.yesReveal || '',
        finalYes: data.finalYes || '',
        finalNo: data.finalNo || '',
      })
    } catch (err) {
      setConfession(prev)
      setError(err?.response?.data?.error || 'failed to save confession settings')
    } finally {
      setSavingConfession(false)
    }
  }

  const saveName = () => {
    const trimmed = nameDraft.trim()
    if (trimmed !== confession.name) {
      saveConfession({ name: trimmed })
    }
  }
  const saveQuestion = () => {
    if (questionDraft !== confession.question) {
      saveConfession({ question: questionDraft })
    }
  }
  const saveReveal = () => {
    if (revealDraft !== confession.yesReveal) {
      saveConfession({ yesReveal: revealDraft })
    }
  }
  const saveFinalYes = () => {
    if (finalYesDraft !== confession.finalYes) {
      saveConfession({ finalYes: finalYesDraft })
    }
  }
  const saveFinalNo = () => {
    if (finalNoDraft !== confession.finalNo) {
      saveConfession({ finalNo: finalNoDraft })
    }
  }

  const toggleAllowed = (ip) => {
    const next = allowedSet.has(ip)
      ? confession.allowedIps.filter((x) => x !== ip)
      : [...confession.allowedIps, ip]
    saveConfession({ allowedIps: next })
  }

  const saveBlocked = async (next) => {
    const prev = blockedIps
    setBlockedIps(next)
    setSavingBlocked(true)
    try {
      const { data } = await api.put('/site/blocked-ips', { blockedIps: next })
      setBlockedIps(data.blockedIps || [])
      if (data.yourIp) setYourIp(data.yourIp)
    } catch (err) {
      setBlockedIps(prev)
      setError(err?.response?.data?.error || 'failed to save blocked IPs')
    } finally {
      setSavingBlocked(false)
    }
  }

  const toggleBlocked = (ip) => {
    const next = blockedSet.has(ip)
      ? blockedIps.filter((x) => x !== ip)
      : [...blockedIps, ip]
    saveBlocked(next)
  }

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

      <div className="grid grid-cols-2 gap-3 mb-4">
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

      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Confession</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Question, reveal, and who can see the tab.
            </p>
          </div>
          {savingConfession && (
            <span className="text-xs text-slate-400">Saving...</span>
          )}
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Name
          </label>
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={saveName}
            maxLength={80}
            placeholder="Sarah"
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Replaces <code className="px-1 rounded bg-white/5 text-slate-300">{'{name}'}</code> in the question / reveal.
          </p>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Question
          </label>
          <textarea
            dir="auto"
            value={questionDraft}
            onChange={(e) => setQuestionDraft(e.target.value)}
            onBlur={saveQuestion}
            maxLength={300}
            rows={2}
            placeholder="Hey {name}, do you like me?"
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200 resize-y"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Yes reveal
          </label>
          <textarea
            dir="auto"
            value={revealDraft}
            onChange={(e) => setRevealDraft(e.target.value)}
            onBlur={saveReveal}
            maxLength={1000}
            rows={2}
            placeholder="I knew it. ❤️"
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200 resize-y"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Shown after Yes is clicked.
          </p>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Final yes message
          </label>
          <textarea
            dir="auto"
            value={finalYesDraft}
            onChange={(e) => setFinalYesDraft(e.target.value)}
            onBlur={saveFinalYes}
            maxLength={500}
            rows={2}
            placeholder="aaaawesooome!, now u just let me know"
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200 resize-y"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Shown after the final Yes.
          </p>
        </div>

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Final no message
          </label>
          <textarea
            dir="auto"
            value={finalNoDraft}
            onChange={(e) => setFinalNoDraft(e.target.value)}
            onBlur={saveFinalNo}
            maxLength={500}
            rows={2}
            placeholder="yeaah who cares, now u just let me know"
            className="w-full rounded-lg bg-white/5 border border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-colors duration-200 resize-y"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Shown after the final No.
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400 font-medium mb-2">Who can see the tab</p>
          <div className="grid grid-cols-3 gap-2">
          {CONFESSION_MODES.map((m) => {
            const Icon = m.icon
            const active = confession.mode === m.value
            return (
              <button
                key={m.value}
                onClick={() => saveConfession({ mode: m.value })}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border text-xs font-medium transition-colors duration-200 cursor-pointer ${
                  active
                    ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-100'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
                title={m.hint}
              >
                <Icon className="w-4 h-4" />
                {m.label}
              </button>
            )
          })}
        </div>
          {confession.mode === 'allowlist' && (
            <div className="mt-3">
              <p className="text-xs text-slate-400">
                Tick the lock next to a visitor below to let them see the tab.{' '}
                {confession.allowedIps.length} allowed.
              </p>
              {confession.allowedIps.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {confession.allowedIps.map((ip) => (
                    <span
                      key={ip}
                      className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md bg-cyan-400/15 border border-cyan-400/30 text-cyan-100 text-xs font-mono"
                    >
                      {ip}
                      <button
                        onClick={() => toggleAllowed(ip)}
                        disabled={savingConfession}
                        className="p-0.5 rounded hover:bg-cyan-400/20 text-cyan-200 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                        aria-label={`Revoke ${ip}`}
                        title="Revoke"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-pink-300" /> Confession answers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {confessionAnswers.length}{' '}
              {confessionAnswers.length === 1 ? 'visitor has' : 'visitors have'} responded.
            </p>
          </div>
          {confessionAnswers.length > 0 && (
            <button
              onClick={() => setAnswersOpen((o) => !o)}
              className="text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 transition-colors duration-200 cursor-pointer"
            >
              {answersOpen ? 'Hide list' : 'Show list'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
              Q1 — main
            </p>
            <div className="flex gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-200">
                <Check className="w-3 h-3" /> {confessionTally.q1.yes}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-200">
                <X className="w-3 h-3" /> {confessionTally.q1.no}
              </span>
            </div>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
              Q2 — reveal
            </p>
            <div className="flex gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-200">
                <Check className="w-3 h-3" /> {confessionTally.q2.yes}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-200">
                <X className="w-3 h-3" /> {confessionTally.q2.no}
              </span>
            </div>
          </div>
        </div>
        {answersOpen && confessionAnswers.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {confessionAnswers.map((a) => (
              <div
                key={a._id}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex flex-col">
                    <span className="font-mono text-slate-200 truncate" title={a._id}>
                      {a.ip || '—'}
                    </span>
                    <span
                      className="font-mono text-[10px] text-slate-500 inline-flex items-center gap-1"
                      title={`device ${a._id}`}
                    >
                      <Smartphone className="w-2.5 h-2.5" /> {shortCid(a._id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className={`px-1.5 py-0.5 rounded border ${answerPillClass(a.q1)}`}>
                      Q1: {a.q1 || '—'}
                    </span>
                    {a.q1NoCount > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded border bg-amber-500/15 border-amber-500/30 text-amber-200"
                        title={`Clicked No ${a.q1NoCount} time${a.q1NoCount === 1 ? '' : 's'} before giving up`}
                      >
                        {a.q1NoCount}× nope
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded border ${answerPillClass(a.q2)}`}>
                      Q2: {a.q2 || '—'}
                    </span>
                    <span className="text-slate-500">{timeAgo(a.updatedAt)}</span>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 flex-wrap text-[10px]"
                  title={describePath(a.storyPath)}
                >
                  <span className="text-slate-500 uppercase tracking-wider mr-1">story</span>
                  {(!a.storyPath || a.storyPath.length === 0) ? (
                    <span className="text-slate-500 italic">not started</span>
                  ) : (
                    a.storyPath.map((s, i) => {
                      const meta = STORY_STEP_META[s] || {
                        label: s,
                        cls: 'bg-white/5 border-white/10 text-slate-400',
                        title: s,
                      }
                      return (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 rounded border ${meta.cls}`}
                          title={meta.title}
                        >
                          {meta.label}
                        </span>
                      )
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-red-300" /> Blocked IPs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              These IPs get a 403 on every API request. {blockedIps.length} blocked.
            </p>
          </div>
          {savingBlocked && <span className="text-xs text-slate-400">Saving...</span>}
        </div>
        {blockedIps.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {blockedIps.map((ip) => (
              <span
                key={ip}
                className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-200 text-xs font-mono"
              >
                {ip}
                <button
                  onClick={() => toggleBlocked(ip)}
                  disabled={savingBlocked}
                  className="p-0.5 rounded hover:bg-red-500/20 text-red-200 transition-colors duration-200 cursor-pointer disabled:opacity-50"
                  aria-label={`Unblock ${ip}`}
                  title="Unblock"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">Nobody blocked. Tap the ban icon next to a visitor below.</p>
        )}
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
                    {v.devices && v.devices.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedIps((prev) => {
                            const next = new Set(prev)
                            if (next.has(v._id)) next.delete(v._id)
                            else next.add(v._id)
                            return next
                          })
                        }
                        className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border transition-colors duration-200 cursor-pointer ${
                          expandedIps.has(v._id)
                            ? 'bg-amber-400/25 text-amber-100 border-amber-400/40'
                            : 'bg-amber-400/15 text-amber-200 border-amber-400/30 hover:bg-amber-400/25'
                        }`}
                        title={`${v.devices.length} device${v.devices.length === 1 ? '' : 's'} behind this IP`}
                      >
                        <Smartphone className="w-3 h-3" /> {v.devices.length}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            expandedIps.has(v._id) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-xs mt-1">{formatLocation(v)}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    First seen {timeAgo(v.firstSeen)} · Last seen {timeAgo(v.lastSeen)}
                  </p>
                  {v.landingPage && (
                    <p className="text-slate-300 text-xs mt-1 truncate" title={v.landingPage}>
                      <span className="text-cyan-400 font-medium">Entered via:</span>{' '}
                      <span className="font-mono">{v.landingPage}</span>
                    </p>
                  )}
                  {v.lastReferer && (
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate" title={v.lastReferer}>
                      <span className="text-slate-500">Referred from:</span>{' '}
                      <a href={v.lastReferer} target="_blank" rel="noreferrer" className="text-cyan-400/70 hover:underline">{v.lastReferer}</a>
                    </p>
                  )}
                  <p className="text-slate-500 text-xs mt-1 truncate">
                    <span className="text-slate-400">{v.lastMethod}</span> {v.lastPath}
                  </p>
                  {v.userAgent && (
                    <p className="text-slate-500 text-[11px] mt-1 truncate" title={v.userAgent}>
                      {v.userAgent}
                    </p>
                  )}
                  {expandedIps.has(v._id) && v.devices && v.devices.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {v.devices.map((d) => (
                        <div
                          key={d._id}
                          className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-2 text-[11px] space-y-1"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <Smartphone className="w-3 h-3 text-amber-300 shrink-0" />
                            <span className="font-mono text-slate-200" title={d._id}>
                              {shortCid(d._id)}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">
                              {d.hits} hit{d.hits === 1 ? '' : 's'}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{timeAgo(d.lastSeen)}</span>
                            {d.fingerprint && (
                              <span
                                className="font-mono text-slate-500 truncate"
                                title={`fingerprint: ${d.fingerprint}`}
                              >
                                fp:{d.fingerprint.slice(0, 6)}
                              </span>
                            )}
                          </div>
                          {d.userAgent && (
                            <p className="text-slate-500 truncate" title={d.userAgent}>
                              {d.userAgent}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {confession.mode === 'allowlist' && (
                    <button
                      onClick={() => toggleAllowed(v._id)}
                      disabled={savingConfession}
                      className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-50 ${
                        allowedSet.has(v._id)
                          ? 'bg-cyan-400/20 text-cyan-200 hover:bg-cyan-400/30'
                          : 'hover:bg-white/10 text-slate-400'
                      }`}
                      aria-label={allowedSet.has(v._id) ? 'Revoke confession access' : 'Grant confession access'}
                      title={allowedSet.has(v._id) ? 'Allowed — click to revoke' : 'Allow confession access'}
                    >
                      {allowedSet.has(v._id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  {(() => {
                    const isSelf = v._id === yourIp
                    return (
                      <button
                        onClick={() => toggleBlocked(v._id)}
                        disabled={savingBlocked || isSelf}
                        className={`p-2 rounded-lg transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                          blockedSet.has(v._id)
                            ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30'
                            : 'hover:bg-red-500/15 text-slate-400 hover:text-red-300'
                        }`}
                        aria-label={
                          isSelf
                            ? "Can't block your own IP"
                            : blockedSet.has(v._id) ? 'Unblock' : 'Block'
                        }
                        title={
                          isSelf
                            ? "That's you — can't block your own IP"
                            : blockedSet.has(v._id) ? 'Blocked — click to unblock' : 'Block this IP'
                        }
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )
                  })()}
                  <button
                    onClick={() => setDeleteTarget(v)}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-300 transition-colors duration-200 cursor-pointer"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
