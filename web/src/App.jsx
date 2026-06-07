import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import { api } from './lib/api'

const AboutPage = lazy(() => import('./pages/About'))
const ContactPage = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const Inbox = lazy(() => import('./pages/Inbox'))
const NotFound = lazy(() => import('./pages/NotFound'))

function RouteFallback() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-16">
      <div className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    </div>
  )
}

function RequireAuth({ authed, children }) {
  const location = useLocation()
  if (authed === null) return null
  if (!authed) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

export default function App() {
  const [authed, setAuthed] = useState(null)

  const checkAuth = async () => {
    try {
      await api.get('/auth/me')
      setAuthed(true)
    } catch {
      setAuthed(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col relative overflow-x-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(168,85,247,0.45),transparent_60%),radial-gradient(ellipse_60%_50%_at_90%_20%,rgba(34,211,238,0.35),transparent_60%),radial-gradient(ellipse_70%_50%_at_10%_80%,rgba(59,130,246,0.4),transparent_60%)]"
        />
        <Navbar authed={authed} />
        <main className="flex-1 pb-16">
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route
                path="/login"
                element={
                  authed ? (
                    <Navigate to="/inbox" replace />
                  ) : (
                    <Login onLogin={() => setAuthed(true)} />
                  )
                }
              />
              <Route
                path="/inbox"
                element={
                  <RequireAuth authed={authed}>
                    <Inbox onLogout={() => setAuthed(false)} />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
