'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  GraduationCap,
  Network,
  Plus,
  Trash2,
  Wrench,
  Briefcase,
  FolderGit2,
  Award,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/auth-context'
import {
  EducationEntry,
  SkillEntry,
  ProjectEntry,
  ExperienceEntry,
  CertificationEntry,
  SKILL_CATEGORIES,
  SKILL_PROFICIENCIES,
  POPULAR_TECH_SKILLS,
  SkillCategory,
  SkillProficiency,
  generateId,
  isValidUrl,
} from '@/lib/profile'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateProfile, isAuthenticated, isLoading } = useAuth()

  // Current Step: 1 to 5
  const [currentStep, setCurrentStep] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Step 1: Personal Info
  const [fullName, setFullName] = useState('')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [summary, setSummary] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')

  // Step 2: Education
  const [educationList, setEducationList] = useState<EducationEntry[]>([])
  const [newEdu, setNewEdu] = useState<Omit<EducationEntry, 'id'>>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: new Date().getFullYear() - 4,
    graduationYear: new Date().getFullYear(),
    coursework: '',
  })
  const [showEduForm, setShowEduForm] = useState(false)

  // Step 3: Technical Skills
  const [skillsList, setSkillsList] = useState<SkillEntry[]>([])
  const [customSkillName, setCustomSkillName] = useState('')
  const [customSkillCategory, setCustomSkillCategory] = useState<SkillCategory>('Programming Languages')
  const [customSkillProficiency, setCustomSkillProficiency] = useState<SkillProficiency>('Intermediate')
  const [customSkillYears, setCustomSkillYears] = useState<string>('2')

  // Step 4: Projects, Experience & Certifications
  const [projectsList, setProjectsList] = useState<ProjectEntry[]>([])
  const [showProjForm, setShowProjForm] = useState(false)
  const [newProj, setNewProj] = useState({
    title: '',
    description: '',
    technologies: '',
    projectUrl: '',
    githubUrl: '',
  })

  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([])
  const [showExpForm, setShowExpForm] = useState(false)
  const [newExp, setNewExp] = useState({
    jobTitle: '',
    company: '',
    employmentType: 'Full-time',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    technologies: '',
  })

  const [certificationsList, setCertificationsList] = useState<CertificationEntry[]>([])
  const [showCertForm, setShowCertForm] = useState(false)
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
  })

  // Hydrate from user if present
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name)
      if (user.headline) setHeadline(user.headline)
      if (user.location) setLocation(user.location)
      if (user.summary) setSummary(user.summary)
      if (user.linkedinUrl) setLinkedinUrl(user.linkedinUrl)
      if (user.githubUrl) setGithubUrl(user.githubUrl)

      if (user.education && user.education.length > 0) {
        setEducationList(user.education)
      } else if (educationList.length === 0) {
        // Pre-fill a default starter entry if empty
        setEducationList([
          {
            id: generateId('edu'),
            institution: 'University / College',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startYear: 2020,
            graduationYear: 2024,
            coursework: 'Data Structures, Database Systems',
          },
        ])
      }

      if (user.skillsList && user.skillsList.length > 0) {
        setSkillsList(user.skillsList)
      } else if (user.skills && user.skills.length > 0) {
        setSkillsList(
          user.skills.map((s, idx) => ({
            id: `sk_init_${idx}`,
            name: s,
            category: 'Programming Languages',
            proficiency: 'Intermediate',
            yearsOfExperience: 2,
          }))
        )
      } else if (skillsList.length === 0) {
        // Default seed skills
        setSkillsList([
          { id: generateId('sk'), name: 'Python', category: 'Programming Languages', proficiency: 'Advanced', yearsOfExperience: 3 },
          { id: generateId('sk'), name: 'SQL', category: 'Databases', proficiency: 'Intermediate', yearsOfExperience: 2 },
        ])
      }

      if (user.projects && user.projects.length > 0) {
        setProjectsList(user.projects)
      }
      if (user.experience && user.experience.length > 0) {
        setExperienceList(user.experience)
      }
      if (user.certifications && user.certifications.length > 0) {
        setCertificationsList(user.certifications)
      }
    }
  }, [user])

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/onboarding')
    }
  }, [isLoading, isAuthenticated, router])

  // Validation per step
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {}

    if (step === 1) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        errs.fullName = 'Please enter your full name (at least 2 characters).'
      }
      if (!headline.trim()) {
        errs.headline = 'Please enter a brief professional headline.'
      }
      if (linkedinUrl && !isValidUrl(linkedinUrl)) {
        errs.linkedinUrl = 'Please enter a valid URL starting with http:// or https://'
      }
      if (githubUrl && !isValidUrl(githubUrl)) {
        errs.githubUrl = 'Please enter a valid URL starting with http:// or https://'
      }
    }

    if (step === 2) {
      if (educationList.length === 0) {
        errs.education = 'Please add at least one education entry.'
      }
    }

    if (step === 3) {
      if (skillsList.length === 0) {
        errs.skills = 'Please add at least one technical skill to your profile.'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors({})
      // Auto-save draft
      updateProfile({
        name: fullName.trim() || user?.name || 'Explorer User',
        headline: headline.trim(),
        location: location.trim(),
        summary: summary.trim(),
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
        education: educationList,
        skillsList: skillsList,
        skills: skillsList.map((s) => s.name),
        projects: projectsList,
        experience: experienceList,
        certifications: certificationsList,
      })
      setCurrentStep((prev) => Math.min(5, prev + 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final Complete
  const handleComplete = () => {
    updateProfile({
      name: fullName.trim() || user?.name || 'Explorer User',
      headline: headline.trim(),
      location: location.trim(),
      summary: summary.trim(),
      linkedinUrl: linkedinUrl.trim(),
      githubUrl: githubUrl.trim(),
      education: educationList,
      skillsList: skillsList,
      skills: skillsList.map((s) => s.name),
      projects: projectsList,
      experience: experienceList,
      certifications: certificationsList,
      onboarded: true,
    })
    setIsCompleted(true)
  }

  // Education helpers
  const handleAddEducation = () => {
    const errs: Record<string, string> = {}
    if (!newEdu.institution.trim()) errs.eduInst = 'Institution name is required.'
    if (!newEdu.degree.trim()) errs.eduDegree = 'Degree is required.'
    if (!newEdu.fieldOfStudy.trim()) errs.eduField = 'Field of study is required.'
    const startYr = Number(newEdu.startYear)
    const gradYr = Number(newEdu.graduationYear)
    if (isNaN(startYr) || startYr < 1960 || startYr > 2035) errs.eduStart = 'Valid start year required.'
    if (isNaN(gradYr) || gradYr < startYr) errs.eduGrad = 'Graduation year cannot precede start year.'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setEducationList((prev) => [
      ...prev,
      {
        id: generateId('edu'),
        institution: newEdu.institution.trim(),
        degree: newEdu.degree.trim(),
        fieldOfStudy: newEdu.fieldOfStudy.trim(),
        startYear: startYr,
        graduationYear: gradYr,
        coursework: newEdu.coursework?.trim() || '',
      },
    ])
    setNewEdu({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startYear: new Date().getFullYear() - 4,
      graduationYear: new Date().getFullYear(),
      coursework: '',
    })
    setShowEduForm(false)
    setErrors({})
  }

  const handleRemoveEducation = (id: string) => {
    setEducationList((prev) => prev.filter((item) => item.id !== id))
  }

  // Skill helpers
  const handleAddSkill = (name: string, category: SkillCategory = 'Programming Languages') => {
    const trimmed = name.trim()
    if (!trimmed) return
    const isDuplicate = skillsList.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      setErrors({ skillInput: `"${trimmed}" is already in your skills list.` })
      return
    }

    setSkillsList((prev) => [
      ...prev,
      {
        id: generateId('sk'),
        name: trimmed,
        category,
        proficiency: customSkillProficiency,
        yearsOfExperience: customSkillYears ? Number(customSkillYears) : undefined,
      },
    ])
    setCustomSkillName('')
    setErrors({})
  }

  const handleRemoveSkill = (id: string) => {
    setSkillsList((prev) => prev.filter((item) => item.id !== id))
  }

  // Project helpers
  const handleAddProject = () => {
    if (!newProj.title.trim()) {
      setErrors({ projTitle: 'Project title is required.' })
      return
    }
    if (!newProj.description.trim()) {
      setErrors({ projDesc: 'Project description is required.' })
      return
    }
    if (newProj.projectUrl && !isValidUrl(newProj.projectUrl)) {
      setErrors({ projUrl: 'Project URL must be valid.' })
      return
    }
    if (newProj.githubUrl && !isValidUrl(newProj.githubUrl)) {
      setErrors({ projGithub: 'GitHub URL must be valid.' })
      return
    }

    const techArray = newProj.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setProjectsList((prev) => [
      ...prev,
      {
        id: generateId('proj'),
        title: newProj.title.trim(),
        description: newProj.description.trim(),
        technologies: techArray,
        projectUrl: newProj.projectUrl.trim() || undefined,
        githubUrl: newProj.githubUrl.trim() || undefined,
      },
    ])
    setNewProj({ title: '', description: '', technologies: '', projectUrl: '', githubUrl: '' })
    setShowProjForm(false)
    setErrors({})
  }

  const handleRemoveProject = (id: string) => {
    setProjectsList((prev) => prev.filter((p) => p.id !== id))
  }

  // Experience helpers
  const handleAddExperience = () => {
    if (!newExp.jobTitle.trim()) {
      setErrors({ expTitle: 'Job title is required.' })
      return
    }
    if (!newExp.company.trim()) {
      setErrors({ expCompany: 'Company name is required.' })
      return
    }
    if (!newExp.startDate) {
      setErrors({ expStart: 'Start date is required.' })
      return
    }
    if (!newExp.isCurrent && newExp.endDate && newExp.endDate < newExp.startDate) {
      setErrors({ expEnd: 'End date cannot precede start date.' })
      return
    }

    const techArray = newExp.technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    setExperienceList((prev) => [
      ...prev,
      {
        id: generateId('exp'),
        jobTitle: newExp.jobTitle.trim(),
        company: newExp.company.trim(),
        employmentType: newExp.employmentType,
        startDate: newExp.startDate,
        endDate: newExp.isCurrent ? undefined : newExp.endDate,
        isCurrent: newExp.isCurrent,
        description: newExp.description.trim(),
        technologies: techArray,
      },
    ])
    setNewExp({
      jobTitle: '',
      company: '',
      employmentType: 'Full-time',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      technologies: '',
    })
    setShowExpForm(false)
    setErrors({})
  }

  const handleRemoveExperience = (id: string) => {
    setExperienceList((prev) => prev.filter((e) => e.id !== id))
  }

  // Certification helpers
  const handleAddCertification = () => {
    if (!newCert.name.trim()) {
      setErrors({ certName: 'Certification name is required.' })
      return
    }
    if (!newCert.issuer.trim()) {
      setErrors({ certIssuer: 'Issuing organization is required.' })
      return
    }
    if (newCert.credentialUrl && !isValidUrl(newCert.credentialUrl)) {
      setErrors({ certUrl: 'Credential URL must be a valid web link.' })
      return
    }

    setCertificationsList((prev) => [
      ...prev,
      {
        id: generateId('cert'),
        name: newCert.name.trim(),
        issuer: newCert.issuer.trim(),
        issueDate: newCert.issueDate || undefined,
        credentialUrl: newCert.credentialUrl.trim() || undefined,
      },
    ])
    setNewCert({ name: '', issuer: '', issueDate: '', credentialUrl: '' })
    setShowCertForm(false)
    setErrors({})
  }

  const handleRemoveCertification = (id: string) => {
    setCertificationsList((prev) => prev.filter((c) => c.id !== id))
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Network className="size-4" />
            </span>{' '}
            NETGRAPH
          </Link>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            STEP {currentStep} OF 5 ·{' '}
            {currentStep === 1
              ? 'PERSONAL INFORMATION'
              : currentStep === 2
              ? 'EDUCATION'
              : currentStep === 3
              ? 'TECHNICAL SKILLS'
              : currentStep === 4
              ? 'PROJECTS & EXPERIENCE'
              : 'REVIEW & COMPLETE'}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Profile Onboarding</span>
            <span>{currentStep * 20}% completed</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  step <= currentStep ? 'bg-indigo-600' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Completion Success Screen */}
        {isCompleted ? (
          <div className="rounded-3xl border border-indigo-100 bg-card p-10 text-center shadow-xs">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="size-8" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em]">
              Your career profile is ready!
            </h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              Your profile has been saved. NETGRAPH is now configured to mine relationships between your skills, projects, and target career opportunities.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-slate-950 hover:bg-indigo-700 text-white">
                <Link href="/dashboard">
                  Explore my dashboard <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="/profile">Edit profile anytime</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Save & exit to workspace
              </Link>
            </div>

            {/* STEP 1: PERSONAL INFORMATION */}
            {currentStep === 1 && (
              <div className="mt-6">
                <h1 className="text-3xl font-semibold tracking-[-0.05em]">
                  Personal & Professional Essentials
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Introduce yourself to personalize your relationship map and career matches.
                </p>

                <div className="mt-8 flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="full-name">
                        Full name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="full-name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        required
                      />
                      {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                      />
                      <span className="text-[11px] text-muted-foreground">Account identifier</span>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="headline">
                        Professional headline <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="headline"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Data Science Student & Machine Learning Enthusiast"
                      />
                      {errors.headline && <p className="text-xs text-rose-500">{errors.headline}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Toronto, Canada"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="summary">About / Professional Summary</Label>
                    <textarea
                      id="summary"
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={3}
                      className="rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      placeholder="Brief overview of your background, career aspirations, and current interests..."
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="linkedin">LinkedIn Profile (optional)</Label>
                      <Input
                        id="linkedin"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                      {errors.linkedinUrl && <p className="text-xs text-rose-500">{errors.linkedinUrl}</p>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="github">GitHub Profile (optional)</Label>
                      <Input
                        id="github"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                      />
                      {errors.githubUrl && <p className="text-xs text-rose-500">{errors.githubUrl}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EDUCATION */}
            {currentStep === 2 && (
              <div className="mt-6">
                <h1 className="text-3xl font-semibold tracking-[-0.05em]">Education History</h1>
                <p className="mt-2 text-muted-foreground">
                  Add degrees, coursework, and institutions to help map academic skills.
                </p>

                {errors.education && (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                    {errors.education}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-4">
                  {educationList.map((edu) => (
                    <div
                      key={edu.id}
                      className="flex items-start justify-between rounded-2xl border border-border bg-card p-5 shadow-xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <GraduationCap className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</h3>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {edu.startYear} – {edu.graduationYear}
                          </p>
                          {edu.coursework && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Coursework:</span> {edu.coursework}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Add Education Form */}
                  {showEduForm ? (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5">
                      <h4 className="font-semibold text-sm">Add Education Entry</h4>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="inst">Institution Name *</Label>
                          <Input
                            id="inst"
                            value={newEdu.institution}
                            onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                            placeholder="e.g. University of Toronto"
                          />
                          {errors.eduInst && <p className="text-xs text-rose-500 mt-1">{errors.eduInst}</p>}
                        </div>
                        <div>
                          <Label htmlFor="degree">Degree *</Label>
                          <Input
                            id="degree"
                            value={newEdu.degree}
                            onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                            placeholder="e.g. Bachelor of Science"
                          />
                          {errors.eduDegree && <p className="text-xs text-rose-500 mt-1">{errors.eduDegree}</p>}
                        </div>
                        <div>
                          <Label htmlFor="field">Field of Study *</Label>
                          <Input
                            id="field"
                            value={newEdu.fieldOfStudy}
                            onChange={(e) => setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })}
                            placeholder="e.g. Computer Science"
                          />
                          {errors.eduField && <p className="text-xs text-rose-500 mt-1">{errors.eduField}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="syear">Start Year *</Label>
                            <Input
                              id="syear"
                              type="number"
                              value={newEdu.startYear}
                              onChange={(e) => setNewEdu({ ...newEdu, startYear: Number(e.target.value) })}
                            />
                            {errors.eduStart && <p className="text-xs text-rose-500 mt-1">{errors.eduStart}</p>}
                          </div>
                          <div>
                            <Label htmlFor="gyear">Grad Year *</Label>
                            <Input
                              id="gyear"
                              type="number"
                              value={newEdu.graduationYear}
                              onChange={(e) => setNewEdu({ ...newEdu, graduationYear: Number(e.target.value) })}
                            />
                            {errors.eduGrad && <p className="text-xs text-rose-500 mt-1">{errors.eduGrad}</p>}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <Label htmlFor="coursework">Relevant Coursework (optional)</Label>
                          <Input
                            id="coursework"
                            value={newEdu.coursework}
                            onChange={(e) => setNewEdu({ ...newEdu, coursework: e.target.value })}
                            placeholder="e.g. Algorithms, Machine Learning, Statistical Inference"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button type="button" size="sm" onClick={handleAddEducation} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                          Save education
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowEduForm(false)} className="rounded-full">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEduForm(true)}
                      className="rounded-2xl border-dashed border-2 py-6 text-muted-foreground hover:text-indigo-600 hover:border-indigo-300"
                    >
                      <Plus className="mr-2 size-4" /> Add education entry
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: TECHNICAL SKILLS */}
            {currentStep === 3 && (
              <div className="mt-6">
                <h1 className="text-3xl font-semibold tracking-[-0.05em]">Technical Skills</h1>
                <p className="mt-2 text-muted-foreground">
                  Select your core competencies, choose categories, and set your proficiency level.
                </p>

                {errors.skills && (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
                    {errors.skills}
                  </p>
                )}

                {/* Quick Add Popular Skills */}
                <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick Suggestions</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {POPULAR_TECH_SKILLS.map((sk) => {
                      const alreadyAdded = skillsList.some((s) => s.name.toLowerCase() === sk.name.toLowerCase())
                      return (
                        <button
                          type="button"
                          key={sk.name}
                          onClick={() => handleAddSkill(sk.name, sk.category)}
                          disabled={alreadyAdded}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                            alreadyAdded
                              ? 'bg-muted/70 text-muted-foreground border-border cursor-not-allowed opacity-60'
                              : 'border-border text-foreground hover:border-indigo-400 hover:bg-indigo-50/50'
                          }`}
                        >
                          {alreadyAdded ? '✓ ' : '+ '}
                          {sk.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Skill Input */}
                <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Add Custom Skill</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
                    <div>
                      <Input
                        value={customSkillName}
                        onChange={(e) => setCustomSkillName(e.target.value)}
                        placeholder="Skill name (e.g. Docker, PyTorch)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkill(customSkillName, customSkillCategory)
                          }
                        }}
                      />
                    </div>
                    <div>
                      <select
                        value={customSkillCategory}
                        onChange={(e) => setCustomSkillCategory(e.target.value as SkillCategory)}
                        className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        {SKILL_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select
                        value={customSkillProficiency}
                        onChange={(e) => setCustomSkillProficiency(e.target.value as SkillProficiency)}
                        className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        {SKILL_PROFICIENCIES.map((prof) => (
                          <option key={prof} value={prof}>
                            {prof}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Button
                        type="button"
                        onClick={() => handleAddSkill(customSkillName, customSkillCategory)}
                        className="h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  {errors.skillInput && <p className="text-xs text-rose-500 mt-2">{errors.skillInput}</p>}
                </div>

                {/* Added Skills List */}
                <div className="mt-6">
                  <h3 className="font-semibold text-sm mb-3">Your Skills ({skillsList.length})</h3>
                  {skillsList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      No skills added yet. Use the suggestions above or type your own.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      {skillsList.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-xs"
                        >
                          <span className="font-semibold text-foreground">{skill.name}</span>
                          <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                            {skill.proficiency}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{skill.category}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill.id)}
                            className="ml-1 text-muted-foreground hover:text-rose-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: PROJECTS, EXPERIENCE & CERTIFICATIONS */}
            {currentStep === 4 && (
              <div className="mt-6 flex flex-col gap-8">
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.05em]">Projects & Experience</h1>
                  <p className="mt-2 text-muted-foreground">
                    Connect real applications, repositories, and workplace background to enrich your network graph.
                  </p>
                </div>

                {/* Projects Section */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="size-5 text-indigo-600" />
                      <h3 className="font-semibold">Projects ({projectsList.length})</h3>
                    </div>
                    {!showProjForm && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowProjForm(true)}
                        className="rounded-full text-xs"
                      >
                        <Plus className="mr-1 size-3.5" /> Add Project
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {projectsList.map((p) => (
                      <div key={p.id} className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-4">
                        <div>
                          <h4 className="font-semibold text-sm">{p.title}</h4>
                          <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                          {p.technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {p.technologies.map((t) => (
                                <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveProject(p.id)} className="text-muted-foreground hover:text-rose-500">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}

                    {showProjForm && (
                      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-4 mt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Add Project</h4>
                        <div className="mt-3 flex flex-col gap-3">
                          <div>
                            <Label htmlFor="proj-name">Project Name *</Label>
                            <Input
                              id="proj-name"
                              value={newProj.title}
                              onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                              placeholder="e.g. Distributed Graph Analytics"
                            />
                            {errors.projTitle && <p className="text-xs text-rose-500 mt-1">{errors.projTitle}</p>}
                          </div>
                          <div>
                            <Label htmlFor="proj-desc">Description *</Label>
                            <textarea
                              id="proj-desc"
                              rows={2}
                              value={newProj.description}
                              onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                              className="rounded-xl border border-input bg-card px-3 py-2 text-xs outline-none w-full"
                              placeholder="What problem does it solve and what did you build?"
                            />
                            {errors.projDesc && <p className="text-xs text-rose-500 mt-1">{errors.projDesc}</p>}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div>
                              <Label htmlFor="proj-tech">Tech Stack (comma separated)</Label>
                              <Input
                                id="proj-tech"
                                value={newProj.technologies}
                                onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                                placeholder="Python, PyTorch, React"
                              />
                            </div>
                            <div>
                              <Label htmlFor="proj-url">Live URL (optional)</Label>
                              <Input
                                id="proj-url"
                                value={newProj.projectUrl}
                                onChange={(e) => setNewProj({ ...newProj, projectUrl: e.target.value })}
                                placeholder="https://myproject.com"
                              />
                            </div>
                            <div>
                              <Label htmlFor="proj-gh">GitHub Repo (optional)</Label>
                              <Input
                                id="proj-gh"
                                value={newProj.githubUrl}
                                onChange={(e) => setNewProj({ ...newProj, githubUrl: e.target.value })}
                                placeholder="https://github.com/..."
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button type="button" size="sm" onClick={handleAddProject} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                              Save project
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowProjForm(false)} className="rounded-full">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience Section */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="size-5 text-indigo-600" />
                      <h3 className="font-semibold">Work Experience ({experienceList.length})</h3>
                    </div>
                    {!showExpForm && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExpForm(true)}
                        className="rounded-full text-xs"
                      >
                        <Plus className="mr-1 size-3.5" /> Add Experience
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {experienceList.map((exp) => (
                      <div key={exp.id} className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-4">
                        <div>
                          <h4 className="font-semibold text-sm">{exp.jobTitle} · {exp.company}</h4>
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate} – {exp.isCurrent ? 'Present (Current)' : exp.endDate || 'N/A'} · {exp.employmentType}
                          </p>
                          {exp.description && <p className="mt-2 text-xs text-muted-foreground">{exp.description}</p>}
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveExperience(exp.id)} className="text-muted-foreground hover:text-rose-500">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}

                    {showExpForm && (
                      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-4 mt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Add Experience</h4>
                        <div className="mt-3 flex flex-col gap-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <Label htmlFor="exp-title">Job Title *</Label>
                              <Input
                                id="exp-title"
                                value={newExp.jobTitle}
                                onChange={(e) => setNewExp({ ...newExp, jobTitle: e.target.value })}
                                placeholder="e.g. Data Analyst Intern"
                              />
                              {errors.expTitle && <p className="text-xs text-rose-500 mt-1">{errors.expTitle}</p>}
                            </div>
                            <div>
                              <Label htmlFor="exp-comp">Company / Organization *</Label>
                              <Input
                                id="exp-comp"
                                value={newExp.company}
                                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                                placeholder="e.g. Acme Analytics"
                              />
                              {errors.expCompany && <p className="text-xs text-rose-500 mt-1">{errors.expCompany}</p>}
                            </div>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-3 items-end">
                            <div>
                              <Label htmlFor="exp-start">Start Date *</Label>
                              <Input
                                id="exp-start"
                                type="month"
                                value={newExp.startDate}
                                onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                              />
                              {errors.expStart && <p className="text-xs text-rose-500 mt-1">{errors.expStart}</p>}
                            </div>
                            <div>
                              <Label htmlFor="exp-end">End Date</Label>
                              <Input
                                id="exp-end"
                                type="month"
                                disabled={newExp.isCurrent}
                                value={newExp.endDate}
                                onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                              />
                            </div>
                            <div className="flex items-center gap-2 pb-2">
                              <input
                                type="checkbox"
                                id="is-current"
                                checked={newExp.isCurrent}
                                onChange={(e) => setNewExp({ ...newExp, isCurrent: e.target.checked })}
                                className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                              />
                              <Label htmlFor="is-current" className="cursor-pointer text-xs">I currently work here</Label>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="exp-desc">Description</Label>
                            <textarea
                              id="exp-desc"
                              rows={2}
                              value={newExp.description}
                              onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                              className="rounded-xl border border-input bg-card px-3 py-2 text-xs outline-none w-full"
                              placeholder="Responsibilities, achievements, and impact..."
                            />
                          </div>

                          <div className="mt-2 flex gap-2">
                            <Button type="button" size="sm" onClick={handleAddExperience} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                              Save experience
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowExpForm(false)} className="rounded-full">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Certifications Section */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Award className="size-5 text-indigo-600" />
                      <h3 className="font-semibold">Certifications ({certificationsList.length})</h3>
                    </div>
                    {!showCertForm && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCertForm(true)}
                        className="rounded-full text-xs"
                      >
                        <Plus className="mr-1 size-3.5" /> Add Certification
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    {certificationsList.map((c) => (
                      <div key={c.id} className="flex items-start justify-between rounded-xl border border-border/80 bg-background/50 p-4">
                        <div>
                          <h4 className="font-semibold text-sm">{c.name}</h4>
                          <p className="text-xs text-muted-foreground">{c.issuer} {c.issueDate ? `· ${c.issueDate}` : ''}</p>
                        </div>
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => handleRemoveCertification(c.id)} className="text-muted-foreground hover:text-rose-500">
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}

                    {showCertForm && (
                      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-4 mt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Add Certification</h4>
                        <div className="mt-3 flex flex-col gap-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <Label htmlFor="cert-name">Certification Name *</Label>
                              <Input
                                id="cert-name"
                                value={newCert.name}
                                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                                placeholder="e.g. AWS Certified Solutions Architect"
                              />
                              {errors.certName && <p className="text-xs text-rose-500 mt-1">{errors.certName}</p>}
                            </div>
                            <div>
                              <Label htmlFor="cert-issuer">Issuing Organization *</Label>
                              <Input
                                id="cert-issuer"
                                value={newCert.issuer}
                                onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                                placeholder="e.g. Amazon Web Services"
                              />
                              {errors.certIssuer && <p className="text-xs text-rose-500 mt-1">{errors.certIssuer}</p>}
                            </div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <Label htmlFor="cert-date">Issue Date (optional)</Label>
                              <Input
                                id="cert-date"
                                type="month"
                                value={newCert.issueDate}
                                onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cert-url">Credential URL (optional)</Label>
                              <Input
                                id="cert-url"
                                value={newCert.credentialUrl}
                                onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <Button type="button" size="sm" onClick={handleAddCertification} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
                              Save certification
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowCertForm(false)} className="rounded-full">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: REVIEW AND COMPLETE */}
            {currentStep === 5 && (
              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <h1 className="text-3xl font-semibold tracking-[-0.05em]">Review Your Career Profile</h1>
                  <p className="mt-2 text-muted-foreground">
                    Everything looks ready. Review your information below before finalizing onboarding.
                  </p>
                </div>

                {/* Personal Info Review Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <h3 className="font-semibold text-sm">Personal & Contact Info</h3>
                    <button type="button" onClick={() => setCurrentStep(1)} className="text-xs text-indigo-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                    <div><span className="text-muted-foreground text-xs block">Full Name:</span> <span className="font-medium">{fullName}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Headline:</span> <span className="font-medium">{headline || 'Not provided'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Location:</span> <span className="font-medium">{location || 'Not provided'}</span></div>
                    <div><span className="text-muted-foreground text-xs block">Email:</span> <span className="font-medium">{user?.email}</span></div>
                  </div>
                  {summary && (
                    <div className="mt-3 text-xs text-muted-foreground border-t border-border/50 pt-2">
                      <span className="font-medium text-foreground">Summary:</span> {summary}
                    </div>
                  )}
                </div>

                {/* Education Review Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <h3 className="font-semibold text-sm">Education ({educationList.length})</h3>
                    <button type="button" onClick={() => setCurrentStep(2)} className="text-xs text-indigo-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    {educationList.map((edu) => (
                      <div key={edu.id} className="text-sm">
                        <span className="font-medium">{edu.degree} in {edu.fieldOfStudy}</span> · <span className="text-muted-foreground">{edu.institution} ({edu.startYear} – {edu.graduationYear})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills Review Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <h3 className="font-semibold text-sm">Technical Skills ({skillsList.length})</h3>
                    <button type="button" onClick={() => setCurrentStep(3)} className="text-xs text-indigo-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillsList.map((s) => (
                      <span key={s.id} className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800">
                        {s.name} ({s.proficiency})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects & Experience Review Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <h3 className="font-semibold text-sm">Experience & Projects</h3>
                    <button type="button" onClick={() => setCurrentStep(4)} className="text-xs text-indigo-600 hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="mt-3 flex flex-col gap-3 text-sm">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">Work Experience:</span>
                      {experienceList.length === 0 ? (
                        <p className="text-xs text-muted-foreground mt-1">None added yet.</p>
                      ) : (
                        experienceList.map((exp) => (
                          <div key={exp.id} className="mt-1">
                            <span className="font-medium">{exp.jobTitle}</span> at {exp.company} ({exp.startDate} – {exp.isCurrent ? 'Present' : exp.endDate})
                          </div>
                        ))
                      )}
                    </div>
                    <div className="border-t border-border/50 pt-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Projects:</span>
                      {projectsList.length === 0 ? (
                        <p className="text-xs text-muted-foreground mt-1">None added yet.</p>
                      ) : (
                        projectsList.map((p) => (
                          <div key={p.id} className="mt-1">
                            <span className="font-medium">{p.title}</span> {p.technologies.length > 0 ? `(${p.technologies.join(', ')})` : ''}
                          </div>
                        ))
                      )}
                    </div>
                    {certificationsList.length > 0 && (
                      <div className="border-t border-border/50 pt-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Certifications:</span>
                        {certificationsList.map((c) => (
                          <div key={c.id} className="mt-1">
                            <span className="font-medium">{c.name}</span> by {c.issuer}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
              {currentStep > 1 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="rounded-full">
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <Button type="button" onClick={handleNext} className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Continue to Step {currentStep + 1} <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleComplete} className="rounded-full bg-slate-950 hover:bg-indigo-700 text-white px-8">
                  <Sparkles className="mr-2 size-4" /> Complete Onboarding
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
