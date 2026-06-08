import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import NotFound from './NotFound'

const DEFAULT_QUESTION = "Hey, this might be a little random, but I think you're interesting and I'd like to get to know you better. Would you be interested in going out sometime?"
const DEFAULT_YES_REVEAL = "Greeeaaaaaaaat!, but before that do u know the names of our solar system planets  rihgt?"
const FINAL_YES = 'aaaawesooome!, now u just let me know'
const FINAL_NO = 'yeaah who cares, now u just let me know'

function QLogo() {
  return (
    <div className="flex justify-center mb-5">
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-cyan-400/10 border border-pink-400/40 grid place-items-center shadow-lg shadow-pink-500/30">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-500/20 blur-md -z-10"
        />
        <span className="text-4xl font-black leading-none bg-gradient-to-br from-pink-200 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(244,114,182,0.55)]">
          ?
        </span>
      </div>
    </div>
  )
}

function HeartLogo() {
  return (
    <div className="flex justify-center mb-5">
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/30 via-rose-400/25 to-purple-500/20 border border-pink-400/50 grid place-items-center shadow-lg shadow-pink-500/40">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/40 to-rose-500/30 blur-md -z-10 animate-pulse"
        />
        <Heart className="w-8 h-8 text-pink-100 fill-pink-300 drop-shadow-[0_0_12px_rgba(244,114,182,0.7)]" />
      </div>
    </div>
  )
}

function SparklesLogo() {
  return (
    <div className="flex justify-center mb-5">
      <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-purple-500/15 to-pink-500/10 border border-cyan-300/40 grid place-items-center shadow-lg shadow-cyan-400/30">
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-purple-500/20 blur-md -z-10"
        />
        <Sparkles className="w-8 h-8 text-cyan-100 drop-shadow-[0_0_12px_rgba(103,232,249,0.6)]" />
      </div>
    </div>
  )
}

function YesNoRow({ onAnswer }) {
  return (
    <div className="flex justify-center gap-4 mt-8">
      <button
        onClick={() => onAnswer(true)}
        className="px-8 py-3 min-w-[110px] rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold text-lg shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 transition-all duration-200 cursor-pointer"
      >
        Yes
      </button>
      <button
        onClick={() => onAnswer(false)}
        className="px-8 py-3 min-w-[110px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-semibold text-lg transition-colors duration-200 cursor-pointer"
      >
        No
      </button>
    </div>
  )
}

function RunawayQuestion({ question, onYes }) {
  const zoneRef = useRef(null)
  const yesRef = useRef(null)
  const noRef = useRef(null)
  const [yesPos, setYesPos] = useState({ x: 0, y: 0 })
  const [noPos, setNoPos] = useState({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)
  const escapedRef = useRef(false)

  const moveAway = useCallback(() => {
    const zone = zoneRef.current?.getBoundingClientRect()
    const btn = noRef.current?.getBoundingClientRect()
    if (!zone || !btn) return
    const padding = 8
    const maxX = Math.max(0, zone.width - btn.width - padding)
    const maxY = Math.max(0, zone.height - btn.height - padding)
    const minDist = escapedRef.current ? 80 : 140
    let nextX, nextY
    let attempts = 0
    do {
      nextX = Math.random() * maxX
      nextY = Math.random() * maxY
      attempts += 1
    } while (
      attempts < 12 &&
      Math.hypot(nextX - noPos.x, nextY - noPos.y) < minDist
    )
    escapedRef.current = true
    setNoPos({ x: nextX, y: nextY })
  }, [noPos])

  useLayoutEffect(() => {
    const zone = zoneRef.current?.getBoundingClientRect()
    const yes = yesRef.current?.getBoundingClientRect()
    const no = noRef.current?.getBoundingClientRect()
    if (!zone || !yes || !no) return
    const gap = 16
    const totalW = yes.width + gap + no.width
    const startX = Math.max(8, (zone.width - totalW) / 2)
    const cy = zone.height / 2
    setYesPos({ x: startX, y: cy - yes.height / 2 })
    setNoPos({ x: startX + yes.width + gap, y: cy - no.height / 2 })
    setReady(true)
  }, [])

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 sm:p-10">
      <QLogo />
      <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center whitespace-pre-wrap break-words leading-relaxed">
        {question}
      </h1>

      <div
        ref={zoneRef}
        className="relative mt-8 h-56 sm:h-64 select-none"
      >
        <button
          ref={yesRef}
          onClick={onYes}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${yesPos.x}px, ${yesPos.y}px)`,
            visibility: ready ? 'visible' : 'hidden',
          }}
          className="px-8 py-3 min-w-[110px] rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-semibold text-lg shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 transition-all duration-200 cursor-pointer"
        >
          Yes
        </button>
        <button
          ref={noRef}
          type="button"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${noPos.x}px, ${noPos.y}px)`,
            transition: ready && escapedRef.current ? 'transform 180ms ease-out' : 'none',
            visibility: ready ? 'visible' : 'hidden',
            touchAction: 'none',
          }}
          onMouseEnter={moveAway}
          onPointerDown={(e) => {
            e.preventDefault()
            moveAway()
          }}
          onClick={(e) => {
            e.preventDefault()
            moveAway()
          }}
          onFocus={moveAway}
          className="px-8 py-3 min-w-[110px] rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 font-semibold text-lg cursor-pointer"
        >
          No
        </button>
      </div>
    </div>
  )
}

