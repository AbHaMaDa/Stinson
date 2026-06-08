import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Sparkles, Menu, X } from 'lucide-react'
import { api } from '../lib/api'

const linkBase =
  'rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer'
const inactive = 'text-slate-300 hover:text-white hover:bg-white/10'
const active = 'text-white bg-cyan-400/10 ring-1 ring-cyan-400/30'

const POLL_MS = 30 * 1000

function UnreadBadge({ count }) {
  if (!count) return null
  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-cyan-400 text-slate-950 text-[11px] font-bold leading-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Navbar({ authed }) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : prev
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!authed) {
      setUnread(0)
      return
    }
    let cancelled = false
    const fetchCount = async () => {
      try {
        const { data } = await api.get('/messages/unread-count')
        if (!cancelled) setUnread(data.count || 0)
      } catch {
        if (!cancelled) setUnread(0)
      }
    }
    fetchCount()
    const id = setInterval(fetchCount, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [authed, location.pathname])

  const desktopItem = ({ isActive }) =>
    `${linkBase} px-3 py-2 inline-flex items-center ${isActive ? active : inactive}`
  const mobileItem = ({ isActive }) =>
    `${linkBase} flex items-center px-4 py-3 text-base ${isActive ? active : inactive}`

  return (
    <header className="sticky top-4 z-50 mx-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl px-4 sm:px-5 py-3 shadow-2xl shadow-blue-950/30">
        <Link to="/" className="flex items-center gap-2 cursor-pointer min-h-[44px]">
          <Sparkles className="w-6 h-6 text-cyan-300" />
          <span className="font-semibold text-white tracking-tight">Stinson</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={desktopItem}>
            Home
          </NavLink>
          <NavLink to="/about" className={desktopItem}>
            About
          </NavLink>
          <NavLink to="/contact" className={desktopItem}>
            Contact
          </NavLink>
          <NavLink to="/inbox" className={desktopItem}>
            Inbox<UnreadBadge count={unread} />
          </NavLink>
          {authed && (
            <NavLink to="/visitors" className={desktopItem}>
              Visitors
            </NavLink>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden p-2.5 rounded-lg text-slate-200 hover:bg-white/10 transition-colors duration-200 cursor-pointer relative"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          {!open && authed && unread > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-slate-900"
              aria-hidden="true"
            />
          )}
        </button>
      </nav>

      {open && (
        <>
          <div
            className="fixed inset-0 -z-0 bg-slate-950/60 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav"
            className="md:hidden mt-2 max-w-6xl mx-auto bg-slate-950/95 backdrop-blur-lg border border-white/15 rounded-2xl p-2 shadow-2xl shadow-blue-950/40 relative"
          >
            <NavLink to="/" end className={mobileItem}>
              Home
            </NavLink>
            <NavLink to="/about" className={mobileItem}>
              About
            </NavLink>
            <NavLink to="/contact" className={mobileItem}>
              Contact
            </NavLink>
            <NavLink to="/inbox" className={mobileItem}>
              Inbox<UnreadBadge count={unread} />
            </NavLink>
            {authed && (
              <NavLink to="/visitors" className={mobileItem}>
                Visitors
              </NavLink>
            )}
          </div>
        </>
      )}
    </header>
  )
}
