import { test, expect } from '@playwright/test'

test.describe('8. Visual and Responsive Regression Checks', () => {
  test('8.1 Homepage renders hero heading, 3D graph canvas, and feature cards', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Confirm strict heading preservation
    await expect(page.locator('h1')).toContainText('Find the thread between what you know and what')

    // Confirm 3D WebGL canvas is mounted
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible({ timeout: 15000 })

    // Confirm feature cards section
    const featureHeading = page.locator('text=Your career is a network, not a checklist.')
    await expect(featureHeading).toBeVisible()

    // Capture desktop screenshot
    await page.screenshot({ path: 'e2e/screenshots/homepage-desktop.png', fullPage: false })
  })

  test('8.2 Desktop viewport has no horizontal overflow and clean layout', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('8.3 Mobile viewport has responsive navigation and no horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check no horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    expect(hasHorizontalScroll).toBe(false)

    // Check mobile hamburger menu button
    const menuBtn = page.locator('button[aria-label="Toggle navigation"]')
    await expect(menuBtn).toBeVisible()

    // Toggle menu
    await menuBtn.click()
    await expect(page.locator('nav a[href="#features"]:visible').first()).toBeVisible()

    // Capture mobile screenshot
    await page.screenshot({ path: 'e2e/screenshots/homepage-mobile.png', fullPage: false })
  })

  test('8.4 Authentication pages render clean responsive forms', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Welcome back')
    await page.screenshot({ path: 'e2e/screenshots/login-page.png' })

    await page.goto('/signup')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toContainText('Create your profile')
    await page.screenshot({ path: 'e2e/screenshots/signup-page.png' })
  })
})
