/**
 * NETGRAPH Frontend Authentication API Client
 *
 * Provides a clean, secure interface for communicating with backend authentication routes.
 *
 * Security Guarantees:
 * - Credentials are sent with `credentials: "include"` to manage HTTP-only cookies.
 * - Session tokens are NEVER stored in localStorage, sessionStorage, or JavaScript variables.
 * - Passwords are NEVER cached or persisted client-side.
 * - Fails safely when database or backend is unavailable (HTTP 503).
 */

import type { UserProfile } from './auth'

export interface AuthApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
  details?: unknown
  isDatabaseUnavailable?: boolean
  isNetworkError?: boolean
  status?: number
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ServerUserRecord {
  id: string
  email: string
  createdAt: string
  profile?: {
    name?: string
    headline?: string
    location?: string
    summary?: string
    careerGoal?: string
    phone?: string
    linkedinUrl?: string
    githubUrl?: string
    portfolioUrl?: string
    onboarded?: boolean
    onboardingStep?: number
  } | null
  settings?: Record<string, unknown> | null
  educations?: unknown[]
  skills?: Array<{ name: string; category?: string; proficiency?: string; yearsOfExperience?: number }>
  projects?: unknown[]
  experiences?: unknown[]
  certifications?: unknown[]
}

/**
 * Normalizes raw server user data into the standardized UserProfile structure
 * expected by NETGRAPH frontend components.
 */
export function normalizeServerUser(serverUser: ServerUserRecord): UserProfile {
  const profile = serverUser.profile || {}
  const rawSkills = serverUser.skills || []

  return {
    id: serverUser.id,
    name: profile.name || serverUser.email.split('@')[0],
    email: serverUser.email,
    headline: profile.headline || undefined,
    location: profile.location || undefined,
    summary: profile.summary || undefined,
    careerGoal: profile.careerGoal || undefined,
    phone: profile.phone || undefined,
    linkedinUrl: profile.linkedinUrl || undefined,
    githubUrl: profile.githubUrl || undefined,
    portfolioUrl: profile.portfolioUrl || undefined,
    education: (serverUser.educations as any[]) || [],
    skillsList: (rawSkills as any[]) || [],
    skills: rawSkills.map((s) => (typeof s === 'string' ? s : s.name)),
    projects: (serverUser.projects as any[]) || [],
    experience: (serverUser.experiences as any[]) || [],
    certifications: (serverUser.certifications as any[]) || [],
    onboardingStep: profile.onboardingStep ?? 1,
    createdAt: typeof serverUser.createdAt === 'string' ? serverUser.createdAt : new Date().toISOString(),
    onboarded: Boolean(profile.onboarded),
  }
}

/**
 * Standardized fetch wrapper that parses server responses and extracts structured error details
 */
async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<AuthApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })

    const status = response.status
    let responseData: any = null

    try {
      responseData = await response.json()
    } catch {
      // Non-JSON response (e.g. gateway error HTML)
      responseData = null
    }

    // 1. Database offline / unconfigured (HTTP 503)
    if (status === 503 || responseData?.code === 'DATABASE_NOT_CONFIGURED') {
      return {
        success: false,
        error:
          responseData?.error ||
          'The database is currently unconfigured or offline. Connect PostgreSQL or use Demo Sign In.',
        code: 'DATABASE_NOT_CONFIGURED',
        isDatabaseUnavailable: true,
        status,
      }
    }

    // 2. Rate limit exceeded (HTTP 429)
    if (status === 429 || responseData?.code === 'RATE_LIMIT_EXCEEDED') {
      return {
        success: false,
        error: responseData?.error || 'Too many attempts. Please wait a minute before trying again.',
        code: 'RATE_LIMIT_EXCEEDED',
        status,
      }
    }

    // 3. CSRF forbidden (HTTP 403)
    if (status === 403 || responseData?.code === 'CSRF_FORBIDDEN') {
      return {
        success: false,
        error: responseData?.error || 'Security check failed (cross-origin request forbidden).',
        code: 'CSRF_FORBIDDEN',
        status,
      }
    }

    // 4. Duplicate user / Resource conflict (HTTP 409)
    if (status === 409 || responseData?.code === 'EMAIL_EXISTS') {
      return {
        success: false,
        error: responseData?.error || 'An account with this email address already exists. Please sign in.',
        code: 'EMAIL_EXISTS',
        status,
      }
    }

    // 5. Unauthorized / Invalid credentials (HTTP 401)
    if (status === 401) {
      return {
        success: false,
        error: responseData?.error || 'Invalid email or password.',
        code: responseData?.code || 'UNAUTHORIZED',
        status,
      }
    }

    // 6. Validation error (HTTP 400)
    if (status === 400) {
      let message = responseData?.error || 'Please verify the form fields and try again.'
      if (Array.isArray(responseData?.details) && responseData.details.length > 0) {
        const firstIssue = responseData.details[0]
        if (firstIssue?.message) {
          message = firstIssue.message
        }
      }
      return {
        success: false,
        error: message,
        code: 'VALIDATION_ERROR',
        details: responseData?.details,
        status,
      }
    }

    // 7. General server failure
    if (!response.ok) {
      return {
        success: false,
        error: responseData?.error || `Server error (${status}). Please try again later.`,
        code: responseData?.code || 'SERVER_ERROR',
        status,
      }
    }

    return {
      success: true,
      data: responseData?.data as T,
      status,
    }
  } catch (err: unknown) {
    // Network errors (e.g. offline, connection refused, DNS failure)
    return {
      success: false,
      error: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR',
      isNetworkError: true,
      status: 0,
    }
  }
}

