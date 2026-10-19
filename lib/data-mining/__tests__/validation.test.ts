/**
 * NETGRAPH Profile Data Validation & Quality Improvements Unit Test Suite
 * Tests all required validation & hygiene aspects:
 * 1. Empty profile validation
 * 2. Partial profile validation
 * 3. Whitespace-only values treated as invalid
 * 4. Invalid email formats rejected
 * 5. Invalid URL formats rejected
 * 6. Duplicate skill detection (exact & alias duplicates)
 * 7. Missing project descriptions or technologies identified
 * 8. Missing experience fields & invalid date ranges identified
 * 9. Malformed localStorage profile recovery (sanitizeProfileData)
 * 10. Profile completeness percentage calculations
 * 11. Safe behavior when feeding incomplete or invalid profiles into data-mining engine
 * 12. Education & Certification validation
 * 13. Data quality downstream impact flags (career matching & relationship mining readiness)
 */

import assert from 'node:assert'
import {
  isNonEmpty,
  sanitizeString,
  isValidUrl,
  isValidEmail,
  isValidYear,
  isValidDateRange,
  validateSkill,
  validateProject,
  validateExperience,
  validateEducation,
  validateCertification,
  evaluateProfileDataQuality,
  sanitizeProfileData,
  calculateProfileCompleteness,
} from '../../data-validation'
import { mineUserProfile } from '../index'
import type { SkillEntry, ProjectEntry, ExperienceEntry, EducationEntry, CertificationEntry } from '../../profile'

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
console.log('RUNNING NETGRAPH PROFILE VALIDATION & DATA QUALITY TESTS')
console.log('======================================================\n')

// 1. Empty Profile Validation
runTest('1. Empty profile returns valid error structures, zero completeness, and safe defaults', () => {
  const result = evaluateProfileDataQuality(null)
  assert.strictEqual(result.isValid, false)
  assert.strictEqual(result.completeness, 0)
  assert.strictEqual(result.miningReadiness.canMatchCareers, false)
  assert.strictEqual(result.miningReadiness.canMineRelationships, false)
  assert.strictEqual(result.miningReadiness.careerMatchQuality, 'none')
  assert.ok(result.errors.length > 0)
  assert.ok(result.recommendations.length > 0)
})

// 2. Partial Profile Validation
runTest('2. Partial profile calculates proportional completeness and identifies missing items', () => {
  const partial = {
    name: 'Ada Lovelace',
    headline: 'First Computer Programmer',
    skills: ['Algorithms', 'Mathematics'],
  }
  const result = evaluateProfileDataQuality(partial)
  assert.ok(result.completeness > 0 && result.completeness < 70)
  assert.strictEqual(result.miningReadiness.canMatchCareers, true)
  assert.strictEqual(result.miningReadiness.canMineRelationships, false) // no projects/exp with technologies
  const missingLabels = result.missingItems.map((m) => m.label)
  assert.ok(missingLabels.includes('Portfolio projects'))
  assert.ok(missingLabels.includes('Work experience'))
})

// 3. Whitespace-Only Values Treated as Invalid
runTest('3. Whitespace-only values are treated as empty across all validation primitives', () => {
  assert.strictEqual(isNonEmpty('   '), false)
  assert.strictEqual(isNonEmpty('\t\n  '), false)
  assert.strictEqual(sanitizeString('   hello   '), 'hello')
  assert.strictEqual(sanitizeString('   \n  '), '')

  // Experience with whitespace-only company
  const expRes = validateExperience({ company: '   ', jobTitle: 'Engineer', startDate: '2023', description: 'Code' })
  assert.strictEqual(expRes.valid, false)
  assert.ok(expRes.errors.company)

  // Project with whitespace-only title
  const projRes = validateProject({ title: '   ', description: 'Built an app' })
  assert.strictEqual(projRes.valid, false)
  assert.ok(projRes.errors.title)
})

