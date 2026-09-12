import type { ChallengePayload } from './types'

const MAX_NAME = 24

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(raw: string): string {
  const padded = raw.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (padded.length % 4)) % 4
  const base64 = padded + '='.repeat(padLength)
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeChallenge(payload: ChallengePayload): string {
  const safeName = payload.name.trim().slice(0, MAX_NAME) || 'Соперник'
  const raw = JSON.stringify({
    v: 1,
    score: Math.max(0, Math.floor(payload.score)),
    name: safeName,
  } satisfies ChallengePayload)
  return toBase64Url(raw)
}

export function decodeChallenge(raw: string | null): ChallengePayload | null {
  if (!raw) return null
  try {
    const json = fromBase64Url(raw)
    const data = JSON.parse(json) as Partial<ChallengePayload>
    if (data.v !== 1 || typeof data.score !== 'number' || !Number.isFinite(data.score)) {
      return null
    }
    return {
      v: 1,
      score: Math.max(0, Math.floor(data.score)),
      name:
        typeof data.name === 'string' && data.name.trim()
          ? data.name.trim().slice(0, MAX_NAME)
          : 'Соперник',
    }
  } catch {
    return null
  }
}

export function buildPlayUrl(challenge?: ChallengePayload): string {
  const url = new URL(window.location.href)
  url.searchParams.set('play', '1')
  if (challenge) {
    url.searchParams.set('c', encodeChallenge(challenge))
  } else {
    url.searchParams.delete('c')
  }
  url.hash = ''
  return url.toString()
}

export function readPlayMode(): { play: boolean; challenge: ChallengePayload | null } {
  const params = new URLSearchParams(window.location.search)
  return {
    play: params.get('play') === '1',
    challenge: decodeChallenge(params.get('c')),
  }
}
