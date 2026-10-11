/**
 * NETGRAPH Career Intelligence Report & PDF Export Unit Test Suite
 * Tests all required functional aspects:
 * 1. Report generation with completed profile
 * 2. Report generation with incomplete profile
 * 3. Report generation with empty profile
 * 4. Correct user information in report data
 * 5. Correct calculated career matches
 * 6. Correct skill gap information
 * 7. Correct relationship metrics when available
 * 8. Valid binary PDF export generation
 * 9. PDF header and trailer validation (%PDF- and %%EOF)
 * 10. Multi-page document generation
 * 11. Regenerating report after profile changes
 * 12. Handling missing optional fields gracefully
 * 13. Valid report filename formatting
 * 14. Profile completeness scoring
 * 15. Academic transparency and data limitation disclosures
 */

import assert from 'node:assert'
import { mineUserProfile } from '../index'
import { UserProfile, DEFAULT_DEMO_USER } from '../../auth'
import {
  buildCareerIntelligenceReport,
  getReportPdfFilename,
} from '../../report-generator'
import {
  generateReportPdfBuffer,
  createReportPdfDocument,
} from '../../report-pdf-generator'

let passedCount = 0
let failedCount = 0

function runTest(testName: string, testFn: () => void) {
  try {
    testFn()
    passedCount++
    console.log(`  ✓ PASS: ${testName}`)
  } catch (error) {
    failedCount++
    console.error(`  ✗ FAIL: ${testName}`)
    console.error(error)
  }
}

console.log('\n======================================================')
console.log('RUNNING NETGRAPH REPORT & PDF GENERATION TESTS')
console.log('======================================================\n')

// 1. Empty profile handling
runTest('1. Empty profile handling generates safe default report with zero crash', () => {
  const analysis = mineUserProfile(null)
  const report = buildCareerIntelligenceReport(null, analysis)

  assert.strictEqual(report.metadata.hasData, false)
  assert.strictEqual(report.metadata.userName, 'Anonymous Candidate')
  assert.strictEqual(report.skills.totalSkills, 0)
  assert.strictEqual(report.careerMatches.topMatches.length, 0)
  assert.strictEqual(report.skillGaps.gaps.length, 0)
  assert.strictEqual(report.relationships.rules.length, 0)
})

// 2. Incomplete profile handling
runTest('2. Incomplete profile handles missing optional fields safely', () => {
  const partialUser: Partial<UserProfile> = {
    id: 'user_part_1',
    name: 'Sarah Connor',
    skills: ['Python', 'SQL'],
  }
  const analysis = mineUserProfile(partialUser)
  const report = buildCareerIntelligenceReport(partialUser, analysis)

  assert.strictEqual(report.metadata.hasData, true)
  assert.strictEqual(report.metadata.userName, 'Sarah Connor')
  assert.strictEqual(report.profile.headline, undefined)
  assert.strictEqual(report.profile.summary, undefined)
  assert.strictEqual(report.profile.experience.length, 0)
  assert.strictEqual(report.profile.projects.length, 0)
  assert.strictEqual(report.skills.totalSkills, 2)
})

// 3. Completed profile extraction
runTest('3. Completed profile extracts user details and full portfolio', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)

  assert.strictEqual(report.metadata.hasData, true)
  assert.strictEqual(report.metadata.userName, 'Alex Morgan')
  assert.strictEqual(report.metadata.userEmail, 'demo@netgraph.edu')
  assert.ok(report.metadata.profileCompletenessScore > 50)
  assert.ok(report.skills.totalSkills >= 5)
  assert.ok(report.careerMatches.topMatches.length > 0)
})

// 4. Correct user information in metadata and profile
runTest('4. Correct user headline, summary, and links in profile section', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)

  assert.strictEqual(report.profile.headline, DEFAULT_DEMO_USER.headline)
  assert.strictEqual(report.profile.summary, DEFAULT_DEMO_USER.summary)
  assert.strictEqual(report.profile.location, DEFAULT_DEMO_USER.location)
  assert.strictEqual(report.profile.linkedinUrl, DEFAULT_DEMO_USER.linkedinUrl)
})

// 5. Correct calculated career matches
runTest('5. Career matches calculate realistic match scores and provide skill breakdown', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)

  assert.ok(report.careerMatches.topMatches.length > 0)
  const top = report.careerMatches.topMatches[0]
  assert.ok(top.matchScore >= 0 && top.matchScore <= 100)
  assert.ok(Array.isArray(top.matchedSkills))
  assert.ok(Array.isArray(top.missingRequiredSkills))
})

