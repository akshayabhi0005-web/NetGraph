/**
 * NETGRAPH Data-Mining Engine — Comprehensive Unit Test Suite
 * Tests all 17 required aspects:
 * 1. Empty profile handling
 * 2. Missing optional fields
 * 3. Skill normalisation
 * 4. Duplicate skill removal
 * 5. Alias normalisation
 * 6. Transaction construction
 * 7. Support calculation
 * 8. Confidence calculation
 * 9. Lift calculation
 * 10. Zero-denominator handling
 * 11. Insufficient-data warnings
 * 12. Graph node generation
 * 13. Graph edge generation
 * 14. Duplicate edge prevention
 * 15. Career role score calculations
 * 16. Missing skill identification
 * 17. Profile changes producing updated results
 */

import assert from 'node:assert'
import {
  mineUserProfile,
  normaliseSkillName,
  preprocessProfile,
  mineAssociationRules,
  matchCareerRoles,
  analyzeSkillGaps,
  generateGraphData,
} from '../index'
import { UserProfile } from '../../auth'
import { Transaction } from '../types'

// Test Runner Helper
let passedCount = 0
let failedCount = 0

function runTest(testName: string, testFn: () => void) {
  try {
    testFn()
    passedCount++
    console.log(`  ✓ PASS: ${testName}`)
  } catch (err: unknown) {
    failedCount++
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`  ✗ FAIL: ${testName}`)
    console.error(`    ${errorMsg}`)
  }
}

console.log('\n======================================================')
console.log('RUNNING NETGRAPH DATA-MINING ENGINE UNIT TESTS')
console.log('======================================================\n')

// 1. Empty Profile Handling
runTest('1. Empty profile handling does not crash and returns safe defaults', () => {
  const resultNull = mineUserProfile(null)
  assert.strictEqual(resultNull.normalisedSkills.length, 0)
  assert.strictEqual(resultNull.transactions.length, 0)
  assert.strictEqual(resultNull.dataQuality.isSufficientData, false)
  assert.strictEqual(resultNull.dataQuality.confidenceLevel, 'low')
  assert.ok(resultNull.dataQuality.warnings.length > 0)

  const resultEmpty = mineUserProfile({})
  assert.strictEqual(resultEmpty.normalisedSkills.length, 0)
  assert.strictEqual(resultEmpty.transactions.length, 0)
})

// 2. Missing Optional Fields Handling
runTest('2. Missing optional fields handled gracefully', () => {
  const partialProfile: Partial<UserProfile> = {
    id: 'test_usr_1',
    name: 'Test Candidate',
    email: 'test@example.com',
    skillsList: [{ id: 's1', name: 'Python', category: 'Programming Languages', proficiency: 'Advanced' }],
    // No projects, no experience, no education, no certifications
  }
  const result = mineUserProfile(partialProfile)
  assert.strictEqual(result.normalisedSkills.length, 1)
  assert.strictEqual(result.normalisedSkills[0].normalisedName, 'Python')
  assert.strictEqual(result.transactions.length, 0)
  assert.ok(result.careerMatches.length > 0)
})

// 3. Skill Normalisation
runTest('3. Skill normalisation handles case, trim, and formatting', () => {
  assert.strictEqual(normaliseSkillName('   python   '), 'Python')
  assert.strictEqual(normaliseSkillName('DOCKER'), 'Docker')
  assert.strictEqual(normaliseSkillName('scikit-learn'), 'Scikit-Learn')
  assert.strictEqual(normaliseSkillName('c++'), 'C++')
})

// 4. Duplicate Skill Removal
runTest('4. Duplicate skills are merged with provenance preserved', () => {
  const profileWithDupes: Partial<UserProfile> = {
    id: 'test_dupes',
    name: 'Duplicate Tester',
    email: 'dupe@example.com',
    skillsList: [
      { id: '1', name: 'python', category: 'Programming Languages', proficiency: 'Beginner' },
      { id: '2', name: 'PYTHON', category: 'Programming Languages', proficiency: 'Advanced' },
    ],
    projects: [
      {
        id: 'p1',
        title: 'Project 1',
        description: 'Test',
        technologies: ['Python', 'python', 'py'],
      },
    ],
  }
  const { skills } = preprocessProfile(profileWithDupes)
  const pythonSkills = skills.filter((s) => s.normalisedName === 'Python')
  assert.strictEqual(pythonSkills.length, 1, 'Duplicate python entries must be merged into one')
  assert.strictEqual(pythonSkills[0].proficiency, 'Advanced', 'Highest proficiency should be preserved')
  assert.ok(pythonSkills[0].provenance.includes('profile_skills'))
  assert.ok(pythonSkills[0].provenance.includes('project'))
})

