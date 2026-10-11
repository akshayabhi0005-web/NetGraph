'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  UserProfile,
  getCurrentSession,
  loginUser as authLoginUser,
  registerUser as authRegisterUser,
  loginDemoUser as authLoginDemoUser,
  logoutUser as authLogoutUser,
  updateUserProfile as authUpdateUserProfile,
} from '@/lib/auth'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginDemo: () => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
  refreshSession: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(() => {
    const session = getCurrentSession()
    if (session) {
      setUser(session.user)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    const result = await authLoginUser(email, password)
    if (result.success && result.user) {
      setUser(result.user)
      setIsLoading(false)
      return { success: true }
    }
    setIsLoading(false)
    return { success: false, error: result.error || 'Authentication failed' }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    const result = await authRegisterUser({ name, email, password })
    if (result.success && result.user) {
      setUser(result.user)
      setIsLoading(false)
      return { success: true }
    }
    setIsLoading(false)
    return { success: false, error: result.error || 'Registration failed' }
  }

  const loginDemo = async () => {
    setIsLoading(true)
    const result = await authLoginDemoUser()
    setUser(result.user)
    setIsLoading(false)
  }

  const logout = () => {
    authLogoutUser()
    setUser(null)
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = authUpdateUserProfile(updates)
    if (updated) {
      setUser(updated)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginDemo,
        logout,
        updateProfile,
        refreshSession,
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
