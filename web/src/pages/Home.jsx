import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Mail } from 'lucide-react'
import { about } from '../data/about'
import { useDocumentTitle } from '../lib/useDocumentTitle'

export default function Home() {
  useDocumentTitle('')
  return (
    <div className="max-w-4xl mx-auto px-4 pt-16 md:pt-24">
      <section className="text-center">
        <div className="flex justify-center mb-8">
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
            <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-purple-500/30 via-blue-500/20 to-cyan-400/30 blur-xl" />
            <Sparkles className="w-14 h-14 text-cyan-300" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="text-white">Hey, I'm </span>
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {about.name}.
          </span>
        </h1>
        <p className="text-xl text-slate-300 mt-5 max-w-2xl mx-auto leading-relaxed">
          A quiet little corner where you can learn a bit about me and leave a message —
          I'll read every word.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 cursor-pointer"
          >
            About me <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/40 text-cyan-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            <Mail className="w-4 h-4" /> Send a message
          </Link>
        </div>
      </section>
    </div>
  )
}
