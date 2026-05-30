import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — only creates the client when env vars are present.
// Without Supabase config the app still runs using fallback shade data.
let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  _client = createClient(url, key)
  return _client
}

// Convenience proxy — callers can keep using `supabase.from(...)`.
// Returns a no-op stub when Supabase is not configured so the UI never crashes.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    if (client) return (client as unknown as Record<string | symbol, unknown>)[prop]
    // Stub: .from() → returns { select: () => Promise<{ data: null, error: null }> }
    if (prop === 'from') {
      return () => ({
        select: () => Promise.resolve({ data: null, error: null }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
      })
    }
    return undefined
  },
})

export type Product = {
  id: string
  name: string
  hex: string
  opacity: number
  finish: 'glossy' | 'matte' | 'satin'
  collection: string
  price: number
  image_url: string
  store_url?: string   // variant-specific product page URL
}

export type TryOnEvent = {
  id: string
  session_id: string
  product_id: string
  event_type: 'shade_selected' | 'photo_captured' | 'add_to_cart' | 'share'
  created_at: string
}

export type Session = {
  id: string
  device_type: string
  browser: string
  skin_tone_estimate: string | null
  created_at: string
}
