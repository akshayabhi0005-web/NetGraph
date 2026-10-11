/**
 * NETGRAPH User Profile & Onboarding Domain Model
 * Strongly typed career profile representation for data mining, skill gap analysis, and recommendations.
 */

export type SkillCategory =
  | 'Programming Languages'
  | 'Frameworks'
  | 'Databases'
  | 'Cloud Computing'
  | 'Data Science'
  | 'Machine Learning'
  | 'Tools'
  | 'Other'

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Programming Languages',
  'Frameworks',
  'Databases',
  'Cloud Computing',
  'Data Science',
  'Machine Learning',
  'Tools',
  'Other',
]

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'

export const SKILL_PROFICIENCIES: SkillProficiency[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
]

export interface SkillEntry {
  id: string
  name: string
  category: SkillCategory
  proficiency: SkillProficiency
  yearsOfExperience?: number
}

export interface EducationEntry {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: number | string
  graduationYear: number | string
  coursework?: string
}

export interface ProjectEntry {
  id: string
  title: string
  description: string
  technologies: string[]
  projectUrl?: string
  githubUrl?: string
}

export interface ExperienceEntry {
  id: string
  jobTitle: string
  company: string
  employmentType?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
  technologies?: string[]
}

export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  issueDate?: string
  credentialUrl?: string
}

export interface UserProfileData {
  id: string
  name: string
  email: string
  headline?: string
  location?: string
  summary?: string
  careerGoal?: string
  phone?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  education: EducationEntry[]
  skillsList: SkillEntry[]
  skills?: string[] // string array kept for compatibility
  projects: ProjectEntry[]
  experience: ExperienceEntry[]
  certifications: CertificationEntry[]
  onboarded: boolean
  createdAt: string
}


export function generateId(prefix = 'item'): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Validate URL syntax (allows http and https)
 */
export function isValidUrl(urlString?: string): boolean {
  if (!urlString || !urlString.trim()) return true
  try {
    const url = new URL(urlString.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validate Email address
 */
export function isValidEmail(email?: string): boolean {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Calculate dynamic profile completeness percentage (0 to 100)
 */
export function calculateProfileCompleteness(profile?: Partial<UserProfileData> | null): number {
  if (!profile) return 0
  let score = 0
  
  // Personal Info (max 30 pts)
  if (profile.name?.trim()) score += 10
  if (profile.headline?.trim()) score += 5
  if (profile.location?.trim()) score += 5
  if (profile.summary?.trim()) score += 5
  if (profile.linkedinUrl?.trim() || profile.githubUrl?.trim()) score += 5

  // Education (max 20 pts)
  if (profile.education && profile.education.length > 0) score += 20

  // Skills (max 25 pts)
  if (profile.skillsList && profile.skillsList.length >= 3) {
    score += 25
  } else if (profile.skillsList && profile.skillsList.length > 0) {
    score += 15
  } else if (profile.skills && profile.skills.length > 0) {
    score += 15
  }

  // Projects (max 15 pts)
  if (profile.projects && profile.projects.length > 0) score += 15

  // Experience & Certs (max 10 pts)
  if (profile.experience && profile.experience.length > 0) {
    score += 10
  } else if (profile.certifications && profile.certifications.length > 0) {
    score += 5
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Sample popular skills for quick selection in Onboarding & Profile
 */
export const POPULAR_TECH_SKILLS: { name: string; category: SkillCategory }[] = [
  { name: 'Python', category: 'Programming Languages' },
  { name: 'JavaScript', category: 'Programming Languages' },
  { name: 'TypeScript', category: 'Programming Languages' },
  { name: 'Java', category: 'Programming Languages' },
  { name: 'C++', category: 'Programming Languages' },
  { name: 'React', category: 'Frameworks' },
  { name: 'Next.js', category: 'Frameworks' },
  { name: 'Node.js', category: 'Frameworks' },
  { name: 'FastAPI', category: 'Frameworks' },
  { name: 'SQL', category: 'Databases' },
  { name: 'PostgreSQL', category: 'Databases' },
  { name: 'MongoDB', category: 'Databases' },
  { name: 'AWS', category: 'Cloud Computing' },
  { name: 'Google Cloud (GCP)', category: 'Cloud Computing' },
  { name: 'Docker', category: 'Cloud Computing' },
  { name: 'Data Mining', category: 'Data Science' },
  { name: 'Pandas', category: 'Data Science' },
  { name: 'Tableau', category: 'Data Science' },
  { name: 'Machine Learning', category: 'Machine Learning' },
  { name: 'Scikit-Learn', category: 'Machine Learning' },
  { name: 'PyTorch', category: 'Machine Learning' },
  { name: 'Git', category: 'Tools' },
]

// Alias for convenience
export const POPULAR_SKILLS = POPULAR_TECH_SKILLS

