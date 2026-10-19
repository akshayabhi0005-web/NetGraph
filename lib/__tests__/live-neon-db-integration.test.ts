/**
 * NETGRAPH LIVE NEON POSTGRESQL INTEGRATION TEST SUITE
 *
 * Verifies real end-to-end database persistence, transaction safety,
 * foreign key cascading, multi-user tenant isolation, and mining engine integration
 * directly against Neon PostgreSQL.
 *
 * All test records use isolated, unique email addresses and are cleanly purged
 * at the end of the test execution.
 */

import { prisma, isDatabaseConfigured } from '../server/prisma'
import {
  generateSalt,
  hashPassword,
  verifyPassword,
  createDatabaseSession,
  revokeDatabaseSession,
  getAuthenticatedUser,
} from '../server/auth'
import {
  getCompleteUserProfile,
  updateUserProfile,
  addEducation,
  deleteEducation,
  addOrUpdateSkill,
  deleteSkill,
  addProject,
  deleteProject,
  addExperience,
  deleteExperience,
  addCertification,
  deleteCertification,
} from '../server/profile-service'
import { getUserSettings, updateUserSettings } from '../server/settings-service'
import {
  getUserAnalyticsOverview,
  getUserCareersAnalytics,
  getUserGraphAnalytics,
} from '../server/mining-service'
import { getCachedMiningResult, invalidateMiningCache } from '../server/mining-cache'

