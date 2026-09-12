export type HitQuality = 'perfect' | 'good' | 'miss'

export interface ChallengePayload {
  score: number
  name: string
  v: 1
}

export interface RoundStats {
  score: number
  streak: number
  bestStreak: number
  hits: number
  perfects: number
}
