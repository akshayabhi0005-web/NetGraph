import { test, expect } from '@playwright/test'
import { cleanupTestUser } from './helpers/test-cleanup'

const PROD_URL = 'https://net-graph.vercel.app'

test.describe('Task 43 — Phase 1: Localhost Complete Onboarding & Verification Flow', () => {
  const timestamp = Date.now()
  const localUserEmail = `test.e2e.task43.local.${timestamp}@example.com`
  const localFailUserEmail = `test.e2e.task43.fail.${timestamp}@example.com`
  const password = 'Password2026!Secure'
  const name = 'Morgan Local'

  test.afterAll(async () => {
    await cleanupTestUser(localUserEmail)
    await cleanupTestUser(localFailUserEmail)
  })

  test('1.1 Complete Localhost User Journey: Registration, Route Guarding, 5-Step Onboarding, Dashboard Access, & Persistence', async ({
    page,
  }) => {
    test.setTimeout(180000)

    // -------------------------------------------------------------------------
    // A. New user registration & redirect to /onboarding
    // -------------------------------------------------------------------------
    await page.goto('/signup')
    await page.fill('input#name', name)
    await page.fill('input#email', localUserEmail)
    await page.fill('input#password', password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    // Confirm redirected to /onboarding and NOT /dashboard
    await page.waitForURL(/\/onboarding/, { timeout: 15000 })
    expect(page.url()).toContain('/onboarding')
    expect(page.url()).not.toContain('/dashboard')

    // -------------------------------------------------------------------------
    // B. Route protection: Confirm user cannot skip onboarding to any feature page
    // -------------------------------------------------------------------------
    const protectedRoutes = [
      '/dashboard',
      '/analytics',
      '/graph',
      '/career',
      '/reports',
      '/profile',
      '/settings',
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      await page.waitForURL(/\/onboarding/, { timeout: 10000 })
      expect(page.url()).toContain('/onboarding')
    }

    // -------------------------------------------------------------------------
    // C. Complete all five onboarding steps with required data
    // -------------------------------------------------------------------------
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')

    // STEP 1: Personal essentials & Career Goal
    await expect(page.getByRole('heading', { name: 'Personal & Professional Essentials' })).toBeVisible()
    await page.fill('input#full-name', name)
    await page.fill('input#headline', 'Lead Knowledge Graph Architect')
    await page.fill('input#career-goal', 'Director of Graph Intelligence')
    await page.fill('input#location', 'Austin, TX')
    await page.fill('textarea#summary', 'Specialist in knowledge graphs, ontologies, and mining.')
    await page.click('button:has-text("Continue to Step 2")')

    // STEP 2: Education
    await expect(page.getByRole('heading', { name: 'Education History' })).toBeVisible()
    const addEduBtn = page.locator('button:has-text("Add Education")')
    if (await addEduBtn.isVisible()) await addEduBtn.click()
    await page.fill('input#inst', 'University of Texas')
    await page.fill('input#degree', 'B.S.')
    await page.fill('input#field', 'Computer Science')
    await page.click('button:has-text("Save Education"), button:has-text("Save Entry")')
    await page.click('button:has-text("Continue to Step 3")')

    // STEP 3: Technical Skills
    await expect(page.getByRole('heading', { name: 'Technical Skills' })).toBeVisible()
    const customSkill = page.locator('input[placeholder*="Skill name"]').first()
    if (await customSkill.isVisible()) {
      await customSkill.fill('Neo4j')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)
    }
    await page.click('button:has-text("Continue to Step 4")')

    // STEP 4: Projects & Experience
    await expect(page.getByRole('heading', { name: 'Projects & Experience' })).toBeVisible()
    const addProj = page.locator('button:has-text("Add Project")')
    if (await addProj.isVisible()) await addProj.click()
    await page.fill('input#proj-name', 'Graph Intelligence Core')
    await page.fill('textarea#proj-desc', 'Apriori and relationship mining system.')
    await page.fill('input#proj-tech', 'Python, TypeScript, Neo4j')
    await page.click('button:has-text("Save project")')
    await page.click('button:has-text("Continue to Step 5")')

    // STEP 5: Review & Complete
    await expect(page.getByRole('heading', { name: 'Review Your Career Profile' })).toBeVisible()
    await expect(page.locator('body')).toContainText('Director of Graph Intelligence')
    await expect(page.locator('body')).toContainText('Lead Knowledge Graph Architect')

    // Submit completion
    await page.click('button:has-text("Complete Onboarding")')
    await expect(page.locator('text=Your career profile is ready!')).toBeVisible({ timeout: 15000 })

    // Explore dashboard now that onboarding is completed
    await page.click('a:has-text("Explore my dashboard")')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('body')).toContainText('Good morning, Morgan')

    // -------------------------------------------------------------------------
    // D. Persistence across reload & re-login
    // -------------------------------------------------------------------------
    // Reload dashboard
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('body')).toContainText('Good morning, Morgan')

    // Verify profile page contains persisted details
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/profile')
    await expect(page.locator('body')).toContainText('Lead Knowledge Graph Architect')

    // Logout
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Log out")')
    await logoutBtn.first().click()
    await page.waitForURL(/\/login/, { timeout: 10000 })

    // -------------------------------------------------------------------------
    // E. Existing user login bypasses onboarding and goes to /dashboard
    // -------------------------------------------------------------------------
    await page.fill('input#email', localUserEmail)
    await page.fill('input#password', password)
    await page.click('button[type="submit"]')

    // Confirm direct access without onboarding redirect
    await page.waitForURL(/\/dashboard|\/settings/, { timeout: 15000 })
    expect(page.url()).not.toContain('/onboarding')

    await page.goto('/dashboard')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('body')).toContainText('Good morning, Morgan')
  })

  test('1.2 Safe Onboarding Save Failure Handling & Error Messaging', async ({ page }) => {
    // Register temporary user for failure simulation
    await page.goto('/signup')
    await page.fill('input#name', 'Failure Test User')
    await page.fill('input#email', localFailUserEmail)
    await page.fill('input#password', password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/onboarding/, { timeout: 15000 })

    // Advance to Step 5
    await page.fill('input#full-name', 'Failure Test User')
    await page.fill('input#headline', 'Simulated Error Engineer')
    await page.click('button:has-text("Continue to Step 2")')
    await page.click('button:has-text("Continue to Step 3")')
    await page.click('button:has-text("Continue to Step 4")')
    await page.click('button:has-text("Continue to Step 5")')
    await expect(page.getByRole('heading', { name: 'Review Your Career Profile' })).toBeVisible()

    // Intercept PUT /api/profile to simulate a safe server error
    await page.route('**/api/profile', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Simulated database transient failure. Profile not saved.',
          }),
        })
      } else {
        await route.continue()
      }
    })

    // Click Complete Onboarding
    await page.click('button:has-text("Complete Onboarding")')

    // Verify clear error message is shown and user is NOT marked completed
    await expect(page.locator('text=Unable to complete onboarding')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('p:has-text("Simulated database transient failure")')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=Your career profile is ready!')).not.toBeVisible()

    // Unroute interception
    await page.unroute('**/api/profile')
  })
})