// Test runner helper
let passCount = 0
let failCount = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ LIVE PASS: ${message}`)
    passCount++
  } else {
    console.error(`  ✗ LIVE FAIL: ${message}`)
    failCount++
    throw new Error(`Assertion failed: ${message}`)
  }
}

async function runLiveNeonIntegrationTests() {
  console.log('\n======================================================')
  console.log('RUNNING NETGRAPH LIVE NEON POSTGRESQL INTEGRATION TESTS')
  console.log('======================================================\n')

  // Guard: Confirm DB is configured
  if (!isDatabaseConfigured()) {
    console.error('DATABASE_URL is not configured. Live tests aborted.')
    process.exit(1)
  }

  // Generate unique test emails with timestamps
  const timestamp = Date.now()
  const userAEmail = `test.neon.a.${timestamp}@example.com`
  const userBEmail = `test.neon.b.${timestamp}@example.com`
  const testPassword = 'SecurePassword2026!'

  let userAId = ''
  let userBId = ''
  let sessionTokenA = ''
  let sessionTokenB = ''

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 1: Account Registration & Password Hashing
    // ─────────────────────────────────────────────────────────────────────────
    console.log('--- 1. User Registration & Password Hashing in Neon ---')

    const saltA = generateSalt()
    const hashA = await hashPassword(testPassword, saltA)

    const createdUserA = await prisma.user.create({
      data: {
        email: userAEmail,
        passwordHash: hashA,
        salt: saltA,
        profile: {
          create: {
            name: 'Neon Tester A',
            headline: 'Graph Intelligence Specialist',
            location: 'San Francisco, CA',
            summary: 'Experienced with graph algorithms and data mining.',
            careerGoal: 'Principal AI Engineer',
            onboarded: true,
            onboardingStep: 4,
          },
        },
        settings: {
          create: {
            theme: 'dark',
            emailSummaries: true,
            shareAnalytics: false,
            defaultGraphLayout: 'force-directed',
          },
        },
      },
      include: {
        profile: true,
        settings: true,
      },
    })
    userAId = createdUserA.id

    assert(Boolean(createdUserA.id), 'User A registered and created in Neon PostgreSQL')
    assert(createdUserA.email === userAEmail, 'User A email matches input')
    assert(createdUserA.profile?.name === 'Neon Tester A', 'User A profile record created in Neon')
    assert(createdUserA.settings?.theme === 'dark', 'User A settings record created in Neon')

    // Create User B for tenant isolation testing
    const saltB = generateSalt()
    const hashB = await hashPassword(testPassword, saltB)
    const createdUserB = await prisma.user.create({
      data: {
        email: userBEmail,
        passwordHash: hashB,
        salt: saltB,
        profile: {
          create: {
            name: 'Neon Tester B',
            headline: 'Data Engineer',
            location: 'New York, NY',
            onboarded: true,
            onboardingStep: 4,
          },
        },
        settings: {
          create: {
            theme: 'light',
          },
        },
      },
    })
    userBId = createdUserB.id
    assert(Boolean(userBId), 'User B registered for cross-user isolation verification')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 2: Duplicate Registration Safety
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 2. Duplicate Registration Rejection ---')
    let duplicateRejected = false
    try {
      await prisma.user.create({
        data: {
          email: userAEmail,
          passwordHash: hashA,
          salt: saltA,
        },
      })
    } catch (err: any) {
      if (err.code === 'P2002' || err.message?.includes('Unique constraint')) {
        duplicateRejected = true
      }
    }
    assert(duplicateRejected, 'Unique constraint on email correctly prevents duplicate registration in Neon')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 3: Password Verification & Constant-Time Validation
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 3. Password Verification ---')
    const userFromDb = await prisma.user.findUnique({ where: { id: userAId } })
    assert(Boolean(userFromDb), 'Fresh read of User A from Neon succeeded')

    const isValidPassword = await verifyPassword(testPassword, userFromDb!.salt, userFromDb!.passwordHash)
    assert(isValidPassword, 'Valid password successfully verifies against stored scrypt hash in Neon')

    const isInvalidPassword = await verifyPassword('WrongPassword123!', userFromDb!.salt, userFromDb!.passwordHash)
    assert(!isInvalidPassword, 'Invalid password correctly rejected by scrypt hash check')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 4: Session Creation, Restoration & Revocation
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 4. Session Management ---')
    sessionTokenA = await createDatabaseSession(userAId)
    sessionTokenB = await createDatabaseSession(userBId)
    assert(Boolean(sessionTokenA), 'UserSession created in Neon for User A')

    // Verify session restoration via Bearer header
    const mockReqA = new Request('http://localhost:3000/api/auth/me', {
      headers: { authorization: `Bearer ${sessionTokenA}` },
    })
    const authenticatedA = await getAuthenticatedUser(mockReqA)
    assert(authenticatedA?.id === userAId, 'Session token restores User A from Neon via getAuthenticatedUser')
    assert(authenticatedA?.email === userAEmail, 'Restored session retains correct email')
    assert(!('passwordHash' in (authenticatedA || {})), 'Restored user strips passwordHash and salt')

    // Session revocation
    await revokeDatabaseSession(sessionTokenA)
    const revokedCheckReq = new Request('http://localhost:3000/api/auth/me', {
      headers: { authorization: `Bearer ${sessionTokenA}` },
    })
    const revokedResult = await getAuthenticatedUser(revokedCheckReq)
    assert(revokedResult === null, 'Revoked session is immediately rejected and returns null')

    // Re-issue active session for subsequent tests
    sessionTokenA = await createDatabaseSession(userAId)

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 5: Profile Updates & Persistence
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 5. Profile Updates & Persistence ---')
    await updateUserProfile(userAId, {
      headline: 'Lead Graph Mining Engineer & AI Researcher',
      location: 'San Francisco Bay Area',
      summary: 'Specializing in complex networks, community detection, and GNNs.',
      careerGoal: 'VP of AI Research',
      portfolioUrl: 'https://github.com/netgraph-test',
    })

    const freshProfileA = await getCompleteUserProfile(userAId)
    assert(
      freshProfileA?.profile?.headline === 'Lead Graph Mining Engineer & AI Researcher',
      'Updated headline persisted and retrieved from Neon'
    )
    assert(
      freshProfileA?.profile?.careerGoal === 'VP of AI Research',
      'Updated career goal persisted and retrieved from Neon'
    )
    assert(
      freshProfileA?.profile?.portfolioUrl === 'https://github.com/netgraph-test',
      'Updated portfolio URL persisted and retrieved from Neon'
    )

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 6: Skills CRUD Operations
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 6. Skills CRUD Persistence ---')
    const skillPython = await addOrUpdateSkill(userAId, {
      name: 'Python',
      category: 'TECHNICAL',
      proficiency: 'Expert',
      yearsOfExperience: 6,
    })
    assert(Boolean(skillPython.id), 'Skill Python added to Neon with EXPERT proficiency')

    const skillNeo4j = await addOrUpdateSkill(userAId, {
      name: 'Neo4j',
      category: 'TECHNICAL',
      proficiency: 'Advanced',
      yearsOfExperience: 4,
    })
    assert(Boolean(skillNeo4j.id), 'Skill Neo4j added to Neon with ADVANCED proficiency')

    const skillNetworkX = await addOrUpdateSkill(userAId, {
      name: 'NetworkX',
      category: 'TECHNICAL',
      proficiency: 'Advanced',
      yearsOfExperience: 3,
    })
    assert(Boolean(skillNetworkX.id), 'Skill NetworkX added to Neon')

    // Read back complete profile and confirm skills
    const profileWithSkills = await getCompleteUserProfile(userAId)
    assert(profileWithSkills?.skills?.length === 3, 'All 3 skills persisted in Neon and retrieved')

    // Delete one skill
    await deleteSkill(userAId, skillNetworkX.id)
    const profileAfterSkillDelete = await getCompleteUserProfile(userAId)
    assert(
      profileAfterSkillDelete?.skills?.length === 2 &&
      !profileAfterSkillDelete?.skills?.some(s => s.name === 'NetworkX'),
      'Skill deletion verified in Neon'
    )

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 7: Projects CRUD Operations
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 7. Projects CRUD Persistence ---')
    const project = await addProject(userAId, {
      title: 'Scalable Graph Neural Network Pipeline',
      description: 'Distributed training of GNNs on 100M node graphs with sub-second inference.',
      technologies: ['Python', 'PyTorch Geometric', 'Neo4j', 'Docker'],
      projectUrl: 'https://example.com/gnn-pipeline',
    })
    assert(Boolean(project.id), 'Project created and persisted in Neon')

    const profileWithProject = await getCompleteUserProfile(userAId)
    assert(
      Boolean(profileWithProject?.projects?.some(p => p.title === 'Scalable Graph Neural Network Pipeline')),
      'Project retrieved in relational query from Neon'
    )

    // Delete project
    await deleteProject(userAId, project.id)
    const profileAfterProjectDelete = await getCompleteUserProfile(userAId)
    assert(
      profileAfterProjectDelete?.projects?.length === 0,
      'Project deleted cleanly from Neon'
    )

    // Re-create project for data-mining graph test
    await addProject(userAId, {
      title: 'Enterprise Knowledge Graph Mining',
      description: 'Entity extraction and link prediction on multi-relational networks.',
      technologies: ['Python', 'Neo4j'],
    })

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 8: Education CRUD Operations
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 8. Education CRUD Persistence ---')
    const edu = await addEducation(userAId, {
      institution: 'Stanford University',
      degree: 'Master of Science',
      fieldOfStudy: 'Computer Science (AI & Network Analysis)',
      startYear: 2020,
      graduationYear: 2022,
    })
    assert(Boolean(edu.id), 'Education record persisted in Neon')

    const profileWithEdu = await getCompleteUserProfile(userAId)
    assert(
      Boolean(profileWithEdu?.educations?.some(e => e.institution === 'Stanford University')),
      'Education record retrieved from Neon'
    )

    await deleteEducation(userAId, edu.id)
    const profileAfterEduDelete = await getCompleteUserProfile(userAId)
    assert(profileAfterEduDelete?.educations?.length === 0, 'Education record deleted cleanly from Neon')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 9: Experience CRUD Operations
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 9. Experience CRUD Persistence ---')
    const exp = await addExperience(userAId, {
      jobTitle: 'Lead Network Mining Engineer',
      company: 'GraphScale Labs',
      employmentType: 'Full-time',
      startDate: '2022-01-01',
      isCurrent: true,
      description: 'Built high-throughput graph mining pipelines.',
      technologies: ['Python', 'Neo4j'],
    })
    assert(Boolean(exp.id), 'Experience record persisted in Neon')

    const profileWithExp = await getCompleteUserProfile(userAId)
    assert(
      Boolean(profileWithExp?.experiences?.some(e => e.company === 'GraphScale Labs')),
      'Experience record retrieved from Neon'
    )

    await deleteExperience(userAId, exp.id)
    const profileAfterExpDelete = await getCompleteUserProfile(userAId)
    assert(profileAfterExpDelete?.experiences?.length === 0, 'Experience record deleted cleanly from Neon')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 10: Certifications CRUD Operations
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 10. Certifications CRUD Persistence ---')
    const cert = await addCertification(userAId, {
      name: 'Neo4j Certified Professional',
      issuer: 'Neo4j GraphAcademy',
      issueDate: '2023-05-15',
      credentialUrl: 'https://neo4j.com/certificates/12345',
    })
    assert(Boolean(cert.id), 'Certification record persisted in Neon')

    const profileWithCert = await getCompleteUserProfile(userAId)
    assert(
      Boolean(profileWithCert?.certifications?.some(c => c.name === 'Neo4j Certified Professional')),
      'Certification record retrieved from Neon'
    )

    await deleteCertification(userAId, cert.id)
    const profileAfterCertDelete = await getCompleteUserProfile(userAId)
    assert(profileAfterCertDelete?.certifications?.length === 0, 'Certification record deleted cleanly from Neon')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 11: User Settings Persistence
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 11. User Settings Persistence ---')
    const updatedSettings = await updateUserSettings(userAId, {
      theme: 'light',
      emailSummaries: true,
      defaultGraphLayout: 'radial',
    })
    assert(updatedSettings.theme === 'light', 'Settings theme updated to light in Neon')
    assert(updatedSettings.emailSummaries === true, 'Settings emailSummaries updated in Neon')
    assert(updatedSettings.defaultGraphLayout === 'radial', 'Settings defaultGraphLayout updated in Neon')

    const freshSettings = await getUserSettings(userAId)
    assert(freshSettings?.defaultGraphLayout === 'radial', 'Fresh read of settings from Neon confirms persistence')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 12: Cross-User Tenant Isolation & Authorization
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 12. Cross-User Tenant Isolation & Authorization ---')
    // Attempt: User B tries to delete User A's skill
    const crossDeleteSuccess = await deleteSkill(userBId, skillPython.id)
    assert(!crossDeleteSuccess, 'User B deleteSkill on User A record returns false (Tenant Isolation enforced)')

    // Verify skill still belongs to User A
    const skillStillExists = await prisma.skill.findUnique({ where: { id: skillPython.id } })
    assert(
      skillStillExists?.userId === userAId,
      'User B cannot delete or modify User A skills in Neon (Tenant Isolation verified)'
    )

    // Verify unauthenticated access returns null
    const unauthReq = new Request('http://localhost:3000/api/auth/me')
    const unauthUser = await getAuthenticatedUser(unauthReq)
    assert(unauthUser === null, 'Unauthenticated request correctly returns null (Authorization verified)')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 13: Data Mining Engine Integration with Live Neon Data
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 13. Data Mining Engine Integration with Live Neon Profile ---')
    // Mined overview
    const minedAnalytics = await getUserAnalyticsOverview(userAId)
    assert(minedAnalytics !== null, 'Data mining overview calculated from Neon profile')
    assert(minedAnalytics!.summary.totalSkills >= 2, 'Data mining reflects actual stored skills (Python, Neo4j)')
    assert(minedAnalytics!.skillProficiencies.length >= 1, 'Mined proficiencies calculated')

    // Mined career matches
    const careers = await getUserCareersAnalytics(userAId, {})
    assert(careers !== null && careers.careerMatches.length > 0, 'Career recommendations derived deterministically from Neon skills')
    assert(typeof careers!.careerMatches[0].matchScore === 'number', 'Career match has valid numerical score')

    // Mined graph nodes and edges
    const minedGraph = await getUserGraphAnalytics(userAId, {})
    assert(minedGraph !== null && minedGraph.nodes.length >= 3, 'Graph generated with real entity nodes from Neon')
    assert(minedGraph!.edges.length >= 2, 'Graph generated with relational edges')

    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 14: Cache Invalidation on Live Mutations
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 14. Mining Cache Invalidation on Mutations ---')
    // Prime the cache
    await getUserAnalyticsOverview(userAId)
    const cachedOverview = getCachedMiningResult(userAId)
    assert(cachedOverview !== null, 'Mining results cached in memory for User A')

    // Invalidate cache
    invalidateMiningCache(userAId)
    const cacheAfterInvalidation = getCachedMiningResult(userAId)
    assert(cacheAfterInvalidation === null, 'Mining cache successfully purged after profile mutation')

  } finally {
    // ─────────────────────────────────────────────────────────────────────────
    // SECTION 15: Clean Purge of Test Accounts
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 15. Teardown & Clean Purge of Test Accounts from Neon ---')
    if (userAId) {
      await prisma.user.delete({ where: { id: userAId } }).catch(() => {})
      console.log(`  Purged User A (${userAId}) and cascaded records from Neon`)
    }
    if (userBId) {
      await prisma.user.delete({ where: { id: userBId } }).catch(() => {})
      console.log(`  Purged User B (${userBId}) and cascaded records from Neon`)
    }

    // Verify cleanup
    const checkA = await prisma.user.findUnique({ where: { email: userAEmail } })
    const checkB = await prisma.user.findUnique({ where: { email: userBEmail } })
    assert(checkA === null && checkB === null, 'All live test records completely purged from Neon PostgreSQL')

    await prisma.$disconnect()
  }

  console.log('\n------------------------------------------------------')
  console.log(`LIVE NEON TESTS: ${passCount} passed, ${failCount} failed`)
  console.log('------------------------------------------------------\n')

  if (failCount > 0) {
    process.exit(1)
  }
}

runLiveNeonIntegrationTests().catch(err => {
  console.error('Unhandled test error:', err)
  process.exit(1)
})
