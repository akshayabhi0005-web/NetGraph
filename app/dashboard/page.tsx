'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Sparkles,
  Target,
  UserRound,
  Network,
} from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AppShell } from '@/components/app-shell'
import { useAuth } from '@/context/auth-context'
import { calculateProfileCompleteness } from '@/lib/profile'

const data = [
  { month: 'Jan', skills: 38 },
  { month: 'Feb', skills: 44 },
  { month: 'Mar', skills: 51 },
  { month: 'Apr', skills: 57 },
  { month: 'May', skills: 64 },
  { month: 'Jun', skills: 72 },
]

const matches = [
  { role: 'Data Analyst', score: 82, skills: 'SQL · Python · Statistics' },
  { role: 'Product Analyst', score: 74, skills: 'Research · SQL · Storytelling' },
  { role: 'Data Scientist', score: 61, skills: 'Python · ML · Experimentation' },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar'
  const completeness = calculateProfileCompleteness(user)
  const skillsCount = user?.skillsList?.length || user?.skills?.length || 0
  const educationCount = user?.education?.length || 0
  const experienceCount = user?.experience?.length || 0

  return (
    <AppShell title="Overview">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700">
              Analysis ready
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Good morning, {firstName}.
            </h1>
            <p className="mt-2 text-muted-foreground">
              Here&apos;s how your profile is connecting today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/profile">Edit profile</Link>
            </Button>
          </div>
        </div>

        {/* Onboarding Prompt Banner if not onboarded or incomplete */}
        {!user?.onboarded && (
          <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">
                  Complete your profile onboarding ({completeness}% complete)
                </h3>
                <p className="text-sm text-slate-600">
                  Walk through the 5-step guided setup to optimize your 3D graph connections and skill recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/onboarding">Complete onboarding &rarr;</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Skills identified', `${skillsCount}`, skillsCount > 0 ? `${skillsCount} verified skills` : 'No skills added', UserRound],
            ['Career alignment', '72%', 'Across 3 roles', Target],
            ['Education & Exp', `${educationCount + experienceCount}`, `${educationCount} degrees · ${experienceCount} roles`, Network],
            ['Profile completeness', `${completeness}%`, completeness >= 80 ? 'Profile optimized' : 'Action recommended', Sparkles],
          ].map(([label, value, note, Icon]) => (
            <div key={label as string} className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label as string}</p>
                <Icon className="size-4 text-indigo-500" />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-[-.05em]">{value as string}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600">{note as string}</p>
            </div>
          ))}
        </div>

        {/* Charts and Matches */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">Skill coverage over time</h2>
                <p className="mt-1 text-sm text-muted-foreground">Illustrative coverage across your target roles.</p>
              </div>
              <BarChart3 className="size-5 text-indigo-500" />
            </div>
            <div className="mt-6 h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="coverage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(15,23,42,.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="skills"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="url(#coverage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">Top career matches</h2>
                <p className="mt-1 text-sm text-muted-foreground">Illustrative profile-alignment.</p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-6 flex flex-col gap-5">
              {matches.map((match) => (
                <div key={match.role}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{match.role}</span>
                    <span className="text-sm font-bold text-indigo-600">{match.score}%</span>
                  </div>
                  <Progress value={match.score} className="mt-2 h-1.5" />
                  <p className="mt-2 text-xs text-muted-foreground">{match.skills}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-7 w-full rounded-full" asChild>
              <Link href="/career">
                Explore all matches <ChevronRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Opportunity Card */}
        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 md:flex md:items-center md:justify-between">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-indigo-600 shadow-xs">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">Your next best area to explore</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Adding one machine learning project could strengthen your path toward Data Scientist by connecting Python, statistics, and experimentation.
              </p>
            </div>
          </div>
          <Button variant="outline" className="mt-5 rounded-full bg-card md:mt-0" asChild>
            <Link href="/skills">
              View skill gap <ArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
