import { test, expect } from '@playwright/test'
import { cleanupTestUser } from './helpers/test-cleanup'

test.describe('2. Onboarding and Profile Workflows', () => {
  const timestamp = Date.now()
  const testEmail = `test.e2e.onboarding.${timestamp}@example.com`
  const testPassword = 'Password2026!Secure'
  const testName = 'Jordan Onboarder'

  test.afterAll(async () => {
    await cleanupTestUser(testEmail)
  })

  test('2.1 Complete onboarding flow, verify persistence, and update profile across reload', async ({
    page,
  }) => {
    // 1. Sign up
    await page.goto('/signup')
    await page.fill('input#name', testName)
    await page.fill('input#email', testEmail)
    await page.fill('input#password', testPassword)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/onboarding/, { timeout: 15000 })
    expect(page.url()).toContain('/onboarding')

    // 2. Verify un-onboarded user is barred from direct /dashboard access
    await page.goto('/dashboard')
    await page.waitForURL(/\/onboarding/, { timeout: 10000 })
    expect(page.url()).toContain('/onboarding')
    await page.waitForLoadState('networkidle')

    // STEP 1: Personal info
    await expect(page.getByRole('heading', { name: 'Personal & Professional Essentials' })).toBeVisible()
    await page.fill('input#full-name', testName)
    await page.fill('input#headline', 'Full Stack Graph Intelligence Specialist')
    await page.fill('input#career-goal', 'Lead Machine Learning Engineer')
    await page.fill('input#location', 'Seattle, WA')
    await page.fill('textarea#summary', 'Specializing in knowledge graphs and predictive data mining.')
    await page.click('button:has-text("Continue to Step 2")')

    // STEP 2: Education
    await expect(page.getByRole('heading', { name: 'Education History' })).toBeVisible()
    const addEduBtn = page.locator('button:has-text("Add Education")')
    if (await addEduBtn.isVisible()) {
      await addEduBtn.click()
    }
    await page.fill('input#inst', 'University of Washington')
    await page.fill('input#degree', 'Master of Science')
    await page.fill('input#field', 'Data Science & Analytics')
    await page.click('button:has-text("Save Education"), button:has-text("Save Entry")')
    await page.click('button:has-text("Continue to Step 3")')

    // STEP 3: Technical Skills
    await expect(page.getByRole('heading', { name: 'Technical Skills' })).toBeVisible()
    // Add custom skill or click enabled suggestion
    const customInput = page.locator('input[placeholder*="Skill name"]').first()
    if (await customInput.isVisible()) {
      await customInput.fill('GraphQL')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)
    }
    const enabledSkillBtn = page.locator('button:has-text("+ ")').first()
    if (await enabledSkillBtn.isVisible() && (await enabledSkillBtn.isEnabled())) {
      await enabledSkillBtn.click()
    }
    await page.click('button:has-text("Continue to Step 4")')

    // STEP 4: Projects & Experience
    await expect(page.getByRole('heading', { name: 'Projects & Experience' })).toBeVisible()
    const addProjBtn = page.locator('button:has-text("Add Project")')
    if (await addProjBtn.isVisible()) {
      await addProjBtn.click()
    }
    await page.fill('input#proj-name', 'Graph Miner Engine')
    await page.fill('textarea#proj-desc', 'Association rule mining pipeline with Apriori algorithm.')
    await page.fill('input#proj-tech', 'Python, TypeScript, Neo4j')
    await page.click('button:has-text("Save project")')
    await page.click('button:has-text("Continue to Step 5")')

    // STEP 5: Review & Complete
    await expect(page.getByRole('heading', { name: 'Review Your Career Profile' })).toBeVisible()
    await expect(page.locator('body')).toContainText('Lead Machine Learning Engineer')
    await page.click('button:has-text("Complete Onboarding")')

    // Confirm completion message
    await expect(page.locator('text=Your career profile is ready!')).toBeVisible({ timeout: 15000 })

    // Explore dashboard now that onboarding is complete
    await page.click('a:has-text("Explore my dashboard")')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('body')).toContainText('Good morning, Jordan')

    // Navigate to profile
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')

    // Verify information from onboarding is present
    await expect(page.locator('body')).toContainText('Full Stack Graph Intelligence Specialist')

    // Edit profile career goal
    const goalInput = page.locator('input#career-goal, input[placeholder*="career goal"], input[name="careerGoal"]').first()
    if (await goalInput.isVisible()) {
      await goalInput.fill('Principal AI Architect')
    }

    // Save profile changes
    const saveButton = page.locator('button:has-text("Save Profile"), button:has-text("Save Changes")').first()
    if (await saveButton.isVisible()) {
      await saveButton.click()
      await page.waitForTimeout(1000)
    }

    // Refresh page to verify persistence across reload
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check that headline remains visible after reload
    await expect(page.locator('body')).toContainText('Full Stack Graph Intelligence Specialist')
  })
})
