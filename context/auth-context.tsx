'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { UserProfile } from '@/lib/auth'
import {
  loginDemoUser as authLoginDemoUser,
  logoutUser as authLogoutDemoUser,
  updateUserProfile as authUpdateUserProfile,
} from '@/lib/auth'
import { authClient, profileClient } from '@/lib/api-client'

export type AuthMode = 'server' | 'demo' | null
export type ServerStatus = 'checking' | 'ready' | 'database_unavailable' | 'network_error'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  authMode: AuthMode
  serverStatus: ServerStatus
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string; isDatabaseUnavailable?: boolean }>
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string; isDatabaseUnavailable?: boolean }>
  loginDemo: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  refreshSession: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')

  /**
   * Restores session on mount directly from the server via GET /api/auth/me.
   * If cookie is valid, restores the server user.
   * If cookie is invalid or expired, sets unauthenticated.
   * If database is unavailable, sets serverStatus without falsely authenticating.
   */
  const refreshSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await authClient.getMe()

      if (res.success && res.data?.user) {
        setUser(res.data.user)
        setAuthMode('server')
        setServerStatus('ready')
      } else if (res.isDatabaseUnavailable) {
        setUser(null)
        setAuthMode(null)
        setServerStatus('database_unavailable')
      } else if (res.isNetworkError) {
        setUser(null)
        setAuthMode(null)
        setServerStatus('network_error')
      } else {
        // HTTP 401 or no active session — server is healthy, but user is not signed in
        setUser(null)
        setAuthMode(null)
        setServerStatus('ready')
      }
    } catch {
      setUser(null)
      setAuthMode(null)
      setServerStatus('network_error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  /**
   * Real backend authentication via POST /api/auth/login
   */
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const result = await authClient.login({ email, password })

    if (result.success && result.data?.user) {
      setUser(result.data.user)
      setAuthMode('server')
      setServerStatus('ready')
      setIsLoading(false)
      return { success: true, user: result.data.user }
    }

    setIsLoading(false)
    if (result.isDatabaseUnavailable) {
      setServerStatus('database_unavailable')
    }

    return {
      success: false,
      error: result.error || 'Authentication failed. Please check your credentials.',
      isDatabaseUnavailable: result.isDatabaseUnavailable,
    }
  }

  /**
   * Real backend registration via POST /api/auth/register
   */
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    const result = await authClient.register({ name, email, password })

    if (result.success && result.data?.user) {
      setUser(result.data.user)
      setAuthMode('server')
      setServerStatus('ready')
      setIsLoading(false)
      return { success: true, user: result.data.user }
    }

    setIsLoading(false)
    if (result.isDatabaseUnavailable) {
      setServerStatus('database_unavailable')
    }

    return {
      success: false,
      error: result.error || 'Registration failed. Please try again.',
      isDatabaseUnavailable: result.isDatabaseUnavailable,
    }
  }

  /**
   * Isolated client-side demo login for local evaluation
   */
  const loginDemo = async () => {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Demo authentication is disabled in production environments.')
      return
    }
    setIsLoading(true)
    const result = await authLoginDemoUser()
    setUser(result.user)
    setAuthMode('demo')
    setIsLoading(false)
  }

  /**
   * Terminates active session on the server and clears client memory
   */
  const logout = async () => {
    try {
      if (authMode === 'server') {
        await authClient.logout()
      } else if (authMode === 'demo') {
        authLogoutDemoUser()
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setAuthMode(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('netgraph_demo_session_v1')
      }
    }
  }

  /**
   * Refetches the full profile from PostgreSQL when authenticated with server
   */
  const refreshProfile = useCallback(async () => {
    if (authMode === 'server') {
      try {
        const res = await profileClient.getProfile()
        if (res.success && res.data?.profile) {
          setUser(res.data.profile)
        }
      } catch (err) {
        console.error('Failed to refresh profile from server:', err)
      }
    }
  }, [authMode])

  /**
   * Profile updater with local reactivity and PostgreSQL persistence
   */
  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      if (authMode === 'demo') {
        authUpdateUserProfile(updates)
      }
      return updated
    })

    if (authMode === 'server') {
      const hasPersonalFields =
        updates.name !== undefined ||
        updates.headline !== undefined ||
        updates.location !== undefined ||
        updates.summary !== undefined ||
        updates.careerGoal !== undefined ||
        updates.phone !== undefined ||
        updates.linkedinUrl !== undefined ||
        updates.githubUrl !== undefined ||
        updates.portfolioUrl !== undefined ||
        updates.onboarded !== undefined ||
        updates.onboardingStep !== undefined

      if (hasPersonalFields) {
        try {
          const res = await profileClient.updateProfile({
            name: updates.name,
            headline: updates.headline,
            location: updates.location,
            summary: updates.summary,
            careerGoal: updates.careerGoal,
            phone: updates.phone,
            linkedinUrl: updates.linkedinUrl,
            githubUrl: updates.githubUrl,
            portfolioUrl: updates.portfolioUrl,
            onboarded: updates.onboarded,
            onboardingStep: updates.onboardingStep,
          })

          if (!res.success) {
            console.error('Failed to sync profile update to server:', res.error)
            throw new Error(res.error || 'Failed to update profile on server')
          }
        } catch (err) {
          console.error('Failed to sync profile update to server:', err)
          throw err
        }
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authMode,
        serverStatus,
        login,
        signup,
        loginDemo,
        logout,
        updateProfile,
        refreshSession,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
