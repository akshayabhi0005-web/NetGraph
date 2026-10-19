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

// Re-export all validation rules, data quality evaluators, and sanitizers
export * from './data-validation'

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