test.describe('Task 43 — Phase 2: Production Vercel Complete Onboarding & Verification Flow', () => {
  const timestamp = Date.now()
  const prodUserEmail = `test.e2e.task43.prod.${timestamp}@example.com`
  const password = 'Password2026!Secure'
  const name = 'Robin Production'

  test.afterAll(async () => {
    await cleanupTestUser(prodUserEmail)
  })

  test('2.1 Complete Production User Journey: Registration, Route Guarding, 5-Step Onboarding, Dashboard Access, & Persistence', async ({
    page,
  }) => {
    test.setTimeout(180000)

    // -------------------------------------------------------------------------
    // A. Production registration & redirect to /onboarding
    // -------------------------------------------------------------------------
    await page.goto(`${PROD_URL}/signup`)
    await expect(page).toHaveTitle(/NetGraph|Profile/i)

    await page.fill('input#name', name)
    await page.fill('input#email', prodUserEmail)
    await page.fill('input#password', password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    // Confirm production redirects to /onboarding and NOT /dashboard
    await page.waitForURL(/\/onboarding/, { timeout: 20000 })
    expect(page.url()).toContain('/onboarding')
    expect(page.url()).not.toContain('/dashboard')

    // -------------------------------------------------------------------------
    // B. Route protection on production: Un-onboarded user cannot skip to /dashboard or /profile
    // -------------------------------------------------------------------------
    await page.goto(`${PROD_URL}/dashboard`)
    await page.waitForURL(/\/onboarding/, { timeout: 15000 })
    expect(page.url()).toContain('/onboarding')

    await page.goto(`${PROD_URL}/profile`)
    await page.waitForURL(/\/onboarding/, { timeout: 15000 })
    expect(page.url()).toContain('/onboarding')

    // -------------------------------------------------------------------------
    // C. Complete 5-step onboarding on production
    // -------------------------------------------------------------------------
    await page.goto(`${PROD_URL}/onboarding`)
    await page.waitForLoadState('networkidle')

    // Step 1: Personal essentials & Career Goal
    await expect(page.getByRole('heading', { name: 'Personal & Professional Essentials' })).toBeVisible()
    await page.fill('input#full-name', name)
    await page.fill('input#headline', 'Senior Cloud Data Miner')
    await page.fill('input#career-goal', 'Principal Research Scientist')
    await page.fill('input#location', 'San Francisco, CA')
    await page.fill('textarea#summary', 'Production verification specialist for complex graph networks.')
    await page.click('button:has-text("Continue to Step 2")')

    // Step 2: Education
    await expect(page.getByRole('heading', { name: 'Education History' })).toBeVisible()
    const addEduBtn = page.locator('button:has-text("Add Education")')
    if (await addEduBtn.isVisible()) await addEduBtn.click()
    await page.fill('input#inst', 'UC Berkeley')
    await page.fill('input#degree', 'M.S.')
    await page.fill('input#field', 'Data Engineering')
    await page.click('button:has-text("Save Education"), button:has-text("Save Entry")')
    await page.click('button:has-text("Continue to Step 3")')

    // Step 3: Technical Skills
    await expect(page.getByRole('heading', { name: 'Technical Skills' })).toBeVisible()
    const customSkill = page.locator('input[placeholder*="Skill name"]').first()
    if (await customSkill.isVisible()) {
      await customSkill.fill('Python')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)
    }
    await page.click('button:has-text("Continue to Step 4")')

    // Step 4: Projects & Experience
    await expect(page.getByRole('heading', { name: 'Projects & Experience' })).toBeVisible()
    const addProj = page.locator('button:has-text("Add Project")')
    if (await addProj.isVisible()) await addProj.click()
    await page.fill('input#proj-name', 'Production Graph Verification')
    await page.fill('textarea#proj-desc', 'Automated end-to-end testing pipeline for relationship mining.')
    await page.fill('input#proj-tech', 'TypeScript, Next.js, PostgreSQL')
    await page.click('button:has-text("Save project")')
    await page.click('button:has-text("Continue to Step 5")')

    // Step 5: Review & Complete
    await expect(page.getByRole('heading', { name: 'Review Your Career Profile' })).toBeVisible()
    await expect(page.locator('body')).toContainText('Principal Research Scientist')
    await expect(page.locator('body')).toContainText('Senior Cloud Data Miner')

    // Complete Onboarding
    await page.click('button:has-text("Complete Onboarding")')
    await expect(page.locator('text=Your career profile is ready!')).toBeVisible({ timeout: 20000 })

    // Explore dashboard
    await page.click('a:has-text("Explore my dashboard")')
    await page.waitForURL(/\/dashboard/, { timeout: 15000 })
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('body')).toContainText('Good morning, Robin')

    // -------------------------------------------------------------------------
    // D. Production Persistence: Reload, Logout, and Returning Login
    // -------------------------------------------------------------------------
    // Reload dashboard
    await page.reload()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('body')).toContainText('Good morning, Robin')

    // Logout
    await page.goto(`${PROD_URL}/settings`)
    await page.waitForLoadState('networkidle')
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Log out")')
    await logoutBtn.first().click()
    await page.waitForURL(/\/login/, { timeout: 15000 })

    // Log back in as existing completed user
    await page.fill('input#email', prodUserEmail)
    await page.fill('input#password', password)
    await page.click('button[type="submit"]')

    // Confirm direct access without onboarding redirect
    await page.waitForURL(/\/dashboard|\/settings/, { timeout: 15000 })
    expect(page.url()).not.toContain('/onboarding')

    await page.goto(`${PROD_URL}/dashboard`)
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
    await expect(page.locator('body')).toContainText('Good morning, Robin')
  })
})
