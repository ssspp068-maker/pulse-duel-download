const KEY = 'pulse-best-v1'

export function readBestScore(): number {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return 0
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) ? Math.max(0, n) : 0
  } catch {
    return 0
  }
}

export function writeBestScore(score: number): number {
  const prev = readBestScore()
  const next = Math.max(prev, score)
  if (next > prev) localStorage.setItem(KEY, String(next))
  return next
}
