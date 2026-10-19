'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import {
  buildCareerIntelligenceReport,
  getReportPdfFilename,
} from '@/lib/report-generator'
import { downloadReportPdf } from '@/lib/report-pdf-generator'
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
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  FileWarning,
  ShieldAlert,
  Lightbulb,
  Check,
  TrendingUp,
  Info,
  Clock,
  BookOpen,
  Target,
  Calendar,
  Layers,
  FileText,
  Code,
  Compass,
  GitCompare,
  BarChart3,
  FileDown,
} from 'lucide-react'

const ROLE_BAR_COLORS = [
  '#4f46e5',
  '#6366f1',
  '#818cf8',
  '#0ea5e9',
  '#06b6d4',
  '#10b981',
  '#8b5cf6',
  '#a855f7',
]

export default function ReportsPage() {
  const { user, analysis, authMode, isDemoData } = useCareerAnalysis()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isExportingJson, setIsExportingJson] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null)
  const [selectedTargetRole, setSelectedTargetRole] = useState<string | null>(null)

  // Pure deterministic build of report data based on current profile and mining analysis
  const report = useMemo(() => {
    return buildCareerIntelligenceReport(user, analysis)
  }, [user, analysis])

  // Set default selected target role for skill gap analysis
  const targetRole = useMemo(() => {
    if (selectedTargetRole) return selectedTargetRole
    return report.careerMatches.topMatches[0]?.roleTitle || ''
  }, [selectedTargetRole, report.careerMatches.topMatches])

  const currentRoleMatch = useMemo(() => {
    return (
      report.careerMatches.topMatches.find((m) => m.roleTitle === targetRole) ||
      report.careerMatches.topMatches[0]
    )
  }, [report.careerMatches.topMatches, targetRole])

  // Chart data for visual comparison of career role alignment
  const roleChartData = useMemo(() => {
    return report.careerMatches.topMatches.map((m) => ({
      name: m.roleTitle,
      score: m.matchScore,
      category: m.category,
      matchedCount: m.matchedSkills.length,
      missingCount: m.missingRequiredSkills.length,
    }))
  }, [report.careerMatches.topMatches])

  // Career Readiness Assessment derived from actual profile metrics
  const readinessAssessment = useMemo(() => {
    const topRole = report.careerMatches.topMatches[0]
    if (!report.metadata.hasData || !topRole) {
      return {
        tier: 'Insufficient Profile Data',
        color: 'text-slate-500',
        bg: 'bg-slate-50 border-slate-200',
        summary: 'Add skills, projects, and work history to calculate genuine career readiness.',
      }
    }
    const score = topRole.matchScore
    const completeness = report.metadata.profileCompletenessScore
    const gaps = report.skillGaps.highPriorityCount

    if (score >= 70 && completeness >= 60) {
      return {
        tier: 'High Pathway Readiness',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
        summary: `Strong alignment with ${topRole.roleTitle} (${score}% requirement coverage). Profile possesses foundational and specialized capabilities.`,
      }
    } else if (score >= 45 || completeness >= 40) {
      return {
        tier: 'Developing Pathway Alignment',
        color: 'text-indigo-700',
        bg: 'bg-indigo-50 border-indigo-200',
        summary: `Moderate alignment with ${topRole.roleTitle} (${score}% match). ${gaps} high-priority skill gap${gaps === 1 ? '' : 's'} to address before requirement parity.`,
      }
    } else {
      return {
        tier: 'Foundational Exploration',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
        summary: `Early-stage profile. Top evaluated alignment is ${topRole.roleTitle} (${score}%). Expanding technical project portfolio will significantly improve alignment scores.`,
      }
    }
  }, [report])

  // Missing profile items checklist
  const missingProfileItems = useMemo(() => {
    const missing: { label: string; link: string }[] = []
    if (!user?.headline) missing.push({ label: 'Professional headline', link: '/profile' })
    if (!user?.summary) missing.push({ label: 'Career summary', link: '/profile' })
    if (!user?.projects || user.projects.length === 0) {
      missing.push({ label: 'Portfolio project implementations', link: '/profile' })
    }
    if (!user?.experience || user.experience.length === 0) {
      missing.push({ label: 'Work experience / internships', link: '/profile' })
    }
    if (!user?.education || user.education.length === 0) {
      missing.push({ label: 'Academic education records', link: '/profile' })
    }
    if (report.skills.totalSkills < 5) {
      missing.push({ label: 'At least 5 cataloged skills', link: '/skills' })
    }
    return missing
  }, [user, report.skills.totalSkills])

  // Handle "Generate / Refresh Report" action
  const handleGenerateReport = async () => {
    if (!report.metadata.hasData) {
      setErrorMessage('Cannot generate report: Please add skills, projects, or experience to your profile first.')
      return
    }

    setIsGenerating(true)
    setErrorMessage(null)
    setDownloadSuccess(null)

    // Simulate reactive regeneration with UI feedback
    await new Promise((resolve) => setTimeout(resolve, 400))

    setLastGeneratedAt(new Date().toLocaleTimeString())
    setIsGenerating(false)
  }

  // Handle genuine downloadable PDF report with date-based filename convention
  const handleDownloadPdf = async () => {
    if (!report.metadata.hasData) {
      setErrorMessage('Cannot generate PDF: Please add skills or experience to your profile first.')
      return
    }

    try {
      setIsDownloading(true)
      setErrorMessage(null)

      // Allow UI thread to show loading state
      await new Promise((resolve) => setTimeout(resolve, 80))

      const pdfFilename = getReportPdfFilename(report.metadata.generatedAt)
      downloadReportPdf(report, pdfFilename)

      setDownloadSuccess(`Downloaded "${pdfFilename}" successfully!`)
      setTimeout(() => setDownloadSuccess(null), 5000)
    } catch (err: unknown) {
      console.error('PDF Generation Error:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while generating the PDF.'
      )
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle downloadable JSON report for researchers and data analysis
  const handleDownloadJson = () => {
    if (!report.metadata.hasData) {
      setErrorMessage('Cannot export JSON: Please add profile data first.')
      return
    }

    try {
      setIsExportingJson(true)
      const filename = getReportPdfFilename(report.metadata.generatedAt).replace('.pdf', '.json')
      const jsonBlob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const url = URL.createObjectURL(jsonBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(url), 1000)

      setDownloadSuccess(`Exported "${filename}" successfully!`)
      setTimeout(() => setDownloadSuccess(null), 5000)
    } catch (err: unknown) {
      console.error('JSON Export Error:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to export report JSON data.'
      )
    } finally {
      setIsExportingJson(false)
    }
  }

  return (
    <AppShell title="Career Intelligence Reports">
      <div className="mx-auto max-w-5xl space-y-8 pb-16">
        {/* A. Reports Center Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
                <Sparkles className="size-3 mr-1" />
                Advanced Report Center
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
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-foreground md:text-4xl">
              Career Intelligence Report
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              Deterministic career matching, Apriori association analysis, and prioritized action plan compiled from your verified profile competencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating || isDownloading || isExportingJson || !report.metadata.hasData}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
              aria-label="Refresh career intelligence report"
            >
              <RefreshCw className={`size-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Updating...' : 'Refresh Report'}
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isDownloading || isGenerating || isExportingJson || !report.metadata.hasData}
              className="rounded-full border-border bg-card hover:bg-muted cursor-pointer"
              aria-label="Download career intelligence report as PDF document"
            >
              <Download className={`size-4 mr-2 ${isDownloading ? 'animate-pulse' : ''}`} />
              {isDownloading ? 'Building PDF...' : 'Download PDF'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadJson}
              disabled={isExportingJson || isDownloading || isGenerating || !report.metadata.hasData}
              className="rounded-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Export raw intelligence report data in JSON format"
              title="Export report structured data as JSON"
            >
              <FileDown className="size-3.5 mr-1" />
              JSON
            </Button>
          </div>
        </div>

        {/* Feedback Messages */}
        {lastGeneratedAt && !downloadSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs font-medium text-indigo-900">
            <CheckCircle2 className="size-4 shrink-0 text-indigo-600" />
            <span>Report updated from current profile at {lastGeneratedAt}. Ready for review or PDF export.</span>
          </div>
        )}

        {downloadSuccess && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-900 transition-all">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-900 transition-all">
            <ShieldAlert className="size-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Data Quality & Limitations Notice */}
        {report.limitations.warnings.length > 0 && report.metadata.hasData && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Report Data Quality & Sample Size Notice:</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-800">
                {report.limitations.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-amber-700">
                Current data confidence is rated <strong>{report.limitations.confidenceLevel.toUpperCase()}</strong>. Adding more projects and work history improves statistical confidence.
              </p>
            </div>
          </div>
        )}

        {/* Report Overview & Summary KPI Cards */}
        {report.metadata.hasData && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Completeness</span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-indigo-600">
                  {report.metadata.profileCompletenessScore}%
                </p>
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${report.metadata.profileCompletenessScore}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cataloged Skills</span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {report.skills.totalSkills}
                </p>
                <p className="mt-1 text-[11px] text-emerald-600 font-medium">Verified competencies</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mined Transactions</span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {report.relationships.totalTransactionsMined}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {report.analytics.totalProjects} projects · {report.analytics.totalExperiences} roles
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Roles Evaluated</span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {report.careerMatches.totalMatchesEvaluated}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Reference catalogue</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Skill Gaps</span>
                <p className="mt-2 text-2xl font-bold tracking-tight text-rose-600">
                  {report.skillGaps.gaps.length}
                </p>
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  {report.skillGaps.highPriorityCount} high priority
                </p>
              </div>
            </div>

            {/* Career-Readiness Assessment Summary Banner */}
            <div className={`rounded-2xl border p-4.5 text-xs ${readinessAssessment.bg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                    Career-Readiness Assessment
                  </span>
                  <h3 className={`mt-0.5 text-sm font-bold ${readinessAssessment.color}`}>
                    {readinessAssessment.tier}
                  </h3>
                  <p className="mt-1 text-slate-700 leading-relaxed max-w-3xl">
                    {readinessAssessment.summary}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild size="sm" variant="outline" className="rounded-full bg-white text-xs">
                    <Link href="/career/compare">
                      <GitCompare className="size-3 mr-1" />
                      Compare Paths
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full bg-white text-xs">
                    <Link href="/analytics">
                      <BarChart3 className="size-3 mr-1" />
                      View Analytics
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State when Profile Data is Missing */}
        {!report.metadata.hasData ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
            <FileWarning className="mx-auto size-12 text-indigo-400" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              Profile Information Required
            </h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              Your career analysis report requires saved profile information. Add your skills, work experience, education, or projects to generate an authentic report.
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
          /* Main Structured Report Document */
          <div className="rounded-3xl border border-border/90 bg-card p-6 shadow-sm sm:p-10 space-y-10">
            {/* Document Header Banner */}
            <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-md sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-widest">
                    <span>NETGRAPH</span>
                    <span>•</span>
                    <span>Career Intelligence Platform</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Career Intelligence & Relationship Report
                  </h2>
                  <p className="mt-1 text-xs text-indigo-100">
                    Generated on {report.metadata.dateFormatted} • Report ID: {report.metadata.reportId}
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20 sm:text-right shrink-0">
                  <p className="text-xs font-medium text-indigo-200">Candidate</p>
                  <p className="text-base font-bold text-white">{report.metadata.userName}</p>
                  <p className="text-xs text-indigo-100">{report.metadata.userEmail}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-white/30 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${report.metadata.profileCompletenessScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white font-medium">
                      {report.metadata.profileCompletenessScore}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
                SECTION 1: EXECUTIVE SUMMARY
               ========================================================================= */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  1
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  Executive Summary
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  Candidate standing & verified competencies
                </span>
              </div>

              {/* Candidate Overview Card */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-4">
                {report.profile.headline && (
                  <p className="text-sm font-semibold text-indigo-950">
                    {report.profile.headline}
                  </p>
                )}

                <p className="text-xs text-foreground leading-relaxed">
                  {report.executiveSummary.summary}
                </p>

                {report.profile.summary && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-indigo-300 pl-3">
                    &ldquo;{report.profile.summary}&rdquo;
                  </p>
                )}

                {/* Core Strengths and Improvement Areas */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Check className="size-3.5 text-emerald-600" />
                      Core Verified Strengths
                    </p>
                    <ul className="space-y-1.5 text-xs text-emerald-950">
                      {report.executiveSummary.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <TrendingUp className="size-3.5 text-amber-600" />
                      Key Development Opportunities
                    </p>
                    <ul className="space-y-1.5 text-xs text-amber-950">
                      {report.executiveSummary.improvementAreas.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Key Competencies Breakdown by Category */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Layers className="size-3.5 text-indigo-600" />
                    Key Competencies by Domain
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(report.skills.skillsByCategory).map(([category, skillList]) => (
                      <div
                        key={category}
                        className="rounded-xl border border-border/80 bg-background/60 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-indigo-700">{category}</span>
                          <span className="text-[10px] text-muted-foreground">{skillList.length} skills</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {skillList.map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center gap-1 rounded bg-white border border-slate-200 px-2 py-0.5 text-[11px] text-slate-800 shadow-2xs"
                            >
                              <span>{skill.normalisedName}</span>
                              <span className="text-[9px] text-muted-foreground font-medium">
                                ({skill.proficiency})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Highlights */}
                {report.profile.projects.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <FolderGit2 className="size-3.5 text-indigo-600" />
                      Portfolio Project Highlights
                    </h4>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {report.profile.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="rounded-xl border border-border/80 bg-background/60 p-3 text-xs"
                        >
                          <p className="font-semibold text-foreground">{proj.title}</p>
                          {proj.description && (
                            <p className="mt-1 text-muted-foreground text-[11px] line-clamp-2">
                              {proj.description}
                            </p>
                          )}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {proj.technologies.map((t) => (
                                <Badge key={t} variant="secondary" className="text-[10px]">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =========================================================================
                SECTION 2: CAREER ALIGNMENT & VISUAL COMPARISON
               ========================================================================= */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  2
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  Career Pathway Alignment
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  Weighted requirement matching & visual comparison
                </span>
              </div>

              {/* Visual Alignment Comparison Chart (Recharts) */}
              <div className="rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="size-3.5 text-indigo-600" />
                      Pathway Alignment Comparison
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Calculated alignment percentage across all evaluated reference career roles.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="ghost" className="text-xs text-indigo-600 hover:text-indigo-800">
                    <Link href="/career/compare">Compare Two Paths Side-by-Side →</Link>
                  </Button>
                </div>

                <div className="h-56 w-full pt-2">
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
                        width={130}
                        tick={{ fontSize: 11, fill: '#475569' }}
                      />
                      <Tooltip
                        formatter={(val, name) => [
                          val !== undefined ? `${val}%` : '—',
                          name === 'score' ? 'Requirement Match' : String(name),
                        ]}
                        labelFormatter={(label) => `Role: ${label}`}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                      />
                      <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                        {roleChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={ROLE_BAR_COLORS[index % ROLE_BAR_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[11px] text-slate-500 pt-1 border-t border-border/60">
                  <strong className="text-slate-700">Notice:</strong> Alignment scores are deterministic estimates derived from cataloged skills versus standard role benchmarks. Scores do not represent commercial employment screening or hiring guarantees.
                </p>
              </div>

              {/* Career Role Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {report.careerMatches.topMatches.map((match) => {
                  // Find user projects that connect to this role via matched technologies
                  const relevantProjects = report.profile.projects.filter((p) =>
                    p.technologies?.some((tech) =>
                      match.matchedSkills.some(
                        (ms) => ms.name.toLowerCase() === tech.toLowerCase()
                      )
                    )
                  )

                  // Find user experience entries that connect to this role
                  const relevantExperience = report.profile.experience.filter((exp) =>
                    exp.technologies?.some((tech) =>
                      match.matchedSkills.some(
                        (ms) => ms.name.toLowerCase() === tech.toLowerCase()
                      )
                    )
                  )

                  return (
                    <div
                      key={match.roleId}
                      className="rounded-2xl border border-border/80 bg-background/50 p-4 space-y-3.5 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{match.roleTitle}</p>
                            <p className="text-[11px] text-muted-foreground">{match.category}</p>
                          </div>
                          <Badge
                            variant={match.matchScore >= 70 ? 'default' : 'secondary'}
                            className={
                              match.matchScore >= 70
                                ? 'bg-emerald-600 text-white font-semibold'
                                : 'bg-indigo-50 text-indigo-700 font-semibold'
                            }
                          >
                            {match.matchScore}% Match
                          </Badge>
                        </div>

                        {/* Match Progress Bar */}
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              match.matchScore >= 70 ? 'bg-emerald-600' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${match.matchScore}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {match.explanation}
                        </p>

                        {/* Supporting Skills in Profile */}
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                            <Check className="size-3 text-emerald-600" />
                            Supporting Skills ({match.matchedSkills.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {match.matchedSkills.length > 0 ? (
                              match.matchedSkills.map((s) => (
                                <span
                                  key={s.name}
                                  className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-900 font-medium"
                                >
                                  {s.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">None currently documented</span>
                            )}
                          </div>
                        </div>

                        {/* Specific Areas Needing Additional Skills */}
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                            <AlertTriangle className="size-3 text-rose-600" />
                            Skills to Improve ({match.missingRequiredSkills.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {match.missingRequiredSkills.length > 0 ? (
                              match.missingRequiredSkills.map((s) => (
                                <span
                                  key={s.name}
                                  className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] text-rose-900 font-medium"
                                >
                                  {s.name} [{s.priority.toUpperCase()}]
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-emerald-700 italic">Full requirement coverage achieved</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Relevant Projects or Experience */}
                      {(relevantProjects.length > 0 || relevantExperience.length > 0) && (
                        <div className="pt-2 border-t border-border/60 text-[10px] text-muted-foreground space-y-1">
                          {relevantProjects.length > 0 && (
                            <p className="line-clamp-1">
                              <span className="font-semibold text-slate-700">Project alignment:</span>{' '}
                              {relevantProjects.map((p) => p.title).join(', ')}
                            </p>
                          )}
                          {relevantExperience.length > 0 && (
                            <p className="line-clamp-1">
                              <span className="font-semibold text-slate-700">Experience alignment:</span>{' '}
                              {relevantExperience.map((e) => e.jobTitle).join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* =========================================================================
                SECTION 3: SKILL GAP ANALYSIS
               ========================================================================= */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  3
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  Skill Gap Analysis
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  Target pathway requirements & priority action items
                </span>
              </div>

              {/* Target Role Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-medium text-muted-foreground shrink-0">
                  Select Target Pathway:
                </span>
                {report.careerMatches.topMatches.map((m) => (
                  <button
                    key={m.roleId}
                    type="button"
                    onClick={() => setSelectedTargetRole(m.roleTitle)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      targetRole === m.roleTitle
                        ? 'bg-indigo-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {m.roleTitle} ({m.matchScore}%)
                  </button>
                ))}
              </div>

              {/* Target Role Skill Breakdown */}
              {currentRoleMatch && (
                <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Skills You Already Have */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                        <Check className="size-3.5 text-emerald-600" />
                        Skills You Already Have ({currentRoleMatch.matchedSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {currentRoleMatch.matchedSkills.map((s) => (
                          <span
                            key={s.name}
                            className="rounded bg-white border border-emerald-200 px-2 py-0.5 text-xs text-emerald-900 font-medium"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                      <p className="text-xs font-bold text-rose-800 mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5 text-rose-600" />
                        Missing Skills for {currentRoleMatch.roleTitle} ({currentRoleMatch.missingRequiredSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {currentRoleMatch.missingRequiredSkills.length > 0 ? (
                          currentRoleMatch.missingRequiredSkills.map((s) => (
                            <span
                              key={s.name}
                              className="rounded bg-white border border-rose-200 px-2 py-0.5 text-xs text-rose-900 font-medium"
                            >
                              {s.name} [{s.priority.toUpperCase()}]
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-700 italic">None - full skill match!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prioritized Learning Steps */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Target className="size-3.5 text-indigo-600" />
                      Prioritized Skill Gaps & Actionable Learning Advice
                    </h4>

                    {report.skillGaps.gaps.filter((g) => g.targetRole === currentRoleMatch.roleTitle).length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No critical skill gaps identified for {currentRoleMatch.roleTitle}.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {report.skillGaps.gaps
                          .filter((g) => g.targetRole === currentRoleMatch.roleTitle)
                          .map((gap) => (
                            <div
                              key={gap.id}
                              className="rounded-xl border border-border bg-card p-4 text-xs space-y-2 shadow-2xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground text-sm">{gap.skillName}</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    gap.priority === 'high'
                                      ? 'border-rose-200 bg-rose-50 text-rose-700 text-[10px]'
                                      : gap.priority === 'medium'
                                      ? 'border-amber-200 bg-amber-50 text-amber-700 text-[10px]'
                                      : 'border-slate-200 bg-slate-50 text-slate-700 text-[10px]'
                                  }
                                >
                                  {gap.priority.toUpperCase()} PRIORITY
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                <strong className="text-slate-800">Role Requirement:</strong> {gap.reason}
                              </p>
                              <p className="text-[11px] text-indigo-700 font-medium bg-indigo-50/60 rounded p-2 border border-indigo-100">
                                <strong className="text-indigo-900">Suggested Action:</strong> {gap.suggestedAction}
                              </p>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                      <Link href="/skills">Manage Skills in Skill Analyzer →</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                      <Link href="/career/compare">Compare with another path →</Link>
                    </Button>
                  </div>
                </div>
              )}
            </section>

            {/* =========================================================================
                SECTION 4: RELATIONSHIP AND ASSOCIATION INSIGHTS
               ========================================================================= */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  4
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  Relationship & Association Insights
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  Portfolio co-occurrence & Apriori mining rules
                </span>
              </div>

              {/* Metric Definition Banner */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs text-indigo-900 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <Info className="size-4 text-indigo-600" />
                  Understanding Association & Co-Occurrence Metrics:
                </p>
                <div className="grid gap-2 sm:grid-cols-3 text-[11px] text-indigo-950">
                  <div className="rounded bg-white/70 p-2.5 border border-indigo-100">
                    <span className="font-bold text-indigo-900 block">Support (Frequency)</span>
                    Percentage of your portfolio project transactions containing both technologies together.
                  </div>
                  <div className="rounded bg-white/70 p-2.5 border border-indigo-100">
                    <span className="font-bold text-indigo-900 block">Confidence (Reliability)</span>
                    Probability that when you apply Technology A, you also utilize Technology B.
                  </div>
                  <div className="rounded bg-white/70 p-2.5 border border-indigo-100">
                    <span className="font-bold text-indigo-900 block">Lift (&gt; 1.0 = Synergy)</span>
                    Degree of technological affinity compared to random chance. Lift &gt; 1.0 indicates positive association.
                  </div>
                </div>
                <p className="text-[10px] text-indigo-700/90 pt-1 border-t border-indigo-200/60 leading-relaxed">
                  <strong>Notice on Correlation vs Causation:</strong> Association rules identify empirical pairings within your submitted portfolio. They do not imply that learning one skill causes proficiency in another, nor do they represent universal market prerequisites.
                </p>
              </div>

              {/* Projects and Connected Technologies */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderGit2 className="size-3.5 text-indigo-600" />
                  Projects & Connected Technologies
                </h4>

                {report.projectRelationships.projectTechAssociations.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No project technology associations documented. Add projects with technologies to reveal connections.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {report.projectRelationships.projectTechAssociations.map((proj, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/80 bg-background/50 p-3.5 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{proj.projectTitle}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {proj.technologies.length} technologies
                          </span>
                        </div>
                        {proj.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {proj.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Frequently Co-occurring Technologies Across Portfolio */}
                {report.projectRelationships.repeatedSkills.length > 0 && (
                  <div className="rounded-xl border border-border bg-muted/30 p-4 text-xs">
                    <p className="font-semibold text-slate-900 mb-1.5">
                      Anchor Technologies Utilized Repeatedly Across Portfolio:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {report.projectRelationships.repeatedSkills.map((r) => (
                        <span
                          key={r.skill}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-900"
                        >
                          <span>{r.skill}</span>
                          <Badge className="bg-indigo-600 text-white text-[10px] px-1.5 py-0">
                            {r.count}x
                          </Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Association Rules Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Mined Association Rules ({report.relationships.rules.length})
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    Mined from {report.relationships.totalTransactionsMined} profile transactions
                  </span>
                </div>

                {report.relationships.rules.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                    <p className="font-medium text-slate-700">No technology association rules mined yet</p>
                    <p className="mt-1 text-[11px] max-w-sm mx-auto">
                      Association rules require at least 2 distinct project or experience entries with overlapping technologies.
                    </p>
                    <Button asChild size="sm" variant="outline" className="mt-3 rounded-full text-xs">
                      <Link href="/profile">Add Projects in Profile</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-3">Antecedent (Used)</th>
                          <th className="p-3">Consequent (Also Used)</th>
                          <th className="p-3 text-right">Support</th>
                          <th className="p-3 text-right">Confidence</th>
                          <th className="p-3 text-right">Lift</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {report.relationships.rules.slice(0, 8).map((rule, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="p-3 font-medium text-foreground">
                              {rule.antecedent.join(', ')}
                            </td>
                            <td className="p-3 text-indigo-600 font-medium">
                              {rule.consequent.join(', ')}
                            </td>
                            <td className="p-3 text-right text-muted-foreground">
                              {Math.round(rule.support * 100)}%
                            </td>
                            <td className="p-3 text-right font-semibold text-foreground">
                              {Math.round(rule.confidence * 100)}%
                            </td>
                            <td className="p-3 text-right text-muted-foreground">
                              {rule.lift.toFixed(1)}x
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* =========================================================================
                SECTION 5: DATA QUALITY AND LIMITATIONS
               ========================================================================= */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  5
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  Data Quality & Limitations Disclosure
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  Confidence assessment & missing information checklist
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <ShieldAlert className="size-4 text-indigo-600" />
                  <span>Academic Methodology & Evaluation Scope</span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {report.limitations.explanation ||
                    'This report is generated by NETGRAPH using transparent co-occurrence transaction counting, Apriori support/confidence association rules, and deterministic weighted requirement coverage matching. It represents an exploratory academic heuristic and does not guarantee commercial employment outcomes or integrate external labor market data.'}
                </p>

                {/* Missing information checklist */}
                {missingProfileItems.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs space-y-2">
                    <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-amber-600" />
                      Missing Information That Could Improve This Report:
                    </p>
                    <ul className="space-y-1 text-[11px] text-amber-900">
                      {missingProfileItems.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span>• {item.label}</span>
                          <Link href={item.link} className="text-indigo-600 hover:underline font-medium">
                            Add now →
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-3 pt-1 text-[11px]">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="font-semibold text-slate-800 block">Data Sources Analyzed</span>
                    <span className="text-slate-600">Saved profile skills, projects, experiences, coursework</span>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="font-semibold text-slate-800 block">Mining Algorithms</span>
                    <span className="text-slate-600">Apriori co-occurrence, Jaccard similarity, weighted matching</span>
                  </div>
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="font-semibold text-slate-800 block">Confidence Level</span>
                    <span className="text-slate-600 capitalize">{report.limitations.confidenceLevel} data confidence</span>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 6: RECOMMENDED ACTION PLAN
               ========================================================================= */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  6
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  Recommended Action Plan
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  Structured 30-60-90 day milestone roadmap & next steps
                </span>
              </div>

              {/* 30-60-90 Day Milestone Cards */}
              <div className="grid gap-3 sm:grid-cols-3">
                {report.actionPlan.prioritizedSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-border bg-background/50 p-4 text-xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Badge
                          variant={step.priority === 'high' ? 'default' : 'secondary'}
                          className={
                            step.priority === 'high'
                              ? 'bg-rose-600 text-white text-[10px]'
                              : 'bg-indigo-50 text-indigo-700 text-[10px]'
                          }
                        >
                          {step.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                          <Clock className="size-3" />
                          {step.timeframe}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground text-sm">{step.title}</h4>
                      <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Plan Skills Table */}
              {report.actionPlan.skillsToImprove.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Target className="size-3.5 text-indigo-600" />
                    Target Skills & Concrete Actions
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {report.actionPlan.skillsToImprove.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-900">{item.skill}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            Target: {item.targetRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          <strong>Why:</strong> {item.reason}
                        </p>
                        <p className="text-[11px] text-indigo-700 font-medium">
                          <strong>Next Action:</strong> {item.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Strengthening Project */}
              {report.actionPlan.recommendedProjects.length > 0 && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs space-y-2">
                  <p className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <Lightbulb className="size-4 text-indigo-600" />
                    Recommended Strengthening Project: {report.actionPlan.recommendedProjects[0].title}
                  </p>
                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    {report.actionPlan.recommendedProjects[0].purpose}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {report.actionPlan.recommendedProjects[0].technologies.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Jump Links to Existing Workspace Tools */}
              <div className="pt-2 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground font-medium">Continue your career analysis:</span>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                    <Link href="/profile">Edit Profile</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                    <Link href="/career/compare">Career Comparison</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                    <Link href="/skills">Skill Gaps</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                    <Link href="/graph">3D Network Graph</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full text-xs">
                    <Link href="/analytics">Profile Analytics</Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  )
}
