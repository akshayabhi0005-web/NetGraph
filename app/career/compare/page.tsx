'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  Compass,
  Circle,
  BarChart3,
} from 'lucide-react'
import { CareerRoleMatch } from '@/lib/data-mining/types'
import { REFERENCE_CAREER_ROLES } from '@/lib/data-mining/career-roles'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function skillSetFrom(match: CareerRoleMatch): Set<string> {
  const role = REFERENCE_CAREER_ROLES.find((r) => r.id === match.roleId)
  if (!role) return new Set()
  const all = [
    ...role.requiredSkills.map((s) => s.name.toLowerCase()),
    ...role.recommendedSkills.map((s) => s.name.toLowerCase()),
  ]
  return new Set(all)
}

function allSkillsNamed(match: CareerRoleMatch): string[] {
  const role = REFERENCE_CAREER_ROLES.find((r) => r.id === match.roleId)
  if (!role) return []
  return [
    ...role.requiredSkills.map((s) => s.name),
    ...role.recommendedSkills.map((s) => s.name),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function RoleSelector({
  label,
  value,
  options,
  disabledId,
  onChange,
}: {
  label: string
  value: string
  options: CareerRoleMatch[]
  disabledId: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
      >
        <option value="">— Select a career path —</option>
        {options.map((r) => (
          <option key={r.roleId} value={r.roleId} disabled={r.roleId === disabledId}>
            {r.roleTitle} ({r.matchScore}% match)
          </option>
        ))}
      </select>
    </div>
  )
}

function SkillBadge({
  name,
  state,
}: {
  name: string
  state: 'matched' | 'missing' | 'shared'
}) {
  const styles =
    state === 'matched'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : state === 'shared'
      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
      : 'bg-muted text-muted-foreground border-dashed border-border'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}
    >
      {state === 'matched' ? (
        <CheckCircle2 className="size-3 text-emerald-500" />
      ) : state === 'shared' ? (
        <Circle className="size-3 fill-indigo-400 text-indigo-400" />
      ) : null}
      {name}
    </span>
  )
}

