/**
 * NETGRAPH Local Demo Authentication Service
 * 
 * NOTE: This is a client-side demo authentication implementation for prototyping.
 * Passwords are salted and hashed with SHA-256 via Web Crypto API before saving to localStorage.
 * Plaintext passwords are NEVER stored.
 * This architecture is designed for future drop-in replacement with NextAuth / Supabase / FastAPI backend.
 */

import type {
  SkillEntry,
  EducationEntry,
  ProjectEntry,
  ExperienceEntry,
  CertificationEntry,
} from './profile'

export interface UserProfile {
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
  education?: EducationEntry[]
  skillsList?: SkillEntry[]
  skills?: string[]
  projects?: ProjectEntry[]
  experience?: ExperienceEntry[]
  certifications?: CertificationEntry[]
  onboardingStep?: number
  createdAt: string
  onboarded: boolean
}

export interface UserAccount extends UserProfile {
  passwordHash: string
  salt: string
}

export interface AuthSession {
  user: UserProfile
  token: string
  expiresAt: number
}

const USERS_STORAGE_KEY = 'netgraph_demo_users_v1'
const SESSION_STORAGE_KEY = 'netgraph_demo_session_v1'

// Default seeded demo user for instant testing
export const DEFAULT_DEMO_USER: UserProfile = {
  id: 'usr_demo_001',
  name: 'Alex Morgan',
  email: 'demo@netgraph.edu',
  headline: 'Product & Data Analyst exploring career pathways',
  location: 'Toronto, Canada',
  summary: 'Analyst focused on turning complex relational data into clear product decisions and graph discoveries.',
  careerGoal: 'Transition into Senior Product Analytics & Data Science.',
  linkedinUrl: 'https://linkedin.com/in/alexmorgan-demo',
  githubUrl: 'https://github.com/alexmorgan-demo',
  skills: ['Python', 'SQL', 'React', 'Data Mining', 'Machine Learning', 'Cloud Computing'],
  skillsList: [
    { id: 'sk_1', name: 'Python', category: 'Programming Languages', proficiency: 'Advanced', yearsOfExperience: 3 },
    { id: 'sk_2', name: 'SQL', category: 'Databases', proficiency: 'Advanced', yearsOfExperience: 4 },
    { id: 'sk_3', name: 'React', category: 'Frameworks', proficiency: 'Intermediate', yearsOfExperience: 2 },
    { id: 'sk_4', name: 'Data Mining', category: 'Data Science', proficiency: 'Advanced', yearsOfExperience: 2 },
    { id: 'sk_5', name: 'Machine Learning', category: 'Machine Learning', proficiency: 'Intermediate', yearsOfExperience: 2 },
    { id: 'sk_6', name: 'Cloud Computing', category: 'Cloud Computing', proficiency: 'Intermediate', yearsOfExperience: 1 },
  ],
  education: [
    {
      id: 'edu_1',
      institution: 'University of Toronto',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science & Statistics',
      startYear: 2020,
      graduationYear: 2024,
      coursework: 'Data Structures, Database Management Systems, Machine Learning, Statistical Inference',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'NetGraph Career Relationship Miner',
      description: 'Interactive career network visualization and skill co-occurrence mining platform built with Three.js and Next.js.',
      technologies: ['Next.js', 'React', 'Three.js', 'TypeScript'],
      projectUrl: 'https://net-graph.vercel.app',
      githubUrl: 'https://github.com/akshayabhi0005-web/NetGraph',
    },
    {
      id: 'proj_2',
      title: 'Market Trend Association Miner',
      description: 'Apriori and association rule analysis pipeline exploring skill clusters across tech job descriptions.',
      technologies: ['Python', 'Pandas', 'Scikit-Learn', 'SQL'],
    },
  ],
  experience: [
    {
      id: 'exp_1',
      jobTitle: 'Data Analytics Intern',
      company: 'Metrix Labs',
      employmentType: 'Internship',
      startDate: '2023-05',
      endDate: '2023-08',
      isCurrent: false,
      description: 'Constructed automated SQL dashboards and extracted customer churn patterns with Python models.',
      technologies: ['SQL', 'Python', 'Tableau'],
    },
    {
      id: 'exp_2',
      jobTitle: 'Student Data Researcher',
      company: 'Computational Intelligence Lab',
      employmentType: 'Part-time',
      startDate: '2023-09',
      isCurrent: true,
      description: 'Investigating graph neural networks and skill dependency graphs for personalized curriculum recommendation.',
      technologies: ['Python', 'PyTorch', 'NetworkX'],
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      issueDate: '2023-11',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert_2',
      name: 'Google Data Analytics Professional Certificate',
      issuer: 'Google',
      issueDate: '2023-04',
      credentialUrl: 'https://coursera.org/verify/professional-cert/google-data',
    },
  ],
  createdAt: new Date().toISOString(),
  onboarded: true,
}

// Default password for demo account is 'Password123'
const DEFAULT_DEMO_SALT = 'netgraph_salt_demo_9841'
// SHA-256 of ('Password123' + DEFAULT_DEMO_SALT)
const DEFAULT_DEMO_HASH = '9db36d4df9565538e1b6a38623eb1b75e7a9b09dbfb4e68e0d37e6b72d2fb005'