// 4. Invalid Email Formats Rejected
runTest('4. Invalid email formats are rejected and valid emails accepted', () => {
  const invalidEmails = ['plainaddress', '@missingusername.com', 'user@.com', 'user@domain', 'user @domain.com', '']
  for (const email of invalidEmails) {
    assert.strictEqual(isValidEmail(email), false, `Should reject ${email}`)
  }

  const validEmails = ['test@example.com', 'first.last@sub.domain.co.uk', 'user+tag@gmail.com']
  for (const email of validEmails) {
    assert.strictEqual(isValidEmail(email), true, `Should accept ${email}`)
  }
})

// 5. Invalid URL Formats Rejected
runTest('5. Invalid URL formats rejected, preventing XSS and invalid web addresses', () => {
  const invalidUrls = ['javascript:alert(1)', 'htt://broken.com', 'ftp://bad', 'just text', 'http://', 'https://']
  for (const url of invalidUrls) {
    assert.strictEqual(isValidUrl(url), false, `Should reject: ${url}`)
  }

  const validUrls = [
    'https://github.com/username',
    'http://localhost:3000',
    'https://subdomain.example.org/path?query=1#hash',
  ]
  for (const url of validUrls) {
    assert.strictEqual(isValidUrl(url), true, `Should accept: ${url}`)
  }
})

// 6. Duplicate Skill Detection (Exact & Normalised Alias)
runTest('6. Duplicate skill detection flags exact duplicates and aliases (e.g. js vs JavaScript)', () => {
  const existingSkills: SkillEntry[] = [
    { id: '1', name: 'JavaScript', category: 'Programming Languages', proficiency: 'Advanced', yearsOfExperience: 3 },
    { id: '2', name: 'React', category: 'Frameworks', proficiency: 'Intermediate', yearsOfExperience: 2 },
  ]

  // Exact duplicate (case-insensitive)
  const exactCheck = validateSkill('javascript', existingSkills)
  assert.strictEqual(exactCheck.valid, false)
  assert.ok(exactCheck.errors.name.includes('already in your skills'))

  // Alias duplicate: "js" normalises to "JavaScript"
  const aliasCheck = validateSkill('js', existingSkills)
  assert.strictEqual(aliasCheck.valid, false)
  assert.ok(aliasCheck.errors.name.includes('already in your skills'))

  // Alias duplicate: "reactjs" normalises to "React"
  const aliasCheck2 = validateSkill('reactjs', existingSkills)
  assert.strictEqual(aliasCheck2.valid, false)
  assert.ok(aliasCheck2.errors.name.includes('already in your skills'))

  // New unique skill
  const newCheck = validateSkill('Python', existingSkills)
  assert.strictEqual(newCheck.valid, true)
})

// 7. Missing Project Descriptions or Technologies Identified
runTest('7. Missing project descriptions or technologies identified with warnings for relationship mining', () => {
  const projectWithoutDesc: Partial<ProjectEntry> = {
    title: 'Distributed Cache',
    description: '',
    technologies: ['Go', 'Redis'],
  }
  const res1 = validateProject(projectWithoutDesc)
  assert.strictEqual(res1.valid, false)
  assert.ok(res1.errors.description)

  const projectWithoutTech: Partial<ProjectEntry> = {
    title: 'Distributed Cache',
    description: 'High throughput distributed caching system built for scale.',
    technologies: [],
  }
  const res2 = validateProject(projectWithoutTech)
  assert.strictEqual(res2.valid, true)
  assert.ok(res2.warnings.length > 0)
  assert.ok(res2.warnings[0].toLowerCase().includes('relationship mining'))
})

