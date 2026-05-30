import { test, expect } from '@playwright/test'

test.describe('Try-On — happy path', () => {
  test.beforeEach(async ({ page }) => {
    // Provide a fake camera stream so tests run without a real webcam
    await page.addInitScript(() => {
      const fakeStream = {
        getTracks: () => [{ stop: () => {} }],
        getVideoTracks: () => [],
      }
      Object.defineProperty(navigator, 'mediaDevices', {
        value: { getUserMedia: () => Promise.resolve(fakeStream as unknown as MediaStream) },
        configurable: true,
      })
    })
  })

  test('color palette renders shade buttons', async ({ page }) => {
    await page.goto('/try-on')
    const shadeBtn = page.locator('button[aria-label]').first()
    await expect(shadeBtn).toBeVisible({ timeout: 15_000 })
  })

  test('clicking a shade marks it as selected (aria-pressed)', async ({ page }) => {
    await page.goto('/try-on')
    const shadeBtn = page.locator('button[aria-label]').first()
    await shadeBtn.click()
    await expect(shadeBtn).toHaveAttribute('aria-pressed', 'true')
  })

  test('AR canvas element is attached to the page', async ({ page }) => {
    await page.goto('/try-on')
    await expect(page.locator('canvas')).toBeAttached({ timeout: 15_000 })
  })
})

test.describe('Try-On — camera denied fallback', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: {
          getUserMedia: () =>
            Promise.reject(
              Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
            ),
        },
        configurable: true,
      })
    })
  })

  test('shows upload file input when camera is denied', async ({ page }) => {
    await page.goto('/try-on')
    await expect(page.locator('input[type="file"]')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('API routes', () => {
  test('GET /api/products returns { data, error } shape', async ({ request }) => {
    const res = await request.get('/api/products')
    const body = await res.json() as Record<string, unknown>
    expect(body).toHaveProperty('data')
    expect(body).toHaveProperty('error')
  })

  test('POST /api/analytics returns 400 for missing fields', async ({ request }) => {
    const res = await request.post('/api/analytics', {
      data: { session_id: 'test-only' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error: string }
    expect(typeof body.error).toBe('string')
  })
})
