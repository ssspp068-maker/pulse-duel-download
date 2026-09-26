let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    ctx = new Ctx()
  }
  return ctx
}

function beep(freq: number, duration: number, gain = 0.08, type: OscillatorType = 'sine') {
  const audio = getCtx()
  if (!audio) return
  if (audio.state === 'suspended') void audio.resume()

  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(audio.destination)
  const t = audio.currentTime
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.start(t)
  osc.stop(t + duration)
}

export function playHitSound(quality: 'perfect' | 'good' | 'miss') {
  switch (quality) {
    case 'perfect':
      beep(880, 0.08, 0.1, 'triangle')
      window.setTimeout(() => beep(1320, 0.06, 0.07, 'triangle'), 40)
      break
    case 'good':
      beep(520, 0.07, 0.07)
      break
    case 'miss':
      beep(140, 0.2, 0.12, 'sawtooth')
      break
    default: {
      const _exhaustive: never = quality
      return _exhaustive
    }
  }
}

export function playStartSound() {
  beep(440, 0.06, 0.06)
  window.setTimeout(() => beep(660, 0.08, 0.08), 70)
}
