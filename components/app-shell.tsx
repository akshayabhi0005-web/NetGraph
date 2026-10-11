'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Network,
  Settings2,
  Target,
  UserRound,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useEffect } from 'react'

const items = [
  ['/dashboard', 'Overview', LayoutDashboard],
  ['/career', 'Career matches', BriefcaseBusiness],
  ['/skills', 'Skill gaps', Target],
  ['/analytics', 'Analytics', BarChart3],
  ['/graph', 'Relationship graph', GitBranch],
  ['/reports', 'Reports', FileText],
  ['/resume', 'Resume builder', FileText],
  ['/profile', 'Profile', UserRound],
] as const

function getInitials(name?: string): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AppShell({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  const path = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  // Route protection for authenticated workspace routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`)
    }
  }, [isLoading, isAuthenticated, path, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-medium text-muted-foreground">Loading workspace...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const initials = getInitials(user?.name)
  const displayName = user?.name || 'Scholar User'
  const userSubtitle = user?.headline || 'Demo account'

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card p-5 lg:flex lg:flex-col lg:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Network className="size-4" />
            </span>
            <span className="font-bold tracking-[-.04em]">NETGRAPH</span>
          </Link>

          <nav className="mt-8 flex flex-col gap-1">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
              Workspace
            </p>
            {items.map(([href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  path === href
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Active User and Logout */}
        <div className="border-t border-border pt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <Link
              href="/settings"
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              <Settings2 className="size-3.5" /> Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 transition"
              title="Sign out of demo session"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl bg-muted/70 p-2.5 transition hover:bg-muted"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-[10px] text-muted-foreground">{userSubtitle}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold lg:hidden">
            <Network className="size-4 text-indigo-600" />
            NETGRAPH
          </Link>
          <h1 className="hidden text-sm font-semibold lg:block">{title}</h1>

          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {initials}
              </span>
              <span className="hidden sm:inline-block font-medium text-foreground">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        <div className="p-5 md:p-8">{children}</div>
      </div>
    </main>
  )
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-indigo-600">{detail}</p>
    </div>
  )
}
