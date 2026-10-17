'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/auth-context'
import {
  Printer,
  Sparkles,
  Save,
  CheckCircle2,
  Mail,
  MapPin,
  Globe,
  Phone,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  AlertCircle,
} from 'lucide-react'
import { SkillEntry } from '@/lib/profile'

export default function ResumePage() {
  const { user, updateProfile } = useAuth()

  // Editable customizer fields
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [showProjects, setShowProjects] = useState(true)
  const [showExperience, setShowExperience] = useState(true)
  const [showEducation, setShowEducation] = useState(true)
  const [showSkills, setShowSkills] = useState(true)
  const [showCertifications, setShowCertifications] = useState(true)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  // Sync state with user profile without fabricating placeholder text
  useEffect(() => {
    if (user) {
      setHeadline(user.headline || user.careerGoal || '')
      setSummary(user.summary || '')
    }
  }, [user])

  const handleSaveToProfile = () => {
    updateProfile({
      headline: headline.trim(),
      summary: summary.trim(),
    })
    setSavedMessage('Resume headline & summary updated in your profile!')
    setTimeout(() => setSavedMessage(null), 3000)
  }

  // Actual profile data extraction with neutral fallbacks (no fabricated identities)
  const name = user?.name?.trim() || 'Your Name'
  const email = user?.email || ''
  const location = user?.location || ''
  const phone = user?.phone || ''
  const linkedinUrl = user?.linkedinUrl || ''
  const githubUrl = user?.githubUrl || ''
  const portfolioUrl = user?.portfolioUrl || ''
  const careerGoal = user?.careerGoal || ''

  const education = user?.education || []
  const experience = user?.experience || []
  const projects = user?.projects || []
  const certifications = user?.certifications || []

  // Extract skills from strongly typed skillsList or legacy array without default demo skills
  const skillsList: SkillEntry[] = useMemo(() => {
    if (user?.skillsList && user.skillsList.length > 0) {
      return user.skillsList
    }
    if (user?.skills && user.skills.length > 0) {
      return user.skills.map((s, idx) => ({
        id: `sk_legacy_${idx}`,
        name: s,
        category: 'Other',
        proficiency: 'Intermediate',
      }))
    }
    return []
  }, [user?.skillsList, user?.skills])

  // Profile completeness check
  const isProfileEmpty =
    !user?.name?.trim() &&
    !user?.headline?.trim() &&
    !user?.summary?.trim() &&
    education.length === 0 &&
    experience.length === 0 &&
    projects.length === 0 &&
    skillsList.length === 0

  return (
    <AppShell title="Resume Builder">
      <div className="mx-auto max-w-7xl">
        {/* Page Top Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end print:hidden">
          <div>
            <Badge variant="secondary" className="rounded-full bg-emerald-50 text-emerald-700">
              Interactive Resume Builder
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Career profile & resume
            </h1>
            <p className="mt-2 text-muted-foreground">
              Automatically generated from your verified NETGRAPH profile and skills graph.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="rounded-full border-border bg-card hover:bg-muted"
            >
              <Link href="/profile">Edit Full Profile</Link>
            </Button>
            <Button
              onClick={() => window.print()}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Printer className="size-4 mr-1.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {savedMessage && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 print:hidden">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[.85fr_1.15fr] print:block">
          {/* LEFT: Controls & Customization Sidebar */}
          <section className="flex flex-col gap-6 print:hidden">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
              <h2 className="font-semibold text-lg text-slate-900">Customizer & Tuning</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Tweak resume presentation and save adjustments back to your profile.
              </p>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Resume Headline</label>
                  <Input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Machine Learning Engineer"
                    className="mt-1.5 bg-background"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Summary Statement</label>
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Brief career narrative (e.g. background, expertise, and goals)..."
                    className="mt-1.5 w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <Button
                  onClick={handleSaveToProfile}
                  variant="outline"
                  size="sm"
                  className="rounded-full self-start"
                >
                  <Save className="size-3.5 mr-1.5" /> Save Edits to Profile
                </Button>
              </div>

              {/* Section Visibility Toggles */}
              <div className="mt-6 border-t border-border pt-5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Display Sections
                </h3>
                <div className="mt-3 flex flex-col gap-2.5 text-sm">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showExperience}
                      onChange={(e) => setShowExperience(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Work Experience ({experience.length} entries)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showProjects}
                      onChange={(e) => setShowProjects(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Key Projects ({projects.length} entries)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showEducation}
                      onChange={(e) => setShowEducation(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Education ({education.length} entries)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSkills}
                      onChange={(e) => setShowSkills(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Technical Skills ({skillsList.length} items)</span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCertifications}
                      onChange={(e) => setShowCertifications(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Certifications ({certifications.length} entries)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Profile sync reminder box */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="size-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Synchronized Profile Data</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    All education credentials, experience timelines, projects, and skills are populated
                    directly from your active NETGRAPH session.
                  </p>
                  <Button asChild size="sm" variant="link" className="px-0 text-xs text-indigo-700">
                    <Link href="/profile">Go to Profile Manager &rarr;</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: Document Resume Preview */}
          <article className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-sm print:m-0 print:border-none print:p-0 print:shadow-none">
            {/* Incomplete Profile Alert for empty accounts */}
            {isProfileEmpty && (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 print:hidden">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="size-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-950">Incomplete Profile Notice</p>
                    <p className="mt-1 text-amber-800 leading-relaxed">
                      Your profile currently contains minimal information. Complete your profile details or walk through guided onboarding to automatically populate this resume.
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Button asChild size="sm" className="rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs">
                        <Link href="/onboarding">Run Onboarding</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-full border-amber-300 text-amber-900 text-xs">
                        <Link href="/profile">Edit Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header info */}
            <div className="border-b border-border pb-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Curriculum Vitae
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {name}
              </h1>
              {headline && (
                <p className="mt-1 text-lg font-medium text-slate-700">{headline}</p>
              )}

              {/* Career Goal / Target Role if available */}
              {careerGoal && careerGoal !== headline && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Target Role:
                  </span>
                  <Badge variant="outline" className="border-indigo-200 bg-indigo-50/70 text-indigo-700 text-xs font-medium">
                    {careerGoal}
                  </Badge>
                </div>
              )}

              {/* Contact and Links bar (Rendered only when real data exists) */}
              <div className="mt-3.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
                {email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5 text-slate-400" />
                    {email}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-slate-400" />
                    {location}
                  </span>
                )}
                {phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="size-3.5 text-slate-400" />
                    {phone}
                  </span>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                  >
                    <Globe className="size-3.5" />
                    {linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-700 hover:underline"
                  >
                    <Globe className="size-3.5" />
                    {githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                )}
                {portfolioUrl && (
                  <a
                    href={portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                  >
                    <Globe className="size-3.5" />
                    {portfolioUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                )}
              </div>

              {!email && !location && !phone && !linkedinUrl && !githubUrl && !portfolioUrl && (
                <p className="mt-2 text-xs italic text-muted-foreground">
                  No contact details provided. Add email, location, or portfolio links in your profile.
                </p>
              )}
            </div>

            {/* Profile Summary */}
            {summary && (
              <div className="mt-6 border-b border-border pb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Professional Summary
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 whitespace-pre-line">
                  {summary}
                </p>
              </div>
            )}

            {/* Technical Skills with Proficiency */}
            {showSkills && (
              <div className="mt-6 border-b border-border pb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Key Skills & Competencies
                </h2>
                {skillsList.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillsList.map((skill) => (
                      <Badge
                        key={skill.id || skill.name}
                        variant="secondary"
                        className="rounded-lg bg-slate-100 font-medium text-slate-800 text-xs py-1 px-2.5 flex items-center gap-1.5"
                      >
                        <span>{skill.name}</span>
                        {skill.proficiency && (
                          <span className="text-[10px] text-muted-foreground font-normal">
                            ({skill.proficiency})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No skills added yet. Add your technical competencies in the Profile Manager to display them here.
                    </p>
                    <Button asChild size="sm" variant="link" className="mt-1 h-auto p-0 text-xs text-indigo-600">
                      <Link href="/profile">Add skills in Profile &rarr;</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Key Projects */}
            {showProjects && (
              <div className="mt-6 border-b border-border pb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Key Projects
                </h2>
                {projects.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-4">
                    {projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                          <h3 className="font-semibold text-slate-900 text-sm">
                            {proj.title}
                          </h3>
                          {proj.projectUrl && (
                            <a
                              href={proj.projectUrl.startsWith('http') ? proj.projectUrl : `https://${proj.projectUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-600 hover:underline"
                            >
                              {proj.projectUrl.replace(/^https?:\/\/(www\.)?/, '')}
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="mt-1.5 text-xs leading-5 text-slate-600 whitespace-pre-line">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
                            Technologies: {proj.technologies.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No projects recorded yet. Add your portfolio projects in the Profile Manager to showcase hands-on implementations.
                    </p>
                    <Button asChild size="sm" variant="link" className="mt-1 h-auto p-0 text-xs text-indigo-600">
                      <Link href="/profile">Add projects in Profile &rarr;</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Work Experience */}
            {showExperience && (
              <div className="mt-6 border-b border-border pb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Professional Experience
                </h2>
                {experience.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-5">
                    {experience.map((item) => (
                      <div key={item.id}>
                        <div className="flex flex-col justify-between sm:flex-row sm:items-baseline">
                          <h3 className="font-semibold text-slate-900 text-sm">
                            {item.jobTitle}{' '}
                            <span className="font-normal text-slate-600">· {item.company}</span>
                          </h3>
                          <span className="text-xs text-muted-foreground font-medium">
                            {item.startDate} — {item.isCurrent ? 'Present' : item.endDate || 'N/A'}
                          </span>
                        </div>
                        {item.employmentType && (
                          <p className="text-xs text-muted-foreground mt-0.5">{item.employmentType}</p>
                        )}
                        <p className="mt-2 text-xs leading-5 text-slate-600 whitespace-pre-line">
                          {item.description}
                        </p>
                        {item.technologies && item.technologies.length > 0 && (
                          <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
                            Technologies: {item.technologies.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No experience entries recorded. Add roles in onboarding or profile to showcase career history.
                    </p>
                    <Button asChild size="sm" variant="link" className="mt-1 h-auto p-0 text-xs text-indigo-600">
                      <Link href="/profile">Add experience in Profile &rarr;</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Education */}
            {showEducation && (
              <div className="mt-6 border-b border-border pb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Education & Credentials
                </h2>
                {education.length > 0 ? (
                  <div className="mt-4 flex flex-col gap-4">
                    {education.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between sm:flex-row sm:items-baseline"
                      >
                        <div>
                          <h3 className="font-semibold text-slate-900 text-sm">
                            {item.degree} in {item.fieldOfStudy}
                          </h3>
                          <p className="text-xs text-slate-600">{item.institution}</p>
                          {item.coursework && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              Relevant Coursework: {item.coursework}
                            </p>
                          )}
                        </div>
                        <div className="text-right sm:self-start">
                          <span className="text-xs text-muted-foreground">
                            {item.startYear} — {item.graduationYear || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No education entries recorded yet.
                    </p>
                    <Button asChild size="sm" variant="link" className="mt-1 h-auto p-0 text-xs text-indigo-600">
                      <Link href="/profile">Add education in Profile &rarr;</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {showCertifications && (
              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Certifications
                </h2>
                {certifications.length > 0 ? (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {certifications.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border bg-slate-50/50 p-3">
                        <p className="font-medium text-xs text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-600">
                          {item.issuer} {item.issueDate && `· ${item.issueDate}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No certifications recorded yet. Add verified credentials in your profile.
                    </p>
                    <Button asChild size="sm" variant="link" className="mt-1 h-auto p-0 text-xs text-indigo-600">
                      <Link href="/profile">Add certifications in Profile &rarr;</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      </div>
    </AppShell>
  )
}
