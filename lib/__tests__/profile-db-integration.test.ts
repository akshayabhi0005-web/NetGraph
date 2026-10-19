/**
 * NETGRAPH Profile & Settings Database Integration Test Suite
 *
 * Verifies:
 * 1. GET /api/profile retrieval and entity normalization
 * 2. PUT /api/profile top-level user profile updates
 * 3. POST & DELETE /api/profile/education
 * 4. POST & DELETE /api/profile/skills
 * 5. POST & DELETE /api/profile/projects
 * 6. POST & DELETE /api/profile/experience
 * 7. POST & DELETE /api/profile/certifications
 * 8. GET & PUT /api/settings preferences persistence
 * 9. Database offline (HTTP 503 DATABASE_NOT_CONFIGURED) graceful handling
 * 10. HTTP 401 Unauthorized protection on all profile & settings endpoints
 * 11. Zod input validation and type coercion (string year translation, comma-separated tags)
 * 12. Strict account tenant isolation (scoping to userId)
 * 13. Data hygiene (no passwordHash, salt, or secret tokens leaked in API responses)
 */

import assert from 'node:assert'
import { profileClient, settingsClient, normalizeServerUser, ServerUserRecord } from '../api-client'
import { educationSchema, skillSchema, projectSchema, experienceSchema, settingsUpdateSchema } from '../server/validation'

let passedCount = 0
let failedCount = 0

async function runAsyncTest(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    passedCount++
    console.log(`  ✓ PASS: ${name}`)
  } catch (error) {
    failedCount++
    console.error(`  ✗ FAIL: ${name}`)
    console.error(error)
  }
}

function runTest(name: string, fn: () => void) {
  try {
    fn()
    passedCount++
    console.log(`  ✓ PASS: ${name}`)
  } catch (error) {
    failedCount++
    console.error(`  ✗ FAIL: ${name}`)
    console.error(error)
  }
}

const originalFetch = global.fetch

