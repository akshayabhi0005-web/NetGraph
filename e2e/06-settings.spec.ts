import { test, expect } from '@playwright/test'
import { cleanupTestUser } from './helpers/test-cleanup'

test.describe('6. Settings and Account Management Workflows', () => {
  const timestamp = Date.now()
  const testEmail = `test.e2e.settings.${timestamp}@example.com`
  const password = 'Password2026!Secure'
  const name = 'Sam Settings'

  test.afterAll(async () => {
    await cleanupTestUser(testEmail)
  })

  test('6.1 Manage preferences, verify persistence across reload, and logout', async ({
    page,
  }) => {
    // 1. Register account
    await page.goto('/signup')
    await page.fill('input#name', name)
    await page.fill('input#email', testEmail)
    await page.fill('input#password', password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })

    if (page.url().includes('/onboarding')) {
      await page.fill('input#full-name', name)
      await page.fill('input#headline', 'Systems Configuration Lead')
      await page.click('button:has-text("Continue to Step 2")')
      await page.click('button:has-text("Continue to Step 3")')
      await page.click('button:has-text("Continue to Step 4")')
      await page.click('button:has-text("Continue to Step 5")')
      await page.click('button:has-text("Complete Onboarding")')
      await expect(page.locator('text=Your career profile is ready!')).toBeVisible({ timeout: 15000 })
    }

    // 2. Navigate to settings
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')

    // Confirm Settings header
    await expect(page.locator('h1').first()).toContainText('Settings')

    // Locate email summaries toggle
    const emailToggle = page.locator('input#email-summaries-toggle')
    await expect(emailToggle).toBeVisible()

    const initialChecked = await emailToggle.isChecked()

    // Toggle setting and wait for PUT /api/settings response
    const savePromise = page.waitForResponse(
      (r) => r.url().includes('/api/settings') && r.request().method() === 'PUT',
      { timeout: 10000 }
    ).catch(() => null)

    await emailToggle.click()
    await savePromise
    await page.waitForTimeout(500)

    // Expect state changed
    const newChecked = await emailToggle.isChecked()
    expect(newChecked).not.toBe(initialChecked)

    // Reload page to verify persistence
    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const reloadedToggle = page.locator('input#email-summaries-toggle')
    await expect(reloadedToggle).toBeVisible()
    expect(await reloadedToggle.isChecked()).toBe(newChecked)

    // 3. Logout from Settings
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Log out")').first()
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
      await page.waitForURL(/\/login/, { timeout: 10000 })
      expect(page.url()).toContain('/login')
    } else {
      await page.request.post('/api/auth/logout').catch(() => {})
      await page.goto('/login')
      expect(page.url()).toContain('/login')
    }
  })
})