/**
 * Frontend Authentication Client
 */
export const authClient = {
  /**
   * Log in user with email and password via POST /api/auth/login
   */
  async login(payload: LoginPayload): Promise<AuthApiResponse<{ user: UserProfile }>> {
    const res = await apiFetch<{ user: ServerUserRecord }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!res.success || !res.data?.user) {
      return {
        ...res,
        data: undefined,
      }
    }

    return {
      success: true,
      data: { user: normalizeServerUser(res.data.user) },
      status: res.status,
    }
  },

  /**
   * Register a new user via POST /api/auth/register
   */
  async register(payload: RegisterPayload): Promise<AuthApiResponse<{ user: UserProfile }>> {
    const res = await apiFetch<{ user: ServerUserRecord }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!res.success || !res.data?.user) {
      return {
        ...res,
        data: undefined,
      }
    }

    return {
      success: true,
      data: { user: normalizeServerUser(res.data.user) },
      status: res.status,
    }
  },

  /**
   * Verify and restore active user session via GET /api/auth/me
   */
  async getMe(): Promise<AuthApiResponse<{ user: UserProfile }>> {
    const res = await apiFetch<{ user: ServerUserRecord }>('/api/auth/me', {
      method: 'GET',
    })

    if (!res.success || !res.data?.user) {
      return {
        ...res,
        data: undefined,
      }
    }

    return {
      success: true,
      data: { user: normalizeServerUser(res.data.user) },
      status: res.status,
    }
  },

  /**
   * Terminate active server session and clear cookie via POST /api/auth/logout
   */
  async logout(): Promise<AuthApiResponse<{ loggedOut: boolean }>> {
    return apiFetch<{ loggedOut: boolean }>('/api/auth/logout', {
      method: 'POST',
    })
  },
}

/**
 * Frontend Profile API Client
 * Connects frontend forms and onboarding directly to PostgreSQL through Next.js API routes.
 */
