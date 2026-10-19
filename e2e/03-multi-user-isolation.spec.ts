import { test, expect } from '@playwright/test'
import { cleanupTestUser } from './helpers/test-cleanup'

test.describe('3. Multi-User and Database Isolation Workflows', () => {
  const timestamp = Date.now()
  const userAEmail = `test.e2e.usera.${timestamp}@example.com`
  const userBEmail = `test.e2e.userb.${timestamp}@example.com`
  const password = 'Password2026!Secure'

  test.afterAll(async () => {
    await cleanupTestUser(userAEmail)
    await cleanupTestUser(userBEmail)
  })

  test('3.1 Verify multi-user isolation between User A and User B across sessions', async ({ page }) => {
    // 1. Register User A and set headline in onboarding
    await page.goto('/signup')
    await page.fill('input#name', 'User Alpha')
    await page.fill('input#email', userAEmail)
    await page.fill('input#password', password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })
    if (page.url().includes('/dashboard')) {
      await page.goto('/onboarding')
    }
    await page.waitForLoadState('networkidle')

    // Onboarding Step 1 for User A
    await page.fill('input#full-name', 'User Alpha')
    await page.fill('input#headline', 'Alpha Exclusive Engineer')
    
    // Wait for the server persistence to complete
    const [putResponseA] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/profile') && r.request().method() === 'PUT'),
      page.click('button:has-text("Continue to Step 2")'),
    ])
    expect(putResponseA.status()).toBe(200)
    await page.waitForTimeout(500)

    // Go to profile and verify headline is present
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText('Alpha Exclusive Engineer')

    // Log out User A
    await page.request.post('/api/auth/logout').catch(() => {})
    await page.context().clearCookies()
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // 2. Register User B in fresh session
    await page.goto('/signup')
    await page.fill('input#name', 'User Beta')
    await page.fill('input#email', userBEmail)
    await page.fill('input#password', password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })
    if (page.url().includes('/dashboard')) {
      await page.goto('/onboarding')
    }
    await page.waitForLoadState('networkidle')

    // User B must NOT see User A's headline
    await expect(page.locator('body')).not.toContainText('Alpha Exclusive Engineer')

    // Onboarding Step 1 for User B
    await page.fill('input#full-name', 'User Beta')
    await page.fill('input#headline', 'Beta Distinct Specialist')
    
    const [putResponseB] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/profile') && r.request().method() === 'PUT'),
      page.click('button:has-text("Continue to Step 2")'),
    ])
    expect(putResponseB.status()).toBe(200)
    await page.waitForTimeout(500)

    // Verify User B profile
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText('Beta Distinct Specialist')
    await expect(page.locator('body')).not.toContainText('Alpha Exclusive Engineer')

    // Log out User B
    await page.request.post('/api/auth/logout').catch(() => {})
    await page.context().clearCookies()

    // 3. Log back in as User A
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.fill('input#email', userAEmail)
    await page.fill('input#password', password)
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/(dashboard|profile|onboarding)/, { timeout: 15000 })
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Confirm User A's data is preserved and User B's data is NOT present
    await expect(page.locator('body')).toContainText('Alpha Exclusive Engineer')
    await expect(page.locator('body')).not.toContainText('Beta Distinct Specialist')
  })
})
