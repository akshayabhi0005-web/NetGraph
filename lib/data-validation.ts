/**
 * NETGRAPH Profile Data Validation & Data Quality Engine
 * Centralized, reusable validation rules, data quality assessment,
 * and safe profile data sanitization.
 */

import {
  UserProfileData,
  SkillEntry,
  EducationEntry,
  ProjectEntry,
  ExperienceEntry,
  CertificationEntry,
  SkillCategory,
  SKILL_CATEGORIES,
  SkillProficiency,
  SKILL_PROFICIENCIES,
} from './profile'
export type { UserProfileData }
import { normaliseSkillName } from './data-mining/normalizer'

// ─────────────────────────────────────────────────────────────────────────────
// 1. Primitive Validators & Sanitizers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a string is non-empty and contains non-whitespace characters.
 */
export function isNonEmpty(value?: string | null): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Trims whitespace from string, returning empty string for null/undefined.
 */
export function sanitizeString(value?: string | null): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Validate URL syntax (http/https). Returns true if empty (optional field).
 */
export function isValidUrl(urlString?: string | null): boolean {
  if (!urlString || !urlString.trim()) return true
  try {
    const url = new URL(urlString.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate standard email format.
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email || !email.trim()) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Validates year input (1900 to currentYear + 10).
 */
export function isValidYear(year?: string | number | null): boolean {
  if (year === undefined || year === null || year === '') return false
  const y = typeof year === 'number' ? year : parseInt(String(year).trim(), 10)
  if (isNaN(y)) return false
  const currentYear = new Date().getFullYear()
  return y >= 1950 && y <= currentYear + 10
}

/**
 * Validates date ranges for employment / projects.
 */
export function isValidDateRange(
  startDate?: string | null,
  endDate?: string | null,
  isCurrent?: boolean
): { valid: boolean; error?: string } {
  if (!isNonEmpty(startDate)) {
    return { valid: false, error: 'Start date is required.' }
  }

  if (isCurrent || !isNonEmpty(endDate) || endDate?.trim().toLowerCase() === 'present') {
    return { valid: true }
  }

  const start = new Date(startDate!.trim())
  const end = new Date(endDate!.trim())

  if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
    return { valid: false, error: 'End date cannot be earlier than start date.' }
  }

  return { valid: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Entity Validators
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
  warnings: string[]
}

/**
 * Validates a skill entry and checks for duplicate/inconsistent naming.
 */
export function validateSkill(
  skillOrName: Partial<SkillEntry> | string,
  existingSkills: SkillEntry[] = []
): ValidationResult {
  const skill: Partial<SkillEntry> =
    typeof skillOrName === 'string' ? { name: skillOrName } : skillOrName
  const errors: Record<string, string> = {}
  const warnings: string[] = []

  const rawName = sanitizeString(skill.name)
  if (!rawName) {
    errors.name = 'Skill name is required.'
  } else if (rawName.length < 2) {
    errors.name = 'Skill name must be at least 2 characters.'
  }

  if (rawName) {
    const canonical = normaliseSkillName(rawName)
    const isDuplicate = existingSkills.some(
      (s) =>
        s.id !== skill.id &&
        (s.name.trim().toLowerCase() === rawName.toLowerCase() ||
          normaliseSkillName(s.name).toLowerCase() === canonical.toLowerCase())
    )

    if (isDuplicate) {
      errors.name = `"${rawName}" (or alias "${canonical}") is already in your skills.`
    } else if (canonical && canonical.toLowerCase() !== rawName.toLowerCase()) {
      warnings.push(`"${rawName}" will be normalized to standard canonical name "${canonical}".`)
    }
  }

  if (skill.category && !SKILL_CATEGORIES.includes(skill.category as SkillCategory)) {
    errors.category = 'Please select a valid technical category.'
  }

  if (
    skill.proficiency &&
    !SKILL_PROFICIENCIES.includes(skill.proficiency as SkillProficiency)
  ) {
    errors.proficiency = 'Please select a valid proficiency level.'
  }

  if (skill.yearsOfExperience !== undefined) {
    const yrs = Number(skill.yearsOfExperience)
    if (isNaN(yrs) || yrs < 0 || yrs > 50) {
      errors.yearsOfExperience = 'Years of experience must be between 0 and 50.'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates a project entry.
 */
export function validateProject(proj: Partial<ProjectEntry>): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: string[] = []

  if (!isNonEmpty(proj.title)) {
    errors.title = 'Project title is required.'
  } else if (sanitizeString(proj.title).length < 2) {
    errors.title = 'Project title must be at least 2 characters.'
  }

  if (!isNonEmpty(proj.description)) {
    errors.description = 'Project description is required.'
  } else if (sanitizeString(proj.description).length < 5) {
    errors.description = 'Project description must be at least 5 characters.'
  }

  const techs = Array.isArray(proj.technologies)
    ? proj.technologies.map((t) => sanitizeString(t)).filter(Boolean)
    : []

  if (techs.length === 0) {
    warnings.push(
      'No technologies specified. Tagging technologies in projects is required for relationship mining.'
    )
  }

  if (proj.projectUrl && !isValidUrl(proj.projectUrl)) {
    errors.projectUrl = 'Please enter a valid URL starting with http:// or https://'
  }

  if (proj.githubUrl && !isValidUrl(proj.githubUrl)) {
    errors.githubUrl = 'Please enter a valid GitHub repository URL.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates a work experience entry.
 */
export function validateExperience(exp: Partial<ExperienceEntry>): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: string[] = []

  if (!isNonEmpty(exp.company)) {
    errors.company = 'Company name is required.'
  }

  if (!isNonEmpty(exp.jobTitle)) {
    errors.jobTitle = 'Job title is required.'
  }

  if (!isNonEmpty(exp.startDate)) {
    errors.startDate = 'Start date is required.'
  }

  if (!isNonEmpty(exp.description)) {
    errors.description = 'Role description or responsibilities required.'
  }

  const dateCheck = isValidDateRange(exp.startDate, exp.endDate, exp.isCurrent)
  if (!dateCheck.valid && dateCheck.error) {
    errors.endDate = dateCheck.error
  }

  const techs = Array.isArray(exp.technologies)
    ? exp.technologies.map((t) => sanitizeString(t)).filter(Boolean)
    : []

  if (techs.length === 0) {
    warnings.push(
      'Tagging technologies used in this role enables transaction co-occurrence mining.'
    )
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates an education entry.
 */
export function validateEducation(edu: Partial<EducationEntry>): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: string[] = []

  if (!isNonEmpty(edu.institution)) {
    errors.institution = 'Institution or university name is required.'
  }

  if (!isNonEmpty(edu.degree)) {
    errors.degree = 'Degree or qualification is required.'
  }

  if (!isNonEmpty(edu.fieldOfStudy)) {
    errors.fieldOfStudy = 'Field of study or major is required.'
  }

  if (!isValidYear(edu.startYear)) {
    errors.startYear = 'Please provide a valid start year (e.g. 2020).'
  }

  const isCurrent =
    edu.graduationYear === 'Present' ||
    String(edu.graduationYear).trim().toLowerCase() === 'present'

  if (!isCurrent && edu.graduationYear !== undefined && edu.graduationYear !== '') {
    if (!isValidYear(edu.graduationYear)) {
      errors.graduationYear = 'Please provide a valid graduation year.'
    } else if (
      isValidYear(edu.startYear) &&
      Number(edu.graduationYear) < Number(edu.startYear)
    ) {
      errors.graduationYear = 'Graduation year cannot be earlier than start year.'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates a certification entry.
 */
export function validateCertification(cert: Partial<CertificationEntry>): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: string[] = []

  if (!isNonEmpty(cert.name)) {
    errors.name = 'Certification name is required.'
  }

  if (!isNonEmpty(cert.issuer)) {
    errors.issuer = 'Issuing organization is required.'
  }

  if (cert.credentialUrl && !isValidUrl(cert.credentialUrl)) {
    errors.credentialUrl = 'Please enter a valid credential verification URL.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Comprehensive Data Quality & Profile Evaluation
// ─────────────────────────────────────────────────────────────────────────────

export interface DataQualityReport {
  completeness: number // 0 to 100
  isValid: boolean
  errors: { field: string; message: string; section: string }[]
  warnings: { message: string; section: string; impact: 'career_matching' | 'relationship_mining' | 'general' }[]
  inconsistencies: string[]
  missingItems: { label: string; section: string; importance: 'high' | 'medium' | 'low'; link: string }[]
  recommendations: { action: string; benefit: string; link: string }[]
  miningReadiness: {
    canMatchCareers: boolean
    canMineRelationships: boolean
    careerMatchQuality: 'none' | 'low' | 'medium' | 'high'
    relationshipMiningQuality: 'none' | 'low' | 'medium' | 'high'
  }
}

/**
 * Evaluates the actual profile for data hygiene, completeness,
 * inconsistencies, and mining readiness.
 */
export function evaluateProfileDataQuality(
  profile?: Partial<UserProfileData> | null
): DataQualityReport {
  const errors: { field: string; message: string; section: string }[] = []
  const warnings: { message: string; section: string; impact: 'career_matching' | 'relationship_mining' | 'general' }[] = []
  const inconsistencies: string[] = []
  const missingItems: { label: string; section: string; importance: 'high' | 'medium' | 'low'; link: string }[] = []
  const recommendations: { action: string; benefit: string; link: string }[] = []

  if (!profile) {
    return {
      completeness: 0,
      isValid: false,
      errors: [{ field: 'profile', message: 'Profile is not initialized.', section: 'Account' }],
      warnings: [{ message: 'No profile data exists.', section: 'General', impact: 'general' }],
      inconsistencies: [],
      missingItems: [{ label: 'Personal Information', section: 'Personal', importance: 'high', link: '/profile' }],
      recommendations: [{ action: 'Complete Guided Onboarding', benefit: 'Initializes your career intelligence map', link: '/onboarding' }],
      miningReadiness: {
        canMatchCareers: false,
        canMineRelationships: false,
        careerMatchQuality: 'none',
        relationshipMiningQuality: 'none',
      },
    }
  }

  // 1. Personal Information Checks
  if (!isNonEmpty(profile.name)) {
    errors.push({ field: 'name', message: 'Full name is required.', section: 'Personal' })
    missingItems.push({ label: 'Full name', section: 'Personal', importance: 'high', link: '/profile' })
  }

  if (profile.email && !isValidEmail(profile.email)) {
    errors.push({ field: 'email', message: 'Email address format is invalid.', section: 'Personal' })
  }

  if (!isNonEmpty(profile.headline)) {
    missingItems.push({ label: 'Professional headline', section: 'Personal', importance: 'medium', link: '/profile' })
    recommendations.push({
      action: 'Add a professional headline',
      benefit: 'Clarifies your career identity for reports and alignment',
      link: '/profile',
    })
  }

  if (!isNonEmpty(profile.summary)) {
    missingItems.push({ label: 'Career summary', section: 'Personal', importance: 'medium', link: '/profile' })
  }

  if (profile.linkedinUrl && !isValidUrl(profile.linkedinUrl)) {
    errors.push({ field: 'linkedinUrl', message: 'LinkedIn URL is invalid.', section: 'Personal' })
  }
  if (profile.githubUrl && !isValidUrl(profile.githubUrl)) {
    errors.push({ field: 'githubUrl', message: 'GitHub URL is invalid.', section: 'Personal' })
  }
  if (profile.portfolioUrl && !isValidUrl(profile.portfolioUrl)) {
    errors.push({ field: 'portfolioUrl', message: 'Portfolio URL is invalid.', section: 'Personal' })
  }

  // 2. Skills Quality Checks
  const skillsList = Array.isArray(profile.skillsList) ? profile.skillsList : []
  const rawSkills = Array.isArray(profile.skills) ? profile.skills : []
  const effectiveSkillCount = Math.max(skillsList.length, rawSkills.length)

  // Detect duplicate skills in skillsList
  const seenSkillNames = new Set<string>()
  for (const s of skillsList) {
    if (!s || !s.name) continue
    const canonical = normaliseSkillName(s.name).toLowerCase()
    if (seenSkillNames.has(canonical)) {
      inconsistencies.push(`Duplicate skill detected: "${s.name}". Data mining engine merges duplicates automatically.`)
    } else {
      seenSkillNames.add(canonical)
    }
  }

  if (effectiveSkillCount === 0) {
    missingItems.push({ label: 'Technical skills', section: 'Skills', importance: 'high', link: '/profile' })
    warnings.push({
      message: 'No technical skills cataloged. Career matching and skill gap analysis cannot run.',
      section: 'Skills',
      impact: 'career_matching',
    })
    recommendations.push({
      action: 'Add at least 3-5 technical skills',
      benefit: 'Enables deterministic career alignment and gap discovery',
      link: '/skills',
    })
  } else if (effectiveSkillCount < 4) {
    warnings.push({
      message: `Only ${effectiveSkillCount} skill${effectiveSkillCount === 1 ? '' : 's'} cataloged. Add more competencies for accurate career coverage.`,
      section: 'Skills',
      impact: 'career_matching',
    })
  }

  // 3. Projects Quality Checks
  const projects = Array.isArray(profile.projects) ? profile.projects : []
  if (projects.length === 0) {
    missingItems.push({ label: 'Portfolio projects', section: 'Projects', importance: 'high', link: '/profile' })
    warnings.push({
      message: 'No portfolio projects documented. Projects provide vital transaction co-occurrence data.',
      section: 'Projects',
      impact: 'relationship_mining',
    })
    recommendations.push({
      action: 'Document at least 1 project with technologies',
      benefit: 'Unlocks empirical co-occurrence pairings and relationship mining',
      link: '/profile',
    })
  } else {
    let emptyTechCount = 0
    projects.forEach((p, idx) => {
      if (!p) return
      if (!isNonEmpty(p.title)) {
        errors.push({ field: `projects[${idx}].title`, message: `Project #${idx + 1} has no title.`, section: 'Projects' })
      }
      if (!isNonEmpty(p.description)) {
        warnings.push({ message: `Project "${p.title || `#${idx + 1}`}" is missing a description.`, section: 'Projects', impact: 'general' })
      }
      const pTechs = Array.isArray(p.technologies) ? p.technologies.filter(isNonEmpty) : []
      if (pTechs.length === 0) {
        emptyTechCount++
      }
    })
    if (emptyTechCount > 0) {
      inconsistencies.push(
        `${emptyTechCount} project${emptyTechCount > 1 ? 's' : ''} have no technologies tagged, excluding them from co-occurrence mining.`
      )
      warnings.push({
        message: `${emptyTechCount} project${emptyTechCount > 1 ? 's lack' : ' lacks'} technology tags.`,
        section: 'Projects',
        impact: 'relationship_mining',
      })
    }
  }

  // 4. Experience Quality Checks
  const experience = Array.isArray(profile.experience) ? profile.experience : []
  if (experience.length === 0) {
    missingItems.push({ label: 'Work experience', section: 'Experience', importance: 'medium', link: '/profile' })
  } else {
    experience.forEach((exp, idx) => {
      if (!exp) return
      if (!isNonEmpty(exp.company) || !isNonEmpty(exp.jobTitle)) {
        errors.push({
          field: `experience[${idx}]`,
          message: `Experience #${idx + 1} is missing company or job title.`,
          section: 'Experience',
        })
      }
      const expTechs = Array.isArray(exp.technologies) ? exp.technologies.filter(isNonEmpty) : []
      if (expTechs.length === 0) {
        warnings.push({
          message: `Work experience at "${exp.company || 'Company'}" has no technologies listed.`,
          section: 'Experience',
          impact: 'relationship_mining',
        })
      }
    })
  }

  // 5. Education Quality Checks
  const education = Array.isArray(profile.education) ? profile.education : []
  if (education.length === 0) {
    missingItems.push({ label: 'Education history', section: 'Education', importance: 'medium', link: '/profile' })
  }

  // 6. Mining Readiness Assessment
  const totalTransactions =
    projects.filter((p) => p && Array.isArray(p.technologies) && p.technologies.filter(isNonEmpty).length > 0).length +
    experience.filter((e) => e && Array.isArray(e.technologies) && e.technologies.filter(isNonEmpty).length > 0).length

  const canMatchCareers = effectiveSkillCount >= 1
  const canMineRelationships = effectiveSkillCount >= 2 && totalTransactions >= 1

  const careerMatchQuality: 'none' | 'low' | 'medium' | 'high' =
    effectiveSkillCount >= 6 ? 'high' : effectiveSkillCount >= 3 ? 'medium' : effectiveSkillCount >= 1 ? 'low' : 'none'

  const relationshipMiningQuality: 'none' | 'low' | 'medium' | 'high' =
    totalTransactions >= 3 ? 'high' : totalTransactions >= 1 ? 'medium' : 'none'

  // Calculate completeness score (0-100) using deterministic formula
  let completenessScore = 0
  if (isNonEmpty(profile.name)) completenessScore += 10
  if (isNonEmpty(profile.headline)) completenessScore += 5
  if (isNonEmpty(profile.location)) completenessScore += 5
  if (isNonEmpty(profile.summary)) completenessScore += 5
  if (isNonEmpty(profile.linkedinUrl) || isNonEmpty(profile.githubUrl)) completenessScore += 5
  if (education.length > 0) completenessScore += 20
  if (effectiveSkillCount >= 3) completenessScore += 25
  else if (effectiveSkillCount > 0) completenessScore += 15
  if (projects.length > 0) completenessScore += 15
  if (experience.length > 0) completenessScore += 10

  const completeness = Math.min(100, Math.max(0, completenessScore))

  return {
    completeness,
    isValid: errors.length === 0,
    errors,
    warnings,
    inconsistencies,
    missingItems,
    recommendations,
    miningReadiness: {
      canMatchCareers,
      canMineRelationships,
      careerMatchQuality,
      relationshipMiningQuality,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Safe Profile Sanitization & Storage Guard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sanitizes URLs ensuring only valid http/https URLs are retained,
 * preventing execution of javascript: or dangerous URI schemes.
 */
function sanitizeSafeUrl(rawUrl?: unknown): string | undefined {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return undefined
  const trimmed = rawUrl.trim()
  return isValidUrl(trimmed) ? trimmed : undefined
}

/**
 * Safely sanitizes arbitrary/malformed profile objects from localStorage,
 * ensuring all required arrays exist and strings are trimmed without losing data.
 */
export function sanitizeProfileData(raw: unknown): UserProfileData {
  const p = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  const id = typeof p.id === 'string' && p.id.trim() ? p.id.trim() : 'usr_' + Date.now().toString(36)
  const name = typeof p.name === 'string' ? p.name.trim() : ''
  const email = typeof p.email === 'string' ? p.email.trim() : ''

  // Safe array extractors
  const education: EducationEntry[] = Array.isArray(p.education)
    ? p.education
        .filter((item): item is EducationEntry => typeof item === 'object' && item !== null)
        .map((edu, idx) => ({
          id: typeof edu.id === 'string' ? edu.id : `edu_${idx}_${Date.now()}`,
          institution: sanitizeString(edu.institution),
          degree: sanitizeString(edu.degree),
          fieldOfStudy: sanitizeString(edu.fieldOfStudy),
          startYear: typeof edu.startYear === 'number' || typeof edu.startYear === 'string' ? edu.startYear : 2020,
          graduationYear: typeof edu.graduationYear === 'number' || typeof edu.graduationYear === 'string' ? edu.graduationYear : 2024,
          coursework: typeof edu.coursework === 'string' ? sanitizeString(edu.coursework) : undefined,
        }))
    : []

  const skillsList: SkillEntry[] = Array.isArray(p.skillsList)
    ? p.skillsList
        .filter((item): item is SkillEntry => typeof item === 'object' && item !== null)
        .map((sk, idx) => ({
          id: typeof sk.id === 'string' ? sk.id : `sk_${idx}_${Date.now()}`,
          name: sanitizeString(sk.name),
          category: (SKILL_CATEGORIES.includes(sk.category as SkillCategory) ? sk.category : 'Programming Languages') as SkillCategory,
          proficiency: (SKILL_PROFICIENCIES.includes(sk.proficiency as SkillProficiency) ? sk.proficiency : 'Intermediate') as SkillProficiency,
          yearsOfExperience: typeof sk.yearsOfExperience === 'number' ? sk.yearsOfExperience : 2,
        }))
        .filter((sk) => sk.name.length > 0)
    : []

  const rawSkills: string[] = Array.isArray(p.skills)
    ? p.skills.filter((s): s is string => typeof s === 'string').map((s) => s.trim()).filter(Boolean)
    : skillsList.map((s) => s.name)

  const projects: ProjectEntry[] = Array.isArray(p.projects)
    ? p.projects
        .filter((item): item is ProjectEntry => typeof item === 'object' && item !== null)
        .map((proj, idx) => ({
          id: typeof proj.id === 'string' ? proj.id : `proj_${idx}_${Date.now()}`,
          title: sanitizeString(proj.title),
          description: sanitizeString(proj.description),
          technologies: Array.isArray(proj.technologies)
            ? proj.technologies.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
            : [],
          projectUrl: sanitizeSafeUrl(proj.projectUrl),
          githubUrl: sanitizeSafeUrl(proj.githubUrl),
        }))
        .filter((proj) => proj.title.length > 0 || proj.description.length > 0)
    : []

  const experience: ExperienceEntry[] = Array.isArray(p.experience)
    ? p.experience
        .filter((item): item is ExperienceEntry => typeof item === 'object' && item !== null)
        .map((exp, idx) => ({
          id: typeof exp.id === 'string' ? exp.id : `exp_${idx}_${Date.now()}`,
          jobTitle: sanitizeString(exp.jobTitle),
          company: sanitizeString(exp.company),
          employmentType: typeof exp.employmentType === 'string' ? sanitizeString(exp.employmentType) : 'Full-time',
          startDate: sanitizeString(exp.startDate),
          endDate: typeof exp.endDate === 'string' ? sanitizeString(exp.endDate) : undefined,
          isCurrent: Boolean(exp.isCurrent),
          description: sanitizeString(exp.description),
          technologies: Array.isArray(exp.technologies)
            ? exp.technologies.filter((t): t is string => typeof t === 'string').map((t) => t.trim()).filter(Boolean)
            : [],
        }))
        .filter((exp) => exp.company.length > 0 || exp.jobTitle.length > 0)
    : []

  const certifications: CertificationEntry[] = Array.isArray(p.certifications)
    ? p.certifications
        .filter((item): item is CertificationEntry => typeof item === 'object' && item !== null)
        .map((cert, idx) => ({
          id: typeof cert.id === 'string' ? cert.id : `cert_${idx}_${Date.now()}`,
          name: sanitizeString(cert.name),
          issuer: sanitizeString(cert.issuer),
          issueDate: typeof cert.issueDate === 'string' ? sanitizeString(cert.issueDate) : undefined,
          credentialUrl: sanitizeSafeUrl(cert.credentialUrl),
        }))
        .filter((cert) => cert.name.length > 0)
    : []

  return {
    id,
    name,
    email,
    headline: typeof p.headline === 'string' ? sanitizeString(p.headline) : undefined,
    location: typeof p.location === 'string' ? sanitizeString(p.location) : undefined,
    summary: typeof p.summary === 'string' ? sanitizeString(p.summary) : undefined,
    careerGoal: typeof p.careerGoal === 'string' ? sanitizeString(p.careerGoal) : undefined,
    phone: typeof p.phone === 'string' ? sanitizeString(p.phone) : undefined,
    linkedinUrl: sanitizeSafeUrl(p.linkedinUrl),
    githubUrl: sanitizeSafeUrl(p.githubUrl),
    portfolioUrl: sanitizeSafeUrl(p.portfolioUrl),
    education,
    skillsList,
    skills: rawSkills,
    projects,
    experience,
    certifications,
    onboarded: Boolean(p.onboarded),
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
  }
}

/**
 * Convenience wrapper returning the deterministic profile completeness percentage (0 to 100).
 */
export function calculateProfileCompleteness(profile?: Partial<UserProfileData> | null): number {
  return evaluateProfileDataQuality(profile).completeness
}