// 5. Alias Normalisation
runTest('5. Standard aliases resolve to canonical names (JS, TS, ML, Postgres)', () => {
  assert.strictEqual(normaliseSkillName('js'), 'JavaScript')
  assert.strictEqual(normaliseSkillName('ts'), 'TypeScript')
  assert.strictEqual(normaliseSkillName('ml'), 'Machine Learning')
  assert.strictEqual(normaliseSkillName('postgre sql'), 'PostgreSQL')
  assert.strictEqual(normaliseSkillName('postgres'), 'PostgreSQL')
  assert.strictEqual(normaliseSkillName('k8s'), 'Kubernetes')
  assert.strictEqual(normaliseSkillName('sklearn'), 'Scikit-Learn')
  assert.strictEqual(normaliseSkillName('gcp'), 'Google Cloud (GCP)')
})

// 6. Transaction Construction
runTest('6. Transactions are constructed from projects and work experiences with >= 1 items', () => {
  const profile: Partial<UserProfile> = {
    projects: [
      { id: 'p1', title: 'Data Pipeline', description: 'desc', technologies: ['Python', 'SQL', 'Docker'] },
    ],
    experience: [
      {
        id: 'e1',
        jobTitle: 'Backend Dev',
        company: 'Cloud Corp',
        startDate: '2022',
        isCurrent: true,
        description: 'desc',
        technologies: ['Go', 'Docker', 'Kubernetes'],
      },
    ],
  }
  const { transactions } = preprocessProfile(profile)
  assert.strictEqual(transactions.length, 2)
  assert.deepStrictEqual(transactions[0].items, ['Docker', 'Python', 'SQL'])
  assert.deepStrictEqual(transactions[1].items, ['Docker', 'Go', 'Kubernetes'])
})

// 7. Support Calculation
runTest('7. Support calculation matches count(A and B) / totalTransactions', () => {
  const dummyTx: Transaction[] = [
    { id: 't1', sourceType: 'project', sourceTitle: 'P1', items: ['Python', 'SQL'] },
    { id: 't2', sourceType: 'project', sourceTitle: 'P2', items: ['Python', 'SQL', 'Docker'] },
    { id: 't3', sourceType: 'project', sourceTitle: 'P3', items: ['Python', 'React'] },
    { id: 't4', sourceType: 'project', sourceTitle: 'P4', items: ['Go', 'Docker'] },
  ]
  const { coOccurrences, rules } = mineAssociationRules(dummyTx)
  const pySqlCo = coOccurrences.find(
    (c) => (c.skillA === 'Python' && c.skillB === 'SQL') || (c.skillA === 'SQL' && c.skillB === 'Python')
  )
  assert.ok(pySqlCo)
  assert.strictEqual(pySqlCo.count, 2) // In t1 and t2

  const pySqlRule = rules.find((r) => r.antecedent[0] === 'Python' && r.consequent[0] === 'SQL')
  assert.ok(pySqlRule)
  // Support = 2 / 4 = 0.5
  assert.strictEqual(pySqlRule.support, 0.5)
})

// 8. Confidence Calculation
runTest('8. Confidence calculation matches count(A and B) / count(A)', () => {
  const dummyTx: Transaction[] = [
    { id: 't1', sourceType: 'project', sourceTitle: 'P1', items: ['Python', 'SQL'] },
    { id: 't2', sourceType: 'project', sourceTitle: 'P2', items: ['Python', 'SQL'] },
    { id: 't3', sourceType: 'project', sourceTitle: 'P3', items: ['Python', 'Docker'] },
    { id: 't4', sourceType: 'project', sourceTitle: 'P4', items: ['Go', 'Docker'] },
  ]
  // Total tx = 4. Python appears in 3 tx (t1, t2, t3). SQL appears in 2 tx. (Python, SQL) in 2 tx.
  // Confidence(Python -> SQL) = 2 / 3 = 0.6667
  // Confidence(SQL -> Python) = 2 / 2 = 1.0
  const { rules } = mineAssociationRules(dummyTx)

  const sqlToPy = rules.find((r) => r.antecedent[0] === 'SQL' && r.consequent[0] === 'Python')
  assert.ok(sqlToPy)
  assert.strictEqual(sqlToPy.confidence, 1.0)

  const pyToSql = rules.find((r) => r.antecedent[0] === 'Python' && r.consequent[0] === 'SQL')
  assert.ok(pyToSql)
  assert.strictEqual(Math.round(pyToSql.confidence * 100), 67)
})

