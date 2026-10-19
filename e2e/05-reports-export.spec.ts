import { test, expect } from '@playwright/test'
import { cleanupTestUser } from './helpers/test-cleanup'
import fs from 'node:fs'

test.describe('5. Report Generation and File Export Workflows', () => {
  const timestamp = Date.now()
  const testEmail = `test.e2e.reports.${timestamp}@example.com`
  const password = 'Password2026!Secure'
  const name = 'Morgan Reporter'

  test.afterAll(async () => {
    await cleanupTestUser(testEmail)
  })

  test('5.1 Setup authenticated profile with verified data and execute PDF and JSON report exports', async ({
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
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')

    // Step 1: Personal essentials
    await page.fill('input#full-name', name)
    await page.fill('input#headline', 'Senior Graph Mining Engineer')
    await page.fill('input#location', 'Berkeley, CA')
    await page.fill('textarea#summary', 'Specialist in complex network analysis and predictive graph mining.')
    await page.click('button:has-text("Continue to Step 2")')

    // Step 2: Education
    const addEduBtn = page.locator('button:has-text("Add Education")')
    if (await addEduBtn.isVisible()) await addEduBtn.click()
    await page.fill('input#inst', 'UC Berkeley')
    await page.fill('input#degree', 'B.S.')
    await page.fill('input#field', 'EECS')
    await page.click('button:has-text("Save Education"), button:has-text("Save Entry")')
    await page.click('button:has-text("Continue to Step 3")')

    // Step 3: Skills
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

    // Step 4: Project
    const addProj = page.locator('button:has-text("Add Project")')
    if (await addProj.isVisible()) await addProj.click()
    await page.fill('input#proj-name', 'Graph Intelligence Platform')
    await page.fill('textarea#proj-desc', 'Automated graph intelligence and career analysis engine.')
    await page.fill('input#proj-tech', 'Python, TypeScript, Neo4j')
    await page.click('button:has-text("Save project")')
    await page.click('button:has-text("Continue to Step 5")')

    // Step 5: Complete
    await page.click('button:has-text("Complete Onboarding")')
    await expect(page.locator('text=Your career profile is ready!')).toBeVisible({ timeout: 15000 })
    await page.waitForTimeout(2000)

    // 2. Navigate to Reports
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')

    // Confirm Career Intelligence Report heading and metrics
    await expect(page.locator('h1, h2').filter({ hasText: /Report|Intelligence/i }).first()).toBeVisible()

    // Test JSON export download
    const jsonBtn = page.locator('button[title*="JSON"], button:has-text("JSON")').first()
    await expect(jsonBtn).toBeVisible({ timeout: 10000 })

    if (await jsonBtn.isEnabled()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
      await jsonBtn.click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/\.json$/i)
      const downloadPath = await download.path()
      if (downloadPath) {
        const fileContent = fs.readFileSync(downloadPath, 'utf-8')
        const parsed = JSON.parse(fileContent)
        expect(parsed).toHaveProperty('metadata')
        expect(parsed).toHaveProperty('careerMatches')
      }
    }

    // Test PDF export download
    const pdfBtn = page.locator('button:has-text("Download PDF")').first()
    await expect(pdfBtn).toBeVisible({ timeout: 10000 })

    if (await pdfBtn.isEnabled()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 20000 })
      await pdfBtn.click()
      const download = await downloadPromise

      expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
      const downloadPath = await download.path()
      if (downloadPath) {
        const stats = fs.statSync(downloadPath)
        expect(stats.size).toBeGreaterThan(1000)
      }
    }
  })
})
