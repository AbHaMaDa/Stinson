import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import { useDocumentTitle } from '../lib/useDocumentTitle'
import NotFound from './NotFound'

const DEFAULT_QUESTION = "Hey, this might be a little random, but I think you're interesting and I'd like to get to know you better. Would you be interested in going out sometime?"
const DEFAULT_YES_REVEAL = "Greeeaaaaaaaat!, but before that do u know the  planets names of our solar system right?"
const FINAL_YES = 'aaaawesooome!, now u just let me know'
const FINAL_NO = 'yeaah who cares, now u just let me know'

const STYLES = `
@keyframes conf-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.6); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes conf-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes conf-rev-orbit {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}
@keyframes conf-float-up {
  0% { transform: translate3d(0, 0, 0) scale(0.4); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.4; }
  100% { transform: translate3d(28px, -110vh, 0) scale(1); opacity: 0; }
}
@keyframes conf-word-in {
  0% { opacity: 0; transform: translateY(16px); filter: blur(6px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@keyframes conf-phase-in {
  0% { opacity: 0; filter: blur(10px); }
  100% { opacity: 1; filter: blur(0); }
}
@keyframes conf-pulse-glow {
  0%, 100% { box-shadow: 0 0 22px var(--g), 0 0 44px var(--g); }
  50% { box-shadow: 0 0 38px var(--g), 0 0 80px var(--g); }
}
@keyframes conf-burst {
  0% { transform: translate(0, 0) scale(0.4); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(1.3); opacity: 0; }
}
@keyframes conf-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes conf-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes conf-drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(8px, -10px); }
}
@keyframes conf-spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes conf-shake {
  0%, 100% { transform: rotate(0deg); }
  15% { transform: rotate(-16deg); }
  30% { transform: rotate(14deg); }
  45% { transform: rotate(-12deg); }
  60% { transform: rotate(10deg); }
  78% { transform: rotate(-5deg); }
}
@keyframes conf-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
`

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 1.8 + 0.8,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 3.5,
        pink: Math.random() > 0.75,
      })),
    [],
  )
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => {
        const tint = s.pink ? 'rgba(244,114,182,0.95)' : 'rgba(255,255,255,0.95)'
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              borderRadius: '50%',
              background: tint,
              boxShadow: `0 0 ${s.size * 4}px ${tint}`,
              animation: `conf-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}

function DriftingDust({ count = 14 }) {
  const dust = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: i * 1.6 + Math.random() * 3,
        duration: 14 + Math.random() * 12,
        size: 2 + Math.random() * 3,
        pink: Math.random() > 0.5,
      })),
    [count],
  )
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      {dust.map((d, i) => {
        const tint = d.pink ? 'rgba(244,114,182,0.8)' : 'rgba(103,232,249,0.75)'
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${d.left}%`,
              bottom: '-20px',
              width: `${d.size}px`,
              height: `${d.size}px`,
              borderRadius: '50%',
              background: tint,
              boxShadow: `0 0 ${d.size * 5}px ${tint}`,
              animation: `conf-float-up ${d.duration}s linear ${d.delay}s infinite`,
            }}
          />
        )
      })}
    </div>
  )
}

function Nebula({ tone }) {
  const cool =
    'radial-gradient(ellipse 65% 55% at 25% 30%, rgba(103,232,249,0.32), transparent 65%), radial-gradient(ellipse 55% 50% at 75% 80%, rgba(99,102,241,0.28), transparent 65%), radial-gradient(ellipse 40% 40% at 60% 50%, rgba(168,85,247,0.18), transparent 70%)'
  const warm =
    'radial-gradient(ellipse 60% 55% at 25% 35%, rgba(244,114,182,0.4), transparent 65%), radial-gradient(ellipse 55% 50% at 75% 70%, rgba(168,85,247,0.35), transparent 65%), radial-gradient(ellipse 45% 40% at 80% 20%, rgba(34,211,238,0.22), transparent 70%)'
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        background: tone === 'cool' ? cool : warm,
        filter: 'blur(24px)',
        transition: 'background 800ms ease',
      }}
    />
  )
}