// 8. Missing Experience Fields & Invalid Date Ranges Identified
runTest('8. Missing experience fields and impossible date ranges identified', () => {
  // Missing required company and job title
  const invalidExp: Partial<ExperienceEntry> = {
    company: '',
    jobTitle: '',
    startDate: '',
    description: '',
  }
  const res = validateExperience(invalidExp)
  assert.strictEqual(res.valid, false)
  assert.ok(res.errors.company)
  assert.ok(res.errors.jobTitle)
  assert.ok(res.errors.startDate)
  assert.ok(res.errors.description)

  // Inverted date range (end precedes start)
  const invertedDate = isValidDateRange('2024-05', '2022-01', false)
  assert.strictEqual(invertedDate.valid, false)
  assert.ok(invertedDate.error?.includes('earlier'))

  // Valid date range with current employment
  const currentDate = isValidDateRange('2022-01', 'Present', true)
  assert.strictEqual(currentDate.valid, true)
})

// 9. Malformed localStorage Profile Recovery
runTest('9. Malformed localStorage data recovery guarantees safe arrays and expected types', () => {
  const corruptInput = {
    name: 'Test Candidate',
    skills: 'not-an-array',
    skillsList: null,
    projects: { 0: 'bad-object' },
    experience: undefined,
    education: 12345,
    certifications: false,
    linkedinUrl: 'javascript:alert(1)',
  }

  const sanitized = sanitizeProfileData(corruptInput)
  assert.strictEqual(sanitized.name, 'Test Candidate')
  assert.strictEqual(sanitized.linkedinUrl, undefined, 'Dangerous javascript: URL must be stripped')
  assert.ok(Array.isArray(sanitized.skills))
  assert.strictEqual(sanitized.skills.length, 0)
  assert.ok(Array.isArray(sanitized.skillsList))
  assert.strictEqual(sanitized.skillsList.length, 0)
  assert.ok(Array.isArray(sanitized.projects))
  assert.strictEqual(sanitized.projects.length, 0)
  assert.ok(Array.isArray(sanitized.experience))
  assert.strictEqual(sanitized.experience.length, 0)
  assert.ok(Array.isArray(sanitized.education))
  assert.strictEqual(sanitized.education.length, 0)
  assert.ok(Array.isArray(sanitized.certifications))
  assert.strictEqual(sanitized.certifications.length, 0)
})

// 10. Profile Completeness Percentage Calculations
runTest('10. Profile completeness calculation scales accurately from 0% to 100%', () => {
  // Empty
  assert.strictEqual(calculateProfileCompleteness(null), 0)
  assert.strictEqual(calculateProfileCompleteness({}), 0)

  // Name only
  const c1 = calculateProfileCompleteness({ name: 'Grace Hopper' })
  assert.ok(c1 >= 10 && c1 <= 20)

  // Complete profile
  const fullProfile = {
    name: 'Grace Hopper',
    headline: 'Computer Scientist & Pioneer',
    careerGoal: 'Develop compiler technology',
    summary: 'Pioneered machine-independent programming languages and linker development.',
    location: 'Arlington, VA',
    linkedinUrl: 'https://linkedin.com/in/gracehopper',
    githubUrl: 'https://github.com/gracehopper',
    education: [
      { id: 'edu_1', institution: 'Yale University', degree: 'Ph.D.', fieldOfStudy: 'Mathematics', startYear: 1930, graduationYear: 1934 },
    ],
    skillsList: [
      { id: 'sk_1', name: 'COBOL', category: 'Programming Languages' as const, proficiency: 'Expert' as const, yearsOfExperience: 10 },
      { id: 'sk_2', name: 'Compilers', category: 'Tools' as const, proficiency: 'Expert' as const, yearsOfExperience: 10 },
      { id: 'sk_3', name: 'Assembly', category: 'Programming Languages' as const, proficiency: 'Advanced' as const, yearsOfExperience: 8 },
      { id: 'sk_4', name: 'Machine Architecture', category: 'Tools' as const, proficiency: 'Advanced' as const, yearsOfExperience: 8 },
    ],
    experience: [
      { id: 'exp_1', jobTitle: 'Director', company: 'US Navy', startDate: '1943', endDate: '1986', description: 'Computing leadership', technologies: ['COBOL'], isCurrent: false },
    ],
    projects: [
      { id: 'pj_1', title: 'A-0 Compiler', description: 'Early compiler system', technologies: ['Compilers', 'Assembly'] },
    ],
    certifications: [
      { id: 'crt_1', name: 'National Medal of Technology', issuer: 'USA', issueDate: '1991' },
    ],
  }

  const cFull = calculateProfileCompleteness(fullProfile)
  assert.strictEqual(cFull, 100)
})