function FollowUpCard({ text, onAnswer }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-pink-500/15 via-purple-500/10 to-cyan-400/10 border border-pink-400/40 p-6 sm:p-10 text-center shadow-2xl shadow-pink-500/20">
      <HeartLogo />
      <p className="text-xl sm:text-2xl font-semibold text-white whitespace-pre-wrap break-words leading-relaxed">
        {text}
      </p>
      <YesNoRow onAnswer={onAnswer} />
    </div>
  )
}

function FinalCard({ variant }) {
  const yes = variant === 'yes'
  return (
    <div
      className={
        yes
          ? 'rounded-2xl p-6 sm:p-10 text-center shadow-2xl bg-gradient-to-br from-pink-500/25 via-purple-500/15 to-cyan-400/10 border border-pink-400/50 shadow-pink-500/30'
          : 'rounded-2xl p-6 sm:p-10 text-center shadow-2xl bg-gradient-to-br from-cyan-400/15 via-purple-500/10 to-slate-500/10 border border-cyan-400/30 shadow-cyan-400/20'
      }
    >
      {yes ? <HeartLogo /> : <SparklesLogo />}
      <p className="text-2xl sm:text-3xl font-semibold text-white whitespace-pre-wrap break-words leading-relaxed">
        {yes ? FINAL_YES : FINAL_NO}
      </p>
    </div>
  )
}

function ConfessionGame({ question, yesReveal }) {
  const [phase, setPhase] = useState('q1')

  return (
    <div className="max-w-2xl mx-auto px-4 pt-12">
      {phase === 'q1' && (
        <RunawayQuestion
          question={question || DEFAULT_QUESTION}
          onYes={() => setPhase('q2')}
        />
      )}
      {phase === 'q2' && (
        <FollowUpCard
          text={yesReveal || DEFAULT_YES_REVEAL}
          onAnswer={(isYes) => setPhase(isYes ? 'finalYes' : 'finalNo')}
        />
      )}
      {phase === 'finalYes' && <FinalCard variant="yes" />}
      {phase === 'finalNo' && <FinalCard variant="no" />}
    </div>
  )
}

export default function Confession() {
  const [state, setState] = useState({ loading: true, visible: false, question: '', yesReveal: '' })

  useDocumentTitle(state.visible ? 'Confession' : 'Page not found')

  useEffect(() => {
    let cancelled = false
    api
      .get('/confession/access')
      .then(({ data }) => {
        if (cancelled) return
        setState({
          loading: false,
          visible: !!data.visible,
          question: data.question || '',
          yesReveal: data.yesReveal || '',
        })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, visible: false, question: '', yesReveal: '' })
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

  return <ConfessionGame question={state.question} yesReveal={state.yesReveal} />
}
