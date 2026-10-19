'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Target,
  ArrowRight,
  Info,
  X,
  PlusCircle,
  GitCompare,
} from 'lucide-react'
import { CareerRoleMatch } from '@/lib/data-mining/types'

export default function CareerPage() {
  const { careerMatches, skillGaps, dataQuality, skills, authMode, isDemoData } = useCareerAnalysis()
  const [selectedRole, setSelectedRole] = useState<CareerRoleMatch | null>(
    careerMatches[0] || null
  )

  useEffect(() => {
    if (!selectedRole && careerMatches.length > 0) {
      setSelectedRole(careerMatches[0])
    }
  }, [careerMatches, selectedRole])

  // Gaps specific to the selected role
  const roleGaps = selectedRole
    ? skillGaps.filter((g) => g.targetRole === selectedRole.roleTitle)
    : []

  return (
    <AppShell title="Career Pathways">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
                Data-Mined Career Alignments
              </Badge>
              {isDemoData ? (
                <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700 border-slate-200">
                  Demo Dataset
                </Badge>
              ) : authMode === 'server' ? (
                <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200">
                  Live Database Profile
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Career pathways & role alignment
            </h1>
            <p className="mt-2 text-muted-foreground">
              Deterministic matching calculated from your verified skills, project technologies, and experience. Match scores are indicative capability comparisons, not predictions or guarantees of employment.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/profile">Edit Profile Skills</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/career/compare">
                <GitCompare className="mr-1.5 size-4" />
                Compare Paths
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/graph">Explore 3D Graph &rarr;</Link>
            </Button>
          </div>
        </div>

        {/* Data Quality & Limitations Notice */}
        {dataQuality.warnings.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Profile Coverage Notice:</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-800">
                {dataQuality.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Insufficient Profile Banner */}
        {skills.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Compass className="mx-auto size-12 text-indigo-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">No profile skills detected</h3>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              The data-mining engine requires skills to compute career-pathway alignment scores and skill gaps.
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
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.9fr]">
            {/* LEFT: Grid of Career Roles */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-lg font-semibold text-slate-900">
                  Target Pathways ({careerMatches.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  Sorted by highest calculated match
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {careerMatches.map((role) => {
                  const isSelected = selectedRole?.roleId === role.roleId
                  return (
                    <article
                      key={role.roleId}
                      onClick={() => setSelectedRole(role)}
                      className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-xs ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                          : 'border-border bg-card hover:border-indigo-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="text-[10px]">
                            {role.category}
                          </Badge>
                          <h3 className="mt-2 font-semibold text-base text-slate-900">
                            {role.roleTitle}
                          </h3>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold tracking-tight text-indigo-600">
                            {role.matchScore}%
                          </span>
                          <p className="text-[10px] text-muted-foreground">Match</p>
                        </div>
                      </div>

                      {/* Match Progress Bar */}
                      <div className="mt-4">
                        <Progress value={role.matchScore} className="h-1.5" />
                      </div>

                      {/* Matched skills preview */}
                      <div className="mt-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Matched ({role.matchedSkills.length}):
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {role.matchedSkills.length > 0 ? (
                            role.matchedSkills.slice(0, 4).map((s) => (
                              <Badge
                                key={s.name}
                                variant="secondary"
                                className="bg-emerald-50 text-emerald-800 text-[10px]"
                              >
                                {s.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">None yet</span>
                          )}
                          {role.matchedSkills.length > 4 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{role.matchedSkills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Missing skills preview */}
                      {role.missingRequiredSkills.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Key Missing ({role.missingRequiredSkills.length}):
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {role.missingRequiredSkills.slice(0, 3).map((s) => (
                              <Badge
                                key={s.name}
                                variant="outline"
                                className="text-[10px] text-slate-600 border-dashed"
                              >
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Inspect details <ChevronRight className="size-3.5" />
                      </button>
                    </article>
                  )
                })}
              </div>
            </div>

            {/* RIGHT: Detailed Pathway Inspector */}
            {selectedRole && (
              <aside className="rounded-3xl border border-border bg-card p-6 shadow-xs h-fit sticky top-6">
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {selectedRole.category}
                    </Badge>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                      {selectedRole.roleTitle}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Alignment Score:{' '}
                      <strong className="text-indigo-600 text-sm font-semibold">
                        {selectedRole.matchScore}%
                      </strong>{' '}
                      ({selectedRole.unweightedMatchPercentage}% core requirements covered)
                    </p>
                  </div>
                </div>

                {/* Score Explanation & Limitations */}
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1">
                    <Info className="size-3.5 text-indigo-600" />
                    How this score is mined:
                  </div>
                  {selectedRole.explanation}
                  {selectedRole.dataLimitations && (
                    <p className="mt-2 text-[11px] text-amber-800">
                      <strong>Limitation:</strong> {selectedRole.dataLimitations.join(' ')}
                    </p>
                  )}
                </div>

                {/* Matched Competencies */}
                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Your Matched Skills ({selectedRole.matchedSkills.length})
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {selectedRole.matchedSkills.map((s) => (
                      <Badge
                        key={s.name}
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-800 border-emerald-200"
                      >
                        <CheckCircle2 className="size-3 mr-1 text-emerald-600" />
                        {s.name} ({s.proficiency || 'Verified'})
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Required Skills */}
                <div className="mt-6 border-t border-border pt-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                    Required Competencies to Develop ({selectedRole.missingRequiredSkills.length})
                  </h3>
                  <div className="mt-3 flex flex-col gap-2.5">
                    {selectedRole.missingRequiredSkills.map((missing) => (
                      <div
                        key={missing.name}
                        className="flex items-center justify-between rounded-xl border border-dashed border-border p-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">{missing.name}</span>
                          <span className="ml-2 text-[11px] text-muted-foreground">
                            Weight: {missing.weight.toFixed(1)}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            missing.priority === 'high'
                              ? 'text-rose-600 border-rose-200 bg-rose-50'
                              : 'text-amber-600 border-amber-200 bg-amber-50'
                          }
                        >
                          {missing.priority.toUpperCase()} PRIORITY
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps & Action Items */}
                {roleGaps.length > 0 && (
                  <div className="mt-6 border-t border-border pt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                      Mined Action Items ({roleGaps.length})
                    </h3>
                    <div className="mt-3 flex flex-col gap-2">
                      {roleGaps.slice(0, 3).map((gap) => (
                        <div key={gap.id} className="rounded-xl border border-border p-3 text-xs">
                          <p className="font-medium text-slate-900">{gap.skillName}</p>
                          <p className="mt-1 text-slate-600 leading-normal">{gap.reason}</p>
                          <p className="mt-1 text-[11px] text-indigo-600 font-medium">
                            &rarr; {gap.suggestedAction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-2">
                  <Button asChild className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Link href="/profile">Add Missing Skills in Profile &rarr;</Link>
                  </Button>
                </div>
              </aside>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
