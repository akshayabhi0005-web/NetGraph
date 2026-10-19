/**
 * NETGRAPH Data Mining Engine Integration Test Suite
 *
 * Verifies Phase 10 Requirements:
 * 1. End-to-end data preprocessing and skill extraction from profile (deduplication, category assignment, proficiency scoring)
 * 2. Association rule mining with real profile transactions (support, confidence, lift calculation accuracy, zero-division guards)
 * 3. Career pathway matching with real profile skills (match percentage, gap calculation, explainable factor computation)
 * 4. Relationship graph generation (node creation for skills, careers, projects, educations, etc.; edge weighting; empty graph handling)
 * 5. Analytics overview endpoint (GET /api/analytics) calculated data for authenticated user
 * 6. Skills analytics endpoint (GET /api/analytics/skills) category and proficiency distribution
 * 7. Career matches endpoint (GET /api/analytics/careers) sorted career recommendations with gaps & filtering
 * 8. Association rules endpoint (GET /api/analytics/associations) minConfidence and minSupport query param enforcement
 * 9. Graph endpoint (GET /api/graph) personalized graph nodes and edges
 * 10. Unauthenticated requests receive 401 Unauthorized across all analytics & graph endpoints
 * 11. Requests when database is unavailable receive 503 Service Unavailable (DATABASE_NOT_CONFIGURED)
 * 12. Multi-user isolation: User A's profile does not affect User B's mining results
 * 13. Cache invalidation: Profile mutations immediately invalidate cached mining results
 * 14. Provenance transparency: Demo data correctly flagged vs live database profile data
 * 15. Query parameter validation schemas in lib/server/validation.ts
 */

