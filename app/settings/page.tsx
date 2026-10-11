'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import { LogOut, RotateCcw } from 'lucide-react'

export default function Settings() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('netgraph_demo_users_v1')
      localStorage.removeItem('netgraph_demo_session_v1')
      logout()
      router.push('/login')
    }
  }

  return (
    <AppShell title="Settings">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-2 text-muted-foreground">Manage your workspace preferences and active session.</p>

        {/* Preferences Section */}
        <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">Demo analysis mode</p>
              <p className="mt-1 text-sm text-muted-foreground">Use clearly labeled illustrative recommendations.</p>
            </div>
            <input type="checkbox" defaultChecked className="size-4 accent-indigo-600" />
          </div>

          <div className="flex items-center justify-between p-6">
            <div>
              <p className="font-medium">Email summaries</p>
              <p className="mt-1 text-sm text-muted-foreground">Receive a monthly profile review.</p>
            </div>
            <input type="checkbox" className="size-4 accent-indigo-600" />
          </div>
        </div>

        {/* Session & Account Section */}
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h3 className="font-semibold text-base">Active Session</h3>
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
