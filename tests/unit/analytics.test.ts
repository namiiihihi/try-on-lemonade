import { getOrCreateSessionId, trackEvent } from '@/lib/analytics'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// jsdom does not ship crypto.randomUUID — polyfill it so analytics.ts uses the UUID path
beforeAll(() => {
  if (!crypto.randomUUID) {
    Object.defineProperty(crypto, 'randomUUID', {
      configurable: true,
      writable: true,
      value: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
        }) as `${string}-${string}-${string}-${string}-${string}`
      },
    })
  }
})

describe('getOrCreateSessionId', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns a non-empty string', () => {
    expect(typeof getOrCreateSessionId()).toBe('string')
    expect(getOrCreateSessionId().length).toBeGreaterThan(8)
  })

  it('returns a UUID-format string when crypto.randomUUID is available', () => {
    expect(getOrCreateSessionId()).toMatch(UUID_REGEX)
  })

  it('is idempotent — same value on repeated calls', () => {
    const first = getOrCreateSessionId()
    const second = getOrCreateSessionId()
    expect(second).toBe(first)
  })

  it('persists ID in sessionStorage under "lemonade_session_id"', () => {
    const id = getOrCreateSessionId()
    expect(sessionStorage.getItem('lemonade_session_id')).toBe(id)
  })

  it('generates a fresh ID after sessionStorage is cleared', () => {
    const first = getOrCreateSessionId()
    sessionStorage.clear()
    // After clearing, a new random UUID is generated — probability of collision is negligible
    const second = getOrCreateSessionId()
    expect(second).not.toBe(first)
  })
})

// jsdom does not include the Fetch Response class — mock as plain objects instead
const mockResponse = (status: number) => ({ status, ok: status >= 200 && status < 300 })

describe('trackEvent', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse(201))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('POSTs to /api/analytics with the correct JSON payload', async () => {
    await trackEvent({ session_id: 'sess-1', product_id: 'prod-1', event_type: 'shade_selected' })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/analytics',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ session_id: 'sess-1', product_id: 'prod-1', event_type: 'shade_selected' }),
      })
    )
  })

  it('resolves without throwing when fetch rejects (silent fail)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    await expect(
      trackEvent({ session_id: 'sess-1', product_id: 'prod-1', event_type: 'share' })
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing when server returns 500', async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse(500))
    await expect(
      trackEvent({ session_id: 'sess-1', product_id: 'prod-1', event_type: 'add_to_cart' })
    ).resolves.toBeUndefined()
  })
})
