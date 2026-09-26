import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import '../pulse.css'
import { writeBestScore, readBestScore } from '../game/bestScore'
import { buildPlayUrl, readChallengeFromUrl } from '../game/challenge'
import { playStartSound } from '../game/sounds'
import type { ChallengePayload } from '../game/types'
import { useTimingRound } from '../game/useTimingRound'

function qualityLabel(quality: 'perfect' | 'good' | 'miss' | null): string {
  switch (quality) {
    case 'perfect':
      return 'ИДЕАЛЬНО'
    case 'good':
      return 'ЕСТЬ'
    case 'miss':
      return 'МИМО'
    case null:
      return ''
    default: {
      const _exhaustive: never = quality
      return _exhaustive
    }
  }
}

export function PulseGame() {
  const challenge = useMemo(() => readChallengeFromUrl(), [])
  const { state, start, beginRunning, hit, reset } = useTimingRound()
  const [name, setName] = useState('Ты')
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const [best, setBest] = useState(() => readBestScore())
  const [countdown, setCountdown] = useState<number | null>(null)
  const [showLanding, setShowLanding] = useState(true)

  const duelResult = useMemo(() => {
    if (!challenge || state.phase !== 'ended') return null
    if (state.stats.score > challenge.score) return 'win'
    if (state.stats.score < challenge.score) return 'lose'
    return 'draw'
  }, [challenge, state.phase, state.stats.score])

  useEffect(() => {
    if (challenge) setShowLanding(false)
  }, [challenge])

  useEffect(() => {
    if (state.phase !== 'ended') return
    setBest(writeBestScore(state.stats.score))
  }, [state.phase, state.stats.score])

  useEffect(() => {
    if (state.phase !== 'countdown') return
    let n = 3
    setCountdown(n)
    const id = window.setInterval(() => {
      n -= 1
      if (n <= 0) {
        clearInterval(id)
        setCountdown(null)
        playStartSound()
        beginRunning()
        return
      }
      setCountdown(n)
    }, 420)
    return () => clearInterval(id)
  }, [state.phase, beginRunning])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code !== 'Space' && event.code !== 'Enter') return
      event.preventDefault()
      if (state.phase === 'running') hit()
      else if (state.phase === 'idle' && !showLanding) start()
      else if (showLanding) {
        setShowLanding(false)
        start()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hit, showLanding, start, state.phase])

  async function shareChallenge() {
    setShareError(null)
    const payload: ChallengePayload = {
      v: 1,
      score: state.stats.score,
      name: name.trim() || 'Ты',
    }
    const url = buildPlayUrl(payload)
    const text = `Я набрал ${state.stats.score} в ПУЛЬС. Сможешь? 🔥`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ПУЛЬС', text, url })
        return
      }
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2500)
      } catch {
        setShareError('Не удалось скопировать ссылку.')
      }
    }
  }

  function handlePlayTap() {
    if (state.phase === 'running') {
      hit()
      return
    }
    if (showLanding) {
      setShowLanding(false)
      start()
      return
    }
    if (state.phase === 'idle') start()
  }

  const size = 300
  const cx = size / 2
  const cy = size / 2
  const radius = 116
  const zoneStart = state.zoneCenter - state.zoneWidth / 2
  const zoneEnd = state.zoneCenter + state.zoneWidth / 2

  function polar(angle: number, r: number) {
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
  }

  function arcPath(from: number, to: number, r: number) {
    const startPt = polar(from, r)
    const endPt = polar(to, r)
    const large = to - from > Math.PI ? 1 : 0
    return `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${large} 1 ${endPt.x} ${endPt.y}`
  }

  const needle = polar(state.angle, radius)
  const shaking = state.shake > 0.05

  return (
    <div className="pulse-shell relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5 pb-8 sm:py-8">
      {showLanding && state.phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--pulse-cyan)]">
            мини-игра · 20 секунд реакции
          </p>
          <h1 className="pulse-title mt-4 text-6xl font-extrabold text-white sm:text-7xl">ПУЛЬС</h1>
          <p className="mt-4 max-w-xs text-base leading-relaxed text-white/75">
            Один тап в золотой сектор. Серия растёт — скорость тоже. Кинь другу ссылку и смотри, кто сильнее.
          </p>
          {challenge && (
            <p className="mt-5 rounded-2xl border border-[var(--pulse-gold)]/40 bg-white/5 px-4 py-3 text-sm">
              <span className="font-semibold text-[var(--pulse-gold)]">{challenge.name}</span> поставил{' '}
              <span className="font-bold">{challenge.score}</span>. Побьёшь?
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setShowLanding(false)
              start()
            }}
            className="pulse-cta mt-8 rounded-full px-10 py-4 text-lg font-bold transition hover:brightness-110"
          >
            {challenge ? 'Принять вызов' : 'Играть'}
          </button>
          <p className="mt-4 text-xs text-white/40">Рекорд: {best}</p>
        </motion.div>
      )}

      <header className={`relative z-10 ${showLanding && state.phase === 'idle' ? 'opacity-0' : ''}`}>
        <p className="pulse-title text-2xl font-extrabold text-white">ПУЛЬС</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/45">попади · серия · вызов</p>
      </header>

      {challenge && !showLanding && state.phase !== 'ended' && (
        <div className="relative z-10 mt-4 rounded-2xl border border-[var(--pulse-gold)]/35 bg-[var(--pulse-gold)]/10 px-4 py-3 text-sm">
          Дуэль с <span className="font-bold text-[var(--pulse-gold)]">{challenge.name}</span> · цель{' '}
          <span className="font-bold">{challenge.score + 1}</span>+
        </div>
      )}

      <div
        className={`relative z-10 mt-5 grid grid-cols-3 gap-2 text-center text-sm ${showLanding && state.phase === 'idle' ? 'opacity-0' : ''}`}
      >
        <div className="rounded-2xl bg-white/5 px-2 py-3 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/45">Счёт</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--pulse-gold)]">
            {state.stats.score}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 px-2 py-3 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/45">Серия</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--pulse-neon-soft)]">
            {state.stats.streak}
          </p>
        </div>
        <div className="rounded-2xl bg-white/5 px-2 py-3 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-white/45">Рекорд</p>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold">{best}</p>
        </div>
      </div>

      <button
        type="button"
        aria-label={state.phase === 'running' ? 'Ударить' : 'Старт'}
        onPointerDown={(event) => {
          event.preventDefault()
          handlePlayTap()
        }}
        className={[
          'relative z-10 mx-auto mt-5 flex h-[min(72vw,320px)] w-[min(72vw,320px)] items-center justify-center touch-manipulation select-none',
          shaking ? 'pulse-shake' : '',
        ].join(' ')}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={['overflow-visible', state.phase === 'running' ? 'pulse-ring-glow' : ''].join(' ')}
        >
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="20" />
          <path
            d={arcPath(zoneStart, zoneEnd, radius)}
            fill="none"
            stroke="url(#pulseZone)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="pulseZone" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffd34d" />
              <stop offset="100%" stopColor="#ff3d81" />
            </linearGradient>
          </defs>
          <circle cx={cx} cy={cy} r="12" fill="rgba(255,255,255,0.9)" />
          <line
            x1={cx}
            y1={cy}
            x2={needle.x}
            y2={needle.y}
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx={needle.x} cy={needle.y} r="10" fill="var(--pulse-neon)" />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {countdown !== null && (
              <motion.p
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 1 }}
                exit={{ scale: 1.6, opacity: 0 }}
                className="font-[family-name:var(--font-display)] text-6xl font-black text-white"
              >
                {countdown}
              </motion.p>
            )}
            {countdown === null && state.phase === 'idle' && !showLanding && (
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-white/80">Тап</p>
            )}
            {state.phase === 'running' && state.lastHit && (
              <motion.div key={`${state.lastHit}-${state.stats.hits}`} className="text-center">
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--pulse-gold)]">
                  {qualityLabel(state.lastHit)}
                </p>
                {state.lastGain > 0 && (
                  <p className="text-lg font-semibold text-[var(--pulse-cyan)]">+{state.lastGain}</p>
                )}
              </motion.div>
            )}
            {state.phase === 'ended' && (
              <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--pulse-neon)]">
                СТОП
              </p>
            )}
          </AnimatePresence>
        </div>
      </button>

      {state.phase === 'ended' && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">раунд</p>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-extrabold text-white">
            {state.stats.score}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Серия {state.stats.bestStreak} · идеально {state.stats.perfects}
            {state.stats.score >= best && state.stats.score > 0 && (
              <span className="ml-2 text-[var(--pulse-gold)]">новый рекорд</span>
            )}
          </p>

          {duelResult && (
            <p className="mt-3 text-base font-semibold text-[var(--pulse-cyan)]">
              {duelResult === 'win' && `Ты взял ${challenge?.name}!`}
              {duelResult === 'lose' && `${challenge?.name} пока сильнее`}
              {duelResult === 'draw' && 'Ничья — реванш?'}
            </p>
          )}

          <label className="mt-4 block text-xs text-white/50">
            Имя в ссылке
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-[var(--pulse-neon)]"
            />
          </label>

          <button
            type="button"
            onClick={() => void shareChallenge()}
            className="pulse-cta mt-4 w-full rounded-2xl py-4 text-base font-bold"
          >
            {copied ? 'Ссылка в буфере — кидай другу' : '🔥 Кинуть вызов другу'}
          </button>
          <button
            type="button"
            onClick={() => {
              reset()
              setShowLanding(false)
              start()
            }}
            className="mt-3 w-full rounded-2xl border border-white/15 py-3 text-sm font-semibold text-white/85"
          >
            Ещё раунд
          </button>
          {shareError && <p className="mt-2 text-sm text-[var(--pulse-neon-soft)]">{shareError}</p>}
        </motion.section>
      )}

      {state.phase === 'running' && (
        <p className="relative z-10 mt-4 text-center text-xs text-white/35">Жми, когда стрелка в розово-золотой дуге</p>
      )}
    </div>
  )
}