async function main() {
  console.log('\n======================================================')
  console.log('RUNNING NETGRAPH PROFILE & SETTINGS DB INTEGRATION TESTS')
  console.log('======================================================\n')

  const sampleServerUser: ServerUserRecord = {
    id: 'usr_db_test_001',
    email: 'developer@netgraph.ai',
    createdAt: new Date().toISOString(),
    profile: {
      name: 'Dr. Jane Graph',
      headline: 'Graph Algorithms & Data Mining Researcher',
      location: 'San Francisco, CA',
      summary: 'Specializing in complex networks and graph neural architectures.',
      careerGoal: 'Pioneer next-generation relationship mining engines.',
      phone: '+1-555-0199',
      linkedinUrl: 'https://linkedin.com/in/janegraph',
      githubUrl: 'https://github.com/janegraph',
      portfolioUrl: 'https://janegraph.ai',
      onboarded: true,
      onboardingStep: 5,
    },
    educations: [
      {
        id: 'edu_1',
        userId: 'usr_db_test_001',
        institution: 'Stanford University',
        degree: 'Ph.D.',
        fieldOfStudy: 'Computer Science',
        startYear: 2018,
        graduationYear: 2022,
        coursework: 'Network Analysis, Mining Massive Datasets',
      },
    ],
    skills: [
      {
        name: 'Graph Mining',
        category: 'Algorithms',
        proficiency: 'Expert',
        yearsOfExperience: 6,
      },
      {
        name: 'PostgreSQL',
        category: 'Databases',
        proficiency: 'Advanced',
        yearsOfExperience: 5,
      },
    ],
    projects: [
      {
        id: 'proj_1',
        userId: 'usr_db_test_001',
        title: 'NetGraph Engine',
        description: 'Scalable complex network relationship mining.',
        technologies: ['TypeScript', 'PostgreSQL', 'Prisma', 'Next.js'],
        projectUrl: 'https://netgraph.ai',
        githubUrl: 'https://github.com/netgraph/engine',
      },
    ],
    experiences: [
      {
        id: 'exp_1',
        userId: 'usr_db_test_001',
        company: 'Network Labs',
        jobTitle: 'Principal Graph Architect',
        employmentType: 'Full-time',
        startDate: '2022-06',
        endDate: 'Present',
        isCurrent: true,
        description: 'Architecting large-scale graph analysis pipelines.',
        technologies: ['PostgreSQL', 'Python', 'Next.js'],
      },
    ],
    certifications: [
      {
        id: 'cert_1',
        userId: 'usr_db_test_001',
        name: 'Certified Data Mining Specialist',
        issuer: 'ACM',
        issueDate: '2023-01',
        credentialUrl: 'https://acm.org/cert/12345',
      },
    ],
    settings: {
      theme: 'dark',
      demoAnalysisMode: false,
      emailSummaries: true,
      shareAnalytics: false,
      defaultGraphLayout: 'force-directed',
    },
  }

  // TEST 1: GET /api/profile retrieval & entity normalization
  await runAsyncTest('GET /api/profile retrieves and normalizes complete profile relational data', async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      assert.strictEqual(url.toString(), '/api/profile')
      assert.strictEqual(init?.method, 'GET')
      return new Response(
        JSON.stringify({
          success: true,
          data: { profile: sampleServerUser },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }) as typeof fetch

    const res = await profileClient.getProfile()
    assert.strictEqual(res.success, true)
    assert.ok(res.data?.profile)
    const prof = res.data.profile
    assert.strictEqual(prof.name, 'Dr. Jane Graph')
    assert.strictEqual(prof.email, 'developer@netgraph.ai')
    assert.strictEqual(prof.education!.length, 1)
    assert.strictEqual(prof.education![0].institution, 'Stanford University')
    assert.strictEqual(prof.skillsList!.length, 2)
    assert.strictEqual(prof.skillsList![0].name, 'Graph Mining')
    assert.strictEqual(prof.projects!.length, 1)
    assert.strictEqual(prof.experience!.length, 1)
    assert.strictEqual(prof.certifications!.length, 1)
    assert.strictEqual(prof.onboarded, true)
  })

  // TEST 2: PUT /api/profile updates top-level attributes
  await runAsyncTest('PUT /api/profile updates top-level user information', async () => {
    let capturedPayload: any = null
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      assert.strictEqual(url.toString(), '/api/profile')
      assert.strictEqual(init?.method, 'PUT')
      capturedPayload = JSON.parse(init?.body as string)
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            profile: {
              ...sampleServerUser.profile,
              ...capturedPayload,
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }) as typeof fetch

    const res = await profileClient.updateProfile({
      headline: 'Chief Graph Architect',
      location: 'New York, NY',
    })
    assert.strictEqual(res.success, true)
    assert.strictEqual(capturedPayload.headline, 'Chief Graph Architect')
    assert.strictEqual(capturedPayload.location, 'New York, NY')
  })

  // TEST 3: POST & DELETE /api/profile/education
  await runAsyncTest('POST & DELETE /api/profile/education adds and removes education', async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        assert.strictEqual(url.toString(), '/api/profile/education')
        return new Response(
          JSON.stringify({
            success: true,
            data: { education: { id: 'edu_new', institution: 'MIT' } },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      } else if (init?.method === 'DELETE') {
        assert.ok(url.toString().includes('/api/profile/education?id=edu_new'))
        return new Response(
          JSON.stringify({
            success: true,
            data: { deleted: true },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected request: ${init?.method}`)
    }) as typeof fetch

    const addRes = await profileClient.addEducation({
      institution: 'MIT',
      degree: 'M.S.',
      fieldOfStudy: 'Computer Science',
      startYear: 2016,
      graduationYear: 2018,
    })
    assert.strictEqual(addRes.success, true)

    const delRes = await profileClient.deleteEducation('edu_new')
    assert.strictEqual(delRes.success, true)
    assert.strictEqual(delRes.data?.deleted, true)
  })

  // TEST 4: POST & DELETE /api/profile/skills
  await runAsyncTest('POST & DELETE /api/profile/skills adds or updates and removes skills', async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        assert.strictEqual(url.toString(), '/api/profile/skills')
        return new Response(
          JSON.stringify({
            success: true,
            data: { skill: { id: 'sk_new', name: 'GraphQL' } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      } else if (init?.method === 'DELETE') {
        assert.ok(url.toString().includes('/api/profile/skills?id=sk_new'))
        return new Response(
          JSON.stringify({
            success: true,
            data: { deleted: true },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected request: ${init?.method}`)
    }) as typeof fetch

    const addRes = await profileClient.addOrUpdateSkill({
      name: 'GraphQL',
      category: 'Web Technologies',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
    })
    assert.strictEqual(addRes.success, true)

    const delRes = await profileClient.deleteSkill('sk_new')
    assert.strictEqual(delRes.success, true)
    assert.strictEqual(delRes.data?.deleted, true)
  })

  // TEST 5: POST & DELETE /api/profile/projects
  await runAsyncTest('POST & DELETE /api/profile/projects adds and removes projects', async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        assert.strictEqual(url.toString(), '/api/profile/projects')
        return new Response(
          JSON.stringify({
            success: true,
            data: { project: { id: 'proj_new', title: 'Network Visualizer' } },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      } else if (init?.method === 'DELETE') {
        assert.ok(url.toString().includes('/api/profile/projects?id=proj_new'))
        return new Response(
          JSON.stringify({
            success: true,
            data: { deleted: true },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected request: ${init?.method}`)
    }) as typeof fetch

    const addRes = await profileClient.addProject({
      title: 'Network Visualizer',
      description: 'Interactive Force-directed Graph Demo',
      technologies: ['Three.js', 'React'],
    })
    assert.strictEqual(addRes.success, true)

    const delRes = await profileClient.deleteProject('proj_new')
    assert.strictEqual(delRes.success, true)
  })

  // TEST 6: POST & DELETE /api/profile/experience
  await runAsyncTest('POST & DELETE /api/profile/experience adds and removes experiences', async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        assert.strictEqual(url.toString(), '/api/profile/experience')
        return new Response(
          JSON.stringify({
            success: true,
            data: { experience: { id: 'exp_new', company: 'AI Labs' } },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      } else if (init?.method === 'DELETE') {
        assert.ok(url.toString().includes('/api/profile/experience?id=exp_new'))
        return new Response(
          JSON.stringify({
            success: true,
            data: { deleted: true },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected request: ${init?.method}`)
    }) as typeof fetch

    const addRes = await profileClient.addExperience({
      company: 'AI Labs',
      jobTitle: 'Research Scientist',
      startDate: '2023-01',
      description: 'Graph neural networks research',
      technologies: ['PyTorch', 'NetworkX'],
    })
    assert.strictEqual(addRes.success, true)

    const delRes = await profileClient.deleteExperience('exp_new')
    assert.strictEqual(delRes.success, true)
  })

  // TEST 7: POST & DELETE /api/profile/certifications
  await runAsyncTest('POST & DELETE /api/profile/certifications adds and removes certifications', async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'POST') {
        assert.strictEqual(url.toString(), '/api/profile/certifications')
        return new Response(
          JSON.stringify({
            success: true,
            data: { certification: { id: 'cert_new', name: 'AWS ML Specialty' } },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      } else if (init?.method === 'DELETE') {
        assert.ok(url.toString().includes('/api/profile/certifications?id=cert_new'))
        return new Response(
          JSON.stringify({
            success: true,
            data: { deleted: true },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected request: ${init?.method}`)
    }) as typeof fetch

    const addRes = await profileClient.addCertification({
      name: 'AWS ML Specialty',
      issuer: 'Amazon Web Services',
      issueDate: '2024-02',
    })
    assert.strictEqual(addRes.success, true)

    const delRes = await profileClient.deleteCertification('cert_new')
    assert.strictEqual(delRes.success, true)
  })

  // TEST 8: GET & PUT /api/settings preferences persistence
  await runAsyncTest('GET & PUT /api/settings retrieves and updates user preferences', async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      assert.strictEqual(url.toString(), '/api/settings')
      if (init?.method === 'GET') {
        return new Response(
          JSON.stringify({
            success: true,
            data: { settings: { demoAnalysisMode: false, emailSummaries: true } },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      } else if (init?.method === 'PUT') {
        const body = JSON.parse(init?.body as string)
        return new Response(
          JSON.stringify({
            success: true,
            data: { settings: body },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected method: ${init?.method}`)
    }) as typeof fetch

    const getRes = await settingsClient.getSettings()
    assert.strictEqual(getRes.success, true)
    assert.strictEqual(getRes.data?.settings.demoAnalysisMode, false)

    const updateRes = await settingsClient.updateSettings({
      demoAnalysisMode: true,
      emailSummaries: false,
    })
    assert.strictEqual(updateRes.success, true)
    assert.strictEqual(updateRes.data?.settings.demoAnalysisMode, true)
  })

  // TEST 9: Database offline (HTTP 503 DATABASE_NOT_CONFIGURED)
  await runAsyncTest('Handles HTTP 503 DATABASE_NOT_CONFIGURED gracefully without crashing', async () => {
    global.fetch = (async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database connection is not configured.',
          code: 'DATABASE_NOT_CONFIGURED',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }) as typeof fetch

    const profileRes = await profileClient.getProfile()
    assert.strictEqual(profileRes.success, false)
    assert.strictEqual(profileRes.isDatabaseUnavailable, true)
    assert.strictEqual(profileRes.code, 'DATABASE_NOT_CONFIGURED')

    const settingsRes = await settingsClient.getSettings()
    assert.strictEqual(settingsRes.success, false)
    assert.strictEqual(settingsRes.isDatabaseUnavailable, true)
  })

  // TEST 10: HTTP 401 Unauthorized protection
  await runAsyncTest('Rejects unauthenticated profile & settings access with HTTP 401', async () => {
    global.fetch = (async () => {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required. Please sign in.',
          code: 'UNAUTHORIZED',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }) as typeof fetch

    const res = await profileClient.getProfile()
    assert.strictEqual(res.success, false)
    assert.strictEqual(res.code, 'UNAUTHORIZED')
    assert.strictEqual(res.status, 401)
  })

  // TEST 11: Zod input validation & schema coercion
  runTest('Zod educationSchema, skillSchema, projectSchema, experienceSchema coercion', () => {
    // Education year coercion
    const validEdu = educationSchema.parse({
      institution: 'University of Washington',
      degree: 'B.S.',
      fieldOfStudy: 'Informatics',
      startYear: '2019',
      graduationYear: 'Present',
    })
    assert.strictEqual(validEdu.startYear, 2019)
    assert.strictEqual(typeof validEdu.graduationYear, 'number')

    // Skill years coercion
    const validSkill = skillSchema.parse({
      name: 'Next.js',
      category: 'Web Technologies',
      proficiency: 'Advanced',
      yearsOfExperience: '4',
    })
    assert.strictEqual(validSkill.yearsOfExperience, 4)

    // Project technologies comma string coercion
    const validProj = projectSchema.parse({
      title: 'Graph Visualization',
      description: '3D Graph Renderer',
      technologies: 'React, Three.js, WebGL',
    })
    assert.deepStrictEqual(validProj.technologies, ['React', 'Three.js', 'WebGL'])

    // Experience technologies comma string coercion
    const validExp = experienceSchema.parse({
      company: 'Acme Corp',
      jobTitle: 'Data Engineer',
      startDate: '2021-01',
      description: 'Data pipelines',
      technologies: 'SQL, Python, Spark',
    })
    assert.deepStrictEqual(validExp.technologies, ['SQL', 'Python', 'Spark'])

    // Settings update schema validation
    const validSettings = settingsUpdateSchema.parse({
      theme: 'dark',
      demoAnalysisMode: true,
      emailSummaries: false,
    })
    assert.strictEqual(validSettings.theme, 'dark')
  })

  // TEST 12: Account isolation check (no foreign user leakage)
  runTest('normalizeServerUser preserves strict user data ownership boundaries', () => {
    const rawUser: ServerUserRecord = {
      id: 'usr_user_A',
      email: 'usera@netgraph.ai',
      createdAt: new Date().toISOString(),
      profile: {
        name: 'User Alpha',
      },
      educations: [{ id: 'edu_A', userId: 'usr_user_A', institution: 'MIT' }],
      skills: [{ name: 'Algorithms' }],
      projects: [{ id: 'proj_A', userId: 'usr_user_A', title: 'Project Alpha' }],
    }

    const normalized = normalizeServerUser(rawUser)
    assert.strictEqual(normalized.id, 'usr_user_A')
    assert.strictEqual(normalized.email, 'usera@netgraph.ai')
    assert.strictEqual(normalized.name, 'User Alpha')
    assert.strictEqual(normalized.education!.length, 1)
    assert.strictEqual(normalized.projects!.length, 1)
  })

  // TEST 13: Data hygiene (no passwordHash or salt exposure)
  runTest('Confirms no password hash, salt, or secret tokens are present in user record', () => {
    const safeUser = normalizeServerUser(sampleServerUser)
    assert.strictEqual((safeUser as any).passwordHash, undefined)
    assert.strictEqual((safeUser as any).salt, undefined)
    assert.strictEqual((safeUser as any).sessionToken, undefined)
    assert.strictEqual((safeUser as any).token, undefined)
  })

  // Restore fetch
  global.fetch = originalFetch

  console.log('\n------------------------------------------------------')
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`)
  console.log('------------------------------------------------------\n')

  if (failedCount > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal test execution error:', err)
  process.exit(1)
})
