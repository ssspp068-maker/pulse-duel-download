import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { GamePath } from './components/GamePath'
import { PulseDuel } from './components/PulseDuel'
import { QUESTIONS } from './data/quiz'
import { buildPlayUrl, readPlayMode } from './game/challenge'
import type { ChallengePayload } from './game/types'
import { buildSummary, computeScores, rankNiches } from './lib/scoring'

const STORAGE_KEY = 'niche-compass-answers-v1'
const MECHANIC_KEY = 'niche-compass-mechanic-v1'

function loadAnswers(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, string>
  } catch {
    return {}
  }
}

type Phase = 'intro' | 'quiz' | 'results' | 'game_path'
type AppMode = 'compass' | 'play'

export default function App() {
  const [mode, setMode] = useState<AppMode>('compass')
  const [challenge, setChallenge] = useState<ChallengePayload | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [mechanicId, setMechanicId] = useState<string | null>('async_duel')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = loadAnswers()
    setAnswers(saved)
    try {
      setMechanicId(localStorage.getItem(MECHANIC_KEY) ?? 'async_duel')
    } catch {
      setMechanicId('async_duel')
    }
    const playMode = readPlayMode()
    if (playMode.play) {
      setMode('play')
      setChallenge(playMode.challenge)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
  }, [answers, hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (mechanicId) localStorage.setItem(MECHANIC_KEY, mechanicId)
    else localStorage.removeItem(MECHANIC_KEY)
  }, [mechanicId, hydrated])

  function openPlay(nextChallenge: ChallengePayload | null = null) {
    setChallenge(nextChallenge)
    setMode('play')
    const url = buildPlayUrl(nextChallenge ?? undefined)
    window.history.replaceState({}, '', url)
  }

  function openCompass() {
    setMode('compass')
    setPhase('game_path')
    const url = new URL(window.location.href)
    url.searchParams.delete('play')
    url.searchParams.delete('c')
    window.history.replaceState({}, '', url.toString())
  }

  const answeredCount = useMemo(
    () => QUESTIONS.filter((q) => Boolean(answers[q.id])).length,
    [answers],
  )

  const ranked = useMemo(() => rankNiches(computeScores(answers)), [answers])
  const summary = useMemo(() => buildSummary(ranked, answers), [ranked, answers])
  const question = QUESTIONS[step]
  const progress = ((step + (phase === 'results' ? 1 : 0)) / QUESTIONS.length) * 100
  const canResume = answeredCount > 0 && answeredCount < QUESTIONS.length

  function selectAnswer(optionId: string) {
    if (!question) return
    const nextAnswers = { ...answers, [question.id]: optionId }
    setAnswers(nextAnswers)

    window.setTimeout(() => {
      if (step >= QUESTIONS.length - 1) {
        setPhase('results')
        return
      }
      setStep((value) => value + 1)
    }, 180)
  }

  function startFresh() {
    setAnswers({})
    localStorage.removeItem(STORAGE_KEY)
    setStep(0)
    setPhase('quiz')
  }

  function resume() {
    const firstUnanswered = QUESTIONS.findIndex((q) => !answers[q.id])
    setStep(firstUnanswered === -1 ? QUESTIONS.length - 1 : firstUnanswered)
    setPhase(firstUnanswered === -1 ? 'results' : 'quiz')
  }

  function goResults() {
    if (answeredCount < QUESTIONS.length) return
    setPhase('results')
  }

  if (mode === 'play') {
    return <PulseDuel challenge={challenge} onBackToCompass={openCompass} />
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <p className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-[var(--gold)] sm:text-5xl">
          Компас Ниши
        </p>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_82%,transparent)] sm:text-lg">
          Опросник, который помогает выбрать направление для своего продукта при ~3 часах в
          день — без давления «зарабатывай быстрее всех».
        </p>
        <button
          type="button"
          onClick={() => openPlay(null)}
          className="mt-4 rounded-2xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-105 active:scale-[0.98]"
        >
          Играть в Пульс-дуэль
        </button>
      </header>

      {phase !== 'intro' && (
        <div
          className="mb-6 h-1.5 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--paper)_16%,transparent)]"
          aria-hidden
        >
          <motion.div
            className="h-full rounded-full bg-[var(--gold)]"
            initial={false}
            animate={{ width: `${phase === 'results' ? 100 : progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      )}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.section
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-[28px] border border-[color:color-mix(in_srgb,var(--paper)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--paper)_9%,transparent)] px-5 py-8 shadow-[0_30px_80px_rgba(0,0,0,0.25)] backdrop-blur-md sm:px-8 sm:py-10"
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--glow)] blur-2xl"
                aria-hidden
              />
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--paper)] sm:text-4xl">
                Найдём нишу, которая тебе ближе — не ту, что сейчас в тренде
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_78%,transparent)] sm:text-base">
                12 коротких вопросов. На выходе — рейтинг направлений (игра, Telegram,
                B2B-инструмент и др.), честные риски и первый шаг. Учитываем, что свой продукт
                важнее мгновенных денег, а мобильная игра — один из кандидатов.
              </p>

              <ul className="mt-6 grid gap-3 text-sm text-[color:color-mix(in_srgb,var(--paper)_88%,transparent)] sm:grid-cols-3">
                <li className="rounded-2xl bg-[color:color-mix(in_srgb,var(--moss)_55%,black)] px-4 py-3">
                  ~8–10 минут
                </li>
                <li className="rounded-2xl bg-[color:color-mix(in_srgb,var(--moss)_55%,black)] px-4 py-3">
                  Ответы сохраняются локально
                </li>
                <li className="rounded-2xl bg-[color:color-mix(in_srgb,var(--moss)_55%,black)] px-4 py-3">
                  Учёт лимита 3 ч/день
                </li>
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={startFresh}
                  className="rounded-2xl bg-[var(--gold)] px-6 py-3.5 text-base font-semibold text-[var(--ink)] transition hover:brightness-105 active:scale-[0.98]"
                >
                  Пройти опрос
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('game_path')}
                  className="rounded-2xl border border-[color:color-mix(in_srgb,var(--gold)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--gold)_12%,transparent)] px-6 py-3.5 text-base font-semibold text-[var(--gold)] transition hover:bg-[color:color-mix(in_srgb,var(--gold)_18%,transparent)] active:scale-[0.98]"
                >
                  Игра победила → механика
                </button>
                {canResume && (
                  <button
                    type="button"
                    onClick={resume}
                    className="rounded-2xl border border-[color:color-mix(in_srgb,var(--paper)_28%,transparent)] bg-transparent px-6 py-3.5 text-base font-semibold text-[var(--paper)] transition hover:bg-[color:color-mix(in_srgb,var(--paper)_8%,transparent)] active:scale-[0.98]"
                  >
                    Продолжить ({answeredCount}/{QUESTIONS.length})
                  </button>
                )}
                {answeredCount === QUESTIONS.length && (
                  <button
                    type="button"
                    onClick={goResults}
                    className="rounded-2xl border border-[color:color-mix(in_srgb,var(--paper)_28%,transparent)] bg-transparent px-6 py-3.5 text-base font-semibold text-[var(--paper)] transition hover:bg-[color:color-mix(in_srgb,var(--paper)_8%,transparent)] active:scale-[0.98]"
                  >
                    Смотреть результат
                  </button>
                )}
              </div>
            </motion.section>
          )}

          {phase === 'quiz' && question && (
            <motion.section
              key={question.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28 }}
              className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--paper)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--paper)_9%,transparent)] px-5 py-7 backdrop-blur-md sm:px-8 sm:py-9"
            >
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--sky)]">
                Вопрос {step + 1} из {QUESTIONS.length}
              </p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold leading-snug text-[var(--paper)] sm:text-3xl">
                {question.title}
              </h2>
              {question.subtitle && (
                <p className="mt-3 text-[15px] leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_72%,transparent)]">
                  {question.subtitle}
                </p>
              )}

              <div className="mt-7 grid gap-3">
                {question.options.map((option, index) => {
                  const selected = answers[question.id] === option.id
                  return (
                    <motion.button
                      key={option.id}
                      type="button"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * index, duration: 0.25 }}
                      onClick={() => selectAnswer(option.id)}
                      className={[
                        'group w-full rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99] sm:px-5',
                        selected
                          ? 'border-[var(--gold)] bg-[color:color-mix(in_srgb,var(--gold)_18%,transparent)]'
                          : 'border-[color:color-mix(in_srgb,var(--paper)_16%,transparent)] bg-[color:color-mix(in_srgb,var(--moss)_40%,black)] hover:border-[color:color-mix(in_srgb,var(--gold)_55%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--gold)_10%,transparent)]',
                      ].join(' ')}
                    >
                      <span className="block text-base font-semibold text-[var(--paper)]">
                        {option.label}
                      </span>
                      {option.hint && (
                        <span className="mt-1 block text-sm text-[color:color-mix(in_srgb,var(--paper)_62%,transparent)]">
                          {option.hint}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (step === 0) {
                      setPhase('intro')
                      return
                    }
                    setStep((value) => value - 1)
                  }}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-[color:color-mix(in_srgb,var(--paper)_70%,transparent)] transition hover:text-[var(--paper)]"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => setPhase('intro')}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-[color:color-mix(in_srgb,var(--paper)_70%,transparent)] transition hover:text-[var(--paper)]"
                >
                  На старт
                </button>
              </div>
            </motion.section>
          )}

          {phase === 'results' && (
            <motion.section
              key="results"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-5"
            >
              <div className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--paper)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--paper)_9%,transparent)] px-5 py-7 backdrop-blur-md sm:px-8 sm:py-9">
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--sky)]">
                  Твой результат
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--paper)] sm:text-4xl">
                  {ranked[0]?.niche.title ?? 'Нужно больше ответов'}
                </h2>
                <p className="mt-2 text-[var(--gold)]">{ranked[0]?.niche.subtitle}</p>
                <p className="mt-5 text-[15px] leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_82%,transparent)] sm:text-base">
                  {summary}
                </p>
              </div>

              <div className="space-y-3">
                {ranked.map((item, index) => (
                  <motion.article
                    key={item.niche.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="rounded-3xl border border-[color:color-mix(in_srgb,var(--paper)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--moss)_50%,black)] px-5 py-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--sky)]">
                          #{index + 1}
                        </p>
                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--paper)]">
                          {item.niche.title}
                        </h3>
                        <p className="mt-1 text-sm text-[color:color-mix(in_srgb,var(--paper)_68%,transparent)]">
                          {item.niche.fitLabel}
                        </p>
                      </div>
                      <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--gold)]">
                        {item.percent}%
                      </p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--paper)_12%,transparent)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,var(--leaf),var(--gold))]"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>

                    {index === 0 && (
                      <div className="mt-5 grid gap-4 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_84%,transparent)] sm:grid-cols-3">
                        <div>
                          <p className="font-semibold text-[var(--gold)]">Почему это близко</p>
                          <ul className="mt-2 space-y-1.5">
                            {item.niche.why.map((line: string) => (
                              <li key={line}>• {line}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--coral)]">На что смотреть</p>
                          <ul className="mt-2 space-y-1.5">
                            {item.niche.watchouts.map((line: string) => (
                              <li key={line}>• {line}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--sky)]">Первый шаг</p>
                          <p className="mt-2">{item.niche.firstStep}</p>
                          <p className="mt-3 text-[color:color-mix(in_srgb,var(--paper)_70%,transparent)]">
                            {item.niche.hoursFit}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.article>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => setPhase('game_path')}
                  className="rounded-2xl bg-[var(--gold)] px-6 py-3.5 text-base font-semibold text-[var(--ink)] transition hover:brightness-105 active:scale-[0.98]"
                >
                  Дальше: выбрать механику
                </button>
                <button
                  type="button"
                  onClick={startFresh}
                  className="rounded-2xl border border-[color:color-mix(in_srgb,var(--paper)_28%,transparent)] px-6 py-3.5 text-base font-semibold text-[var(--paper)] transition hover:bg-[color:color-mix(in_srgb,var(--paper)_8%,transparent)] active:scale-[0.98]"
                >
                  Пройти ещё раз
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep(0)
                    setPhase('quiz')
                  }}
                  className="rounded-2xl border border-[color:color-mix(in_srgb,var(--paper)_28%,transparent)] px-6 py-3.5 text-base font-semibold text-[var(--paper)] transition hover:bg-[color:color-mix(in_srgb,var(--paper)_8%,transparent)] active:scale-[0.98]"
                >
                  Пересмотреть ответы
                </button>
              </div>
            </motion.section>
          )}

          {phase === 'game_path' && (
            <GamePath
              selectedId={mechanicId}
              onSelect={setMechanicId}
              onPlay={() => openPlay(null)}
              onBack={() => setPhase(answeredCount === QUESTIONS.length ? 'results' : 'intro')}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-10 text-sm text-[color:color-mix(in_srgb,var(--paper)_48%,transparent)]">
        Игра — да. Дальше важнее узкий прототип, чем большой продакшен.
      </footer>
    </div>
  )
}