function PathCard({
  match,
  color,
  label,
  sharedSkillNames,
}: {
  match: CareerRoleMatch
  color: 'A' | 'B'
  label: string
  sharedSkillNames: Set<string>
}) {
  const role = REFERENCE_CAREER_ROLES.find((r) => r.id === match.roleId)
  const borderColor = color === 'A' ? 'border-indigo-400' : 'border-sky-400'
  const headerBg = color === 'A' ? 'bg-indigo-50 text-indigo-700' : 'bg-sky-50 text-sky-700'
  const scoreColor = color === 'A' ? 'text-indigo-600' : 'text-sky-600'

  const matchedNames = new Set(match.matchedSkills.map((s) => s.name.toLowerCase()))
  const allRequired = role?.requiredSkills ?? []
  const allRecommended = role?.recommendedSkills ?? []

  return (
    <div className={`flex flex-col rounded-2xl border-2 ${borderColor} bg-card shadow-xs`}>
      {/* Header */}
      <div className={`rounded-t-xl px-5 py-4 ${headerBg}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className={`mb-2 rounded-full text-[10px] ${headerBg} border-current`}>
              {label}
            </Badge>
            <h3 className="text-lg font-bold tracking-tight">{match.roleTitle}</h3>
            <p className="mt-0.5 text-xs opacity-70">{match.category}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-3xl font-bold tracking-tight ${scoreColor}`}>
              {match.matchScore}%
            </span>
            <p className="text-[10px] opacity-60">Profile Match</p>
          </div>
        </div>
        <Progress value={match.matchScore} className="mt-3 h-1.5" />
      </div>

      {/* Body */}
      <div className="flex flex-col gap-5 p-5">
        {/* Description */}
        {role?.description && (
          <p className="text-xs leading-relaxed text-muted-foreground">{role.description}</p>
        )}

        {/* Score Explanation */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
            <Info className="size-3 text-muted-foreground" />
            Score calculation:
          </div>
          {match.explanation}
        </div>

        {/* Required Skills */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Required Skills ({allRequired.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {allRequired.map((s) => {
              const hasIt = matchedNames.has(s.name.toLowerCase())
              const isShared = sharedSkillNames.has(s.name.toLowerCase())
              return (
                <SkillBadge
                  key={s.name}
                  name={s.name}
                  state={hasIt ? 'matched' : isShared ? 'shared' : 'missing'}
                />
              )
            })}
          </div>
        </div>

        {/* Recommended Skills */}
        {allRecommended.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Recommended Skills ({allRecommended.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allRecommended.map((s) => {
                const hasIt = matchedNames.has(s.name.toLowerCase())
                const isShared = sharedSkillNames.has(s.name.toLowerCase())
                return (
                  <SkillBadge
                    key={s.name}
                    name={s.name}
                    state={hasIt ? 'matched' : isShared ? 'shared' : 'missing'}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Missing required count */}
        <div className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3 text-xs">
          <span className="text-muted-foreground">Skill gaps to address:</span>
          <span className="font-bold text-rose-600">{match.missingRequiredSkills.length} required</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function CareerComparePage() {
  const { careerMatches, skillGaps, skills, dataQuality } = useCareerAnalysis()

  const [roleAId, setRoleAId] = useState<string>('')
  const [roleBId, setRoleBId] = useState<string>('')
  const [hasCompared, setHasCompared] = useState(false)

  const roleA = careerMatches.find((r) => r.roleId === roleAId) || null
  const roleB = careerMatches.find((r) => r.roleId === roleBId) || null

  const canCompare = roleAId !== '' && roleBId !== '' && roleAId !== roleBId
  const sameRoleSelected = roleAId !== '' && roleBId !== '' && roleAId === roleBId

  // Compute comparison data only when both roles are set
  const comparison = useMemo(() => {
    if (!roleA || !roleB) return null

    const skillsA = skillSetFrom(roleA)
    const skillsB = skillSetFrom(roleB)
    const namedA = allSkillsNamed(roleA)
    const namedB = allSkillsNamed(roleB)

    const sharedSkillNames = new Set<string>()
    for (const s of skillsA) {
      if (skillsB.has(s)) sharedSkillNames.add(s)
    }

    const uniqueToA = namedA.filter((s) => !skillsB.has(s.toLowerCase()))
    const uniqueToB = namedB.filter((s) => !skillsA.has(s.toLowerCase()))

    const sharedList = namedA.filter((s) => skillsB.has(s.toLowerCase()))
    const totalDistinct = new Set([...namedA.map((s) => s.toLowerCase()), ...namedB.map((s) => s.toLowerCase())]).size

    // Shared skills user already has
    const matchedANames = new Set(roleA.matchedSkills.map((s) => s.name.toLowerCase()))
    const matchedBNames = new Set(roleB.matchedSkills.map((s) => s.name.toLowerCase()))
    const sharedAndUserHas = sharedList.filter(
      (s) => matchedANames.has(s.toLowerCase()) && matchedBNames.has(s.toLowerCase())
    )

    // Skills helpful for both paths (shared + missing in at least one)
    const leverageSkills = sharedList.filter(
      (s) =>
        !matchedANames.has(s.toLowerCase()) ||
        !matchedBNames.has(s.toLowerCase())
    )

    // Coverage for chart data
    const coverageChartData = [
      {
        role: roleA.roleTitle.length > 22 ? roleA.roleTitle.slice(0, 22) + '…' : roleA.roleTitle,
        match: roleA.matchScore,
        missing: 100 - roleA.matchScore,
      },
      {
        role: roleB.roleTitle.length > 22 ? roleB.roleTitle.slice(0, 22) + '…' : roleB.roleTitle,
        match: roleB.matchScore,
        missing: 100 - roleB.matchScore,
      },
    ]

    // Skill gap priorities for both
    const gapsA = skillGaps.filter((g) => g.targetRole === roleA.roleTitle)
    const gapsB = skillGaps.filter((g) => g.targetRole === roleB.roleTitle)

    // High-priority actions covering both paths
    const highPriorityGaps = [
      ...gapsA.filter((g) => g.priority === 'high'),
      ...gapsB.filter((g) => g.priority === 'high'),
    ]
      .filter(
        (gap, idx, arr) =>
          arr.findIndex((g) => g.skillName === gap.skillName) === idx
      )
      .slice(0, 6)

    return {
      sharedSkillNames,
      sharedList,
      uniqueToA,
      uniqueToB,
      totalDistinct,
      sharedAndUserHas,
      leverageSkills,
      coverageChartData,
      highPriorityGaps,
      gapsA,
      gapsB,
    }
  }, [roleA, roleB, skillGaps])

  const handleCompare = () => {
    if (canCompare) setHasCompared(true)
  }

  const handleReset = () => {
    setRoleAId('')
    setRoleBId('')
    setHasCompared(false)
  }

  return (
    <AppShell title="Career Path Comparison">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              Side-by-Side Career Analysis
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl text-slate-900">
              Compare career paths
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Select two career paths and compare required skills, your profile coverage, skill gaps, and learning priorities — based entirely on your profile data.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/career">← Career Matches</Link>
            </Button>
            <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/skills">
                Skill Analysis <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Data Quality Warning */}
        {dataQuality.warnings.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Profile Coverage Notice:</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-800">
                {dataQuality.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-amber-700">
                Add more skills, projects, and experience to your profile for more accurate comparison results.
              </p>
            </div>
          </div>
        )}

        {/* No profile skills */}
        {skills.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Compass className="mx-auto size-12 text-indigo-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">No profile skills detected</h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              Career path comparison requires skills in your profile. Add skills via onboarding or the Profile manager.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Link href="/onboarding">Complete Guided Onboarding</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/profile">Add Skills in Profile</Link>
              </Button>
            </div>
          </div>
        ) : careerMatches.length < 2 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <GitCompare className="mx-auto size-12 text-indigo-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">Not enough career data</h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              At least two career path results are required to run a comparison. Enrich your profile to unlock more matches.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/career">View Career Matches</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Selector Panel */}
            <div className="rounded-2xl border border-border bg-card shadow-xs p-6">
              <div className="flex items-center gap-2 mb-5">
                <GitCompare className="size-5 text-indigo-500" />
                <h2 className="text-base font-semibold text-slate-900">Select two career paths to compare</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <RoleSelector
                  label="Career Path A"
                  value={roleAId}
                  options={careerMatches}
                  disabledId={roleBId}
                  onChange={(id) => {
                    setRoleAId(id)
                    setHasCompared(false)
                  }}
                />
                <RoleSelector
                  label="Career Path B"
                  value={roleBId}
                  options={careerMatches}
                  disabledId={roleAId}
                  onChange={(id) => {
                    setRoleBId(id)
                    setHasCompared(false)
                  }}
                />
              </div>

              {sameRoleSelected && (
                <p className="mt-3 text-xs text-rose-600 font-medium">
                  Please select two different career paths to compare.
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleCompare}
                  disabled={!canCompare}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  aria-label="Run career path comparison"
                >
                  <GitCompare className="size-4 mr-1.5" />
                  Compare Paths
                </Button>
                {hasCompared && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="rounded-full"
                    aria-label="Reset career comparison selection"
                  >
                    Reset
                  </Button>
                )}
              </div>

              {/* Transparency Note */}
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-slate-600">
                <Info className="size-3.5 text-indigo-500 mt-0.5 shrink-0" />
                <span>
                  Comparison scores are calculated deterministically from your profile skills against the NETGRAPH reference career catalogue. These are illustrative alignment estimates and do not represent real job-market hiring requirements or guarantee employability.
                </span>
              </div>
            </div>

            {/* Empty state — nothing compared yet */}
            {!hasCompared && (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
                <GitCompare className="mx-auto size-10 text-muted-foreground" />
                <p className="mt-3 font-medium text-slate-700">
                  Select two career paths above and click <strong>Compare Paths</strong> to see a detailed side-by-side analysis.
                </p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  You'll see required skills, your coverage, skill gaps, shared competencies, and actionable learning priorities.
                </p>
              </div>
            )}

            {/* Comparison Results */}
            {hasCompared && roleA && roleB && comparison && (
              <div className="space-y-8">
                {/* Summary Scorecard */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <p className="text-xs font-medium text-muted-foreground">Shared Skills</p>
                    <p className="mt-2 text-3xl font-bold text-indigo-600 tracking-tight">{comparison.sharedList.length}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Skills common to both paths</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <p className="text-xs font-medium text-muted-foreground">Total Distinct Skills</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">{comparison.totalDistinct}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Across both paths combined</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <p className="text-xs font-medium text-muted-foreground">Shared & You Have</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-600 tracking-tight">{comparison.sharedAndUserHas.length}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Shared skills already in profile</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
                    <p className="text-xs font-medium text-muted-foreground">Leverage Skills</p>
                    <p className="mt-2 text-3xl font-bold text-amber-600 tracking-tight">{comparison.leverageSkills.length}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Shared gaps — learning helps both</p>
                  </div>
                </div>

                {/* Side-by-side Path Cards */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <PathCard
                    match={roleA}
                    color="A"
                    label="Career Path A"
                    sharedSkillNames={comparison.sharedSkillNames}
                  />
                  <PathCard
                    match={roleB}
                    color="B"
                    label="Career Path B"
                    sharedSkillNames={comparison.sharedSkillNames}
                  />
                </div>

                {/* Coverage Chart */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="size-4 text-indigo-500" />
                    <h2 className="text-base font-semibold text-slate-900">Profile Coverage Comparison</h2>
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">
                    How much of each path's skill requirements your current profile covers. Gaps represent skills not yet in your profile.
                  </p>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparison.coverageChartData}
                        layout="vertical"
                        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                        barCategoryGap="30%"
                      >
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <YAxis
                          type="category"
                          dataKey="role"
                          width={140}
                          tick={{ fontSize: 11, fill: '#475569' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            value !== undefined ? `${value}%` : '—',
                            name === 'match' ? 'Profile Coverage' : 'Skill Gap',
                          ]}
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                        />
                        <Legend
                          iconSize={10}
                          iconType="circle"
                          formatter={(value) =>
                            value === 'match' ? 'Profile Coverage' : 'Skill Gap'
                          }
                          wrapperStyle={{ fontSize: 11 }}
                        />
                        <Bar dataKey="match" stackId="a" fill="#4f46e5" radius={[4, 0, 0, 4]}>
                          {comparison.coverageChartData.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? '#4f46e5' : '#0ea5e9'} />
                          ))}
                        </Bar>
                        <Bar dataKey="missing" stackId="a" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    Scores are weighted by skill importance within each role definition, not a simple skill count.
                  </p>
                </div>

                {/* Skill Sets Comparison */}
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Unique to A */}
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Only in Path A — {roleA.roleTitle}
                    </p>
                    <p className="mb-3 text-[11px] text-muted-foreground">
                      {comparison.uniqueToA.length} skills unique to this path
                    </p>
                    {comparison.uniqueToA.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No unique skills — both paths share all required skills.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {comparison.uniqueToA.map((s) => {
                          const matched = roleA.matchedSkills.some(
                            (m) => m.name.toLowerCase() === s.toLowerCase()
                          )
                          return <SkillBadge key={s} name={s} state={matched ? 'matched' : 'missing'} />
                        })}
                      </div>
                    )}
                  </div>

                  {/* Shared Skills */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                      Shared Skills — Both Paths
                    </p>
                    <p className="mb-3 text-[11px] text-muted-foreground">
                      {comparison.sharedList.length} skills in common
                    </p>
                    {comparison.sharedList.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No skills in common between these paths.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {comparison.sharedList.map((s) => {
                          const inA = roleA.matchedSkills.some(
                            (m) => m.name.toLowerCase() === s.toLowerCase()
                          )
                          const inB = roleB.matchedSkills.some(
                            (m) => m.name.toLowerCase() === s.toLowerCase()
                          )
                          return <SkillBadge key={s} name={s} state={inA && inB ? 'matched' : 'shared'} />
                        })}
                      </div>
                    )}
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-emerald-600">Green</span> = you have it in both.{' '}
                      <span className="font-semibold text-indigo-600">Blue</span> = shared but not yet in both profiles.
                    </p>
                  </div>

                  {/* Unique to B */}
                  <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sky-600">
                      Only in Path B — {roleB.roleTitle}
                    </p>
                    <p className="mb-3 text-[11px] text-muted-foreground">
                      {comparison.uniqueToB.length} skills unique to this path
                    </p>
                    {comparison.uniqueToB.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No unique skills — both paths share all required skills.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {comparison.uniqueToB.map((s) => {
                          const matched = roleB.matchedSkills.some(
                            (m) => m.name.toLowerCase() === s.toLowerCase()
                          )
                          return <SkillBadge key={s} name={s} state={matched ? 'matched' : 'missing'} />
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Leverage Skills — helpful for both */}
                {comparison.leverageSkills.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="size-4 text-amber-600" />
                      <h3 className="text-sm font-semibold text-amber-900">Skills that help you pursue both paths</h3>
                    </div>
                    <p className="mb-4 text-xs text-amber-800">
                      These {comparison.leverageSkills.length} shared skills are either missing or not fully covered in one or both paths. Learning them accelerates progress toward either career simultaneously.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {comparison.leverageSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-full border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Priorities */}
                {comparison.highPriorityGaps.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h3 className="text-base font-semibold text-slate-900 mb-1">
                      Top Learning Priorities
                    </h3>
                    <p className="mb-5 text-xs text-muted-foreground">
                      High-priority skill gaps identified from your profile for both career paths combined. Addressing these will have the most impact on your comparison scores.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {comparison.highPriorityGaps.map((gap) => (
                        <div
                          key={`${gap.skillName}-${gap.targetRole}`}
                          className="rounded-xl border border-border p-4 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900">{gap.skillName}</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] text-rose-600 border-rose-200 bg-rose-50"
                            >
                              HIGH
                            </Badge>
                          </div>
                          <p className="text-slate-600 leading-relaxed">{gap.reason}</p>
                          <p className="mt-1.5 text-indigo-600 font-medium">→ {gap.suggestedAction}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground">
                            Needed for: {gap.targetRole}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Link href="/profile">Add Missing Skills in Profile →</Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-full">
                        <Link href="/skills">View Full Skill Analysis</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Limitations notice */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  <Info className="size-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="leading-relaxed">
                    <strong className="text-slate-700">Transparency note:</strong>{' '}
                    This comparison is generated deterministically from your profile against NETGRAPH's reference career catalogue. It does not represent verified job-market data, hiring decisions, or salary information. No career path is declared universally superior — the results highlight differences to help you make informed decisions.
                    {roleA.dataLimitations && (
                      <span className="block mt-1 text-amber-700">
                        Path A limitation: {roleA.dataLimitations.join(' ')}
                      </span>
                    )}
                    {roleB.dataLimitations && (
                      <span className="block mt-1 text-amber-700">
                        Path B limitation: {roleB.dataLimitations.join(' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