export const profileClient = {
  /**
   * Fetch complete user profile and relations via GET /api/profile
   */
  async getProfile(): Promise<AuthApiResponse<{ profile: UserProfile }>> {
    const res = await apiFetch<{ profile: ServerUserRecord }>('/api/profile', {
      method: 'GET',
    })

    if (!res.success || !res.data?.profile) {
      return {
        ...res,
        data: undefined,
      }
    }

    return {
      success: true,
      data: { profile: normalizeServerUser(res.data.profile) },
      status: res.status,
    }
  },

  /**
   * Update top-level profile information via PUT /api/profile
   */
  async updateProfile(payload: Record<string, unknown>): Promise<AuthApiResponse<{ profile: unknown }>> {
    return apiFetch<{ profile: unknown }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Add education entry via POST /api/profile/education
   */
  async addEducation(payload: Record<string, unknown>): Promise<AuthApiResponse<{ education: unknown }>> {
    return apiFetch<{ education: unknown }>('/api/profile/education', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Delete education entry via DELETE /api/profile/education?id=<id>
   */
  async deleteEducation(id: string): Promise<AuthApiResponse<{ deleted: boolean }>> {
    return apiFetch<{ deleted: boolean }>(`/api/profile/education?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  /**
   * Add or update skill via POST /api/profile/skills
   */
  async addOrUpdateSkill(payload: Record<string, unknown>): Promise<AuthApiResponse<{ skill: unknown }>> {
    return apiFetch<{ skill: unknown }>('/api/profile/skills', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Delete skill entry via DELETE /api/profile/skills?id=<id>
   */
  async deleteSkill(id: string): Promise<AuthApiResponse<{ deleted: boolean }>> {
    return apiFetch<{ deleted: boolean }>(`/api/profile/skills?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  /**
   * Add project entry via POST /api/profile/projects
   */
  async addProject(payload: Record<string, unknown>): Promise<AuthApiResponse<{ project: unknown }>> {
    return apiFetch<{ project: unknown }>('/api/profile/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Delete project entry via DELETE /api/profile/projects?id=<id>
   */
  async deleteProject(id: string): Promise<AuthApiResponse<{ deleted: boolean }>> {
    return apiFetch<{ deleted: boolean }>(`/api/profile/projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  /**
   * Add experience entry via POST /api/profile/experience
   */
  async addExperience(payload: Record<string, unknown>): Promise<AuthApiResponse<{ experience: unknown }>> {
    return apiFetch<{ experience: unknown }>('/api/profile/experience', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Delete experience entry via DELETE /api/profile/experience?id=<id>
   */
  async deleteExperience(id: string): Promise<AuthApiResponse<{ deleted: boolean }>> {
    return apiFetch<{ deleted: boolean }>(`/api/profile/experience?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },

  /**
   * Add certification entry via POST /api/profile/certifications
   */
  async addCertification(payload: Record<string, unknown>): Promise<AuthApiResponse<{ certification: unknown }>> {
    return apiFetch<{ certification: unknown }>('/api/profile/certifications', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Delete certification entry via DELETE /api/profile/certifications?id=<id>
   */
  async deleteCertification(id: string): Promise<AuthApiResponse<{ deleted: boolean }>> {
    return apiFetch<{ deleted: boolean }>(`/api/profile/certifications?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}

/**
 * Frontend Settings API Client
 * Manages user preferences persistence to PostgreSQL.
 */
export const settingsClient = {
  /**
   * Fetch user settings via GET /api/settings
   */
  async getSettings(): Promise<AuthApiResponse<{ settings: Record<string, unknown> }>> {
    return apiFetch<{ settings: Record<string, unknown> }>('/api/settings', {
      method: 'GET',
    })
  },

  /**
   * Update user settings via PUT /api/settings
   */
  async updateSettings(payload: Record<string, unknown>): Promise<AuthApiResponse<{ settings: Record<string, unknown> }>> {
    return apiFetch<{ settings: Record<string, unknown> }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

/**
 * Frontend Analytics API Client
 * Retrieves authenticated data-mining metrics and recommendations directly from Next.js server endpoints.
 */
export const analyticsClient = {
  /**
   * Fetch overview analytics derived from user's real profile via GET /api/analytics
   */
  async getOverview(): Promise<AuthApiResponse<{ analytics: Record<string, unknown> }>> {
    return apiFetch<{ analytics: Record<string, unknown> }>('/api/analytics', {
      method: 'GET',
    })
  },

  /**
   * Fetch detailed skills analytics via GET /api/analytics/skills
   */
  async getSkills(): Promise<AuthApiResponse<{ skillsAnalytics: Record<string, unknown> }>> {
    return apiFetch<{ skillsAnalytics: Record<string, unknown> }>('/api/analytics/skills', {
      method: 'GET',
    })
  },

  /**
   * Fetch career matches and skill gaps via GET /api/analytics/careers
   */
  async getCareers(params?: {
    category?: string
    minScore?: number
    limit?: number
  }): Promise<AuthApiResponse<{ careerAnalytics: Record<string, unknown> }>> {
    const q = new URLSearchParams()
    if (params?.category) q.set('category', params.category)
    if (params?.minScore !== undefined) q.set('minScore', String(params.minScore))
    if (params?.limit !== undefined) q.set('limit', String(params.limit))
    const query = q.toString() ? `?${q.toString()}` : ''
    return apiFetch<{ careerAnalytics: Record<string, unknown> }>(`/api/analytics/careers${query}`, {
      method: 'GET',
    })
  },

  /**
   * Fetch association rules, itemsets, and co-occurrences via GET /api/analytics/associations
   */
  async getAssociations(params?: {
    minSupport?: number
    minConfidence?: number
    limit?: number
  }): Promise<AuthApiResponse<{ associationAnalytics: Record<string, unknown> }>> {
    const q = new URLSearchParams()
    if (params?.minSupport !== undefined) q.set('minSupport', String(params.minSupport))
    if (params?.minConfidence !== undefined) q.set('minConfidence', String(params.minConfidence))
    if (params?.limit !== undefined) q.set('limit', String(params.limit))
    const query = q.toString() ? `?${q.toString()}` : ''
    return apiFetch<{ associationAnalytics: Record<string, unknown> }>(`/api/analytics/associations${query}`, {
      method: 'GET',
    })
  },
}

/**
 * Frontend Graph API Client
 * Retrieves real multi-entity relationship graph nodes and edges via GET /api/graph
 */
export const graphClient = {
  /**
   * Fetch relationship graph data via GET /api/graph
   */
  async getGraph(params?: {
    nodeType?: string
    limit?: number
  }): Promise<AuthApiResponse<{ graph: Record<string, unknown> }>> {
    const q = new URLSearchParams()
    if (params?.nodeType) q.set('nodeType', params.nodeType)
    if (params?.limit !== undefined) q.set('limit', String(params.limit))
    const query = q.toString() ? `?${q.toString()}` : ''
    return apiFetch<{ graph: Record<string, unknown> }>(`/api/graph${query}`, {
      method: 'GET',
    })
  },
}
