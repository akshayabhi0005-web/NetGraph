import { test, expect } from '@playwright/test'
import { cleanupTestUser } from './helpers/test-cleanup'

test.describe('4. Data Mining and Analytics Workflows', () => {
  const timestamp = Date.now()
  const testEmail = `test.e2e.mining.${timestamp}@example.com`
  const password = 'Password2026!Secure'
  const name = 'Mining Analyst'

  test.afterAll(async () => {
    await cleanupTestUser(testEmail)
  })

  test('4.1 Complete data mining journey across Dashboard, Analytics, Skills, Career, and Graph', async ({
    page,
  }) => {
    // 1. Sign up user
    await page.goto('/signup')
    await page.fill('input#name', name)
    await page.fill('input#email', testEmail)
    await page.fill('input#password', password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 15000 })

    // Onboarding setup
    if (page.url().includes('/onboarding')) {
      await page.fill('input#full-name', name)
      await page.fill('input#headline', 'Graph & Data Mining Specialist')
      await page.click('button:has-text("Continue to Step 2")')

      // Step 2 Education
      const addEduBtn = page.locator('button:has-text("Add Education")')
      if (await addEduBtn.isVisible()) await addEduBtn.click()
      await page.fill('input#inst', 'Stanford University')
      await page.fill('input#degree', 'B.S.')
      await page.fill('input#field', 'Computer Science')
      await page.click('button:has-text("Save Education"), button:has-text("Save Entry")')
      await page.click('button:has-text("Continue to Step 3")')

      // Step 3 Skills
      const customInput = page.locator('input[placeholder*="Skill name"]').first()
      if (await customInput.isVisible()) {
        await customInput.fill('Python')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(300)
      }
      const enabledSkill = page.locator('button:has-text("+ ")').first()
      if (await enabledSkill.isVisible() && (await enabledSkill.isEnabled())) {
        await enabledSkill.click()
      }
      await page.click('button:has-text("Continue to Step 4")')

      // Step 4 Project
      const addProj = page.locator('button:has-text("Add Project")')
      if (await addProj.isVisible()) await addProj.click()
      await page.fill('input#proj-name', 'Apriori Graph Engine')
      await page.fill('textarea#proj-desc', 'Mining association rules across large scale network graphs.')
      await page.click('button:has-text("Save project")')
      await page.click('button:has-text("Continue to Step 5")')

      // Step 5 Complete
      await page.click('button:has-text("Complete Onboarding")')
      await page.waitForTimeout(1000)
    }

    // 2. Test Dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/Dashboard|Workspace|Overview|Analytics|Skills/i)

    // 3. Test Analytics
    await page.goto('/analytics')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/Analytics|Skill Distribution|Profile Intelligence/i)

    // 4. Test Skills inventory
    await page.goto('/skills')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/Skills|Competencies/i)

    // 5. Test Career Recommendations
    await page.goto('/career')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/Career|Match|Pathway|Target/i)

    // 6. Test Career Comparison
    await page.goto('/career/compare')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/Compare|Role|Requirements/i)

    // 7. Test Relationship Graph
    await page.goto('/graph')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Explore your relationship graph')).toBeVisible()
    const graphContainer = page.locator('canvas, svg, div[data-graph-container]').first()
    await expect(graphContainer).toBeVisible({ timeout: 10000 })
  })
})