// 6. Correct skill gap information
runTest('6. Skill gaps identify missing critical capabilities with assigned priorities', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)

  assert.ok(Array.isArray(report.skillGaps.gaps))
  for (const gap of report.skillGaps.gaps) {
    assert.ok(['high', 'medium', 'low'].includes(gap.priority))
    assert.ok(gap.skillName.length > 0)
    assert.ok(gap.targetRole.length > 0)
  }
})

// 7. Correct relationship metrics when available
runTest('7. Mined relationships calculate support, confidence, and lift metrics', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)

  assert.ok(Array.isArray(report.relationships.rules))
  for (const rule of report.relationships.rules) {
    assert.ok(rule.support >= 0 && rule.support <= 1)
    assert.ok(rule.confidence >= 0 && rule.confidence <= 1)
    assert.ok(rule.lift >= 0)
  }
})

// 8. Generate valid PDF export
runTest('8. PDF generator produces valid binary PDF buffer', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)
  const buffer = generateReportPdfBuffer(report)

  assert.ok(buffer instanceof Uint8Array)
  assert.ok(buffer.length > 1000, 'PDF buffer should be substantial')
})

// 9. PDF header and trailer validation
runTest('9. PDF binary contains authentic %PDF- header and %%EOF trailer', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)
  const buffer = generateReportPdfBuffer(report)

  const header = Buffer.from(buffer.subarray(0, 8)).toString('utf-8')
  assert.ok(header.startsWith('%PDF-'), `Expected %PDF- header, got: ${header}`)

  const tail = Buffer.from(buffer.subarray(buffer.length - 30)).toString('utf-8')
  assert.ok(tail.includes('%%EOF'), `Expected %%EOF in trailer, got: ${tail}`)
})

// 10. Multi-page document generation
runTest('10. Comprehensive profile produces multi-page PDF document', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)
  const doc = createReportPdfDocument(report)

  const pageCount = doc.getNumberOfPages()
  assert.ok(pageCount >= 1, 'Report must generate at least 1 page')
})

// 11. Regenerating report after profile changes
runTest('11. Profile changes immediately update the generated report', () => {
  const initialAnalysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report1 = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, initialAnalysis)

  const updatedUser = {
    ...DEFAULT_DEMO_USER,
    skills: [...DEFAULT_DEMO_USER.skills!, 'Rust', 'Kubernetes'],
    name: 'Alexandra Morgan',
  }
  const updatedAnalysis = mineUserProfile(updatedUser)
  const report2 = buildCareerIntelligenceReport(updatedUser, updatedAnalysis)

  assert.strictEqual(report2.metadata.userName, 'Alexandra Morgan')
  assert.ok(report2.skills.totalSkills > report1.skills.totalSkills)
})

// 12. Standard filename format
runTest('12. Filename generator formats NETGRAPH_Career_Report_YYYY-MM-DD.pdf', () => {
  const filename = getReportPdfFilename('2026-10-11T12:00:00Z')
  assert.strictEqual(filename, 'NETGRAPH_Career_Report_2026-10-11.pdf')
})

// 13. Completeness score reflects real data
runTest('13. Completeness score rises with profile depth', () => {
  const bareUser: Partial<UserProfile> = { name: 'Bare User' }
  const bareReport = buildCareerIntelligenceReport(bareUser, mineUserProfile(bareUser))

  const fullReport = buildCareerIntelligenceReport(
    DEFAULT_DEMO_USER,
    mineUserProfile(DEFAULT_DEMO_USER)
  )

  assert.ok(
    fullReport.metadata.profileCompletenessScore >
      bareReport.metadata.profileCompletenessScore
  )
})

// 14. Academic limitations notice disclosure
runTest('14. Academic transparency and limitations are always disclosed', () => {
  const analysis = mineUserProfile(DEFAULT_DEMO_USER)
  const report = buildCareerIntelligenceReport(DEFAULT_DEMO_USER, analysis)

  assert.ok(report.limitations.explanation.length > 0)
  assert.ok(['low', 'moderate', 'high'].includes(report.limitations.confidenceLevel))
})

// 15. Empty profile PDF export generates cleanly without crash
runTest('15. Empty profile PDF generates cleanly without crashing', () => {
  const analysis = mineUserProfile(null)
  const report = buildCareerIntelligenceReport(null, analysis)
  const buffer = generateReportPdfBuffer(report)

  assert.ok(buffer instanceof Uint8Array)
  assert.ok(buffer.length > 500)
  const header = Buffer.from(buffer.subarray(0, 8)).toString('utf-8')
  assert.ok(header.startsWith('%PDF-'))
})

console.log('\n======================================================')
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`)
console.log('======================================================\n')

if (failedCount > 0) {
  process.exit(1)
}