function OrbitalCore({ children, ringColor = 'rgba(244,114,182,0.55)', glowColor = 'rgba(244,114,182,0.45)' }) {
  return (
    <div
      className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center"
      style={{ animation: 'conf-breathe 6s ease-in-out infinite' }}
    >
      <div
        aria-hidden="true"
        className="absolute rounded-full"
        style={{
          inset: '-26px',
          border: `1px dashed ${ringColor}`,
          opacity: 0.45,
          animation: 'conf-rev-orbit 32s linear infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid ${ringColor}`,
          animation: 'conf-orbit 16s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: ringColor,
            boxShadow: `0 0 18px ${ringColor}`,
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-2 rounded-full"
        style={{
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(168,85,247,0.18) 50%, transparent 80%)`,
          filter: 'blur(14px)',
        }}
      />
      <div className="relative z-10 leading-none">{children}</div>
    </div>
  )
}

function PlanetIcon() {
  return (
    <div
      className="relative w-20 h-20 sm:w-24 sm:h-24"
      style={{ animation: 'conf-spin-slow 28s linear infinite' }}
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: '150%',
          height: '34%',
          transform: 'translate(-50%, -50%) rotate(-22deg)',
          borderRadius: '50%',
          border: '2px solid rgba(244,114,182,0.7)',
          clipPath: 'inset(0 0 52% 0)',
          boxShadow: '0 0 12px rgba(244,114,182,0.55)',
        }}
      />
      <div
        className="absolute inset-3 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 28%, rgba(254,202,232,1) 0%, rgba(244,114,182,1) 38%, rgba(168,85,247,1) 75%, rgba(76,29,149,1) 100%)',
          boxShadow: '0 0 36px rgba(244,114,182,0.65), inset -5px -10px 22px rgba(0,0,0,0.45)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 pointer-events-none"
        style={{
          width: '150%',
          height: '34%',
          transform: 'translate(-50%, -50%) rotate(-22deg)',
          borderRadius: '50%',
          border: '2px solid rgba(244,114,182,0.9)',
          clipPath: 'inset(52% 0 0 0)',
          boxShadow: '0 0 12px rgba(244,114,182,0.7)',
        }}
      />
    </div>
  )
}

function HangingRabbit({ count }) {
  const visible = count > 0
  return (
    <>
      {/* Mobile: hangs under the card, paws gripping the bottom border */}
      <div
        aria-hidden="true"
        className="sm:hidden absolute pointer-events-none z-30 left-1/2 bottom-0 -translate-x-1/2 translate-y-[calc(100%-18px)]"
        style={{ width: '130px', height: '116px' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: visible ? 1 : 0,
            transform: visible
              ? 'translateY(0) scale(1) rotate(0deg)'
              : 'translateY(-44px) scale(0.85) rotate(-6deg)',
            transformOrigin: 'top center',
            transition:
              'opacity 300ms ease, transform 650ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              animation: visible ? 'conf-bob 3.4s ease-in-out infinite' : undefined,
            }}
          >
            <svg width="130" height="116" viewBox="0 0 130 116" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rbFurM" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#fce7f3" />
                </linearGradient>
                <radialGradient id="rbGlowM" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0%" stopColor="rgba(244,114,182,0.45)" />
                  <stop offset="100%" stopColor="rgba(244,114,182,0)" />
                </radialGradient>
              </defs>

              {/* Soft glow behind head */}
              <circle cx="65" cy="62" r="50" fill="url(#rbGlowM)" />

              {/* Left paw gripping bottom edge of card */}
              <g>
                <ellipse cx="42" cy="12" rx="13" ry="8" fill="url(#rbFurM)" stroke="#1e1b4b" strokeWidth="1.3" />
                <ellipse cx="42" cy="14" rx="5.5" ry="3" fill="rgba(244,114,182,0.7)" />
                <ellipse cx="34" cy="6" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
                <ellipse cx="40" cy="4" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
                <ellipse cx="46" cy="5" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
                <ellipse cx="51" cy="7" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
              </g>
              {/* Right paw */}
              <g>
                <ellipse cx="88" cy="12" rx="13" ry="8" fill="url(#rbFurM)" stroke="#1e1b4b" strokeWidth="1.3" />
                <ellipse cx="88" cy="14" rx="5.5" ry="3" fill="rgba(244,114,182,0.7)" />
                <ellipse cx="80" cy="6" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
                <ellipse cx="86" cy="4" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
                <ellipse cx="92" cy="5" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
                <ellipse cx="97" cy="7" rx="2" ry="1.5" fill="rgba(244,114,182,0.85)" />
              </g>

              {/* Head + ears (shake on count change) */}
              <g
                key={count}
                style={{
                  transformOrigin: '65px 28px',
                  transformBox: 'view-box',
                  animation: count > 0 ? 'conf-shake 0.85s ease-in-out' : undefined,
                }}
              >
                {/* Left ear */}
                <g transform="rotate(-12 53 46)">
                  <ellipse cx="53" cy="38" rx="9" ry="22" fill="url(#rbFurM)" stroke="#1e1b4b" strokeWidth="1.4" />
                  <ellipse cx="53" cy="40" rx="4" ry="16" fill="rgba(244,114,182,0.75)" />
                </g>
                {/* Right ear */}
                <g transform="rotate(12 77 46)">
                  <ellipse cx="77" cy="38" rx="9" ry="22" fill="url(#rbFurM)" stroke="#1e1b4b" strokeWidth="1.4" />
                  <ellipse cx="77" cy="40" rx="4" ry="16" fill="rgba(244,114,182,0.75)" />
                </g>

                {/* Head */}
                <circle cx="65" cy="74" r="24" fill="url(#rbFurM)" stroke="#1e1b4b" strokeWidth="1.6" />

                {/* Happy closed eyes ^_^ */}
                <path d="M 52 70 Q 56 74 60 70" stroke="#1e1b4b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path d="M 70 70 Q 74 74 78 70" stroke="#1e1b4b" strokeWidth="2.4" fill="none" strokeLinecap="round" />

                {/* Cheeks */}
                <ellipse cx="50" cy="82" rx="3.6" ry="2.4" fill="rgba(244,114,182,0.78)" />
                <ellipse cx="80" cy="82" rx="3.6" ry="2.4" fill="rgba(244,114,182,0.78)" />

                {/* Nose */}
                <path d="M 60 80 L 70 80 L 65 84.5 Z" fill="#ec4899" stroke="#1e1b4b" strokeWidth="1.1" strokeLinejoin="round" />

                {/* Mouth */}
                <path d="M 65 84.5 L 65 88" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 65 88 Q 61.5 90.5 59 89.5" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <path d="M 65 88 Q 68.5 90.5 71 89.5" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" />

                {/* Whiskers */}
                <line x1="45" y1="80" x2="32" y2="77" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
                <line x1="45" y1="84" x2="32" y2="85" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
                <line x1="85" y1="80" x2="98" y2="77" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
                <line x1="85" y1="84" x2="98" y2="85" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop: peeking out from the right edge of the card */}
      <div
        aria-hidden="true"
        className="hidden sm:block absolute pointer-events-none z-30 right-4 top-[calc(2.5rem+90px)] translate-x-[calc(100%-35px)]"
        style={{ width: '100px', height: '190px' }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: visible ? 1 : 0,
            transform: visible
              ? 'translateX(0) scale(1) rotate(0deg)'
              : 'translateX(-32px) scale(0.85) rotate(-10deg)',
            transformOrigin: 'left center',
            transition:
              'opacity 300ms ease, transform 650ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              animation: visible ? 'conf-bob 3.4s ease-in-out infinite' : undefined,
            }}
          >
            <svg width="100" height="190" viewBox="0 0 100 190" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="rbFur" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#fce7f3" />
              </linearGradient>
              <radialGradient id="rbGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(244,114,182,0.45)" />
                <stop offset="100%" stopColor="rgba(244,114,182,0)" />
              </radialGradient>
            </defs>

            {/* Soft glow behind the head */}
            <circle cx="58" cy="78" r="48" fill="url(#rbGlow)" />

            {/* Upper paw gripping the right border of the card */}
            <g>
              <ellipse cx="22" cy="98" rx="13" ry="9" fill="url(#rbFur)" stroke="#1e1b4b" strokeWidth="1.3" />
              <ellipse cx="22" cy="100" rx="5.5" ry="3" fill="rgba(244,114,182,0.7)" />
              <ellipse cx="12" cy="92" rx="2" ry="1.6" fill="rgba(244,114,182,0.85)" />
              <ellipse cx="10" cy="98" rx="2" ry="1.6" fill="rgba(244,114,182,0.85)" />
              <ellipse cx="12" cy="104" rx="2" ry="1.6" fill="rgba(244,114,182,0.85)" />
            </g>

            {/* Lower paw */}
            <g>
              <ellipse cx="22" cy="160" rx="13" ry="9" fill="url(#rbFur)" stroke="#1e1b4b" strokeWidth="1.3" />
              <ellipse cx="22" cy="162" rx="5.5" ry="3" fill="rgba(244,114,182,0.7)" />
              <ellipse cx="12" cy="154" rx="2" ry="1.6" fill="rgba(244,114,182,0.85)" />
              <ellipse cx="10" cy="160" rx="2" ry="1.6" fill="rgba(244,114,182,0.85)" />
              <ellipse cx="12" cy="166" rx="2" ry="1.6" fill="rgba(244,114,182,0.85)" />
            </g>

            {/* Head + ears (shake on count change) */}
            <g
              key={count}
              style={{
                transformOrigin: '60px 104px',
                transformBox: 'view-box',
                animation: count > 0 ? 'conf-shake 0.85s ease-in-out' : undefined,
              }}
            >
              {/* Left ear (closer to the hidden side) */}
              <g transform="rotate(-14 48 38)">
                <ellipse cx="48" cy="28" rx="8.5" ry="25" fill="url(#rbFur)" stroke="#1e1b4b" strokeWidth="1.4" />
                <ellipse cx="48" cy="30" rx="3.8" ry="18" fill="rgba(244,114,182,0.75)" />
              </g>
              {/* Right ear */}
              <g transform="rotate(12 74 38)">
                <ellipse cx="74" cy="28" rx="8.5" ry="25" fill="url(#rbFur)" stroke="#1e1b4b" strokeWidth="1.4" />
                <ellipse cx="74" cy="30" rx="3.8" ry="18" fill="rgba(244,114,182,0.75)" />
              </g>

              {/* Head */}
              <circle cx="60" cy="80" r="24" fill="url(#rbFur)" stroke="#1e1b4b" strokeWidth="1.6" />

              {/* Happy closed eyes ^_^ */}
              <path d="M 47 76 Q 51 80 55 76" stroke="#1e1b4b" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d="M 65 76 Q 69 80 73 76" stroke="#1e1b4b" strokeWidth="2.4" fill="none" strokeLinecap="round" />

              {/* Cheeks */}
              <ellipse cx="45" cy="88" rx="3.6" ry="2.4" fill="rgba(244,114,182,0.78)" />
              <ellipse cx="75" cy="88" rx="3.6" ry="2.4" fill="rgba(244,114,182,0.78)" />

              {/* Pink triangle nose */}
              <path d="M 55 86 L 65 86 L 60 90.5 Z" fill="#ec4899" stroke="#1e1b4b" strokeWidth="1.1" strokeLinejoin="round" />

              {/* Bunny mouth (Y) */}
              <path d="M 60 90.5 L 60 94" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 60 94 Q 56.5 96.5 54 95.5" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              <path d="M 60 94 Q 63.5 96.5 66 95.5" stroke="#1e1b4b" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* Whiskers */}
              <line x1="40" y1="86" x2="28" y2="83" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
              <line x1="40" y1="90" x2="28" y2="91" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
              <line x1="80" y1="86" x2="92" y2="83" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
              <line x1="80" y1="90" x2="92" y2="91" stroke="rgba(30,27,75,0.55)" strokeWidth="1" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </div>
    </div>
    </>
  )
}

function StaggeredText({ text, className, baseDelay = 0, perWord = 55 }) {
  const parts = useMemo(() => text.split(/(\s+)/), [text])
  let wordIdx = -1
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (/^\s+$/.test(p)) return <span key={i}>{p}</span>
        wordIdx += 1
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              animation: 'conf-word-in 0.55s ease-out both',
              animationDelay: `${baseDelay + wordIdx * perWord}ms`,
            }}
          >
            {p}
          </span>
        )
      })}
    </span>
  )
}

function PillBtn({ children, variant = 'primary', innerRef, style, className = '', ...rest }) {
  const isPrimary = variant === 'primary'
  return (
    <button
      ref={innerRef}
      style={{
        '--g': isPrimary ? 'rgba(244,114,182,0.55)' : 'rgba(148,163,184,0.0)',
        ...style,
      }}
      className={
        (isPrimary
          ? 'relative px-10 py-3.5 min-w-[120px] rounded-full font-bold text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-[length:200%_100%] hover:[background-position:100%_50%] transition-[background-position] duration-500 cursor-pointer'
          : 'relative px-10 py-3.5 min-w-[120px] rounded-full font-bold text-lg text-slate-200 bg-white/[0.04] border border-white/20 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer') +
        ' ' +
        className
      }
      {...rest}
    >
      {isPrimary && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ animation: 'conf-pulse-glow 2.6s ease-in-out infinite' }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  )
}

function Phase1Runaway({ question, onYes, onNope }) {
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
    onNope?.()
  }, [noPos, onNope])

  useLayoutEffect(() => {
    const zone = zoneRef.current?.getBoundingClientRect()
    const yes = yesRef.current?.getBoundingClientRect()
    const no = noRef.current?.getBoundingClientRect()
    if (!zone || !yes || !no) return
    const gap = 20
    const totalW = yes.width + gap + no.width
    const startX = Math.max(8, (zone.width - totalW) / 2)
    const cy = zone.height / 2
    setYesPos({ x: startX, y: cy - yes.height / 2 })
    setNoPos({ x: startX + yes.width + gap, y: cy - no.height / 2 })
    setReady(true)
  }, [])

  return (
    <div className="relative flex flex-col items-center text-center px-4 py-6 w-full">
      <OrbitalCore>
        <span className="text-6xl sm:text-7xl font-black bg-gradient-to-br from-pink-100 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(244,114,182,0.7)]">
          ?
        </span>
      </OrbitalCore>
      <h1 className="mt-8 max-w-xl text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
        <StaggeredText text={question} />
      </h1>
      <div
        ref={zoneRef}
        className="relative mt-10 w-full max-w-lg h-44 sm:h-48 select-none"
      >
        <PillBtn
          innerRef={yesRef}
          onClick={onYes}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${yesPos.x}px, ${yesPos.y}px)`,
            visibility: ready ? 'visible' : 'hidden',
          }}
        >
          Yes
        </PillBtn>
        <PillBtn
          variant="ghost"
          innerRef={noRef}
          type="button"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: `translate(${noPos.x}px, ${noPos.y}px)`,
            transition: ready && escapedRef.current ? 'transform 200ms ease-out' : 'none',
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
        >
          No
        </PillBtn>
      </div>
    </div>
  )
}

function Phase2FollowUp({ text, onAnswer }) {
  return (
    <div className="relative flex flex-col items-center text-center px-4 py-6 w-full">
      <OrbitalCore>
        <PlanetIcon />
      </OrbitalCore>
      <h2 className="mt-8 max-w-xl text-xl sm:text-2xl font-bold text-white tracking-tight leading-relaxed">
        <StaggeredText text={text} />
      </h2>
      <div className="mt-10 flex flex-wrap justify-center gap-5">
        <PillBtn onClick={() => onAnswer(true)}>Yes</PillBtn>
        <PillBtn variant="ghost" onClick={() => onAnswer(false)}>
          No
        </PillBtn>
      </div>
    </div>
  )
}

function ParticleBurst({ count = 24 }) {
  const items = useMemo(() => {
    const colors = [
      'rgba(244,114,182,1)',
      'rgba(168,85,247,1)',
      'rgba(103,232,249,1)',
      'rgba(253,224,71,1)',
      'rgba(255,255,255,1)',
    ]
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const dist = 130 + Math.random() * 100
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        delay: Math.random() * 0.5,
        size: 5 + Math.random() * 7,
        color: colors[i % colors.length],
      }
    })
  }, [count])
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-24 sm:top-28 -translate-x-1/2 pointer-events-none"
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: `${it.size}px`,
            height: `${it.size}px`,
            borderRadius: '50%',
            background: it.color,
            boxShadow: `0 0 ${it.size * 2.5}px ${it.color}`,
            '--dx': `${it.dx}px`,
            '--dy': `${it.dy}px`,
            animation: `conf-burst 1.6s ease-out ${it.delay}s both`,
          }}
        />
      ))}
    </div>
  )
}

