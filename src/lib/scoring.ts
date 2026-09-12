import {
  EMPTY_SCORES,
  NICHES,
  QUESTIONS,
  type AnswerOption,
  type NicheId,
  type NicheProfile,
  type ScoreMap,
} from '../data/quiz'

export interface RankedNiche {
  niche: NicheProfile
  score: number
  percent: number
}

export function computeScores(answers: Record<string, string>): ScoreMap {
  const scores: ScoreMap = { ...EMPTY_SCORES }

  for (const question of QUESTIONS) {
    const answerId = answers[question.id]
    if (!answerId) continue
    const option = question.options.find(
      (item: AnswerOption) => item.id === answerId,
    )
    if (!option) continue
    for (const [nicheId, value] of Object.entries(option.scores) as Array<
      [NicheId, number]
    >) {
      scores[nicheId] += value
    }
  }

  return scores
}

export function rankNiches(scores: ScoreMap): RankedNiche[] {
  const max = Math.max(...(Object.values(scores) as number[]), 1)
  return (Object.keys(scores) as NicheId[])
    .map((id) => ({
      niche: NICHES[id],
      score: scores[id],
      percent: Math.round((scores[id] / max) * 100),
    }))
    .sort((a, b) => b.score - a.score || a.niche.title.localeCompare(b.niche.title, 'ru'))
}

export function buildSummary(ranked: RankedNiche[], answers: Record<string, string>): string {
  const top = ranked[0]
  const second = ranked[1]
  const gameLean = answers.game_lean
  const patience = answers.patience

  if (!top) {
    return 'Ответь на вопросы — и появится персональная рекомендация.'
  }

  const parts: string[] = []
  parts.push(
    `По твоим ответам ближе всего «${top.niche.title}». При ~3 часах в день это реалистичный вектор, если держать узкий scope.`,
  )

  if (second && second.percent >= 75) {
    parts.push(
      `Сильный второй вариант — «${second.niche.title}». Имеет смысл сравнить оба на одном эксперименте на 2 недели.`,
    )
  }

  if (gameLean === 'store_premium' && top.niche.id !== 'mobile_game') {
    parts.push(
      'Тяга к полноценной мобильной игре есть, но остальные ответы тянут в более быстрый продуктовый цикл. Компромисс: Telegram-игра или крошечный прототип на 1 механику.',
    )
  }

  if (patience === 'fast' && top.niche.id === 'mobile_game') {
    parts.push(
      'Осторожно: хочется денег относительно быстро, а мобильная игра обычно медленнее. Стартуй с прототипа/Telegram-версии, не с большого продакшена.',
    )
  }

  return parts.join(' ')
}
