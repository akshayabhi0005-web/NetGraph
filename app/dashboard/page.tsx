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
  Compass,
} from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AppShell } from '@/components/app-shell'
import { useAuth } from '@/context/auth-context'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import { calculateProfileCompleteness } from '@/lib/profile'

export default function DashboardPage() {
  const { user } = useAuth()
  const { careerMatches, skillGaps, skills, coOccurrences, associationRules, dataQuality } =
    useCareerAnalysis()

  const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar'
  const completeness = calculateProfileCompleteness(user)
  const skillsCount = skills.length
  const projectsCount = user?.projects?.length || 0
  const experienceCount = user?.experience?.length || 0
  const certsCount = user?.certifications?.length || 0

  const topMatches = careerMatches.slice(0, 3)
  const topGap = skillGaps.find((g) => g.priority === 'high') || skillGaps[0]

  // Dynamic Skill Category distribution for the dashboard mini-chart
  const chartData = [
    { category: 'Prog. Lang', count: skills.filter((s) => s.category === 'Programming Languages').length },
    { category: 'Frameworks', count: skills.filter((s) => s.category === 'Frameworks').length },
    { category: 'Databases', count: skills.filter((s) => s.category === 'Databases').length },
    { category: 'Cloud', count: skills.filter((s) => s.category === 'Cloud Computing').length },
    { category: 'Data Science', count: skills.filter((s) => s.category === 'Data Science').length },
    { category: 'ML/AI', count: skills.filter((s) => s.category === 'Machine Learning').length },
  ]

  return (
    <AppShell title="Overview">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700">
              Analysis ready
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Good morning, {firstName}.
            </h1>
            <p className="mt-2 text-muted-foreground">
              Here&apos;s how your profile is connecting today through the relationship-mining engine.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/career">Explore Pathways</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/profile">Edit Profile</Link>
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
            [
              'Skills identified',
              `${skillsCount}`,
              skillsCount > 0 ? `${skillsCount} verified competencies` : 'Add skills in profile',
              UserRound,
              '/skills',
            ],
            [
              'Top role match',
              topMatches[0] ? `${topMatches[0].matchScore}%` : '0%',
              topMatches[0] ? topMatches[0].roleTitle : 'No skills recorded',
              Target,
              '/career',
            ],
            [
              'Projects & Experience',
              `${projectsCount + experienceCount}`,
              `${projectsCount} projects · ${experienceCount} jobs · ${certsCount} certs`,
              Network,
              '/profile',
            ],
            [
              'Mined relationships',
              `${coOccurrences.length}`,
              `${associationRules.length} association rules`,
              Compass,
              '/graph',
            ],
          ].map(([label, value, note, Icon, linkHref]) => (
            <Link
              key={label as string}
              href={linkHref as string}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label as string}</p>
                <Icon className="size-4 text-indigo-500" />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-[-.05em]">{value as string}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600">{note as string}</p>
            </Link>
          ))}
        </div>

        {/* Charts and Career Matches */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
          {/* Skill Domain Coverage Chart */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Skill Distribution Across Domains</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Actual counts of your competencies categorized by engineering domains.
                </p>
              </div>
              <BarChart3 className="size-5 text-indigo-500" />
            </div>
            <div className="mt-6 h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="coverage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.24} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 8px 24px rgba(15,23,42,.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Skills"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    fill="url(#coverage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Career Matches from Data-Mining Engine */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Top Career Matches</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Computed by the career matching algorithm.
                </p>
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </div>

            <div className="mt-6 flex flex-col gap-5">
              {topMatches.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">
                  Add skills in your profile to compute career matches.
                </p>
              ) : (
                topMatches.map((match) => {
                  const skillsSummary =
                    match.matchedSkills.length > 0
                      ? match.matchedSkills.map((s) => s.name).slice(0, 3).join(' · ')
                      : 'No overlapping skills yet'
                  return (
                    <div key={match.roleId}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{match.roleTitle}</span>
                        <span className="text-sm font-bold text-indigo-600">{match.matchScore}%</span>
                      </div>
                      <Progress value={match.matchScore} className="mt-2 h-1.5" />
                      <p className="mt-1.5 text-xs text-muted-foreground">{skillsSummary}</p>
                    </div>
                  )
                })
              )}
            </div>

            <Button variant="outline" className="mt-7 w-full rounded-full" asChild>
              <Link href="/career">
                Explore all {careerMatches.length} matches <ChevronRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Dynamic Opportunity Card from Skill Gaps */}
        {topGap && (
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-6 md:flex md:items-center md:justify-between">
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-indigo-600 shadow-xs">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Recommended skill focus: {topGap.skillName}
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                  {topGap.reason} Adding a project or demonstrating coursework with {topGap.skillName} will immediately increase your alignment score for {topGap.targetRole}.
                </p>
              </div>
            </div>
            <Button variant="outline" className="mt-5 rounded-full bg-card md:mt-0" asChild>
              <Link href="/career">
                View role gap <ArrowUpRight className="size-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
