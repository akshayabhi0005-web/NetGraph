'use client'

import { useState, useEffect } from 'react'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import { CheckCircle2 } from 'lucide-react'

export default function Profile() {
  const { user, updateProfile } = useAuth()

  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [careerGoal, setCareerGoal] = useState('')
  const [summary, setSummary] = useState('')
  const [location, setLocation] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setHeadline(user.headline || '')
      setCareerGoal(user.careerGoal || '')
      setSummary(user.summary || '')
      setLocation(user.location || '')
    }
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      name: name.trim() || user?.name || 'Explorer User',
      headline: headline.trim(),
      careerGoal: careerGoal.trim(),
      summary: summary.trim(),
      location: location.trim(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <AppShell title="Profile">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-tight">Your profile</h2>
        <p className="mt-2 text-muted-foreground">Keep the information behind your analysis current.</p>

        {saved && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
            <span>Profile details saved and updated across workspace.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Morgan"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <span className="text-[11px] text-muted-foreground">Registered account email.</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="headline">Professional headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Product & Data Analyst"
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
            <Label htmlFor="careerGoal">Career goal</Label>
            <Input
              id="careerGoal"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="Move into a product analytics & data science role."
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="summary">About / Summary</Label>
            <textarea
              id="summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Summary of experience and background..."
            />
          </div>

          <Button type="submit" className="w-fit rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
            Save profile
          </Button>
        </form>
      </div>
    </AppShell>
  )
}