function PhaseFinal({ variant }) {
  const yes = variant === 'yes'
  return (
    <div className="relative flex flex-col items-center text-center px-4 py-6 w-full">
      {yes && <ParticleBurst />}
      <OrbitalCore
        ringColor={yes ? 'rgba(244,114,182,0.65)' : 'rgba(103,232,249,0.5)'}
        glowColor={yes ? 'rgba(244,114,182,0.55)' : 'rgba(103,232,249,0.4)'}
      >
        {yes ? (
          <Sparkles
            className="w-16 h-16 sm:w-20 sm:h-20 text-pink-100"
            style={{
              filter: 'drop-shadow(0 0 24px rgba(244,114,182,1)) drop-shadow(0 0 12px rgba(168,85,247,0.7))',
              animation: 'conf-breathe 2.4s ease-in-out infinite',
            }}
          />
        ) : (
          <span
            className="text-6xl sm:text-7xl leading-none"
            style={{
              filter: 'drop-shadow(0 0 18px rgba(103,232,249,0.7))',
              animation: 'conf-drift 6s ease-in-out infinite',
            }}
          >
            🌙
          </span>
        )}
      </OrbitalCore>
      <p
        className={
          yes
            ? 'mt-10 max-w-xl text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug bg-gradient-to-r from-pink-200 via-purple-200 to-cyan-200 bg-[length:200%_100%] bg-clip-text text-transparent'
            : 'mt-10 max-w-xl text-2xl sm:text-3xl font-bold tracking-tight leading-snug text-slate-200/90'
        }
        style={yes ? { animation: 'conf-shimmer 3.5s ease-in-out infinite' } : undefined}
      >
        {yes ? FINAL_YES : FINAL_NO}
      </p>
    </div>
  )
}

