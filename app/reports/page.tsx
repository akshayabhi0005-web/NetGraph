'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import { buildCareerIntelligenceReport, getReportPdfFilename } from '@/lib/report-generator'
import { downloadReportPdf } from '@/lib/report-pdf-generator'
import {
  FileText,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Compass,
  FileWarning,
  Share2,
  ShieldAlert,
} from 'lucide-react'

export default function ReportsPage() {
  const { user, analysis, isLoading } = useCareerAnalysis()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null)

  // Pure deterministic build of report data based on current profile and mining analysis
  const report = useMemo(() => {
    return buildCareerIntelligenceReport(user, analysis)
  }, [user, analysis])

  const handleRegenerate = () => {
    setIsGenerating(true)
    setErrorMessage(null)
    setDownloadSuccess(null)
    setTimeout(() => {
      setLastGeneratedAt(new Date().toLocaleTimeString())
      setIsGenerating(false)
    }, 450)
  }

  const handleDownloadPdf = async () => {
    if (!report.metadata.hasData) {
      setErrorMessage('Cannot generate PDF: Please add skills or experience to your profile first.')
      return
    }

    try {
      setIsDownloading(true)
      setErrorMessage(null)
      const filename = getReportPdfFilename(report.metadata.generatedAt)

      // Allow UI thread to show loading spinner before PDF generation
      await new Promise((resolve) => setTimeout(resolve, 80))

      downloadReportPdf(report, filename)

      setDownloadSuccess(`Downloaded "${filename}" successfully!`)
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

  return (
    <AppShell title="Reports">
      <div className="mx-auto max-w-5xl space-y-8 pb-16">
        {/* Top Header & Actions Bar */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              <Sparkles className="size-3 mr-1" />
              Verified Career Intelligence
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-foreground md:text-4xl">
              Career Analysis Reports
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Extract and export your actual profile information, mined association rules, and career role matches into an authentic PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="rounded-full border-border bg-card hover:bg-muted"
            >
              <RefreshCw className={`size-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Refreshing...' : 'Regenerate'}
            </Button>

            <Button
              onClick={handleDownloadPdf}
              disabled={isDownloading || !report.metadata.hasData}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Download className={`size-4 mr-2 ${isDownloading ? 'animate-pulse' : ''}`} />
              {isDownloading ? 'Building PDF...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Success / Error Banners */}
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

        {/* Data Quality Notice */}
        {report.limitations.warnings.length > 0 && report.metadata.hasData && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">Report Data Quality Note:</p>
              <p className="mt-0.5 text-amber-800">
                {report.limitations.warnings.join(' ')}
              </p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!report.metadata.hasData ? (
          /* Empty State */
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
          /* Report Preview Canvas */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <FileText className="size-4 text-indigo-600" />
                <span>Interactive Report Preview</span>
                {lastGeneratedAt && (
                  <span className="text-[11px] text-slate-400">
                    • Refreshed at {lastGeneratedAt}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                Document ID: {report.metadata.reportId}
              </span>
            </div>

            {/* Document Card: Container styled as paper report */}
            <div className="rounded-3xl border border-border/90 bg-card p-6 shadow-sm sm:p-10 space-y-8">
              {/* Cover Banner */}
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
                      Generated on {report.metadata.dateFormatted}
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
                        {report.metadata.profileCompletenessScore}% Profile
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Professional Profile */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    1
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    Professional Profile
                  </h3>
                </div>

                {report.profile.headline && (
                  <p className="text-sm font-semibold text-indigo-950">
                    {report.profile.headline}
                  </p>
                )}

                {report.profile.summary && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {report.profile.summary}
                  </p>
                )}

                {/* Experience */}
                {report.profile.experience.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Briefcase className="size-3.5 text-indigo-600" />
                      Work Experience
                    </h4>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {report.profile.experience.map((exp) => (
                        <div
                          key={exp.id}
                          className="rounded-xl border border-border/80 bg-background/50 p-3.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{exp.jobTitle}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate || 'Present'}
                            </span>
                          </div>
                          <p className="text-indigo-600 font-medium">{exp.company}</p>
                          {exp.description && (
                            <p className="mt-1.5 text-muted-foreground text-[11px] line-clamp-2">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {report.profile.projects.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <FolderGit2 className="size-3.5 text-indigo-600" />
                      Projects & Implementations
                    </h4>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {report.profile.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="rounded-xl border border-border/80 bg-background/50 p-3.5 text-xs"
                        >
                          <span className="font-semibold text-foreground">{proj.title}</span>
                          {proj.description && (
                            <p className="mt-1 text-muted-foreground text-[11px] line-clamp-2">
                              {proj.description}
                            </p>
                          )}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {proj.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700 font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education & Certs */}
                {(report.profile.education.length > 0 ||
                  report.profile.certifications.length > 0) && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {report.profile.education.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <GraduationCap className="size-3.5 text-indigo-600" />
                          Education
                        </h4>
                        {report.profile.education.map((edu) => (
                          <div
                            key={edu.id}
                            className="rounded-xl border border-border/80 bg-background/50 p-3 text-xs"
                          >
                            <p className="font-semibold text-foreground">
                              {edu.degree} in {edu.fieldOfStudy}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                              {edu.institution} {edu.graduationYear ? `(${edu.graduationYear})` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {report.profile.certifications.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          <Award className="size-3.5 text-indigo-600" />
                          Certifications
                        </h4>
                        {report.profile.certifications.map((cert) => (
                          <div
                            key={cert.id}
                            className="rounded-xl border border-border/80 bg-background/50 p-3 text-xs"
                          >
                            <p className="font-semibold text-foreground">{cert.name}</p>
                            <p className="text-muted-foreground text-[11px]">{cert.issuer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Technical Skills */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    Technical Skills Inventory
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {report.skills.totalSkills} skills verified
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(report.skills.skillsByCategory).map(([cat, skills]) => (
                    <div
                      key={cat}
                      className="rounded-xl border border-border/80 bg-background/50 p-3.5"
                    >
                      <h4 className="text-xs font-semibold text-indigo-700 mb-2">
                        {cat} ({skills.length})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-800 shadow-2xs"
                          >
                            <span>{skill.normalisedName}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              • {skill.proficiency}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Career Role Matches */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    3
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    Career Role Match Analysis
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Weighted Requirement Coverage
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {report.careerMatches.topMatches.map((match) => (
                    <div
                      key={match.roleId}
                      className="rounded-xl border border-border/80 bg-background/50 p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{match.roleTitle}</p>
                          <p className="text-[11px] text-muted-foreground">{match.category}</p>
                        </div>
                        <Badge
                          variant={match.matchScore >= 70 ? 'default' : 'secondary'}
                          className={
                            match.matchScore >= 70
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-50 text-indigo-700'
                          }
                        >
                          {match.matchScore}%
                        </Badge>
                      </div>

                      {/* Covered Skills */}
                      <div>
                        <p className="text-[11px] font-semibold text-emerald-700">Covered Skills</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {match.matchedSkills.map((s) => s.name).join(', ') || 'None'}
                        </p>
                      </div>

                      {/* Missing Critical Skills */}
                      <div>
                        <p className="text-[11px] font-semibold text-rose-600">Missing Skills</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {match.missingRequiredSkills.map((s) => s.name).join(', ') || 'None'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Skill Gap Analysis */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    4
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    Skill Gap Analysis & Learning Priorities
                  </h3>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {report.skillGaps.gaps.slice(0, 6).map((gap) => (
                    <div
                      key={gap.id}
                      className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{gap.skillName}</span>
                          <Badge
                            variant="outline"
                            className={
                              gap.priority === 'high'
                                ? 'border-rose-200 bg-rose-50 text-rose-700 text-[10px]'
                                : 'border-amber-200 bg-amber-50 text-amber-700 text-[10px]'
                            }
                          >
                            {gap.priority.toUpperCase()} PRIORITY
                          </Badge>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Target: {gap.targetRole}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-600">
                          {gap.suggestedAction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Data-Mined Relationships */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    5
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    Mined Skill Relationships
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Co-Occurrence Association Rules
                  </span>
                </div>

                {report.relationships.rules.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    No co-occurrence patterns discovered. Add more projects and work experiences to calculate support and confidence rules.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-border/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-3">Antecedent</th>
                          <th className="p-3">Consequent</th>
                          <th className="p-3 text-right">Support</th>
                          <th className="p-3 text-right">Confidence</th>
                          <th className="p-3 text-right">Lift</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {report.relationships.rules.slice(0, 6).map((rule, idx) => (
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

              {/* Section 6: Analytics Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                    6
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">
                    Analytics Summary
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border/80 bg-background/50 p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {report.analytics.totalSkills}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Verified Skills</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/50 p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {report.analytics.totalTransactions}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Portfolio Transactions</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/50 p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {report.analytics.totalProjects}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Projects Logged</p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/50 p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">
                      {report.careerMatches.totalMatchesEvaluated}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Benchmark Roles</p>
                  </div>
                </div>
              </div>

              {/* Section 7: Data Limitations & Academic Disclosure */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <ShieldAlert className="size-4 text-indigo-600" />
                  <span>Academic Methodology & Data Limitations Disclosure</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  NETGRAPH calculates career recommendations using deterministic weighted skill requirement coverage and empirical co-occurrence frequency mining. Scores represent benchmark similarity heuristics for exploratory career planning, not verified commercial employment predictions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
