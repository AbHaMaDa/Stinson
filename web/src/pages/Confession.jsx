import { useEffect, useState } from 'react'
import { MessageCircleHeart } from 'lucide-react'
import { api } from '../lib/api'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import NotFound from './NotFound'

export default function Confession() {
  const [state, setState] = useState({ loading: true, visible: false })

  useDocumentTitle(state.visible ? 'Confession' : 'Page not found')

  useEffect(() => {
    let cancelled = false
    api
      .get('/confession/access')
      .then(({ data }) => {
        if (!cancelled) setState({ loading: false, visible: !!data.visible })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, visible: false })
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (state.loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-16">
        <div className="h-40 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      </div>
    )
  }

  if (!state.visible) return <NotFound />

  return (
    <div className="max-w-3xl mx-auto px-4 pt-12">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-pink-400/15 border border-pink-400/30 grid place-items-center">
            <MessageCircleHeart className="w-7 h-7 text-pink-300" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Confession</h1>
        <p className="text-slate-300 mt-3">
          Placeholder. Content coming soon.
        </p>
      </div>
    </div>
  )
}