function ConfessionGame({ question, yesReveal }) {
  const [phase, setPhase] = useState('q1')
  const [nopeCount, setNopeCount] = useState(0)
  const tone = phase === 'finalNo' ? 'cool' : 'warm'

  return (
    <>
      <style>{STYLES}</style>
      <div className="relative max-w-3xl mx-auto px-3 sm:px-4 pt-6 sm:pt-10">
        <div
          className="relative rounded-3xl border border-white/10 overflow-hidden min-h-[600px] sm:min-h-[640px] flex items-center justify-center"
          style={{
            background:
              'linear-gradient(180deg, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.6) 100%)',
          }}
        >
          <Nebula tone={tone} />
          <Stars />
          <DriftingDust />
          <div
            key={phase}
            className="relative w-full flex items-center justify-center py-12"
            style={{ animation: 'conf-phase-in 0.75s ease-out both' }}
          >
            {phase === 'q1' && (
              <Phase1Runaway
                question={question || DEFAULT_QUESTION}
                onYes={() => setPhase('q2')}
                onNope={() => setNopeCount((n) => n + 1)}
              />
            )}
            {phase === 'q2' && (
              <Phase2FollowUp
                text={yesReveal || DEFAULT_YES_REVEAL}
                onAnswer={(isYes) => setPhase(isYes ? 'finalYes' : 'finalNo')}
              />
            )}
            {phase === 'finalYes' && <PhaseFinal variant="yes" />}
            {phase === 'finalNo' && <PhaseFinal variant="no" />}
          </div>
        </div>
        {phase === 'q1' && <HangingRabbit count={nopeCount} />}
      </div>
    </>
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
