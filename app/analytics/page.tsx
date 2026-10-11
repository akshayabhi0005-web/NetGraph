'use client'

import React from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  BarChart3,
  PieChart as PieIcon,
  Compass,
  Link2,
  Award,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { SKILL_CATEGORIES, SKILL_PROFICIENCIES } from '@/lib/profile'

const ROLE_COLORS = [
  '#4f46e5',
  '#6366f1',
  '#818cf8',
  '#0ea5e9',
  '#06b6d4',
  '#10b981',
  '#8b5cf6',
  '#a855f7',
]

export default function AnalyticsPage() {
  const {
    careerMatches,
    skills,
    coOccurrences,
    dataQuality,
    topMatch,
  } = useCareerAnalysis()

  // 1. Career Matches Bar Chart Data
  const roleChartData = careerMatches.map((m) => ({
    name: m.roleTitle,
    score: m.matchScore,
    category: m.category,
  }))

  // 2. Skill Category Distribution Data
  const categoryChartData = SKILL_CATEGORIES.map((cat) => ({
    category: cat,
    count: skills.filter((s) => s.category === cat).length,
  })).filter((c) => c.count > 0)

  // 3. Proficiency Breakdown Data
  const proficiencyChartData = SKILL_PROFICIENCIES.map((prof) => ({
    level: prof,
    count: skills.filter((s) => s.proficiency === prof).length,
  }))

  // 4. Top Co-occurring Pairs Data
  const coOccurrenceChartData = coOccurrences.slice(0, 6).map((co) => ({
    pair: `${co.skillA} + ${co.skillB}`,
    count: co.count,
  }))

  return (
    <AppShell title="Profile Analytics">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              Deterministic Analytics
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Profile & relationship analytics
            </h1>
            <p className="mt-2 text-muted-foreground">
              Statistical breakdowns derived strictly from your cataloged competencies and portfolio transactions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/profile">Edit Profile</Link>
            </Button>
            <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/career">View All Roles</Link>
            </Button>
          </div>
        </div>

        {/* Data Quality & Limitations Notice */}
        {dataQuality.warnings.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Sample Notice:</p>
              <p className="mt-0.5 text-amber-800">
                {dataQuality.warnings.join(' ')}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {skills.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <BarChart3 className="mx-auto size-12 text-indigo-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">No profile data to analyze</h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              Add technical skills, projects, and work experience to unlock real-time career alignment analytics.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/onboarding">Run Guided Onboarding</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/profile">Add Skills in Profile</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stat Summary Cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-sm text-muted-foreground">Cataloged skills</span>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{skills.length}</p>
                <p className="mt-1 text-xs text-emerald-600 font-medium">Mapped to graph</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-sm text-muted-foreground">Mined transactions</span>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {dataQuality.totalTransactionsMined}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Projects & work history</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-sm text-muted-foreground">Co-occurring pairs</span>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {coOccurrences.length}
                </p>
                <p className="mt-1 text-xs text-indigo-600 font-medium">Empirical pairings</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                <span className="text-sm text-muted-foreground">Top role match</span>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-indigo-600">
                  {topMatch ? `${topMatch.matchScore}%` : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-slate-700 font-medium truncate">
                  {topMatch?.roleTitle || 'Explore roles'}
                </p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Chart 1: Career-Role Alignment Comparison */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="font-semibold text-base text-slate-900">Career Pathway Alignment</h2>
                    <p className="text-xs text-muted-foreground">
                      Calculated alignment percentage across all 8 reference career roles.
                    </p>
                  </div>
                  <Compass className="size-4 text-indigo-500" />
                </div>

                <div className="mt-6 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={roleChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        tick={{ fontSize: 11, fill: '#475569' }}
                      />
                      <Tooltip
                        formatter={(val: any) => [`${val ?? 0}%`, 'Match Score']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                        {roleChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Skill Category Distribution */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="font-semibold text-base text-slate-900">Competencies by Domain</h2>
                    <p className="text-xs text-muted-foreground">
                      Distribution of your skills across technical domains.
                    </p>
                  </div>
                  <PieIcon className="size-4 text-indigo-500" />
                </div>

                <div className="mt-6 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 25 }}
                    >
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any) => [`${val ?? 0} skills`, 'Count']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Proficiency Level Breakdown */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="font-semibold text-base text-slate-900">Proficiency Distribution</h2>
                    <p className="text-xs text-muted-foreground">
                      Self-reported proficiency tiers across your skill inventory.
                    </p>
                  </div>
                  <Award className="size-4 text-indigo-500" />
                </div>

                <div className="mt-6 h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={proficiencyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any) => [`${val ?? 0} skills`, 'Total']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Top Co-Occurring Skill Relationships */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="font-semibold text-base text-slate-900">Top Technology Pairings</h2>
                    <p className="text-xs text-muted-foreground">
                      Mined co-occurrence frequency across your projects and work history.
                    </p>
                  </div>
                  <Link2 className="size-4 text-indigo-500" />
                </div>

                <div className="mt-6 h-[230px]">
                  {coOccurrenceChartData.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground text-center px-4">
                      No technology co-occurrences mined yet. Add multiple technologies to a project or experience entry to generate pairings.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={coOccurrenceChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                        <YAxis
                          type="category"
                          dataKey="pair"
                          width={140}
                          tick={{ fontSize: 10, fill: '#475569' }}
                        />
                        <Tooltip
                          formatter={(val: any) => [`${val ?? 0} transactions`, 'Co-occurrences']}
                          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