/**
 * Hash a password with a random salt using the browser's Web Crypto API
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback simple hash for non-crypto environments
    let hash = 0
    const str = password + salt
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash).toString(16)
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSalt(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16)
    window.crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
  }
  return Math.random().toString(36).substring(2, 15)
}

function generateToken(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return 'sess_' + window.crypto.randomUUID()
  }
  return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

/**
 * Retrieve all registered demo accounts from localStorage, seeding default if missing.
 */
export function getStoredAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      const initial: UserAccount[] = [
        {
          ...DEFAULT_DEMO_USER,
          salt: DEFAULT_DEMO_SALT,
          passwordHash: DEFAULT_DEMO_HASH,
        },
      ]
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    return JSON.parse(raw) as UserAccount[]
  } catch (err) {
    console.error('Failed to parse stored demo users:', err)
    return []
  }
}

/**
 * Save user accounts to localStorage
 */
function saveStoredAccounts(accounts: UserAccount[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts))
  } catch (err) {
    console.error('Failed to save demo users:', err)
  }
}

/**
 * Retrieve current active session
 */
export function getCurrentSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (Date.now() > session.expiresAt) {
      logoutUser()
      return null
    }
    return session
  } catch (err) {
    console.error('Failed to parse current session:', err)
    return null
  }
}

/**
 * Save active session
 */
export function saveCurrentSession(user: UserProfile): AuthSession {
  const session: AuthSession = {
    user,
    token: generateToken(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days demo expiry
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }
  return session
}

/**
 * Clear current active session (Logout)
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch (err) {
    console.error('Failed to clear session:', err)
  }
}

/**
 * Register a new demo user
 */
export async function registerUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const trimmedName = name.trim()

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters long.' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' }
  }

  const accounts = getStoredAccounts()
  const exists = accounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)
  if (exists) {
    return {
      success: false,
      error: 'An account with this email address already exists. Please sign in instead.',
    }
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  const newUser: UserProfile = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: trimmedName,
    email: normalizedEmail,
    headline: '',
    location: '',
    summary: '',
    careerGoal: '',
    linkedinUrl: '',
    githubUrl: '',
    education: [],
    skillsList: [],
    skills: [],
    projects: [],
    experience: [],
    certifications: [],
    onboardingStep: 1,
    createdAt: new Date().toISOString(),
    onboarded: false,
  }

  const newAccount: UserAccount = {
    ...newUser,
    salt,
    passwordHash,
  }

  accounts.push(newAccount)
  saveStoredAccounts(accounts)
  saveCurrentSession(newUser)

  return { success: true, user: newUser }
}

/**
 * Authenticate existing demo user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; token?: string; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return { success: false, error: 'Please provide your email address.' }
  }
  if (!password) {
    return { success: false, error: 'Please provide your password.' }
  }

  const accounts = getStoredAccounts()
  const account = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail)

  if (!account) {
    return { success: false, error: 'No account found with this email. Please check your credentials or create an account.' }
  }

  const computedHash = await hashPassword(password, account.salt)
  if (computedHash !== account.passwordHash) {
    return { success: false, error: 'Incorrect password. Please verify and try again.' }
  }

  const { salt, passwordHash, ...userProfile } = account
  const session = saveCurrentSession(userProfile)

  return { success: true, user: userProfile, token: session.token }
}

/**
 * 1-Click Instant Demo Login
 */
export async function loginDemoUser(): Promise<{ success: boolean; user: UserProfile; token: string }> {
  const accounts = getStoredAccounts()
  let demoAccount = accounts.find((acc) => acc.email === DEFAULT_DEMO_USER.email)

  if (!demoAccount) {
    demoAccount = {
      ...DEFAULT_DEMO_USER,
      salt: DEFAULT_DEMO_SALT,
      passwordHash: DEFAULT_DEMO_HASH,
    }
    accounts.push(demoAccount)
    saveStoredAccounts(accounts)
  }

  const { salt, passwordHash, ...userProfile } = demoAccount
  const session = saveCurrentSession(userProfile)
  return { success: true, user: userProfile, token: session.token }
}

/**
 * Update current active user's profile
 */
export function updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
  const session = getCurrentSession()
  if (!session) return null

  let computedSkills = updates.skills || session.user.skills
  if (updates.skillsList && !updates.skills) {
    computedSkills = updates.skillsList.map((s) => s.name)
  }

  const updatedUser: UserProfile = {
    ...session.user,
    ...updates,
    skills: computedSkills,
  }

  // Update in session
  saveCurrentSession(updatedUser)

  // Update in stored accounts list
  const accounts = getStoredAccounts()
  const index = accounts.findIndex((acc) => acc.id === updatedUser.id)
  if (index !== -1) {
    accounts[index] = {
      ...accounts[index],
      ...updates,
      skills: computedSkills,
    }
    saveStoredAccounts(accounts)
  }

  return updatedUser
}
