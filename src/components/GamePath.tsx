import { AnimatePresence, motion } from 'framer-motion'
import { GAME_MECHANICS, PLATFORM_DECISION, type GameMechanic } from '../data/gamePath'

interface GamePathProps {
  onBack: () => void
  onPlay: () => void
  selectedId: string | null
  onSelect: (id: string) => void
}

export function GamePath({ onBack, onPlay, selectedId, onSelect }: GamePathProps) {
  const selected: GameMechanic | undefined = GAME_MECHANICS.find((item) => item.id === selectedId)

  return (
    <motion.section
      key="game-path"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      <div className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--paper)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--paper)_9%,transparent)] px-5 py-7 backdrop-blur-md sm:px-8 sm:py-9">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--sky)]">
          Игра зафиксирована
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--paper)] sm:text-4xl">
          Не «большая мобильная игра», а один прототип
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_82%,transparent)] sm:text-base">
          Стартовая платформа: <span className="text-[var(--gold)]">{PLATFORM_DECISION.primary}</span>.
          {PLATFORM_DECISION.reason} Потом: {PLATFORM_DECISION.later}.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--paper)]">
          Выбери одну механику
        </h3>
        {GAME_MECHANICS.map((mechanic, index) => {
          const active = selectedId === mechanic.id
          return (
            <motion.button
              key={mechanic.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index }}
              onClick={() => onSelect(mechanic.id)}
              className={[
                'w-full rounded-3xl border px-5 py-5 text-left transition active:scale-[0.99]',
                active
                  ? 'border-[var(--gold)] bg-[color:color-mix(in_srgb,var(--gold)_16%,transparent)]'
                  : 'border-[color:color-mix(in_srgb,var(--paper)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--moss)_50%,black)] hover:border-[color:color-mix(in_srgb,var(--gold)_50%,transparent)]',
              ].join(' ')}
            >
              <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--paper)]">
                {mechanic.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_78%,transparent)]">
                {mechanic.pitch}
              </p>
              <p className="mt-2 text-sm text-[var(--sky)]">{mechanic.whyFit}</p>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--moss)_58%,black)] px-5 py-6 sm:px-7"
          >
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-[var(--gold)]">
              Твой 2-недельный эксперимент
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--paper)]">
              {selected.title}
            </h3>

            <div className="mt-5 grid gap-5 text-sm leading-relaxed text-[color:color-mix(in_srgb,var(--paper)_86%,transparent)] sm:grid-cols-3">
              <div>
                <p className="font-semibold text-[var(--gold)]">MVP</p>
                <ul className="mt-2 space-y-1.5">
                  {selected.mvp.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--coral)]">Не делать сейчас</p>
                <ul className="mt-2 space-y-1.5">
                  {selected.avoid.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--sky)]">Критерий успеха</p>
                <p className="mt-2">{selected.validate}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="font-semibold text-[var(--paper)]">План на 14 дней</p>
              <ol className="mt-2 space-y-1.5 text-sm text-[color:color-mix(in_srgb,var(--paper)_82%,transparent)]">
                {selected.weekPlan.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>

            <p className="mt-5 rounded-2xl bg-[color:color-mix(in_srgb,var(--gold)_12%,transparent)] px-4 py-3 text-sm text-[var(--paper)]">
              Прототип уже собран: timing + вызов другу по ссылке. Жми «Играть прототип».
            </p>
            <button
              type="button"
              onClick={onPlay}
              className="mt-4 rounded-2xl bg-[var(--gold)] px-6 py-3.5 text-base font-semibold text-[var(--ink)] transition hover:brightness-105 active:scale-[0.98]"
            >
              Играть прототип
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onPlay}
          className="rounded-2xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:brightness-105 active:scale-[0.98]"
        >
          Играть Пульс-дуэль
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl px-3 py-2 text-sm font-medium text-[color:color-mix(in_srgb,var(--paper)_70%,transparent)] transition hover:text-[var(--paper)]"
        >
          Назад к результату опроса
        </button>
      </div>
    </motion.section>
  )
}