// 11. Safe Behavior When Feeding Incomplete or Invalid Profiles into Data Mining Engine
runTest('11. Feeding empty, null, or corrupted profiles into mineUserProfile runs safely without throwing', () => {
  // 1. null
  const nullMining = mineUserProfile(null)
  assert.ok(nullMining)
  assert.strictEqual(nullMining.normalisedSkills.length, 0)
  assert.strictEqual(nullMining.associationRules.length, 0)
  assert.ok(nullMining.careerMatches.every((m) => m.matchScore === 0))

  // 2. completely empty object
  const emptyMining = mineUserProfile({} as any)
  assert.ok(emptyMining)
  assert.strictEqual(emptyMining.normalisedSkills.length, 0)
  assert.ok(emptyMining.careerMatches.every((m) => m.matchScore === 0))

  // 3. malformed fields
  const corruptMining = mineUserProfile({
    skills: 'bad-string',
    projects: 12345,
    experience: null,
  } as any)
  assert.ok(corruptMining)
  assert.strictEqual(corruptMining.normalisedSkills.length, 0)
  assert.ok(corruptMining.careerMatches.every((m) => m.matchScore === 0))
})

// 12. Education & Certification Validation
runTest('12. Education and certification validators catch missing fields and invalid years', () => {
  const invalidEdu: Partial<EducationEntry> = {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: 1800, // out of range
  }
  const eduRes = validateEducation(invalidEdu)
  assert.strictEqual(eduRes.valid, false)
  assert.ok(eduRes.errors.institution)
  assert.ok(eduRes.errors.degree)
  assert.ok(eduRes.errors.fieldOfStudy)
  assert.ok(eduRes.errors.startYear)

  const invalidCert: Partial<CertificationEntry> = {
    name: '   ',
    issuer: '',
    credentialUrl: 'javascript:void(0)',
  }
  const certRes = validateCertification(invalidCert)
  assert.strictEqual(certRes.valid, false)
  assert.ok(certRes.errors.name)
  assert.ok(certRes.errors.issuer)
  assert.ok(certRes.errors.credentialUrl)
})

// 13. Data Quality Downstream Impact Flags
runTest('13. evaluateProfileDataQuality accurately sets downstream mining impact flags', () => {
  // Profile with skills but no project/experience tech tags
  const skillsOnly = {
    name: 'Linus',
    skills: ['C', 'Git', 'Linux Kernel', 'File Systems'],
  }
  const report1 = evaluateProfileDataQuality(skillsOnly)
  assert.strictEqual(report1.miningReadiness.canMatchCareers, true)
  assert.strictEqual(report1.miningReadiness.canMineRelationships, false)
  assert.strictEqual(report1.miningReadiness.relationshipMiningQuality, 'none')

  // Profile with skills and project tech tags
  const withProjects = {
    ...skillsOnly,
    projects: [
      { id: '1', title: 'Linux', description: 'Kernel implementation', technologies: ['C', 'Linux Kernel', 'File Systems'] },
      { id: '2', title: 'Git', description: 'Version control system', technologies: ['C', 'Git'] },
    ],
  }
  const report2 = evaluateProfileDataQuality(withProjects)
  assert.strictEqual(report2.miningReadiness.canMatchCareers, true)
  assert.strictEqual(report2.miningReadiness.canMineRelationships, true)
  assert.ok(report2.miningReadiness.relationshipMiningQuality === 'medium' || report2.miningReadiness.relationshipMiningQuality === 'high')
})

console.log('\n======================================================')
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`)
console.log('======================================================\n')

if (failedCount > 0) {
  process.exit(1)
}