// 9. Lift Calculation
runTest('9. Lift calculation matches Confidence(A -> B) / Support(B)', () => {
  const dummyTx: Transaction[] = [
    { id: 't1', sourceType: 'project', sourceTitle: 'P1', items: ['Python', 'SQL'] },
    { id: 't2', sourceType: 'project', sourceTitle: 'P2', items: ['Python', 'SQL'] },
    { id: 't3', sourceType: 'project', sourceTitle: 'P3', items: ['Python', 'Docker'] },
    { id: 't4', sourceType: 'project', sourceTitle: 'P4', items: ['Go', 'Docker'] },
  ]
  // For SQL -> Python:
  // Confidence(SQL -> Python) = 1.0
  // Support(Python) = 3 / 4 = 0.75
  // Lift = 1.0 / 0.75 = 1.3333 (> 1 indicates positive association)
  const { rules } = mineAssociationRules(dummyTx)
  const sqlToPy = rules.find((r) => r.antecedent[0] === 'SQL' && r.consequent[0] === 'Python')
  assert.ok(sqlToPy)
  assert.strictEqual(Math.round(sqlToPy.lift * 100), 133)
})

// 10. Zero-Denominator Handling
runTest('10. Zero denominator handled safely without NaN or infinite values', () => {
  // Empty transaction set
  const emptyOutput = mineAssociationRules([])
  assert.strictEqual(emptyOutput.rules.length, 0)
  assert.strictEqual(emptyOutput.coOccurrences.length, 0)

  // Single transaction with 1 item (no pairs can form)
  const singleItemTx: Transaction[] = [
    { id: 't1', sourceType: 'project', sourceTitle: 'Solo', items: ['Python'] },
  ]
  const singleOutput = mineAssociationRules(singleItemTx)
  assert.strictEqual(singleOutput.coOccurrences.length, 0)
  assert.strictEqual(singleOutput.rules.length, 0)
})

// 11. Insufficient-Data Warnings
runTest('11. Data quality flags insufficient data and outputs transparent warnings', () => {
  const minimalProfile: Partial<UserProfile> = {
    skillsList: [{ id: '1', name: 'SQL', category: 'Databases', proficiency: 'Intermediate' }],
  }
  const { dataQuality } = preprocessProfile(minimalProfile)
  assert.strictEqual(dataQuality.confidenceLevel, 'low')
  assert.strictEqual(dataQuality.isSufficientData, false)
  assert.ok(dataQuality.warnings.length >= 2)
  assert.ok(dataQuality.warnings.some((w) => w.includes('No co-occurrence transactions')))
})

// 12. Graph Node Generation
runTest('12. Graph nodes are generated for skills, projects, experience, education, certs, and roles', () => {
  const profile: Partial<UserProfile> = {
    skillsList: [{ id: 's1', name: 'Python', category: 'Programming Languages', proficiency: 'Advanced' }],
    projects: [{ id: 'p1', title: 'Network Miner', description: 'desc', technologies: ['Python'] }],
    experience: [{ id: 'e1', jobTitle: 'Analyst', company: 'Tech Corp', startDate: '2023', isCurrent: true, description: 'desc', technologies: ['Python'] }],
    education: [{ id: 'ed1', institution: 'MIT', degree: 'BS', fieldOfStudy: 'CS', startYear: 2020, graduationYear: 2024 }],
    certifications: [{ id: 'c1', name: 'Python Certified', issuer: 'PFF' }],
  }
  const result = mineUserProfile(profile)
  const nodes = result.graphData.nodes

  const types = new Set(nodes.map((n) => n.type))
  assert.ok(types.has('skill'), 'Must include skill nodes')
  assert.ok(types.has('project'), 'Must include project nodes')
  assert.ok(types.has('experience'), 'Must include experience nodes')
  assert.ok(types.has('education'), 'Must include education nodes')
  assert.ok(types.has('certification'), 'Must include certification nodes')
})

// 13. Graph Edge Generation
runTest('13. Graph edges correctly represent relationships with evidence', () => {
  const profile: Partial<UserProfile> = {
    projects: [
      { id: 'p1', title: 'ML App', description: 'desc', technologies: ['Python', 'PyTorch'] },
    ],
  }
  const result = mineUserProfile(profile)
  const edges = result.graphData.edges

  const projEdge = edges.find((e) => e.type === 'used_in_project')
  assert.ok(projEdge, 'Should contain used_in_project edge')
  assert.ok(projEdge.evidence.includes('ML App'))

  const coEdge = edges.find((e) => e.type === 'co_occurred')
  assert.ok(coEdge, 'Should contain co_occurred edge between Python and PyTorch')
})

