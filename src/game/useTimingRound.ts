import { useCallback, useEffect, useRef, useState } from 'react'
import { playHitSound } from './sounds'
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
  phase: 'idle' | 'countdown' | 'running' | 'ended'
  angle: number
  zoneCenter: number
  zoneWidth: number
  speed: number
  stats: RoundStats
  lastHit: HitQuality | null
  lastGain: number
  flash: number
  shake: number
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
    lastGain: 0,
    flash: 0,
    shake: 0,
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
        shake: Math.max(0, prev.shake - dt * 2.5),
      }
    })

    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop])

  const beginRunning = useCallback(() => {
    stopLoop()
    const next: TimingState = {
      ...createIdleState(),
      phase: 'running',
      zoneWidth: 0.82,
      zoneCenter: Math.random() * TWO_PI,
    }
    stateRef.current = next
    setState(next)
    rafRef.current = requestAnimationFrame(tick)
  }, [stopLoop, tick])

  const start = useCallback(() => {
    stopLoop()
    setState({
      ...createIdleState(),
      phase: 'countdown',
    })
  }, [stopLoop])

  const hit = useCallback(() => {
    const current = stateRef.current
    if (current.phase !== 'running') return
    // ignore taps during countdown / idle ended handled by UI

    const dist = angleDistance(current.angle, current.zoneCenter)
    const half = current.zoneWidth / 2
    const perfectHalf = half * 0.28

    let quality: HitQuality
    if (dist <= perfectHalf) quality = 'perfect'
    else if (dist <= half) quality = 'good'
    else quality = 'miss'

    playHitSound(quality)

    if (quality === 'miss') {
      stopLoop()
      setState((prev) => ({
        ...prev,
        phase: 'ended',
        lastHit: 'miss',
        lastGain: 0,
        flash: 1,
        shake: 1,
        stats: {
          ...prev.stats,
          streak: 0,
        },
      }))
      return
    }

    const streak = current.stats.streak + 1
    const base = quality === 'perfect' ? 140 : 75
    const warmup = current.stats.hits < 3 ? 1.15 : 1
    const gained = Math.round(base * warmup * (1 + streak * 0.14))
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
      lastGain: gained,
      flash: 1,
      shake: 0,
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

  return {
    state,
    start,
    beginRunning,
    hit,
    reset: () => {
      stopLoop()
      setState(createIdleState())
    },
  }
}
