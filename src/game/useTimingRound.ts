import { useCallback, useEffect, useRef, useState } from 'react'
import type { HitQuality, RoundStats } from './types'

const TWO_PI = Math.PI * 2

function normalizeAngle(angle: number): number {
  const value = angle % TWO_PI
  return value < 0 ? value + TWO_PI : value
}

function angleDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b))
  return Math.min(diff, TWO_PI - diff)
}

export interface TimingState {
  phase: 'idle' | 'running' | 'ended'
  angle: number
  zoneCenter: number
  zoneWidth: number
  speed: number
  stats: RoundStats
  lastHit: HitQuality | null
  flash: number
}

const INITIAL_STATS: RoundStats = {
  score: 0,
  streak: 0,
  bestStreak: 0,
  hits: 0,
  perfects: 0,
}

function createIdleState(): TimingState {
  return {
    phase: 'idle',
    angle: 0,
    zoneCenter: Math.PI * 1.2,
    zoneWidth: 0.7,
    speed: 2.2,
    stats: { ...INITIAL_STATS },
    lastHit: null,
    flash: 0,
  }
}

export function useTimingRound() {
  const [state, setState] = useState<TimingState>(() => createIdleState())
  const stateRef = useRef(state)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef<number | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    lastTsRef.current = null
  }, [])

  const tick = useCallback((ts: number) => {
    const current = stateRef.current
    if (current.phase !== 'running') {
      stopLoop()
      return
    }

    if (lastTsRef.current === null) lastTsRef.current = ts
    const dt = Math.min(0.033, (ts - lastTsRef.current) / 1000)
    lastTsRef.current = ts

    setState((prev) => {
      if (prev.phase !== 'running') return prev
      return {
        ...prev,
        angle: normalizeAngle(prev.angle + prev.speed * dt),
        flash: Math.max(0, prev.flash - dt * 3),
      }
    })

    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop])

  const start = useCallback(() => {
    stopLoop()
    const next: TimingState = {
      ...createIdleState(),
      phase: 'running',
      zoneCenter: Math.random() * TWO_PI,
    }
    stateRef.current = next
    setState(next)
    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop, tick])

  const hit = useCallback(() => {
    const current = stateRef.current
    if (current.phase !== 'running') return

    const dist = angleDistance(current.angle, current.zoneCenter)
    const half = current.zoneWidth / 2
    const perfectHalf = half * 0.28

    let quality: HitQuality
    if (dist <= perfectHalf) quality = 'perfect'
    else if (dist <= half) quality = 'good'
    else quality = 'miss'

    if (quality === 'miss') {
      stopLoop()
      setState((prev) => ({
        ...prev,
        phase: 'ended',
        lastHit: 'miss',
        flash: 1,
        stats: {
          ...prev.stats,
          streak: 0,
        },
      }))
      return
    }

    const streak = current.stats.streak + 1
    const base = quality === 'perfect' ? 120 : 70
    const gained = Math.round(base * (1 + streak * 0.12))
    const nextWidth = Math.max(0.28, current.zoneWidth - (quality === 'perfect' ? 0.035 : 0.02))
    const nextSpeed = Math.min(5.4, current.speed + (quality === 'perfect' ? 0.14 : 0.09))

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && quality === 'perfect') {
      navigator.vibrate(12)
    }

    setState((prev) => ({
      ...prev,
      zoneCenter: normalizeAngle(prev.zoneCenter + 1.7 + Math.random() * 2.2),
      zoneWidth: nextWidth,
      speed: nextSpeed,
      lastHit: quality,
      flash: 1,
      stats: {
        score: prev.stats.score + gained,
        streak,
        bestStreak: Math.max(prev.stats.bestStreak, streak),
        hits: prev.stats.hits + 1,
        perfects: prev.stats.perfects + (quality === 'perfect' ? 1 : 0),
      },
    }))
  }, [stopLoop])

  useEffect(() => () => stopLoop(), [stopLoop])

  return { state, start, hit, reset: () => {
    stopLoop()
    setState(createIdleState())
  } }
}
