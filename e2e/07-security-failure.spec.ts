import { test, expect } from '@playwright/test'

test.describe('7. Security and Failure Scenarios', () => {
  test('7.1 Unauthenticated requests to protected pages redirect or protect access', async ({
    page,
  }) => {
    // Clear all cookies
    await page.context().clearCookies()

    // Test protected routes
    const protectedRoutes = ['/dashboard', '/profile', '/settings', '/reports', '/analytics', '/graph']

    for (const route of protectedRoutes) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      // Must either redirect to /login or show authentication required
      const url = page.url()
      const isRedirected = url.includes('/login')
      const hasAuthPrompt = (await page.locator('text=Sign in, text=Log in').count()) > 0
      expect(isRedirected || hasAuthPrompt).toBe(true)
    }
  })

  test('7.2 Non-existent routes render 404 cleanly without server error or stack trace', async ({
    page,
  }) => {
    const res = await page.goto('/non-existent-random-page-netgraph-xyz-999')
    expect(res?.status()).toBe(404)

    // Confirm page does not contain internal stack traces or secrets
    const content = await page.content()
    expect(content).not.toContain('PrismaClient')
    expect(content).not.toContain('DATABASE_URL')
    expect(content).not.toContain('scrypt')
    expect(content).not.toContain('passwordHash')
  })

  test('7.3 Protected API routes reject unauthenticated requests with HTTP 401', async ({
    page,
  }) => {
    await page.context().clearCookies()

    const apiRoutes = ['/api/profile', '/api/analytics', '/api/graph', '/api/settings']

    for (const endpoint of apiRoutes) {
      const res = await page.request.get(endpoint)
      expect(res.status()).toBe(401)
      const json = await res.json()
      expect(json).toHaveProperty('error')
    }
  })

  test('7.4 HTTP Security headers are served on responses', async ({ page }) => {
    const res = await page.goto('/')
    expect(res).not.toBeNull()

    const headers = res!.headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })
})
