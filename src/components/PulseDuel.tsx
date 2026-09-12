import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { buildPlayUrl } from '../game/challenge'
import type { ChallengePayload } from '../game/types'
import { useTimingRound } from '../game/useTimingRound'

interface PulseDuelProps {
  challenge: ChallengePayload | null
  onBackToCompass: () => void
}

function qualityLabel(quality: 'perfect' | 'good' | 'miss' | null): string {
  switch (quality) {
    case 'perfect':
      return 'Идеально'
    case 'good':
      return 'Есть'
    case 'miss':
      return 'Мимо'
    case null:
      return ''
    default: {
      const _exhaustive: never = quality
      return _exhaustive
    }
  }
}

export function PulseDuel({ challenge, onBackToCompass }: PulseDuelProps) {
  const { state, start, hit, reset } = useTimingRound()
  const [name, setName] = useState('Игрок')
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)

  const duelResult = useMemo(() => {
    if (!challenge || state.phase !== 'ended') return null
    if (state.stats.score > challenge.score) return 'win'
    if (state.stats.score < challenge.score) return 'lose'
    return 'draw'
  }, [challenge, state.phase, state.stats.score])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.code !== 'Space' && event.code !== 'Enter') return
      event.preventDefault()
      if (state.phase === 'running') hit()
      else start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hit, start, state.phase])

  async function shareChallenge() {
    setShareError(null)
    const url = buildPlayUrl({
      v: 1,
      score: state.stats.score,
      name: name.trim() || 'Игрок',
    })
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Пульс-дуэль',
          text: `Побей мой счёт ${state.stats.score} в Пульс-дуэли`,
          url,
        })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      } catch {
        setShareError('Не удалось поделиться. Скопируй ссылку вручную из адресной строки после шаринга.')
      }
    }
  }

  const size = 280
  const cx = size / 2
  const cy = size / 2
  const radius = 108
  const zoneStart = state.zoneCenter - state.zoneWidth / 2
  const zoneEnd = state.zoneCenter + state.zoneWidth / 2

  function polar(angle: number, r: number) {
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    }
  }

  function arcPath(from: number, to: number, r: number) {
    const start = polar(from, r)
    const end = polar(to, r)
    const large = to - from > Math.PI ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
  }

  const needle = polar(state.angle, radius)
  const flashColor =
    state.lastHit === 'perfect'
      ? 'var(--gold)'
      : state.lastHit === 'good'
        ? 'var(--leaf)'
        : state.lastHit === 'miss'
          ? 'var(--coral)'
          : 'transparent'

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-6 sm:py-10">
      <header className="mb-6">
        <p className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[var(--gold)]">
          Пульс-дуэль
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_75%,transparent)]">
          Timing как ядро + вызов другу по ссылке. Жми, когда стрелка в золотой зоне.
        </p>
      </header>

      {challenge && (
        <div className="mb-4 rounded-2xl border border-[color:color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--gold)_12%,transparent)] px-4 py-3 text-sm text-[var(--paper)]">
          Вызов от <span className="font-semibold text-[var(--gold)]">{challenge.name}</span>: счёт{' '}
          <span className="font-semibold">{challenge.score}</span>. Побей — и кинь ссылку обратно.
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-sm text-[var(--paper)]">
        <div className="rounded-2xl bg-[color:color-mix(in_srgb,var(--moss)_55%,black)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--sky)]">Счёт</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--gold)]">
            {state.stats.score}
          </p>
        </div>
        <div className="rounded-2xl bg-[color:color-mix(in_srgb,var(--moss)_55%,black)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--sky)]">Серия</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">{state.stats.streak}</p>
        </div>
        <div className="rounded-2xl bg-[color:color-mix(in_srgb,var(--moss)_55%,black)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--sky)]">Идеально</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold">{state.stats.perfects}</p>
        </div>
      </div>

      <button
        type="button"
        aria-label={
          state.phase === 'running' ? 'Ударить' : state.phase === 'ended' ? 'Раунд окончен' : 'Старт'
        }
        onPointerDown={(event) => {
          event.preventDefault()
          if (state.phase === 'running') hit()
          else if (state.phase === 'idle') start()
        }}
        className="relative mx-auto mt-6 flex h-[300px] w-[300px] items-center justify-center rounded-full touch-manipulation select-none"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="color-mix(in srgb, var(--paper) 16%, transparent)"
            strokeWidth="18"
          />
          <path
            d={arcPath(zoneStart, zoneEnd, radius)}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity={0.95}
          />
          <circle cx={cx} cy={cy} r="10" fill="var(--paper)" />
          <line
            x1={cx}
            y1={cy}
            x2={needle.x}
            y2={needle.y}
            stroke="var(--paper)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx={needle.x} cy={needle.y} r="8" fill="var(--coral)" />
          {state.flash > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={radius + 28}
              fill="none"
              stroke={flashColor}
              strokeWidth="3"
              opacity={state.flash}
            />
          )}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {state.phase === 'idle' && (
              <p className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--paper)]">
                Тап / Space
              </p>
            )}
            {state.phase === 'running' && state.lastHit && (
              <motion.p
                key={`${state.lastHit}-${state.stats.hits}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--gold)]"
              >
                {qualityLabel(state.lastHit)}
              </motion.p>
            )}
            {state.phase === 'ended' && (
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--coral)]">
                Мимо
              </p>
            )}
          </div>
        </div>
      </button>

      {state.phase === 'ended' && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-[28px] border border-[color:color-mix(in_srgb,var(--paper)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--paper)_9%,transparent)] px-5 py-6"
        >
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--paper)]">
            Раунд окончен · {state.stats.score}
          </h2>
          <p className="mt-2 text-sm text-[color:color-mix(in_srgb,var(--paper)_72%,transparent)]">
            Попадений: {state.stats.hits}. Лучшая серия: {state.stats.bestStreak}.
          </p>

          {duelResult && (
            <p className="mt-3 text-base font-semibold text-[var(--gold)]">
              {duelResult === 'win' && `Победа против ${challenge?.name} (${challenge?.score})`}
              {duelResult === 'lose' && `Пока слабее, чем ${challenge?.name} (${challenge?.score})`}
              {duelResult === 'draw' && `Ничья с ${challenge?.name}`}
            </p>
          )}

          <label className="mt-5 block text-sm text-[var(--sky)]">
            Имя в вызове
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={24}
              className="mt-2 w-full rounded-2xl border border-[color:color-mix(in_srgb,var(--paper)_18%,transparent)] bg-[color:color-mix(in_srgb,var(--moss)_60%,black)] px-4 py-3 text-[var(--paper)] outline-none focus:border-[var(--gold)]"
              placeholder="Как подписать вызов"
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void shareChallenge()}
              className="rounded-2xl bg-[var(--gold)] px-5 py-3.5 text-base font-semibold text-[var(--ink)] transition hover:brightness-105 active:scale-[0.98]"
            >
              {copied ? 'Ссылка скопирована' : 'Вызвать друга'}
            </button>
            <button
              type="button"
              onClick={() => {
                reset()
                start()
              }}
              className="rounded-2xl border border-[color:color-mix(in_srgb,var(--paper)_28%,transparent)] px-5 py-3.5 text-base font-semibold text-[var(--paper)] transition hover:bg-[color:color-mix(in_srgb,var(--paper)_8%,transparent)] active:scale-[0.98]"
            >
              Ещё раз
            </button>
          </div>
          {shareError && <p className="mt-3 text-sm text-[var(--coral)]">{shareError}</p>}
        </motion.section>
      )}

      {state.phase !== 'ended' && (
        <p className="mt-6 text-center text-sm text-[color:color-mix(in_srgb,var(--paper)_55%,transparent)]">
          {state.phase === 'idle' ? 'Нажми круг, чтобы начать' : 'Лови золотую дугу'}
        </p>
      )}

      <button
        type="button"
        onClick={onBackToCompass}
        className="mt-auto pt-8 text-left text-sm font-medium text-[color:color-mix(in_srgb,var(--paper)_65%,transparent)] transition hover:text-[var(--paper)]"
      >
        ← К компасу ниши
      </button>
    </div>
  )
}
