'use client'

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
  FolderGit2,
  Wrench,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'

export default function GraphPage() {
  const { graphNodes, graphEdges, dataQuality, skills } = useCareerAnalysis()

  return (
    <AppShell title="Relationship Graph">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              Interactive Relationship Network
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Explore your relationship graph
            </h1>
            <p className="mt-2 text-muted-foreground">
              Mined connections connecting skills, project technologies, work experience, certifications, and career targets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/profile">Edit Profile Data</Link>
            </Button>
            <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/career">Career Matches &rarr;</Link>
            </Button>
          </div>
        </div>

        {/* Quality Notice */}
        {dataQuality.warnings.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Graph Generation Notice:</p>
              <p className="mt-0.5 text-amber-800">
                {dataQuality.warnings.join(' ')}
              </p>
            </div>
          </div>
        )}

        {/* Network Metrics Bar */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Entities</span>
              <Network className="size-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{graphNodes.length}</p>
            <p className="text-[11px] text-muted-foreground">Graph Nodes</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Relationships</span>
              <Share2 className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{graphEdges.length}</p>
            <p className="text-[11px] text-muted-foreground">Connected Edges</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Technical Skills</span>
              <Wrench className="size-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{skills.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Verified Nodes</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Transactions</span>
              <FolderGit2 className="size-4 text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {dataQuality.totalTransactionsMined}
            </p>
            <p className="text-[11px] text-muted-foreground">Portfolio Sources</p>
          </div>
        </div>

        {/* Dedicated Graph Visualizer */}
        <div className="mt-8">
          {graphNodes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
              <Compass className="mx-auto size-12 text-indigo-400" />
              <h3 className="mt-4 text-lg font-semibold text-slate-800">Empty graph network</h3>
              <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
                Add skills, projects, and work experience to your profile to render your personalized relationship graph.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href="/onboarding">Complete Onboarding</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/profile">Edit Profile</Link>
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