// 14. Duplicate Edge Prevention
runTest('14. Graph edge generation prevents duplicate edges', () => {
  const profile: Partial<UserProfile> = {
    projects: [
      { id: 'p1', title: 'App 1', description: 'desc', technologies: ['Python', 'SQL'] },
      { id: 'p2', title: 'App 2', description: 'desc', technologies: ['Python', 'SQL'] },
    ],
  }
  const result = mineUserProfile(profile)
  const edges = result.graphData.edges

  const edgeKeys = edges.map((e) => `${e.source}-->${e.target}::${e.type}`)
  const uniqueKeys = new Set(edgeKeys)
  assert.strictEqual(edgeKeys.length, uniqueKeys.size, 'All generated edges must be unique')
})

// 15. Career Role Score Calculations
runTest('15. Career role scores are calculated deterministically via weighted coverage', () => {
  // A profile with Python, SQL, Statistics, Pandas (strong Data Analyst candidate)
  const profile: Partial<UserProfile> = {
    skillsList: [
      { id: '1', name: 'SQL', category: 'Databases', proficiency: 'Advanced' },
      { id: '2', name: 'Python', category: 'Programming Languages', proficiency: 'Advanced' },
      { id: '3', name: 'Statistics', category: 'Data Science', proficiency: 'Advanced' },
      { id: '4', name: 'Pandas', category: 'Data Science', proficiency: 'Advanced' },
    ],
  }
  const { skills } = preprocessProfile(profile)
  const matches = matchCareerRoles(skills)

  const dataAnalyst = matches.find((m) => m.roleTitle === 'Data Analyst')
  assert.ok(dataAnalyst)
  // Required skills: SQL (1.0), Python (0.9), Statistics (0.8), Tableau (0.7), Pandas (0.8).
  // Total required weight = 4.2.
  // Matched = SQL (1.0) + Python (0.9) + Statistics (0.8) + Pandas (0.8) = 3.5.
  // Expected base score = (3.5 / 4.2) * 90 = ~75%
  assert.ok(dataAnalyst.matchScore >= 70 && dataAnalyst.matchScore <= 80)
  assert.strictEqual(dataAnalyst.unweightedMatchPercentage, 80) // 4 out of 5 required skills
})

// 16. Missing Skill Identification
runTest('16. Skill gap analyzer identifies missing skills and assigns priorities', () => {
  const profile: Partial<UserProfile> = {
    skillsList: [
      { id: '1', name: 'SQL', category: 'Databases', proficiency: 'Advanced' },
      { id: '2', name: 'Python', category: 'Programming Languages', proficiency: 'Advanced' },
      { id: '3', name: 'Statistics', category: 'Data Science', proficiency: 'Advanced' },
      { id: '4', name: 'Pandas', category: 'Data Science', proficiency: 'Advanced' },
    ],
  }
  const result = mineUserProfile(profile)
  const gaps = result.skillGaps

  const tableauGap = gaps.find((g) => g.skillName === 'Tableau' && g.targetRole === 'Data Analyst')
  assert.ok(tableauGap, 'Tableau must be identified as a missing skill for Data Analyst')
  assert.ok(tableauGap.reason.includes('Data Analyst'))
})

// 17. Profile Changes Producing Updated Results
runTest('17. Profile changes immediately produce updated mining results', () => {
  const initialProfile: Partial<UserProfile> = {
    skillsList: [{ id: '1', name: 'Python', category: 'Programming Languages', proficiency: 'Intermediate' }],
  }
  const initialResult = mineUserProfile(initialProfile)
  const initialDAScore = initialResult.careerMatches.find((m) => m.roleTitle === 'Data Analyst')?.matchScore || 0

  // Add SQL to the profile
  const updatedProfile: Partial<UserProfile> = {
    skillsList: [
      { id: '1', name: 'Python', category: 'Programming Languages', proficiency: 'Intermediate' },
      { id: '2', name: 'SQL', category: 'Databases', proficiency: 'Advanced' },
    ],
  }
  const updatedResult = mineUserProfile(updatedProfile)
  const updatedDAScore = updatedResult.careerMatches.find((m) => m.roleTitle === 'Data Analyst')?.matchScore || 0

  assert.ok(updatedDAScore > initialDAScore, 'Adding SQL must immediately raise Data Analyst match score')
  assert.strictEqual(updatedResult.normalisedSkills.length, 2)
})

console.log('\n======================================================')
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`)
console.log('======================================================\n')

if (failedCount > 0) {
  process.exit(1)
}
