'use client'

import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'

export default function ResumePage() {
  const { user, updateProfile } = useAuth()

  // Editable customizer fields
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [showEducation, setShowEducation] = useState(true)
  const [showExperience, setShowExperience] = useState(true)
  const [showSkills, setShowSkills] = useState(true)
  const [showCertifications, setShowCertifications] = useState(true)
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setHeadline(user.headline || 'Product & Data Analyst')
      setSummary(
        user.summary ||
          'Analyst focused on turning complex information into clear product decisions and measurable impact.'
      )
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

  const name = user?.name || 'Alex Morgan'
  const email = user?.email || 'alex@example.com'
  const location = user?.location || 'New York, NY'
  const phone = user?.phone || ''
  const linkedinUrl = user?.linkedinUrl || ''
  const githubUrl = user?.githubUrl || ''
  const portfolioUrl = user?.portfolioUrl || ''

  const education = user?.education || []
  const experience = user?.experience || []
  const certifications = user?.certifications || []
  const skillsList =
    user?.skillsList && user.skillsList.length > 0
      ? user.skillsList.map((s) => s.name)
      : user?.skills || ['SQL', 'Python', 'Product Research', 'Statistics', 'Storytelling']

  return (
    <AppShell title="Resume Builder">
      <div className="mx-auto max-w-7xl">
        {/* Page Top Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
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
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Printer className="size-4 mr-1.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {savedMessage && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          {/* LEFT: Controls & Customization Sidebar */}
          <section className="flex flex-col gap-6">
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
                    placeholder="Brief career narrative..."
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
                    All education credentials, experience timelines, and skill endorsements are populated
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
            {/* Header info */}
            <div className="border-b border-border pb-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Curriculum Vitae
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {name}
              </h1>
              <p className="mt-1 text-lg font-medium text-slate-700">{headline}</p>

              {/* Contact and Links bar */}
              <div className="mt-3.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Mail className="size-3.5 text-slate-400" />
                  {email}
                </span>
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
                  <span className="inline-flex items-center gap-1 text-indigo-600">
                    <Globe className="size-3.5" />
                    {linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                )}
                {githubUrl && (
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <Globe className="size-3.5" />
                    {githubUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                )}
                {portfolioUrl && (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <Globe className="size-3.5" />
                    {portfolioUrl.replace(/^https?:\/\/(www\.)?/, '')}
                  </span>
                )}
              </div>
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

            {/* Selected Skills */}
            {showSkills && (
              <div className="mt-6 border-b border-border pb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Key Skills & Competencies
                </h2>
                {skillsList.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skillsList.map((skill, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="rounded-lg bg-slate-100 font-medium text-slate-800"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    No skills added yet. Add skills in your profile to display them here.
                  </p>
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
                  </div>
                )}
              </div>
            )}

            {/* Certifications */}
            {showCertifications && certifications.length > 0 && (
              <div className="mt-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Certifications
                </h2>
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
              </div>
            )}
          </article>
        </div>
      </div>
    </AppShell>
  )
}