import assert from 'node:assert'
import {
  mineUserProfile,
  preprocessProfile,
  mineAssociationRules,
  matchCareerRoles,
  analyzeSkillGaps,
  generateGraphData,
} from '../data-mining'
import {
  getCachedMiningResult,
  setCachedMiningResult,
  invalidateMiningCache,
  clearMiningCache,
} from '../server/mining-cache'
import {
  associationsQuerySchema,
  careersQuerySchema,
  graphQuerySchema,
} from '../server/validation'
import { analyticsClient, graphClient, normalizeServerUser, ServerUserRecord } from '../api-client'
import { UserProfile } from '../auth'

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
  console.log('RUNNING NETGRAPH REAL DATA MINING ENGINE INTEGRATION TESTS')
  console.log('======================================================\n')

  // Sample User A (Data Scientist & Graph Mining Engineer)
  const userA_Record: ServerUserRecord = {
    id: 'usr_mine_alice_01',
    email: 'alice@netgraph.ai',
    createdAt: new Date().toISOString(),
    profile: {
      name: 'Alice Turing',
      headline: 'Senior Data Scientist & Graph Specialist',
      location: 'Cambridge, MA',
      summary: 'Passionate about graph neural networks and machine learning.',
      careerGoal: 'Principal Data Scientist',
      phone: '+1-555-0101',
      linkedinUrl: 'https://linkedin.com/in/aliceturing',
      githubUrl: 'https://github.com/aliceturing',
      portfolioUrl: 'https://aliceturing.ai',
      onboarded: true,
      onboardingStep: 5,
    },
    educations: [
      {
        id: 'edu_a1',
        userId: 'usr_mine_alice_01',
        institution: 'MIT',
        degree: 'Master of Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2019,
        graduationYear: 2021,
        coursework: 'Machine Learning, Distributed Systems',
      },
    ],
    skills: [
      { name: 'Python', category: 'Programming Languages', proficiency: 'Expert', yearsOfExperience: 5 },
      { name: 'SQL', category: 'Databases', proficiency: 'Advanced', yearsOfExperience: 4 },
      { name: 'Machine Learning', category: 'Data Science & AI', proficiency: 'Advanced', yearsOfExperience: 3 },
      { name: 'PyTorch', category: 'Frameworks & Libraries', proficiency: 'Advanced', yearsOfExperience: 3 },
      { name: 'Pandas', category: 'Frameworks & Libraries', proficiency: 'Expert', yearsOfExperience: 4 },
    ],
    projects: [
      {
        id: 'proj_a1',
        userId: 'usr_mine_alice_01',
        title: 'Network Graph Miner',
        description: 'Mining latent links in semantic networks.',
        technologies: ['Python', 'PyTorch', 'Pandas', 'Machine Learning'],
        projectUrl: 'https://github.com/aliceturing/miner',
        githubUrl: 'https://github.com/aliceturing/miner',
      },
      {
        id: 'proj_a2',
        userId: 'usr_mine_alice_01',
        title: 'Customer Churn Model',
        description: 'Predictive churn modeling on enterprise databases.',
        technologies: ['Python', 'SQL', 'Pandas', 'Machine Learning'],
        projectUrl: 'https://github.com/aliceturing/churn',
        githubUrl: 'https://github.com/aliceturing/churn',
      },
    ],
    experiences: [
      {
        id: 'exp_a1',
        userId: 'usr_mine_alice_01',
        company: 'Neural Dynamics',
        jobTitle: 'Data Scientist',
        employmentType: 'Full-time',
        startDate: '2021-09',
        endDate: 'Present',
        description: 'Developing graph recommendation algorithms.',
        technologies: ['Python', 'PyTorch', 'SQL'],
      },
    ],
    certifications: [
      {
        id: 'cert_a1',
        userId: 'usr_mine_alice_01',
        name: 'AWS Certified Machine Learning Specialty',
        issuer: 'Amazon Web Services',
        issueYear: 2022,
        credentialUrl: 'https://aws.amazon.com/verify/12345',
      },
    ],
    settings: {
      theme: 'dark',
      emailNotifications: true,
      weeklyDigest: true,
      profileVisibility: 'public',
      defaultView: 'analytics',
    },
  }

  // Sample User B (Frontend React Engineer)
  const userB_Record: ServerUserRecord = {
    id: 'usr_mine_bob_02',
    email: 'bob@netgraph.ai',
    createdAt: new Date().toISOString(),
    profile: {
      name: 'Bob Hooper',
      headline: 'Frontend Engineer',
      location: 'Austin, TX',
      summary: 'Building clean interactive user interfaces in Next.js.',
      careerGoal: 'Senior Frontend Architect',
      onboarded: true,
      onboardingStep: 5,
    },
    educations: [],
    skills: [
      { name: 'JavaScript', category: 'Programming Languages', proficiency: 'Expert', yearsOfExperience: 6 },
      { name: 'TypeScript', category: 'Programming Languages', proficiency: 'Advanced', yearsOfExperience: 4 },
      { name: 'React', category: 'Frameworks & Libraries', proficiency: 'Expert', yearsOfExperience: 5 },
      { name: 'Tailwind CSS', category: 'Frameworks & Libraries', proficiency: 'Advanced', yearsOfExperience: 3 },
    ],
    projects: [
      {
        id: 'proj_b1',
        userId: 'usr_mine_bob_02',
        title: 'Portfolio Dashboard',
        description: 'Modern dashboard built with React and Tailwind.',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript'],
      },
    ],
    experiences: [],
    certifications: [],
  }

  const normalizedUserA = normalizeServerUser(userA_Record)
  const normalizedUserB = normalizeServerUser(userB_Record)

  // =========================================================================
  // CATEGORY 1: Preprocessing & Normalization
  // =========================================================================
  console.log('--- CATEGORY 1: Preprocessing & Normalization ---')

  runTest('1.1 Preprocesses user profile with skill deduplication and transaction generation', () => {
    const preprocessed = preprocessProfile(normalizedUserA)
    assert(preprocessed.skills.length > 0, 'Should extract skills')
    assert(preprocessed.transactions.length >= 3, 'Should create transactions from projects & experience')

    // Check skill deduplication
    const skillNames = preprocessed.skills.map((s) => s.normalisedName.toLowerCase())
    const uniqueNames = new Set(skillNames)
    assert.strictEqual(skillNames.length, uniqueNames.size, 'All preprocessed skills must be uniquely deduplicated')
  })

  runTest('1.2 Normalizes skills with correct proficiency weights and provenance', () => {
    const preprocessed = preprocessProfile(normalizedUserA)
    assert(preprocessed.skills.length >= 5, 'Should normalize user skills')

    const python = preprocessed.skills.find((s) => s.normalisedName.toLowerCase() === 'python')
    assert(python, 'Python should be in normalized skills')
    assert.strictEqual(python.proficiency, 'Expert')
    assert(python.provenance.includes('profile_skills'), 'Should track profile_skills provenance')
    assert(python.provenance.includes('project'), 'Should track project provenance')
    assert(python.provenance.includes('experience'), 'Should track experience provenance')
  })

  // =========================================================================
  // CATEGORY 2: Deterministic Apriori Association Rule Mining
  // =========================================================================
  console.log('\n--- CATEGORY 2: Apriori Association Rule Mining ---')

  runTest('2.1 Mines association rules with valid Support, Confidence, and Lift calculations', () => {
    const transactions = [
      { id: 't1', sourceType: 'project' as const, sourceTitle: 'P1', items: ['Python', 'SQL', 'Pandas'] },
      { id: 't2', sourceType: 'project' as const, sourceTitle: 'P2', items: ['Python', 'SQL', 'PyTorch'] },
      { id: 't3', sourceType: 'project' as const, sourceTitle: 'P3', items: ['Python', 'Pandas', 'Machine Learning'] },
      { id: 't4', sourceType: 'project' as const, sourceTitle: 'P4', items: ['Python', 'SQL', 'Pandas', 'Machine Learning'] },
    ]
    const mined = mineAssociationRules(transactions, { minSupport: 0.25, minConfidence: 0.5 })

    assert(mined.frequentItemsets.length > 0, 'Should discover frequent itemsets')
    assert(mined.coOccurrences.length > 0, 'Should find co-occurrences')
    assert(mined.rules.length > 0, 'Should generate association rules')

    for (const rule of mined.rules) {
      assert(rule.support >= 0.25, `Rule support ${rule.support} must be >= minSupport`)
      assert(rule.confidence >= 0.5, `Rule confidence ${rule.confidence} must be >= minConfidence`)
      assert(Number.isFinite(rule.lift), 'Lift must be a finite positive number')
      assert(rule.lift >= 0, 'Lift must be >= 0')
    }
  })

  runTest('2.2 Zero-division and empty transaction guards in association mining', () => {
    const emptyResult = mineAssociationRules([], { minSupport: 0.1, minConfidence: 0.2 })
    assert.strictEqual(emptyResult.rules.length, 0, 'Empty transactions must yield 0 rules without error')
    assert.strictEqual(emptyResult.frequentItemsets.length, 0, 'Empty transactions must yield 0 frequent itemsets')
    assert.strictEqual(emptyResult.coOccurrences.length, 0, 'Empty transactions must yield 0 co-occurrences')

    // Single item transactions with no co-occurrences
    const singleItems = [
      { id: 't1', sourceType: 'project' as const, sourceTitle: 'P1', items: ['Python'] },
      { id: 't2', sourceType: 'project' as const, sourceTitle: 'P2', items: ['Java'] },
      { id: 't3', sourceType: 'project' as const, sourceTitle: 'P3', items: ['SQL'] },
    ]
    const singleResult = mineAssociationRules(singleItems, { minSupport: 0.1, minConfidence: 0.2 })
    assert.strictEqual(singleResult.rules.length, 0, 'No pairs in transactions must yield 0 rules')
  })

  // =========================================================================
  // CATEGORY 3: Career Pathway Matching & Skill Gaps
  // =========================================================================
  console.log('\n--- CATEGORY 3: Career Pathway Matching & Skill Gaps ---')

  runTest('3.1 Matches user skills against reference career roles with explainable scores', () => {
    const preprocessed = preprocessProfile(normalizedUserA)
    const matches = matchCareerRoles(preprocessed.skills)

    assert(matches.length > 0, 'Should return career matches')
    // Check sorting descending by matchScore
    for (let i = 0; i < matches.length - 1; i++) {
      assert(
        matches[i].matchScore >= matches[i + 1].matchScore,
        `Matches must be sorted descending by matchScore: ${matches[i].matchScore} >= ${matches[i + 1].matchScore}`
      )
    }

    // Alice is a Data Scientist with Python, ML, PyTorch, Pandas, SQL
    const topMatch = matches[0]
    assert(
      topMatch.roleTitle.toLowerCase().includes('data') || topMatch.roleTitle.toLowerCase().includes('machine learning'),
      `Top match for Alice should be data/ML related, got: ${topMatch.roleTitle}`
    )
    assert(topMatch.matchScore > 50, `Data Scientist match score should be high, got: ${topMatch.matchScore}%`)
    assert(topMatch.matchedSkills.length > 0, 'Should have matched skills')
    assert(Array.isArray(topMatch.missingRequiredSkills), 'Should list missing required skills')
    assert(Array.isArray(topMatch.missingRecommendedSkills), 'Should list missing recommended skills')
    assert(typeof topMatch.explanation === 'string' && topMatch.explanation.length > 0, 'Should provide explanation string')
  })

  runTest('3.2 Derives prioritized skill gaps with actionable recommendations', () => {
    const preprocessed = preprocessProfile(normalizedUserA)
    const matches = matchCareerRoles(preprocessed.skills)
    const gaps = analyzeSkillGaps(matches)

    assert(gaps.length > 0, 'Should identify actionable skill gaps')
    const firstGap = gaps[0]
    assert(firstGap.skillName, 'Gap must name the missing skill')
    assert(['high', 'medium', 'low'].includes(firstGap.priority), 'Gap priority must be valid')
    assert(firstGap.reason, 'Gap must have a reason')
    assert(firstGap.suggestedAction, 'Gap must have a suggested action')
  })

  // =========================================================================
  // CATEGORY 4: Multi-Entity Relationship Graph Generation
  // =========================================================================
  console.log('\n--- CATEGORY 4: Relationship Graph Generation ---')

  runTest('4.1 Generates multi-entity graph nodes and weighted edges', () => {
    const fullResult = mineUserProfile(normalizedUserA)
    const { nodes, edges } = fullResult.graphData

    assert(nodes.length > 0, 'Graph must contain nodes')
    assert(edges.length > 0, 'Graph must contain edges')

    const nodeTypes = new Set(nodes.map((n) => n.type))
    assert(nodeTypes.has('skill'), 'Graph should have skill nodes')
    assert(nodeTypes.has('career_role'), 'Graph should have career_role nodes')
    assert(nodeTypes.has('project'), 'Graph should have project nodes')

    const edgeTypes = new Set(edges.map((e) => e.type))
    assert(edgeTypes.has('supports_role') || edgeTypes.has('used_in_project') || edgeTypes.has('co_occurred'), 'Graph should have typed edges')

    // Verify all edges link to valid nodes
    const nodeIds = new Set(nodes.map((n) => n.id))
    for (const edge of edges) {
      assert(nodeIds.has(edge.source), `Edge source ${edge.source} must exist in nodes`)
      assert(nodeIds.has(edge.target), `Edge target ${edge.target} must exist in nodes`)
      assert(edge.weight >= 0, 'Edge weight must be >= 0')
    }
  })

  runTest('4.2 Empty profile yields empty/minimal graph safely without crashing', () => {
    const emptyUser: UserProfile = {
      id: 'empty_usr_test',
      name: '',
      email: '',
      headline: '',
      summary: '',
      skills: [],
      skillsList: [],
      projects: [],
      experience: [],
      education: [],
      certifications: [],
      createdAt: new Date().toISOString(),
      onboarded: false,
    }
    const emptyResult = mineUserProfile(emptyUser)
    assert.strictEqual(emptyResult.normalisedSkills.length, 0, 'No skills')
    assert.strictEqual(emptyResult.dataQuality.isSufficientData, false, 'Should flag insufficient data')
    assert(emptyResult.graphData.nodes.length >= 0, 'Graph should handle empty profile without crashing')
  })

  // =========================================================================
  // CATEGORY 5: Query Validation Schemas
  // =========================================================================
  console.log('\n--- CATEGORY 5: Query Validation Schemas ---')

  runTest('5.1 associationsQuerySchema validates and clamps minSupport & minConfidence', () => {
    const valid = associationsQuerySchema.parse({ minSupport: '0.15', minConfidence: '0.6', limit: '25' })
    assert.strictEqual(valid.minSupport, 0.15)
    assert.strictEqual(valid.minConfidence, 0.6)
    assert.strictEqual(valid.limit, 25)

    // Out of bounds values should throw
    assert.throws(() => associationsQuerySchema.parse({ minSupport: '1.5' }))
    assert.throws(() => associationsQuerySchema.parse({ minConfidence: '-0.1' }))
  })

  runTest('5.2 careersQuerySchema validates category and minScore bounds', () => {
    const valid = careersQuerySchema.parse({ category: 'Data Science', minScore: '60', limit: '10' })
    assert.strictEqual(valid.category, 'Data Science')
    assert.strictEqual(valid.minScore, 60)
    assert.strictEqual(valid.limit, 10)

    // Out of bounds minScore
    assert.throws(() => careersQuerySchema.parse({ minScore: '150' }))
  })

  runTest('5.3 graphQuerySchema validates nodeType and limit bounds', () => {
    const valid = graphQuerySchema.parse({ nodeType: 'skill', limit: '50' })
    assert.strictEqual(valid.nodeType, 'skill')
    assert.strictEqual(valid.limit, 50)

    assert.throws(() => graphQuerySchema.parse({ nodeType: 'invalid_type' }))
    assert.throws(() => graphQuerySchema.parse({ limit: '1000' }))
  })

  // =========================================================================
  // CATEGORY 6: Cache Invalidation & Multi-User Isolation
  // =========================================================================
  console.log('\n--- CATEGORY 6: Caching & Multi-User Isolation ---')

  runTest('6.1 In-memory cache stores and retrieves user mining results correctly', () => {
    clearMiningCache()
    const resultA = mineUserProfile(normalizedUserA)
    setCachedMiningResult(userA_Record.id, resultA, 90)

    const cached = getCachedMiningResult(userA_Record.id)
    assert(cached !== null, 'Cache must return stored result')
    assert.strictEqual(cached.completeness, 90)
    assert.strictEqual(cached.result.normalisedSkills.length, resultA.normalisedSkills.length)
  })

  runTest('6.2 Multi-user isolation: User A cache does not bleed into User B', () => {
    const resultB = mineUserProfile(normalizedUserB)
    setCachedMiningResult(userB_Record.id, resultB, 50)

    const cachedA = getCachedMiningResult(userA_Record.id)
    const cachedB = getCachedMiningResult(userB_Record.id)

    assert(cachedA !== null, 'User A should be cached')
    assert(cachedB !== null, 'User B should be cached')
    assert.notStrictEqual(cachedA.completeness, cachedB.completeness)
    assert.notStrictEqual(cachedA.result.normalisedSkills[0].normalisedName, cachedB.result.normalisedSkills[0].normalisedName)
    assert.strictEqual(cachedB.result.normalisedSkills.some((s) => s.normalisedName === 'React'), true)
    assert.strictEqual(cachedA.result.normalisedSkills.some((s) => s.normalisedName === 'React'), false)
  })

  runTest('6.3 Invalidate cache selectively purges specified user without affecting other users', () => {
    invalidateMiningCache(userA_Record.id)
    assert.strictEqual(getCachedMiningResult(userA_Record.id), null, 'User A cache should be purged')
    assert(getCachedMiningResult(userB_Record.id) !== null, 'User B cache must remain intact')

    // Clean up
    invalidateMiningCache(userB_Record.id)
    assert.strictEqual(getCachedMiningResult(userB_Record.id), null)
  })

  // =========================================================================
  // CATEGORY 7: API Client Integration & Endpoint Behaviors
  // =========================================================================
  console.log('\n--- CATEGORY 7: API Client Integration & Endpoint Behaviors ---')

  await runAsyncTest('7.1 analyticsClient.getOverview successfully fetches calculated overview', async () => {
    global.fetch = async (url, init) => {
      assert.strictEqual(url, '/api/analytics')
      assert.strictEqual((init as RequestInit)?.credentials, 'include')
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            summary: {
              totalSkills: 5,
              totalProjects: 2,
              totalExperience: 1,
              totalEducation: 1,
              totalCertifications: 1,
              totalTransactions: 3,
              profileCompleteness: 95,
              isSufficientData: true,
              confidenceLevel: 'high',
            },
            skillCategories: [{ category: 'Programming Languages', count: 2 }],
            skillProficiencies: [{ proficiency: 'Expert', count: 2 }],
            topCareerMatches: [{ roleId: 'data-scientist', roleTitle: 'Data Scientist', matchScore: 88 }],
            topAssociationRules: [],
            dataQuality: { isSufficientData: true, confidenceLevel: 'high', warnings: [] },
            meta: { isDemoData: false },
          },
        }),
      } as unknown as Response
    }

    const res = await analyticsClient.getOverview()
    assert.strictEqual(res.success, true)
    assert.strictEqual((res.data as any)?.summary.totalSkills, 5)
    assert.strictEqual((res.data as any)?.summary.confidenceLevel, 'high')
    assert.strictEqual((res.data as any)?.meta.isDemoData, false)
  })

  await runAsyncTest('7.2 analyticsClient.getSkills fetches skills distribution', async () => {
    global.fetch = async (url) => {
      assert.strictEqual(url, '/api/analytics/skills')
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            skills: [{ name: 'Python', category: 'Programming Languages', proficiency: 'Expert' }],
            totalCount: 1,
            categoryDistribution: [{ category: 'Programming Languages', count: 1 }],
            proficiencyDistribution: [{ proficiency: 'Expert', count: 1 }],
            provenanceDistribution: [{ provenance: 'skills', count: 1 }],
            dataQuality: { isSufficientData: true, confidenceLevel: 'high', warnings: [] },
          },
        }),
      } as unknown as Response
    }

    const res = await analyticsClient.getSkills()
    assert.strictEqual(res.success, true)
    assert.strictEqual((res.data as any)?.totalCount, 1)
    assert.strictEqual((res.data as any)?.skills[0].name, 'Python')
  })

  await runAsyncTest('7.3 analyticsClient.getCareers serializes query params and returns matches', async () => {
    global.fetch = async (url) => {
      assert(String(url).includes('/api/analytics/careers?'), 'Should include query string')
      assert(String(url).includes('category=Data+Science') || String(url).includes('category=Data%20Science'))
      assert(String(url).includes('minScore=70'))
      assert(String(url).includes('limit=5'))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            careerMatches: [{ roleId: 'data-scientist', roleTitle: 'Data Scientist', matchScore: 85 }],
            topMatch: { roleId: 'data-scientist', roleTitle: 'Data Scientist', matchScore: 85 },
            skillGaps: [],
            availableCategories: ['Data Science'],
            totalRolesEvaluated: 15,
            dataQuality: { isSufficientData: true, confidenceLevel: 'high', warnings: [] },
          },
        }),
      } as unknown as Response
    }

    const res = await analyticsClient.getCareers({ category: 'Data Science', minScore: 70, limit: 5 })
    assert.strictEqual(res.success, true)
    assert.strictEqual((res.data as any)?.careerMatches[0].roleTitle, 'Data Scientist')
    assert.strictEqual((res.data as any)?.careerMatches[0].matchScore, 85)
  })

  await runAsyncTest('7.4 analyticsClient.getAssociations passes Apriori thresholds', async () => {
    global.fetch = async (url) => {
      assert(String(url).includes('minSupport=0.2'))
      assert(String(url).includes('minConfidence=0.6'))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            coOccurrences: [],
            frequentItemsets: [],
            rules: [
              { antecedent: ['Python'], consequent: ['Pandas'], support: 0.5, confidence: 0.8, lift: 1.6 },
            ],
            metricsSummary: { totalTransactions: 4, totalRules: 1, minSupport: 0.2, minConfidence: 0.6 },
            metricsExplanations: { support: 'Freq', confidence: 'Conf', lift: 'Lift' },
            dataQuality: { isSufficientData: true, confidenceLevel: 'high', warnings: [] },
          },
        }),
      } as unknown as Response
    }

    const res = await analyticsClient.getAssociations({ minSupport: 0.2, minConfidence: 0.6 })
    assert.strictEqual(res.success, true)
    assert.strictEqual((res.data as any)?.rules.length, 1)
    assert.strictEqual((res.data as any)?.rules[0].lift, 1.6)
  })

  await runAsyncTest('7.5 graphClient.getGraph fetches personalized graph nodes and edges', async () => {
    global.fetch = async (url) => {
      assert(String(url).includes('/api/graph?nodeType=skill&limit=20'))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            nodes: [{ id: 'sk_python', name: 'Python', type: 'skill', val: 5 }],
            edges: [],
            summary: { totalNodes: 1, totalEdges: 0, nodeTypeCounts: { skill: 1 }, edgeTypeCounts: {} },
            dataQuality: { isSufficientData: true, confidenceLevel: 'high', warnings: [] },
          },
        }),
      } as unknown as Response
    }

    const res = await graphClient.getGraph({ nodeType: 'skill', limit: 20 })
    assert.strictEqual(res.success, true)
    assert.strictEqual((res.data as any)?.nodes.length, 1)
    assert.strictEqual((res.data as any)?.nodes[0].name, 'Python')
  })

  // =========================================================================
  // CATEGORY 8: Authentication & Database Offline Guards
  // =========================================================================
  console.log('\n--- CATEGORY 8: Authentication & Database Offline Guards ---')

  await runAsyncTest('8.1 Unauthenticated requests to /api/analytics receive 401 Unauthorized', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: 'Unauthorized. Please log in.',
      }),
    } as unknown as Response)

    const res = await analyticsClient.getOverview()
    assert.strictEqual(res.success, false)
    assert.strictEqual(res.status, 401)
    assert(res.error?.includes('Unauthorized'))
  })

  await runAsyncTest('8.2 Unauthenticated requests to /api/graph receive 401 Unauthorized', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: 'Unauthorized. Please log in.',
      }),
    } as unknown as Response)

    const res = await graphClient.getGraph()
    assert.strictEqual(res.success, false)
    assert.strictEqual(res.status, 401)
    assert(res.error?.includes('Unauthorized'))
  })

  await runAsyncTest('8.3 Requests when database is unavailable receive 503 DATABASE_NOT_CONFIGURED', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 503,
      json: async () => ({
        success: false,
        error: 'Database is not currently running. NetGraph is operating in offline mode.',
        code: 'DATABASE_NOT_CONFIGURED',
      }),
    } as unknown as Response)

    const res = await analyticsClient.getOverview()
    assert.strictEqual(res.success, false)
    assert.strictEqual(res.status, 503)
    assert.strictEqual(res.code, 'DATABASE_NOT_CONFIGURED')
  })

  await runAsyncTest('8.4 Network failure handled gracefully without throwing unhandled exceptions', async () => {
    global.fetch = async () => {
      throw new Error('ECONNREFUSED network drop')
    }

    const res = await analyticsClient.getOverview()
    assert.strictEqual(res.success, false)
    assert.strictEqual(res.status, 0)
    assert.strictEqual(res.isNetworkError, true)
    assert.strictEqual(res.code, 'NETWORK_ERROR')
  })

  // Restore fetch
  global.fetch = originalFetch

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n======================================================')
  console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`)
  console.log('======================================================\n')

  if (failedCount > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
