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
  Menu,
  Network,
  Settings2,
  Target,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useState, useEffect } from 'react'

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
  const { user, isAuthenticated, isLoading, authMode, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [path])

  // Close mobile drawer on Escape key press
  useEffect(() => {
    if (!mobileOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Route protection for authenticated workspace routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`)
    } else if (!isLoading && isAuthenticated && user && !user.onboarded) {
      router.push('/onboarding')
    }
  }, [isLoading, isAuthenticated, user, path, router])

  const handleLogout = async () => {
    await logout()
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

  if (!isAuthenticated || (user && !user.onboarded)) {
    return null
  }

  const initials = getInitials(user?.name)
  const displayName = user?.name || 'Scholar User'
  const userSubtitle = authMode === 'demo' ? 'Local Demo Mode' : (user?.headline || 'Server Account')

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
              title="Sign out"
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

      {/* Mobile Drawer Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Slide-Over Navigation Drawer */}
      <div
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col justify-between border-r border-border bg-card p-5 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Network className="size-4" />
              </span>
              <span className="font-bold tracking-[-.04em]">NETGRAPH</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition"
              aria-label="Close navigation menu"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="mt-7 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
              Workspace
            </p>
            {items.map(([href, label, Icon]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
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

        {/* Mobile Drawer Footer with Settings, Logout, and User Info */}
        <div className="border-t border-border pt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              <Settings2 className="size-3.5" /> Settings
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                handleLogout()
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 transition"
              title="Sign out"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>

          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
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
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-5 md:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Network className="size-3.5" />
              </span>
              <span className="font-bold tracking-tight">NETGRAPH</span>
            </Link>
          </div>
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
