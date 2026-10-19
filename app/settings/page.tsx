'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { settingsClient } from '@/lib/api-client'
import { LogOut, RotateCcw, CheckCircle2 } from 'lucide-react'

export interface UserPreferences {
  demoAnalysisMode: boolean
  emailSummaries: boolean
}

export const SETTINGS_STORAGE_KEY = 'netgraph_settings_v1'

export const DEFAULT_PREFERENCES: UserPreferences = {
  demoAnalysisMode: true,
  emailSummaries: false,
}

/**
 * Retrieve saved preferences safely on the client.
 * Falls back cleanly to default preferences if localStorage is empty,
 * unavailable, or contains malformed data.
 */
export function getSavedPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES
  }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw)
    return {
      demoAnalysisMode:
        typeof parsed?.demoAnalysisMode === 'boolean'
          ? parsed.demoAnalysisMode
          : DEFAULT_PREFERENCES.demoAnalysisMode,
      emailSummaries:
        typeof parsed?.emailSummaries === 'boolean'
          ? parsed.emailSummaries
          : DEFAULT_PREFERENCES.emailSummaries,
    }
  } catch (err) {
    console.error('Failed to parse saved settings, falling back to defaults:', err)
    return DEFAULT_PREFERENCES
  }
}

/**
 * Persist user preferences to localStorage.
 */
export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(prefs))
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

export default function Settings() {
  const router = useRouter()
  const { user, logout, authMode } = useAuth()

  // Controlled preferences state initialized with sensible defaults
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES)
  const [isLoaded, setIsLoaded] = useState(false)
  const [saveNotice, setSaveNotice] = useState<string | null>(null)

  // Safe client-side loading to prevent Next.js hydration mismatch
  useEffect(() => {
    const saved = getSavedPreferences()
    setPreferences(saved)
    setIsLoaded(true)

    if (authMode === 'server') {
      settingsClient
        .getSettings()
        .then((res) => {
          if (res.success && res.data?.settings) {
            const s = res.data.settings
            setPreferences({
              demoAnalysisMode:
                typeof s.demoAnalysisMode === 'boolean'
                  ? s.demoAnalysisMode
                  : DEFAULT_PREFERENCES.demoAnalysisMode,
              emailSummaries:
                typeof s.emailSummaries === 'boolean'
                  ? s.emailSummaries
                  : DEFAULT_PREFERENCES.emailSummaries,
            })
          }
        })
        .catch(() => {})
    }
  }, [authMode])

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      }
      savePreferences(updated)

      if (authMode === 'server') {
        settingsClient
          .updateSettings({
            [key]: updated[key],
          })
          .then((res) => {
            if (res.isDatabaseUnavailable) {
              setSaveNotice('Saved locally (DB offline)')
            } else {
              setSaveNotice('Synced to database')
            }
          })
          .catch(() => {
            setSaveNotice('Saved locally')
          })
      } else {
        setSaveNotice('Preference saved')
      }

      setTimeout(() => setSaveNotice(null), 2500)
      return updated
    })
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleResetData = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('netgraph_demo_users_v1')
      localStorage.removeItem('netgraph_demo_session_v1')
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
      setPreferences(DEFAULT_PREFERENCES)
      await logout()
      router.push('/login')
    }
  }

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
            <p className="mt-2 text-muted-foreground">Manage your workspace preferences and active session.</p>
          </div>
          {saveNotice && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition-opacity">
              <CheckCircle2 className="size-4 shrink-0" />
              {saveNotice}
            </span>
          )}
        </div>

        {/* Preferences Section */}
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card shadow-xs">
          <label
            htmlFor="demo-mode-toggle"
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
          >
            <div className="pr-4">
              <p className="font-medium text-slate-900">Demo analysis mode</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use clearly labeled illustrative recommendations.
              </p>
            </div>
            <input
              id="demo-mode-toggle"
              type="checkbox"
              checked={preferences.demoAnalysisMode}
              onChange={() => handleToggle('demoAnalysisMode')}
              disabled={!isLoaded}
              className="size-4.5 rounded accent-indigo-600 cursor-pointer focus:ring-2 focus:ring-indigo-600 focus:outline-none shrink-0"
            />
          </label>

          <label
            htmlFor="email-summaries-toggle"
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
          >
            <div className="pr-4">
              <p className="font-medium text-slate-900">Email summaries</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Receive a monthly profile review.
              </p>
            </div>
            <input
              id="email-summaries-toggle"
              type="checkbox"
              checked={preferences.emailSummaries}
              onChange={() => handleToggle('emailSummaries')}
              disabled={!isLoaded}
              className="size-4.5 rounded accent-indigo-600 cursor-pointer focus:ring-2 focus:ring-indigo-600 focus:outline-none shrink-0"
            />
          </label>
        </div>

        {/* Session & Account Section */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="font-semibold text-base text-slate-900">Active Session</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email || 'Demo account'}</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogout}
              className="rounded-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <LogOut className="mr-2 size-4" /> Sign out
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleResetData}
              className="rounded-full text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-2 size-4" /> Reset demo storage
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
