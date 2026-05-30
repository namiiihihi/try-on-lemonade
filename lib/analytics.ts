// Analytics helper — browser-only, uses sessionStorage for session persistence

import type { TryOnEvent } from './supabase'

export type EventType = TryOnEvent['event_type']

export type EventPayload = {
  session_id: string
  product_id: string
  event_type: EventType
}

export function getOrCreateSessionId(): string {
  const KEY = 'lemonade_session_id'
  const existing = sessionStorage.getItem(KEY)
  if (existing) return existing

  // crypto.randomUUID is available in all modern browsers (HTTPS or localhost)
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  sessionStorage.setItem(KEY, id)
  return id
}

export async function trackEvent(payload: EventPayload): Promise<void> {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // Silent fail — analytics must never break the user experience
  }
}
