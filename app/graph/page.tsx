'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import { ProfileGraphCanvas } from '@/components/profile-graph-canvas'
import {
  Compass,
  Network,
  Share2,
  Wrench,
  Layers,
  AlertTriangle,
  ArrowRight,
  Database,
} from 'lucide-react'

export default function GraphPage() {
  const { user, graphNodes, graphEdges, dataQuality, skills } = useCareerAnalysis()

  // Calculate distinct profile sections contributing data to the graph
  const dataSourcesCount = useMemo(() => {
    let count = 0
    const hasSkills =
      (user?.skillsList && user.skillsList.length > 0) ||
      (user?.skills && user.skills.length > 0) ||
      skills.length > 0
    if (hasSkills) count++
    if (user?.projects && user.projects.length > 0) count++
    if (user?.experience && user.experience.length > 0) count++
    if (user?.education && user.education.length > 0) count++
    if (user?.certifications && user.certifications.length > 0) count++
    return count
  }, [user, skills])

  // Count distinct technical skills represented in graph nodes
  const technicalSkillsCount = useMemo(() => {
    return graphNodes.filter((n) => n.type === 'skill').length
  }, [graphNodes])

  // Notice is only displayed when graph dataset is small or incomplete
  const isSmallOrIncomplete =
    !dataQuality.isSufficientData ||
    dataQuality.confidenceLevel === 'low' ||
    dataQuality.warnings.length > 0

  return (
    <AppShell title="Relationship Graph">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* A. Page Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              Interactive Relationship Network
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl text-slate-900">
              Explore your relationship graph
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Discover connections between your skills, project technologies, work experience, certifications, and career opportunities.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/profile">Edit Profile Data</Link>
            </Button>
            <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/career">
                Career Matches <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* B. Graph Generation Notice (Only shown when appropriate) */}
        {isSmallOrIncomplete && graphNodes.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Graph Generation Notice:</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Your relationship graph is based on your current profile data. Add more skills, projects, and experience to discover additional relationships.
                {dataQuality.warnings.length > 0 && ` (${dataQuality.warnings.join(' ')})`}
              </p>
            </div>
          </div>
        )}

        {/* C. Four Summary Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Entities */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Entities</span>
              <Network className="size-4 text-indigo-500" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {graphNodes.length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Graph Nodes</p>
          </div>

          {/* 2. Relationships */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Relationships</span>
              <Share2 className="size-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {graphEdges.length}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Connected Edges</p>
          </div>

          {/* 3. Technical Skills */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Technical Skills</span>
              <Wrench className="size-4 text-indigo-500" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {technicalSkillsCount}
            </p>
            <p className="mt-1 text-[11px] text-emerald-600 font-medium">Distinct Skills</p>
          </div>

          {/* 4. Data Sources */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Data Sources</span>
              <Layers className="size-4 text-amber-500" />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              {dataSourcesCount}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Contributing Sections</p>
          </div>
        </div>

        {/* D & E. Interactive Graph Explorer */}
        <div>
          {graphNodes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
              <Compass className="mx-auto size-12 text-indigo-400" />
              <h2 className="mt-4 text-lg font-semibold text-slate-800">Empty graph network</h2>
              <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
                Add skills, projects, and work experience to your profile to render your personalized relationship graph.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href="/onboarding">
                    Complete Onboarding <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/profile">Edit Profile Data</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ProfileGraphCanvas nodes={graphNodes} edges={graphEdges} />
          )}
        </div>
      </div>
    </AppShell>
  )
}
