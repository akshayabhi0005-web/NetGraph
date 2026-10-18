'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import {
  BarChart3,
  Compass,
  Link2,
  Award,
  AlertTriangle,
  Info,
  ArrowRight,
  Filter,
  RotateCcw,
  CheckCircle2,
  Target,
  Sparkles,
  Layers,
  GitCompare,
  TrendingUp,
  FileText,
} from 'lucide-react'
import {
  SKILL_CATEGORIES,
  SKILL_PROFICIENCIES,
  calculateProfileCompleteness,
  SkillCategory,
} from '@/lib/profile'
import { REFERENCE_CAREER_ROLES } from '@/lib/data-mining/career-roles'

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

const PROFICIENCY_COLORS: Record<string, string> = {
  Beginner: '#94a3b8',
  Intermediate: '#38bdf8',
  Advanced: '#6366f1',
  Expert: '#4f46e5',
}

export default function AnalyticsPage() {
  const {
    user,
    careerMatches,
    skills,
    coOccurrences,
    associationRules,
    skillGaps,
    dataQuality,
    topMatch,
  } = useCareerAnalysis()

  // ───────────────────────────────────────────────────────────────────────────
  // Local Filter State
  // ───────────────────────────────────────────────────────────────────────────
  const [selectedCareerCategory, setSelectedCareerCategory] = useState<string>('all')
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>('all')
  const [minMatchThreshold, setMinMatchThreshold] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'alignment' | 'coverage' | 'skills' | 'associations'>('overview')

  // Available Career Categories derived from career matches
  const careerCategories = useMemo(() => {
    const cats = new Set<string>()
    careerMatches.forEach((m) => {
      if (m.category) cats.add(m.category)
    })
    return Array.from(cats).sort()
  }, [careerMatches])

  // Profile Completeness Score
  const completenessScore = useMemo(() => {
    return calculateProfileCompleteness(user)
  }, [user])

  // High priority gaps count
  const highPriorityGaps = useMemo(() => {
    return skillGaps.filter((g) => g.priority === 'high')
  }, [skillGaps])

  // Is any filter currently applied?
  const isFilterActive =
    selectedCareerCategory !== 'all' ||
    selectedSkillCategory !== 'all' ||
    minMatchThreshold > 0

  const handleResetFilters = () => {
    setSelectedCareerCategory('all')
    setSelectedSkillCategory('all')
    setMinMatchThreshold(0)
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Filtered Data Calculations
  // ───────────────────────────────────────────────────────────────────────────

  // 1. Filtered Career Roles for Alignment Chart
  const filteredCareerMatches = useMemo(() => {
    return careerMatches.filter((m) => {
      if (selectedCareerCategory !== 'all' && m.category !== selectedCareerCategory) {
        return false
      }
      if (m.matchScore < minMatchThreshold) {
        return false
      }
      return true
    })
  }, [careerMatches, selectedCareerCategory, minMatchThreshold])

  const roleChartData = useMemo(() => {
    return filteredCareerMatches.map((m) => ({
      name: m.roleTitle,
      score: m.matchScore,
      unweighted: m.unweightedMatchPercentage,
      category: m.category,
      matchedCount: m.matchedSkills.length,
      missingReqCount: m.missingRequiredSkills.length,
    }))
  }, [filteredCareerMatches])

  // 2. Skill Coverage Data (Matched vs Missing Required vs Missing Recommended)
  const coverageChartData = useMemo(() => {
    return filteredCareerMatches.map((m) => ({
      role: m.roleTitle.length > 20 ? m.roleTitle.slice(0, 18) + '…' : m.roleTitle,
      fullTitle: m.roleTitle,
      matched: m.matchedSkills.length,
      missingRequired: m.missingRequiredSkills.length,
      missingRecommended: m.missingRecommendedSkills.length,
      matchScore: m.matchScore,
    }))
  }, [filteredCareerMatches])

  // 3. Filtered Skills & Category Distribution Data
  const filteredSkills = useMemo(() => {
    if (selectedSkillCategory === 'all') return skills
    return skills.filter((s) => s.category === selectedSkillCategory)
  }, [skills, selectedSkillCategory])

  const categoryChartData = useMemo(() => {
    return SKILL_CATEGORIES.map((cat) => ({
      category: cat,
      count: skills.filter((s) => s.category === cat).length,
    })).filter((c) => (selectedSkillCategory === 'all' ? c.count > 0 : c.category === selectedSkillCategory))
  }, [skills, selectedSkillCategory])

  // 4. Proficiency Breakdown Data
  const proficiencyChartData = useMemo(() => {
    return SKILL_PROFICIENCIES.map((prof) => ({
      level: prof,
      count: filteredSkills.filter((s) => s.proficiency === prof).length,
    }))
  }, [filteredSkills])

  // 5. Co-occurring Technology Pairs
  const coOccurrenceChartData = useMemo(() => {
    return coOccurrences.slice(0, 8).map((co) => ({
      pair: `${co.skillA} + ${co.skillB}`,
      count: co.count,
    }))
  }, [coOccurrences])

  // 6. Actionable Insights: Cross-Cutting / Leverage Skills
  const crossCuttingSkills = useMemo(() => {
    return skills
      .map((skill) => {
        const rolesRequiring = REFERENCE_CAREER_ROLES.filter((role) =>
          role.requiredSkills.some((rs) => rs.name.toLowerCase() === skill.normalisedName.toLowerCase())
        ).map((r) => r.title)
        const rolesRecommending = REFERENCE_CAREER_ROLES.filter((role) =>
          role.recommendedSkills.some((rs) => rs.name.toLowerCase() === skill.normalisedName.toLowerCase())
        ).map((r) => r.title)
        return {
          name: skill.normalisedName,
          category: skill.category,
          proficiency: skill.proficiency,
          provenanceCount: skill.provenance.length,
          totalRolesSupported: rolesRequiring.length + rolesRecommending.length,
          rolesRequiring,
        }
      })
      .sort((a, b) => b.totalRolesSupported - a.totalRolesSupported)
      .slice(0, 5)
  }, [skills])

  // 7. Actionable Insights: Most Frequently Used Skills in Transactions
  const topTransactionSkills = useMemo(() => {
    const frequencyMap = new Map<string, number>()
    coOccurrences.forEach((co) => {
      frequencyMap.set(co.skillA, (frequencyMap.get(co.skillA) || 0) + co.count)
      frequencyMap.set(co.skillB, (frequencyMap.get(co.skillB) || 0) + co.count)
    })
    return Array.from(frequencyMap.entries())
      .map(([name, freq]) => ({ name, freq }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, 5)
  }, [coOccurrences])

  // 8. Top Association Rule
  const topRule = useMemo(() => {
    if (!associationRules || associationRules.length === 0) return null
    return [...associationRules].sort((a, b) => b.lift - a.lift)[0]
  }, [associationRules])

  // 9. Profile Improvement Recommendations
  const completenessSuggestions = useMemo(() => {
    const suggestions: string[] = []
    if (!user?.headline) suggestions.push('Add a professional headline')
    if (!user?.summary) suggestions.push('Write a short career summary')
    if (!user?.projects || user.projects.length < 2) {
      suggestions.push('Add at least 2 portfolio projects with technology tags')
    }
    if (!user?.experience || user.experience.length === 0) {
      suggestions.push('Document work experience or internships')
    }
    if (skills.length < 5) {
      suggestions.push('List at least 5 technical competencies')
    }
    return suggestions
  }, [user, skills])

  return (
    <AppShell title="Profile Analytics">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              Interactive Data Mining Engine
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl text-slate-900">
              Profile & career analytics
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Statistical breakdowns, career alignment coverage, and association rule intelligence derived deterministically from your cataloged competencies and portfolio transactions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/profile">Edit Profile</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/career/compare">
                <GitCompare className="mr-1.5 size-4" />
                Compare Paths
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/reports">
                <FileText className="mr-1.5 size-4" />
                Export Report
              </Link>
            </Button>
          </div>
        </div>

        {/* Data Quality & Limitations Notice */}
        {dataQuality.warnings.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Data Quality & Sample Notice:</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-800">
                {dataQuality.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-amber-700">
                Data mining confidence is currently <strong>{dataQuality.confidenceLevel.toUpperCase()}</strong>. Adding more projects and work history improves statistical certainty and association discovery.
              </p>
            </div>
          </div>
        )}

        {/* Empty State when no skills exist */}
        {skills.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <BarChart3 className="mx-auto size-12 text-indigo-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">No profile competencies to analyze</h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              Add technical skills, portfolio projects, and work experience to unlock real-time career alignment analytics and association rule discovery.
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
            {/* Stat Summary KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Card 1: Profile Completeness */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completeness</span>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700">
                      Profile
                    </Badge>
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{completenessScore}%</p>
                  <Progress value={completenessScore} className="mt-2.5 h-1.5" />
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  {completenessScore >= 80 ? 'Comprehensive profile' : 'Add details to reach 100%'}
                </p>
              </div>

              {/* Card 2: Total Cataloged Skills */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cataloged Skills</span>
                    <Sparkles className="size-3.5 text-indigo-500" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-indigo-600">{skills.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-600">Normalized & mapped</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Across {categoryChartData.length} technical domains</p>
                </div>
              </div>

              {/* Card 3: Top Role Match */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Role Alignment</span>
                    <Compass className="size-3.5 text-indigo-500" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-indigo-600">
                    {topMatch ? `${topMatch.matchScore}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {topMatch?.roleTitle || 'Explore roles'}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {careerMatches.filter((m) => m.matchScore >= 50).length} of 8 roles align ≥50%
                  </p>
                </div>
              </div>

              {/* Card 4: Identified Skill Gaps */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill Gaps</span>
                    <Target className="size-3.5 text-rose-500" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-rose-600">{skillGaps.length}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-rose-600">
                    {highPriorityGaps.length} high priority gaps
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Across reference pathways</p>
                </div>
              </div>

              {/* Card 5: Mined Relationships */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mined Evidence</span>
                    <Link2 className="size-3.5 text-emerald-500" />
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {dataQuality.totalTransactionsMined}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-indigo-600">
                    {coOccurrences.length} pairings · {associationRules.length} rules
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Project & work transactions</p>
                </div>
              </div>
            </div>

            {/* Interactive Filters Toolbar */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-900">Interactive Dashboard Filters</span>
                  {isFilterActive && (
                    <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700 text-[10px]">
                      Filtered
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Career Category Filter */}
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="filter-career-category" className="text-xs text-muted-foreground font-medium">
                      Career Domain:
                    </label>
                    <select
                      id="filter-career-category"
                      aria-label="Filter by career domain"
                      value={selectedCareerCategory}
                      onChange={(e) => setSelectedCareerCategory(e.target.value)}
                      className="rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <option value="all">All Domains ({careerMatches.length})</option>
                      {careerCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skill Category Filter */}
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="filter-skill-category" className="text-xs text-muted-foreground font-medium">
                      Skill Category:
                    </label>
                    <select
                      id="filter-skill-category"
                      aria-label="Filter by skill category"
                      value={selectedSkillCategory}
                      onChange={(e) => setSelectedSkillCategory(e.target.value)}
                      className="rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <option value="all">All Categories ({skills.length})</option>
                      {SKILL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Match Score Filter */}
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="filter-min-score" className="text-xs text-muted-foreground font-medium">
                      Min Alignment:
                    </label>
                    <select
                      id="filter-min-score"
                      aria-label="Filter by minimum alignment score"
                      value={minMatchThreshold}
                      onChange={(e) => setMinMatchThreshold(Number(e.target.value))}
                      className="rounded-xl border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <option value={0}>All Alignment Scores</option>
                      <option value={25}>≥ 25% Match</option>
                      <option value={50}>≥ 50% Match</option>
                      <option value={75}>≥ 75% Match</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  {isFilterActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetFilters}
                      className="h-8 rounded-full px-2.5 text-xs text-slate-600 hover:text-slate-900"
                      aria-label="Reset all analytics filters"
                    >
                      <RotateCcw className="size-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filter Summary */}
              {isFilterActive && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Showing <strong>{filteredCareerMatches.length}</strong> of {careerMatches.length} career pathways and <strong>{filteredSkills.length}</strong> of {skills.length} skills.
                  </span>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    Filters only affect analytics display and do not alter profile records.
                  </span>
                </div>
              )}
            </div>

            {/* Interactive View Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Comprehensive Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('alignment')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'alignment'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Career Pathway Alignment ({filteredCareerMatches.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coverage')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'coverage'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Skill Coverage Breakdown
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'skills'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Domain & Proficiency Distribution ({filteredSkills.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('associations')}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  activeTab === 'associations'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                Association Rules & Pairings ({coOccurrences.length})
              </button>
            </div>

            {/* TAB CONTENT: Overview or Specific Views */}

            {/* Section 1: Career Pathway Alignment & Skill Coverage */}
            {(activeTab === 'overview' || activeTab === 'alignment' || activeTab === 'coverage') && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Chart 1: Career-Role Alignment Comparison */}
                {(activeTab === 'overview' || activeTab === 'alignment') && (
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <h2 className="font-semibold text-base text-slate-900">Career Pathway Alignment</h2>
                          <p className="text-xs text-muted-foreground">
                            Weighted alignment percentage across reference career roles.
                          </p>
                        </div>
                        <Compass className="size-4 text-indigo-500" />
                      </div>

                      {roleChartData.length === 0 ? (
                        <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground text-center p-4">
                          No career pathways match the current filter criteria ({selectedCareerCategory}, min {minMatchThreshold}%).
                        </div>
                      ) : (
                        <div className="mt-6 h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={roleChartData}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                              <YAxis
                                type="category"
                                dataKey="name"
                                width={135}
                                tick={{ fontSize: 11, fill: '#475569' }}
                              />
                              <Tooltip
                                formatter={(val, name) => [
                                  val !== undefined ? `${val}%` : '—',
                                  name === 'score' ? 'Weighted Match' : 'Unweighted Match',
                                ]}
                                labelFormatter={(label) => `Role: ${label}`}
                                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
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
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Calculated via deterministic weighted coverage formula</span>
                      <Link href="/career" className="text-indigo-600 hover:underline font-medium">
                        View career details →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Chart 2: Skill Coverage Breakdown (Matched vs Missing Required vs Missing Recommended) */}
                {(activeTab === 'overview' || activeTab === 'coverage') && (
                  <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <h2 className="font-semibold text-base text-slate-900">Skill Coverage Breakdown</h2>
                          <p className="text-xs text-muted-foreground">
                            Matched competencies vs. missing required and recommended skills per role.
                          </p>
                        </div>
                        <Layers className="size-4 text-indigo-500" />
                      </div>

                      {coverageChartData.length === 0 ? (
                        <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground text-center p-4">
                          No role coverage data for the selected filters.
                        </div>
                      ) : (
                        <div className="mt-6 h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={coverageChartData}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                              <YAxis
                                type="category"
                                dataKey="role"
                                width={135}
                                tick={{ fontSize: 11, fill: '#475569' }}
                              />
                              <Tooltip
                                formatter={(val, name) => [
                                  val !== undefined ? `${val} skills` : '—',
                                  name === 'matched'
                                    ? 'Matched Skills'
                                    : name === 'missingRequired'
                                    ? 'Missing Required'
                                    : 'Missing Recommended',
                                ]}
                                labelFormatter={(label, payload) => {
                                  const item = payload && payload[0]?.payload
                                  return item ? `${item.fullTitle} (${item.matchScore}% Match)` : String(label)
                                }}
                                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                              />
                              <Legend
                                iconSize={10}
                                iconType="circle"
                                wrapperStyle={{ fontSize: 11 }}
                                formatter={(value) =>
                                  value === 'matched'
                                    ? 'Matched Skills'
                                    : value === 'missingRequired'
                                    ? 'Missing Required'
                                    : 'Missing Recommended'
                                }
                              />
                              <Bar dataKey="matched" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                              <Bar dataKey="missingRequired" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} />
                              <Bar dataKey="missingRecommended" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Green = In Profile, Red = Required Gap, Amber = Recommended Gap</span>
                      <Link href="/career/compare" className="text-indigo-600 hover:underline font-medium">
                        Side-by-side compare →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 2: Skill Inventory, Domain Distribution & Proficiency */}
            {(activeTab === 'overview' || activeTab === 'skills') && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Chart 3: Skill Category Distribution */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="font-semibold text-base text-slate-900">Competencies by Domain</h2>
                        <p className="text-xs text-muted-foreground">
                          Distribution of your skills across technical domains.
                        </p>
                      </div>
                      <Award className="size-4 text-indigo-500" />
                    </div>

                    {categoryChartData.length === 0 ? (
                      <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground text-center p-4">
                        No competencies found in the selected domain ({selectedSkillCategory}).
                      </div>
                    ) : (
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
                              formatter={(val) => [val !== undefined ? `${val} skills` : '—', 'Count']}
                              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                            />
                            <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Categorized based on the standard NETGRAPH taxonomy</span>
                    <Link href="/skills" className="text-indigo-600 hover:underline font-medium">
                      Manage skills inventory →
                    </Link>
                  </div>
                </div>

                {/* Chart 4: Proficiency Level Breakdown */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="font-semibold text-base text-slate-900">Proficiency Distribution</h2>
                        <p className="text-xs text-muted-foreground">
                          Self-reported proficiency tiers across your skill inventory.
                        </p>
                      </div>
                      <TrendingUp className="size-4 text-indigo-500" />
                    </div>

                    <div className="mt-6 h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={proficiencyChartData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                        >
                          <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(val) => [val !== undefined ? `${val} skills` : '—', 'Total']}
                            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {proficiencyChartData.map((entry) => (
                              <Cell
                                key={entry.level}
                                fill={PROFICIENCY_COLORS[entry.level] || '#6366f1'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {skills.filter((s) => s.proficiency === 'Advanced' || s.proficiency === 'Expert').length} advanced/expert skills
                    </span>
                    <Link href="/profile" className="text-indigo-600 hover:underline font-medium">
                      Update proficiency levels →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Data Mining Association Rules & Technology Pairings */}
            {(activeTab === 'overview' || activeTab === 'associations') && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Chart 5: Top Co-Occurring Skill Relationships */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="font-semibold text-base text-slate-900">Mined Technology Pairings</h2>
                        <p className="text-xs text-muted-foreground">
                          Empirical co-occurrence frequency across your portfolio transactions.
                        </p>
                      </div>
                      <Link2 className="size-4 text-indigo-500" />
                    </div>

                    <div className="mt-6 h-[260px]">
                      {coOccurrenceChartData.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-xs text-muted-foreground text-center px-6">
                          <Link2 className="size-8 text-slate-300 mb-2" />
                          <p className="font-medium text-slate-700">No technology pairings mined yet</p>
                          <p className="mt-1 max-w-xs text-[11px]">
                            Tag at least 2 technologies in a project or work experience entry to discover empirical co-occurrences.
                          </p>
                          <Button asChild size="sm" variant="outline" className="mt-3 rounded-full text-xs">
                            <Link href="/profile">Add Technologies in Projects</Link>
                          </Button>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={coOccurrenceChartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                          >
                            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <YAxis
                              type="category"
                              dataKey="pair"
                              width={145}
                              tick={{ fontSize: 10, fill: '#475569' }}
                            />
                            <Tooltip
                              formatter={(val) => [val !== undefined ? `${val} transactions` : '—', 'Co-occurrences']}
                              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                            />
                            <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Derived from {dataQuality.totalTransactionsMined} project & work history records</span>
                    <Link href="/graph" className="text-indigo-600 hover:underline font-medium">
                      View relationship graph →
                    </Link>
                  </div>
                </div>

                {/* Card 6: Association Rules Engine (Support, Confidence, Lift) */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div>
                        <h2 className="font-semibold text-base text-slate-900">Mined Association Rules</h2>
                        <p className="text-xs text-muted-foreground">
                          Statistical dependency metrics: Support, Confidence, and Lift.
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                        Apriori Mining
                      </Badge>
                    </div>

                    <div className="mt-4">
                      {associationRules.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
                          <AlertTriangle className="size-6 text-amber-500 mx-auto mb-2" />
                          <h4 className="text-xs font-semibold text-slate-800">Insufficient transactions for association rules</h4>
                          <p className="mt-1 text-[11px] text-muted-foreground max-w-sm mx-auto">
                            Association rules require at least 2 distinct portfolio transactions containing overlapping technologies. Currently {dataQuality.totalTransactionsMined} transaction(s) mined.
                          </p>
                          <div className="mt-4 flex justify-center gap-2">
                            <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                              <Link href="/profile">Add Project Records</Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {associationRules.slice(0, 3).map((rule, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs transition-colors hover:bg-muted/50"
                            >
                              <div className="flex items-center justify-between font-semibold text-slate-900 mb-1.5">
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className="text-indigo-600">[{rule.antecedent.join(', ')}]</span>
                                  <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                                  <span className="text-emerald-700">[{rule.consequent.join(', ')}]</span>
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] shrink-0 ${
                                    rule.lift > 1.2
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-50 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  Lift: {rule.lift.toFixed(2)}x
                                </Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                                <div>
                                  Support: <strong className="text-slate-800">{Math.round(rule.support * 100)}%</strong>
                                </div>
                                <div>
                                  Confidence: <strong className="text-slate-800">{Math.round(rule.confidence * 100)}%</strong>
                                </div>
                                <div>
                                  Evidence: <strong className="text-slate-800">{rule.transactionCount} txns</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
                    <strong>Rule Interpretation:</strong> Lift &gt; 1.0 indicates a positive association between technologies. Does not imply causation or market prerequisites.
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Actionable Insights & Guidance (Step 5) */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-indigo-600" />
                  <h2 className="font-semibold text-base text-slate-900">Actionable Data Mining Insights</h2>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Empirically Grounded
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Insight 1: Cross-Cutting Leverage Skills */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Cross-Cutting Skills</span>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">Highest Career Multipliers</h3>
                    <p className="mt-1.5 text-xs text-slate-600">
                      Skills in your profile that unlock the highest number of reference career paths:
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {crossCuttingSkills.length > 0 ? (
                        crossCuttingSkills.slice(0, 3).map((s) => (
                          <span
                            key={s.name}
                            className="inline-flex items-center rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-900"
                          >
                            {s.name} ({s.totalRolesSupported} roles)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Add skills to evaluate leverage</span>
                      )}
                    </div>
                  </div>
                  <Link href="/career/compare" className="mt-3 text-xs text-indigo-600 hover:underline font-medium block">
                    Compare impact on paths →
                  </Link>
                </div>

                {/* Insight 2: High-Priority Missing Competencies */}
                <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Priority Skill Gaps</span>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">Critical Next Steps</h3>
                    <p className="mt-1.5 text-xs text-slate-600">
                      Required skills missing for your top aligned roles:
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {highPriorityGaps.length > 0 ? (
                        highPriorityGaps.slice(0, 3).map((g) => (
                          <span
                            key={`${g.skillName}-${g.targetRole}`}
                            className="inline-flex items-center rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[11px] font-medium text-rose-900"
                            title={`Needed for ${g.targetRole}: ${g.reason}`}
                          >
                            {g.skillName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-emerald-600" /> No critical gaps found
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href="/skills" className="mt-3 text-xs text-rose-600 hover:underline font-medium block">
                    View gap recommendations →
                  </Link>
                </div>

                {/* Insight 3: Most Frequently Used Technologies */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Portfolio Depth</span>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">Core Applied Stack</h3>
                    <p className="mt-1.5 text-xs text-slate-600">
                      Technologies with the strongest transactional grounding in your portfolio:
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {topTransactionSkills.length > 0 ? (
                        topTransactionSkills.slice(0, 3).map((t) => (
                          <span
                            key={t.name}
                            className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-900"
                          >
                            {t.name} ({t.freq} pairings)
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Add technologies to projects</span>
                      )}
                    </div>
                  </div>
                  <Link href="/graph" className="mt-3 text-xs text-emerald-600 hover:underline font-medium block">
                    Inspect in 3D graph →
                  </Link>
                </div>

                {/* Insight 4: Completeness Roadmap */}
                <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Data Quality</span>
                    <h3 className="mt-1 text-sm font-semibold text-slate-900">Profile Completeness</h3>
                    <p className="mt-1.5 text-xs text-slate-600">
                      {completenessSuggestions.length > 0
                        ? `Suggested next step: ${completenessSuggestions[0]}`
                        : 'Profile data is complete and robust.'}
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span>Completeness</span>
                        <span>{completenessScore}%</span>
                      </div>
                      <Progress value={completenessScore} className="h-1.5" />
                    </div>
                  </div>
                  <Link href="/profile" className="mt-3 text-xs text-amber-700 hover:underline font-medium block">
                    Enrich profile details →
                  </Link>
                </div>
              </div>

              {/* Academic Rigor & Transparency Note */}
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                <Info className="size-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="leading-relaxed">
                  <strong className="text-slate-700">Academic & Statistical Transparency:</strong>{' '}
                  All analytics on this dashboard are generated deterministically by evaluating your cataloged competencies against standard reference career roles. Statistical associations (Support, Confidence, and Lift) describe co-occurrence in your portfolio projects and do not imply causal relationships. NETGRAPH does not make compensation, hiring, or job market guarantees.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
