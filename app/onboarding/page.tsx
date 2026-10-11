'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Network } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'

const availableSkills = ['Python', 'React', 'SQL', 'Data analysis', 'Machine learning', 'Cloud']

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateProfile, isAuthenticated, isLoading } = useAuth()

  const [fullName, setFullName] = useState('')
  const [location, setLocation] = useState('')
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [selected, setSelected] = useState<string[]>(['Python', 'SQL'])
  const [done, setDone] = useState(false)

  // Initialize with current user data if available
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name)
      if (user.location) setLocation(user.location)
      if (user.headline) setHeadline(user.headline)
      if (user.summary) setSummary(user.summary)
      if (user.skills && user.skills.length > 0) setSelected(user.skills)
    }
  }, [user])

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/onboarding')
    }
  }, [isLoading, isAuthenticated, router])

  const toggle = (skill: string) => {
    setSelected((current) =>
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill]
    )
  }

  const handleSave = () => {
    updateProfile({
      name: fullName.trim() || user?.name || 'Explorer User',
      location: location.trim(),
      headline: headline.trim(),
      summary: summary.trim(),
      skills: selected,
      onboarded: true,
    })
    setDone(true)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Network className="size-4" />
            </span>{' '}
            NETGRAPH
          </Link>
          <span className="text-xs font-semibold text-muted-foreground">PROFILE SETUP · 1 OF 3</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-14">
        <div className="mb-10 flex gap-2">
          <span className="h-1.5 flex-1 rounded-full bg-indigo-600" />
          <span className="h-1.5 flex-1 rounded-full bg-muted" />
          <span className="h-1.5 flex-1 rounded-full bg-muted" />
        </div>

        {done ? (
          <div className="rounded-3xl border border-indigo-100 bg-card p-10 text-center shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="size-7" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em]">
              Your profile is ready to explore.
            </h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              We&apos;ll use your inputs to create a transparent, illustrative career analysis. Nothing here is a hiring prediction.
            </p>
            <Button asChild className="mt-8 rounded-full bg-slate-950 hover:bg-indigo-700 text-white">
              <Link href="/dashboard">
                View my dashboard <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        ) : (
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" /> Exit setup
            </Link>
            <h1 className="mt-8 text-4xl font-semibold tracking-[-0.055em]">
              Let&apos;s map your starting point.
            </h1>
            <p className="mt-3 max-w-lg text-lg leading-8 text-muted-foreground">
              Tell us a little about yourself first. You can always come back and add detail later.
            </p>

            <div className="mt-10 flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Toronto, Canada"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="headline">Professional headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Computer science student exploring data"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="summary">Short professional summary</Label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="min-h-24 rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="A sentence or two about what you enjoy building..."
                />
              </div>

              <div>
                <Label>Skills you want to include</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggle(skill)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        selected.includes(skill)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                          : 'border-border text-muted-foreground hover:border-indigo-300'
                      }`}
                    >
                      {selected.includes(skill) && <Check className="mr-1 inline size-3.5" />}
                      {skill}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Select at least one. You&apos;ll add education, projects, and goals in the next steps.
                </p>
              </div>

              <Button
                onClick={handleSave}
                className="mt-2 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save and continue <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
