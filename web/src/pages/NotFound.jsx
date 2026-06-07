import { Link } from 'react-router-dom'
import { Compass, Home as HomeIcon } from 'lucide-react'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <div className="max-w-md mx-auto px-4 pt-24 text-center">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-10 border border-white/20 shadow-2xl shadow-blue-950/40">
        <div className="flex justify-center mb-6">
          <div className="bg-cyan-400/10 rounded-2xl p-4 border border-cyan-400/30">
            <Compass className="w-10 h-10 text-cyan-300" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-white tracking-tight">404</h1>
        <p className="text-slate-300 mt-3">
          That page wandered off. Let's head back home.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 cursor-pointer"
        >
          <HomeIcon className="w-4 h-4" /> Go home
        </Link>
      </div>
    </div>
  )
}
