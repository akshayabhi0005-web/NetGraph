'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/auth-context'
import { profileClient } from '@/lib/api-client'
import {
  User,
  GraduationCap,
  Wrench,
  Briefcase,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  ExternalLink,
  Building,
} from 'lucide-react'
import {
  EducationEntry,
  SkillEntry,
  ProjectEntry,
  ExperienceEntry,
  CertificationEntry,
  SkillCategory,
  SkillProficiency,
  SKILL_CATEGORIES,
  SKILL_PROFICIENCIES,
  POPULAR_TECH_SKILLS,
  calculateProfileCompleteness,
} from '@/lib/profile'
import {
  validateSkill,
  validateProject,
  validateExperience,
  validateEducation,
  validateCertification,
  isValidUrl,
} from '@/lib/data-validation'
import { DataQualityCard } from '@/components/data-quality-card'

type ProfileTab = 'personal' | 'education' | 'skills' | 'experience' | 'certifications'

export default function ProfilePage() {
  const { user, updateProfile, authMode, serverStatus } = useAuth()

  // Active Tab
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal')

  // Personal Info Form State
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [careerGoal, setCareerGoal] = useState('')
  const [summary, setSummary] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  // Sub-list States
  const [educationList, setEducationList] = useState<EducationEntry[]>([])
  const [skillsList, setSkillsList] = useState<SkillEntry[]>([])
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>([])
  const [projectsList, setProjectsList] = useState<ProjectEntry[]>([])
  const [certificationsList, setCertificationsList] = useState<CertificationEntry[]>([])

  // Modal / Inline Add Form States
  // Education form
  const [showEduForm, setShowEduForm] = useState(false)
  const [editingEduId, setEditingEduId] = useState<string | null>(null)
  const [eduInstitution, setEduInstitution] = useState('')
  const [eduDegree, setEduDegree] = useState('')
  const [eduField, setEduField] = useState('')
  const [eduStartYear, setEduStartYear] = useState('')
  const [eduGradYear, setEduGradYear] = useState('')
  const [eduCurrent, setEduCurrent] = useState(false)
  const [eduCoursework, setEduCoursework] = useState('')

  // Skill form
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [skillName, setSkillName] = useState('')
  const [skillCategory, setSkillCategory] = useState<SkillCategory>('Programming Languages')
  const [skillProficiency, setSkillProficiency] = useState<SkillProficiency>('Intermediate')
  const [skillYears, setSkillYears] = useState('2')

  // Experience form
  const [showExpForm, setShowExpForm] = useState(false)
  const [editingExpId, setEditingExpId] = useState<string | null>(null)
  const [expCompany, setExpCompany] = useState('')
  const [expJobTitle, setExpJobTitle] = useState('')
  const [expEmploymentType, setExpEmploymentType] = useState('Full-time')
  const [expStartDate, setExpStartDate] = useState('')
  const [expEndDate, setExpEndDate] = useState('')
  const [expIsCurrent, setExpIsCurrent] = useState(false)
  const [expDescription, setExpDescription] = useState('')
  const [expTechnologies, setExpTechnologies] = useState('')

  // Project form
  const [showProjForm, setShowProjForm] = useState(false)
  const [editingProjId, setEditingProjId] = useState<string | null>(null)
  const [projTitle, setProjTitle] = useState('')
  const [projDescription, setProjDescription] = useState('')
  const [projTech, setProjTech] = useState('')
  const [projUrl, setProjUrl] = useState('')
  const [projGithubUrl, setProjGithubUrl] = useState('')

  // Certification form
  const [showCertForm, setShowCertForm] = useState(false)
  const [certName, setCertName] = useState('')
  const [certIssuer, setCertIssuer] = useState('')
  const [certIssueDate, setCertIssueDate] = useState('')
  const [certUrl, setCertUrl] = useState('')

  // Status & Validation states
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [eduErrors, setEduErrors] = useState<Record<string, string>>({})
  const [skillErrors, setSkillErrors] = useState<Record<string, string>>({})
  const [expErrors, setExpErrors] = useState<Record<string, string>>({})
  const [expWarnings, setExpWarnings] = useState<string[]>([])
  const [projErrors, setProjErrors] = useState<Record<string, string>>({})
  const [projWarnings, setProjWarnings] = useState<string[]>([])
  const [certErrors, setCertErrors] = useState<Record<string, string>>({})

  // Initialize from user object
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setHeadline(user.headline || '')
      setCareerGoal(user.careerGoal || '')
      setSummary(user.summary || '')
      setLocation(user.location || '')
      setPhone(user.phone || '')
      setLinkedinUrl(user.linkedinUrl || '')
      setGithubUrl(user.githubUrl || '')
      setPortfolioUrl(user.portfolioUrl || '')

      setEducationList(user.education || [])
      setSkillsList(user.skillsList || [])
      setExperienceList(user.experience || [])
      setProjectsList(user.projects || [])
      setCertificationsList(user.certifications || [])
    }
  }, [user])

  // Completeness score
  const completeness = calculateProfileCompleteness({
    name,
    headline,
    careerGoal,
    summary,
    location,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    education: educationList,
    skillsList,
    experience: experienceList,
    projects: projectsList,
    certifications: certificationsList,
  })

  // Discard changes & reset to current user profile
  const handleDiscardChanges = () => {
    if (user) {
      setName(user.name || '')
      setHeadline(user.headline || '')
      setCareerGoal(user.careerGoal || '')
      setSummary(user.summary || '')
      setLocation(user.location || '')
      setPhone(user.phone || '')
      setLinkedinUrl(user.linkedinUrl || '')
      setGithubUrl(user.githubUrl || '')
      setPortfolioUrl(user.portfolioUrl || '')

      setEducationList(user.education || [])
      setSkillsList(user.skillsList || [])
      setExperienceList(user.experience || [])
      setProjectsList(user.projects || [])
      setCertificationsList(user.certifications || [])
      setFormErrors({})
      setSavedMessage('Changes reset to last saved state.')
      setTimeout(() => setSavedMessage(null), 3000)
    }
  }

  // Save full profile
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const errors: Record<string, string> = {}
    if (!name.trim()) errors.name = 'Full name is required'
    if (linkedinUrl && !isValidUrl(linkedinUrl)) errors.linkedinUrl = 'Please enter a valid URL'
    if (githubUrl && !isValidUrl(githubUrl)) errors.githubUrl = 'Please enter a valid URL'
    if (portfolioUrl && !isValidUrl(portfolioUrl)) errors.portfolioUrl = 'Please enter a valid URL'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setActiveTab('personal')
      return
    }
    setFormErrors({})

    updateProfile({
      name: name.trim(),
      headline: headline.trim(),
      careerGoal: careerGoal.trim(),
      summary: summary.trim(),
      location: location.trim(),
      phone: phone.trim(),
      linkedinUrl: linkedinUrl.trim(),
      githubUrl: githubUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
      education: educationList,
      skillsList: skillsList,
      experience: experienceList,
      projects: projectsList,
      certifications: certificationsList,
    })

    if (authMode === 'server') {
      profileClient
        .updateProfile({
          name: name.trim(),
          headline: headline.trim(),
          careerGoal: careerGoal.trim(),
          summary: summary.trim(),
          location: location.trim(),
          phone: phone.trim(),
          linkedinUrl: linkedinUrl.trim(),
          githubUrl: githubUrl.trim(),
          portfolioUrl: portfolioUrl.trim(),
        })
        .then((res) => {
          if (res.success) {
            setSavedMessage('Profile successfully saved and synchronized to PostgreSQL database!')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Profile updated in session. (PostgreSQL is offline; changes will not persist after restart)')
          } else {
            setSavedMessage(`Failed to persist profile: ${res.error || 'Server validation error'}`)
          }
        })
        .catch(() => {
          setSavedMessage('Profile updated in session (network connection to server failed).')
        })
    } else {
      setSavedMessage('Profile successfully updated in demo session!')
    }
    setTimeout(() => setSavedMessage(null), 4000)
  }

  // Education Handlers
  const openAddEdu = () => {
    setEditingEduId(null)
    setEduInstitution('')
    setEduDegree('')
    setEduField('')
    setEduStartYear('')
    setEduGradYear('')
    setEduCurrent(false)
    setEduCoursework('')
    setEduErrors({})
    setShowEduForm(true)
  }

  const openEditEdu = (item: EducationEntry) => {
    setEditingEduId(item.id)
    setEduInstitution(item.institution)
    setEduDegree(item.degree)
    setEduField(item.fieldOfStudy)
    setEduStartYear(String(item.startYear))
    setEduGradYear(String(item.graduationYear))
    setEduCurrent(String(item.graduationYear) === 'Present')
    setEduCoursework(item.coursework || '')
    setEduErrors({})
    setShowEduForm(true)
  }

  const saveEduEntry = () => {
    const check = validateEducation({
      institution: eduInstitution,
      degree: eduDegree,
      fieldOfStudy: eduField,
      startYear: eduStartYear,
      graduationYear: eduCurrent ? 'Present' : eduGradYear,
      coursework: eduCoursework,
    })

    if (!check.valid) {
      setEduErrors(check.errors)
      return
    }
    setEduErrors({})

    const entry: EducationEntry = {
      id: editingEduId || `edu_${Date.now()}`,
      institution: eduInstitution.trim(),
      degree: eduDegree.trim(),
      fieldOfStudy: eduField.trim(),
      startYear: eduStartYear.trim(),
      graduationYear: eduCurrent ? 'Present' : eduGradYear.trim(),
      coursework: eduCoursework.trim() || undefined,
    }

    const updated = editingEduId
      ? educationList.map((item) => (item.id === editingEduId ? entry : item))
      : [...educationList, entry]

    setEducationList(updated)
    setShowEduForm(false)
    updateProfile({ education: updated })

    if (authMode === 'server') {
      profileClient
        .addEducation({
          id: editingEduId || undefined,
          institution: entry.institution,
          degree: entry.degree,
          fieldOfStudy: entry.fieldOfStudy,
          startYear: parseInt(String(entry.startYear)) || 2020,
          graduationYear: entry.graduationYear === 'Present' ? new Date().getFullYear() : (parseInt(String(entry.graduationYear)) || new Date().getFullYear()),
          coursework: entry.coursework,
        })
        .then((res) => {
          if (res.success) {
            setSavedMessage('Education entry saved to database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Education saved in session (PostgreSQL is offline).')
          } else {
            setSavedMessage(`Failed to save education: ${res.error || 'Server error'}`)
          }
        })
        .catch(() => setSavedMessage('Failed to save education: Network error.'))
    } else {
      setSavedMessage('Education entry saved.')
    }
    setTimeout(() => setSavedMessage(null), 3500)
  }

  const removeEduEntry = (id: string) => {
    const updated = educationList.filter((item) => item.id !== id)
    setEducationList(updated)
    updateProfile({ education: updated })

    if (authMode === 'server') {
      profileClient
        .deleteEducation(id)
        .then((res) => {
          if (res.success) {
            setSavedMessage('Education removed from database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Education removed in session (PostgreSQL offline).')
          }
        })
        .catch((err) => console.error('Failed to delete education:', err))
    } else {
      setSavedMessage('Education removed.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  // Skill Handlers
  const addSkillEntry = () => {
    const check = validateSkill(skillName, skillsList)
    if (!check.valid) {
      setSkillErrors(check.errors)
      return
    }
    setSkillErrors({})

    const newSkill: SkillEntry = {
      id: `sk_${Date.now()}`,
      name: skillName.trim(),
      category: skillCategory,
      proficiency: skillProficiency,
      yearsOfExperience: parseInt(skillYears) || 1,
    }

    const updated = [...skillsList, newSkill]
    setSkillsList(updated)
    setSkillName('')
    setShowSkillForm(false)
    updateProfile({ skillsList: updated })

    if (authMode === 'server') {
      profileClient
        .addOrUpdateSkill({
          name: newSkill.name,
          category: newSkill.category,
          proficiency: newSkill.proficiency,
          yearsOfExperience: newSkill.yearsOfExperience,
        })
        .then((res) => {
          if (res.success) {
            setSavedMessage(`"${newSkill.name}" saved to database skills.`)
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage(`"${newSkill.name}" saved in session (PostgreSQL is offline).`)
          } else {
            setSavedMessage(`Failed to persist skill: ${res.error || 'Server error'}`)
          }
        })
        .catch(() => setSavedMessage(`"${newSkill.name}" saved in session (network error).`))
    } else {
      setSavedMessage(`Added "${newSkill.name}" to skills.`)
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const addQuickSkill = (skill: (typeof POPULAR_TECH_SKILLS)[0]) => {
    const check = validateSkill(skill.name, skillsList)
    if (!check.valid) return
    const newSkill: SkillEntry = {
      id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: skill.name,
      category: skill.category,
      proficiency: 'Intermediate',
      yearsOfExperience: 2,
    }
    const updated = [...skillsList, newSkill]
    setSkillsList(updated)
    updateProfile({ skillsList: updated })

    if (authMode === 'server') {
      profileClient
        .addOrUpdateSkill({
          name: newSkill.name,
          category: newSkill.category,
          proficiency: newSkill.proficiency,
          yearsOfExperience: newSkill.yearsOfExperience,
        })
        .then((res) => {
          if (res.success) {
            setSavedMessage(`"${newSkill.name}" added to database.`)
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage(`"${newSkill.name}" saved in session (PostgreSQL offline).`)
          }
        })
        .catch((err) => console.error('Failed to sync skill:', err))
    } else {
      setSavedMessage(`Added "${newSkill.name}" to skills.`)
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const removeSkillEntry = (id: string) => {
    const updated = skillsList.filter((s) => s.id !== id)
    setSkillsList(updated)
    updateProfile({ skillsList: updated })

    if (authMode === 'server') {
      profileClient
        .deleteSkill(id)
        .then((res) => {
          if (res.success) {
            setSavedMessage('Skill removed from database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Skill removed in session (PostgreSQL offline).')
          }
        })
        .catch((err) => console.error('Failed to delete skill:', err))
    } else {
      setSavedMessage('Skill removed.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  // Experience Handlers
  const openAddExp = () => {
    setEditingExpId(null)
    setExpCompany('')
    setExpJobTitle('')
    setExpEmploymentType('Full-time')
    setExpStartDate('')
    setExpEndDate('')
    setExpIsCurrent(false)
    setExpDescription('')
    setExpTechnologies('')
    setExpErrors({})
    setExpWarnings([])
    setShowExpForm(true)
  }

  const openEditExp = (item: ExperienceEntry) => {
    setEditingExpId(item.id)
    setExpCompany(item.company)
    setExpJobTitle(item.jobTitle)
    setExpEmploymentType(item.employmentType || 'Full-time')
    setExpStartDate(item.startDate)
    setExpEndDate(item.endDate || '')
    setExpIsCurrent(!!item.isCurrent)
    setExpDescription(item.description)
    setExpTechnologies((item.technologies || []).join(', '))
    setExpErrors({})
    setExpWarnings([])
    setShowExpForm(true)
  }

  const saveExpEntry = () => {
    const techArray = expTechnologies.split(',').map((s) => s.trim()).filter(Boolean)
    const check = validateExperience({
      company: expCompany,
      jobTitle: expJobTitle,
      startDate: expStartDate,
      endDate: expIsCurrent ? 'Present' : expEndDate,
      isCurrent: expIsCurrent,
      description: expDescription,
      technologies: techArray,
    })

    if (!check.valid) {
      setExpErrors(check.errors)
      setExpWarnings(check.warnings)
      return
    }
    setExpErrors({})
    setExpWarnings(check.warnings)

    const entry: ExperienceEntry = {
      id: editingExpId || `exp_${Date.now()}`,
      company: expCompany.trim(),
      jobTitle: expJobTitle.trim(),
      employmentType: expEmploymentType.trim(),
      startDate: expStartDate.trim(),
      endDate: expIsCurrent ? 'Present' : expEndDate.trim(),
      isCurrent: expIsCurrent,
      description: expDescription.trim(),
      technologies: techArray,
    }

    const updated = editingExpId
      ? experienceList.map((item) => (item.id === editingExpId ? entry : item))
      : [...experienceList, entry]

    setExperienceList(updated)
    setShowExpForm(false)
    updateProfile({ experience: updated })

    if (authMode === 'server') {
      profileClient
        .addExperience({
          id: editingExpId || undefined,
          company: entry.company,
          jobTitle: entry.jobTitle,
          employmentType: entry.employmentType,
          startDate: entry.startDate,
          endDate: entry.endDate,
          isCurrent: entry.isCurrent,
          description: entry.description,
          technologies: entry.technologies,
        })
        .then((res) => {
          if (res.success) {
            setSavedMessage('Work experience saved to database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Work experience saved in session (PostgreSQL offline).')
          } else {
            setSavedMessage(`Failed to save experience: ${res.error || 'Server error'}`)
          }
        })
        .catch(() => setSavedMessage('Experience saved in session (network error).'))
    } else {
      setSavedMessage('Work experience saved.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const removeExpEntry = (id: string) => {
    const updated = experienceList.filter((item) => item.id !== id)
    setExperienceList(updated)
    updateProfile({ experience: updated })

    if (authMode === 'server') {
      profileClient
        .deleteExperience(id)
        .then((res) => {
          if (res.success) {
            setSavedMessage('Experience removed from database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Experience removed in session (PostgreSQL offline).')
          }
        })
        .catch((err) => console.error('Failed to delete experience:', err))
    } else {
      setSavedMessage('Experience removed.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  // Project Handlers
  const openAddProj = () => {
    setEditingProjId(null)
    setProjTitle('')
    setProjDescription('')
    setProjTech('')
    setProjUrl('')
    setProjGithubUrl('')
    setProjErrors({})
    setProjWarnings([])
    setShowProjForm(true)
  }

  const openEditProj = (item: ProjectEntry) => {
    setEditingProjId(item.id)
    setProjTitle(item.title)
    setProjDescription(item.description)
    setProjTech(item.technologies.join(', '))
    setProjUrl(item.projectUrl || '')
    setProjGithubUrl(item.githubUrl || '')
    setProjErrors({})
    setProjWarnings([])
    setShowProjForm(true)
  }

  const saveProjEntry = () => {
    const techArray = projTech.split(',').map((t) => t.trim()).filter(Boolean)
    const check = validateProject({
      title: projTitle,
      description: projDescription,
      technologies: techArray,
      projectUrl: projUrl,
      githubUrl: projGithubUrl,
    })

    if (!check.valid) {
      setProjErrors(check.errors)
      setProjWarnings(check.warnings)
      return
    }
    setProjErrors({})
    setProjWarnings(check.warnings)

    const entry: ProjectEntry = {
      id: editingProjId || `proj_${Date.now()}`,
      title: projTitle.trim(),
      description: projDescription.trim(),
      technologies: techArray,
      projectUrl: projUrl.trim() || undefined,
      githubUrl: projGithubUrl.trim() || undefined,
    }

    const updated = editingProjId
      ? projectsList.map((item) => (item.id === editingProjId ? entry : item))
      : [...projectsList, entry]

    setProjectsList(updated)
    setShowProjForm(false)
    updateProfile({ projects: updated })

    if (authMode === 'server') {
      profileClient
        .addProject({
          id: editingProjId || undefined,
          title: entry.title,
          description: entry.description,
          technologies: entry.technologies,
          projectUrl: entry.projectUrl,
          githubUrl: entry.githubUrl,
        })
        .then((res) => {
          if (res.success) {
            setSavedMessage('Project saved to database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Project saved in session (PostgreSQL offline).')
          } else {
            setSavedMessage(`Failed to save project: ${res.error || 'Server error'}`)
          }
        })
        .catch(() => setSavedMessage('Project saved in session (network error).'))
    } else {
      setSavedMessage('Project saved.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const removeProjEntry = (id: string) => {
    const updated = projectsList.filter((p) => p.id !== id)
    setProjectsList(updated)
    updateProfile({ projects: updated })

    if (authMode === 'server') {
      profileClient
        .deleteProject(id)
        .then((res) => {
          if (res.success) {
            setSavedMessage('Project removed from database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Project removed in session (PostgreSQL offline).')
          }
        })
        .catch((err) => console.error('Failed to delete project:', err))
    } else {
      setSavedMessage('Project removed.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  // Certification Handlers
  const openAddCert = () => {
    setCertName('')
    setCertIssuer('')
    setCertIssueDate('')
    setCertUrl('')
    setCertErrors({})
    setShowCertForm(true)
  }

  const saveCertEntry = () => {
    const check = validateCertification({
      name: certName,
      issuer: certIssuer,
      credentialUrl: certUrl,
      issueDate: certIssueDate,
    })

    if (!check.valid) {
      setCertErrors(check.errors)
      return
    }
    setCertErrors({})

    const entry: CertificationEntry = {
      id: `cert_${Date.now()}`,
      name: certName.trim(),
      issuer: certIssuer.trim(),
      issueDate: certIssueDate.trim() || undefined,
      credentialUrl: certUrl.trim() || undefined,
    }

    const updated = [...certificationsList, entry]
    setCertificationsList(updated)
    setCertName('')
    setCertIssuer('')
    setCertIssueDate('')
    setCertUrl('')
    setShowCertForm(false)
    updateProfile({ certifications: updated })

    if (authMode === 'server') {
      profileClient
        .addCertification({
          name: entry.name,
          issuer: entry.issuer,
          issueDate: entry.issueDate,
          credentialUrl: entry.credentialUrl,
        })
        .then((res) => {
          if (res.success) {
            setSavedMessage('Certification added to database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Certification added in session (PostgreSQL offline).')
          } else {
            setSavedMessage(`Failed to save certification: ${res.error || 'Server error'}`)
          }
        })
        .catch(() => setSavedMessage('Certification saved in session (network error).'))
    } else {
      setSavedMessage('Certification added.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  const removeCertEntry = (id: string) => {
    const updated = certificationsList.filter((c) => c.id !== id)
    setCertificationsList(updated)
    updateProfile({ certifications: updated })

    if (authMode === 'server') {
      profileClient
        .deleteCertification(id)
        .then((res) => {
          if (res.success) {
            setSavedMessage('Certification removed from database.')
          } else if (res.isDatabaseUnavailable) {
            setSavedMessage('Certification removed in session (PostgreSQL offline).')
          }
        })
        .catch((err) => console.error('Failed to delete certification:', err))
    } else {
      setSavedMessage('Certification removed.')
    }
    setTimeout(() => setSavedMessage(null), 3000)
  }

  return (
    <AppShell title="Profile">
      <div className="mx-auto max-w-5xl">
        {/* Onboarding Alert Banner if incomplete */}
        {!user?.onboarded && (
          <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Guided Onboarding Available</h3>
                <p className="text-sm text-slate-600">
                  Complete the 5-step guided profile setup to quickly build your career graph.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
              <Link href="/onboarding">Resume Onboarding &rarr;</Link>
            </Button>
          </div>
        )}

        {/* Success / Status Notification */}
        {savedMessage && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-xs animate-in fade-in">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-2xl text-white shadow-md">
                {name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {name || 'Your Profile'}
                  </h1>
                  {user?.onboarded && (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Onboarded
                    </Badge>
                  )}
                  {authMode === 'server' && (
                    <Badge
                      variant="secondary"
                      className={
                        serverStatus === 'database_unavailable'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }
                    >
                      {serverStatus === 'database_unavailable' ? 'Session (DB Offline)' : 'PostgreSQL Synced'}
                    </Badge>
                  )}
                  {authMode === 'demo' && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
                      Demo Mode
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {headline || 'Professional headline not set'} · {location || 'Location not set'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
            </div>

            {/* Profile Completeness Pill & Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-border bg-muted/40 p-3.5 text-center sm:min-w-[140px]">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Sparkles className="size-3.5 text-indigo-500" />
                  Completeness
                </div>
                <p className="mt-1 text-2xl font-bold text-indigo-600">{completeness}%</p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscardChanges}
                  className="rounded-full"
                  title="Discard unsaved edits"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSaveProfile()}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Save Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-border pb-px scrollbar-none">
            {[
              { id: 'personal', label: 'Personal Info', icon: User, count: null },
              { id: 'education', label: 'Education', icon: GraduationCap, count: educationList.length },
              { id: 'skills', label: 'Skills', icon: Wrench, count: skillsList.length },
              { id: 'experience', label: 'Experience & Projects', icon: Briefcase, count: experienceList.length + projectsList.length },
              { id: 'certifications', label: 'Certifications', icon: Award, count: certificationsList.length },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Profile Data Quality & Mining Health Status */}
        <div className="mt-6">
          <DataQualityCard
            profile={{
              name,
              headline,
              careerGoal,
              summary,
              location,
              phone,
              linkedinUrl,
              githubUrl,
              portfolioUrl,
              education: educationList,
              skillsList,
              skills: skillsList.map((s) => s.name),
              experience: experienceList,
              projects: projectsList,
              certifications: certificationsList,
            }}
          />
        </div>

        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <p className="text-sm text-muted-foreground">
                  Update your identity, contact channels, and career focus.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="mt-6 flex flex-col gap-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="p_name">Full Name *</Label>
                  <Input
                    id="p_name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                  />
                  {formErrors.name && (
                    <span className="text-xs text-rose-500">{formErrors.name}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="p_email">Email Address</Label>
                  <Input
                    id="p_email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Connected to your NETGRAPH account.
                  </span>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="p_headline">Professional Headline</Label>
                  <Input
                    id="p_headline"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Product & Data Analyst"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="p_location">Current Location</Label>
                  <Input
                    id="p_location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA or Remote"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="p_careerGoal">Primary Career Goal</Label>
                  <Input
                    id="p_careerGoal"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Transition into Senior AI/ML Engineering"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="p_phone">Phone Number (Optional)</Label>
                  <Input
                    id="p_phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="p_summary">Professional Summary / About</Label>
                <textarea
                  id="p_summary"
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summarize your key strengths, domain focus, and career vision..."
                  className="rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-slate-800">Online Profiles & Links</h3>
                <div className="mt-4 grid gap-5 sm:grid-cols-3">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="p_linkedin" className="text-xs">
                      LinkedIn URL
                    </Label>
                    <Input
                      id="p_linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                    {formErrors.linkedinUrl && (
                      <span className="text-xs text-rose-500">{formErrors.linkedinUrl}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="p_github" className="text-xs">
                      GitHub URL
                    </Label>
                    <Input
                      id="p_github"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                    {formErrors.githubUrl && (
                      <span className="text-xs text-rose-500">{formErrors.githubUrl}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="p_portfolio" className="text-xs">
                      Portfolio / Website
                    </Label>
                    <Input
                      id="p_portfolio"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                    {formErrors.portfolioUrl && (
                      <span className="text-xs text-rose-500">{formErrors.portfolioUrl}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save Personal Info
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: EDUCATION */}
        {activeTab === 'education' && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold">Education History</h2>
                <p className="text-sm text-muted-foreground">
                  Degrees, institutions, and relevant academic background.
                </p>
              </div>
              <Button
                onClick={openAddEdu}
                size="sm"
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="size-4 mr-1.5" /> Add Degree
              </Button>
            </div>

            {/* Modal / Inline Education Form */}
            {showEduForm && (
              <div className="my-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6">
                <h3 className="font-semibold text-slate-900">
                  {editingEduId ? 'Edit Education Entry' : 'Add Education Entry'}
                </h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edu_inst">Institution / University *</Label>
                    <Input
                      id="edu_inst"
                      value={eduInstitution}
                      onChange={(e) => setEduInstitution(e.target.value)}
                      placeholder="e.g. University of Toronto"
                      className="mt-1.5 bg-card"
                    />
                    {eduErrors.institution && (
                      <span className="text-xs text-rose-500 mt-1 block">{eduErrors.institution}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edu_deg">Degree *</Label>
                    <Input
                      id="edu_deg"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      placeholder="e.g. Bachelor of Science"
                      className="mt-1.5 bg-card"
                    />
                    {eduErrors.degree && (
                      <span className="text-xs text-rose-500 mt-1 block">{eduErrors.degree}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edu_fld">Field of Study *</Label>
                    <Input
                      id="edu_fld"
                      value={eduField}
                      onChange={(e) => setEduField(e.target.value)}
                      placeholder="e.g. Computer Science & Statistics"
                      className="mt-1.5 bg-card"
                    />
                    {eduErrors.fieldOfStudy && (
                      <span className="text-xs text-rose-500 mt-1 block">{eduErrors.fieldOfStudy}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edu_sy">Start Year *</Label>
                    <Input
                      id="edu_sy"
                      value={eduStartYear}
                      onChange={(e) => setEduStartYear(e.target.value)}
                      placeholder="e.g. 2020"
                      className="mt-1.5 bg-card"
                    />
                    {eduErrors.startYear && (
                      <span className="text-xs text-rose-500 mt-1 block">{eduErrors.startYear}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edu_ey">Graduation Year</Label>
                    <Input
                      id="edu_ey"
                      value={eduGradYear}
                      disabled={eduCurrent}
                      onChange={(e) => setEduGradYear(e.target.value)}
                      placeholder="e.g. 2024"
                      className="mt-1.5 bg-card"
                    />
                    {eduErrors.graduationYear && (
                      <span className="text-xs text-rose-500 mt-1 block">{eduErrors.graduationYear}</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edu_curr"
                    checked={eduCurrent}
                    onChange={(e) => setEduCurrent(e.target.checked)}
                    className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="edu_curr" className="cursor-pointer text-xs font-medium">
                    I am currently studying here
                  </Label>
                </div>

                <div className="mt-4">
                  <Label htmlFor="edu_cw">Relevant Coursework</Label>
                  <Input
                    id="edu_cw"
                    value={eduCoursework}
                    onChange={(e) => setEduCoursework(e.target.value)}
                    placeholder="e.g. Data Structures, Database Systems, Machine Learning"
                    className="mt-1.5 bg-card"
                  />
                </div>

                <div className="mt-5 flex justify-end gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setShowEduForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveEduEntry} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Entry
                  </Button>
                </div>
              </div>
            )}

            {/* Education List */}
            <div className="mt-6 flex flex-col gap-4">
              {educationList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                  <GraduationCap className="mx-auto size-9 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-medium text-slate-700">No education entries added yet</p>
                  <p className="text-xs text-muted-foreground">
                    Add your university, degrees, or continuing education credentials.
                  </p>
                  <Button
                    onClick={openAddEdu}
                    size="sm"
                    variant="outline"
                    className="mt-4 rounded-full"
                  >
                    Add your first degree
                  </Button>
                </div>
              ) : (
                educationList.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-indigo-200 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <GraduationCap className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {item.degree} in {item.fieldOfStudy}
                        </h4>
                        <p className="text-sm text-slate-600">{item.institution}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.startYear} — {item.graduationYear || 'N/A'}
                        </p>
                        {item.coursework && (
                          <p className="mt-2 text-xs text-slate-600">
                            Coursework: {item.coursework}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditEdu(item)}
                        className="text-slate-600 hover:text-indigo-600"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEduEntry(item.id)}
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICAL SKILLS */}
        {activeTab === 'skills' && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold">Technical & Domain Skills</h2>
                <p className="text-sm text-muted-foreground">
                  Skills power your career graph node positions, edges, and job match percentages.
                </p>
              </div>
              <Button
                onClick={() => setShowSkillForm(true)}
                size="sm"
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="size-4 mr-1.5" /> Add Skill
              </Button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Add Popular Skills:
              </span>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {POPULAR_TECH_SKILLS.map((pop) => {
                  const added = skillsList.some(
                    (s) => s.name.toLowerCase() === pop.name.toLowerCase()
                  )
                  return (
                    <button
                      key={pop.name}
                      type="button"
                      disabled={added}
                      onClick={() => addQuickSkill(pop)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                        added
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-60 cursor-default'
                          : 'bg-card border border-border text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                      }`}
                    >
                      {pop.name} {added ? '✓' : '+'}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Add Custom Skill Form */}
            {showSkillForm && (
              <div className="my-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6">
                <h3 className="font-semibold text-slate-900">Add Technical Skill</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="sk_name">Skill Name *</Label>
                    <Input
                      id="sk_name"
                      value={skillName}
                      onChange={(e) => setSkillName(e.target.value)}
                      placeholder="e.g. Kubernetes, React, GraphQL"
                      className="mt-1.5 bg-card"
                    />
                    {skillErrors.name && (
                      <span className="text-xs text-rose-500 mt-1 block">{skillErrors.name}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="sk_cat">Category</Label>
                    <select
                      id="sk_cat"
                      value={skillCategory}
                      onChange={(e) => setSkillCategory(e.target.value as SkillCategory)}
                      className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      {SKILL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="sk_prof">Proficiency Level</Label>
                    <select
                      id="sk_prof"
                      value={skillProficiency}
                      onChange={(e) => setSkillProficiency(e.target.value as SkillProficiency)}
                      className="mt-1.5 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      {SKILL_PROFICIENCIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 max-w-xs">
                  <Label htmlFor="sk_yrs">Years of Experience</Label>
                  <Input
                    id="sk_yrs"
                    type="number"
                    min="1"
                    max="40"
                    value={skillYears}
                    onChange={(e) => setSkillYears(e.target.value)}
                    className="mt-1.5 bg-card"
                  />
                  {skillErrors.yearsOfExperience && (
                    <span className="text-xs text-rose-500 mt-1 block">{skillErrors.yearsOfExperience}</span>
                  )}
                </div>

                <div className="mt-5 flex justify-end gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setShowSkillForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addSkillEntry} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Skill
                  </Button>
                </div>
              </div>
            )}

            {/* Skills Grouped by Category */}
            <div className="mt-6 flex flex-col gap-6">
              {skillsList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                  <Wrench className="mx-auto size-9 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-medium text-slate-700">No skills added yet</p>
                  <p className="text-xs text-muted-foreground">
                    Add languages, frameworks, or tools to generate your 3D graph connections.
                  </p>
                </div>
              ) : (
                SKILL_CATEGORIES.map((cat) => {
                  const items = skillsList.filter((s) => s.category === cat)
                  if (items.length === 0) return null
                  return (
                    <div key={cat} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-900">{cat}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                            {items.length}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-xs hover:border-indigo-200"
                          >
                            <div>
                              <p className="font-medium text-sm text-slate-900">{skill.name}</p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700 capitalize">
                                  {skill.proficiency}
                                </span>
                                {skill.yearsOfExperience && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {skill.yearsOfExperience} yr{skill.yearsOfExperience > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkillEntry(skill.id)}
                              className="size-8 p-0 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: EXPERIENCE & PROJECTS */}
        {activeTab === 'experience' && (
          <div className="mt-6 flex flex-col gap-6">
            {/* Work Experience Section */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-semibold">Work Experience</h2>
                  <p className="text-sm text-muted-foreground">
                    Chronological positions and leadership history.
                  </p>
                </div>
                <Button
                  onClick={openAddExp}
                  size="sm"
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="size-4 mr-1.5" /> Add Experience
                </Button>
              </div>

              {/* Experience Form */}
              {showExpForm && (
                <div className="my-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6">
                  <h3 className="font-semibold text-slate-900">
                    {editingExpId ? 'Edit Work Experience' : 'Add Work Experience'}
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="exp_comp">Company / Organization *</Label>
                      <Input
                        id="exp_comp"
                        value={expCompany}
                        onChange={(e) => setExpCompany(e.target.value)}
                        placeholder="e.g. Acme Tech"
                        className="mt-1.5 bg-card"
                      />
                      {expErrors.company && (
                        <span className="text-xs text-rose-500 mt-1 block">{expErrors.company}</span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="exp_rl">Job Title / Role *</Label>
                      <Input
                        id="exp_rl"
                        value={expJobTitle}
                        onChange={(e) => setExpJobTitle(e.target.value)}
                        placeholder="e.g. Product Analyst"
                        className="mt-1.5 bg-card"
                      />
                      {expErrors.jobTitle && (
                        <span className="text-xs text-rose-500 mt-1 block">{expErrors.jobTitle}</span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="exp_sd">Start Date *</Label>
                      <Input
                        id="exp_sd"
                        value={expStartDate}
                        onChange={(e) => setExpStartDate(e.target.value)}
                        placeholder="e.g. 2022"
                        className="mt-1.5 bg-card"
                      />
                      {expErrors.startDate && (
                        <span className="text-xs text-rose-500 mt-1 block">{expErrors.startDate}</span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="exp_ed">End Date</Label>
                      <Input
                        id="exp_ed"
                        value={expEndDate}
                        disabled={expIsCurrent}
                        onChange={(e) => setExpEndDate(e.target.value)}
                        placeholder="e.g. 2024"
                        className="mt-1.5 bg-card"
                      />
                      {expErrors.endDate && (
                        <span className="text-xs text-rose-500 mt-1 block">{expErrors.endDate}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="exp_curr"
                      checked={expIsCurrent}
                      onChange={(e) => setExpIsCurrent(e.target.checked)}
                      className="rounded border-input text-indigo-600 focus:ring-indigo-500"
                    />
                    <Label htmlFor="exp_curr" className="cursor-pointer text-xs font-medium">
                      I currently work in this role
                    </Label>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="exp_desc">Role Responsibilities & Achievements *</Label>
                    <textarea
                      id="exp_desc"
                      rows={3}
                      value={expDescription}
                      onChange={(e) => setExpDescription(e.target.value)}
                      placeholder="Describe what you built, analyzed, or managed..."
                      className="mt-1.5 w-full rounded-2xl border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    {expErrors.description && (
                      <span className="text-xs text-rose-500 mt-1 block">{expErrors.description}</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <Label htmlFor="exp_sk">Technologies & Tools Used (comma separated)</Label>
                    <Input
                      id="exp_sk"
                      value={expTechnologies}
                      onChange={(e) => setExpTechnologies(e.target.value)}
                      placeholder="e.g. Python, SQL, Tableau, Metric Design"
                      className="mt-1.5 bg-card"
                    />
                    {expWarnings.map((w, i) => (
                      <span key={i} className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                        {w}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-end gap-2.5">
                    <Button variant="outline" size="sm" onClick={() => setShowExpForm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveExpEntry} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Save Experience
                    </Button>
                  </div>
                </div>
              )}

              {/* Experience Items */}
              <div className="mt-6 flex flex-col gap-4">
                {experienceList.length === 0 ? (
                  <p className="text-center py-6 text-sm text-muted-foreground">
                    No work experience entries recorded yet.
                  </p>
                ) : (
                  experienceList.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-indigo-200 sm:flex-row sm:items-start"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <Building className="size-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{item.jobTitle}</h4>
                          <p className="text-sm font-medium text-slate-700">{item.company}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.startDate} — {item.isCurrent ? 'Present' : item.endDate || 'N/A'}
                            {item.employmentType && ` · ${item.employmentType}`}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-slate-600 whitespace-pre-line">
                            {item.description}
                          </p>
                          {item.technologies && item.technologies.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {item.technologies.map((s, i) => (
                                <Badge key={i} variant="secondary" className="text-[11px] font-normal">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditExp(item)}
                          className="text-slate-600 hover:text-indigo-600"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExpEntry(item.id)}
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Featured Projects Section */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-xl font-semibold">Key Projects</h2>
                  <p className="text-sm text-muted-foreground">
                    Hands-on portfolio projects showing applied knowledge.
                  </p>
                </div>
                <Button
                  onClick={openAddProj}
                  size="sm"
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="size-4 mr-1.5" /> Add Project
                </Button>
              </div>

              {/* Project Form */}
              {showProjForm && (
                <div className="my-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6">
                  <h3 className="font-semibold text-slate-900">
                    {editingProjId ? 'Edit Project' : 'Add Project'}
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="pj_tt">Project Title *</Label>
                      <Input
                        id="pj_tt"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        placeholder="e.g. Customer Churn Graph Predictor"
                        className="mt-1.5 bg-card"
                      />
                      {projErrors.title && (
                        <span className="text-xs text-rose-500 mt-1 block">{projErrors.title}</span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pj_lv">Live Demo URL (Optional)</Label>
                      <Input
                        id="pj_lv"
                        value={projUrl}
                        onChange={(e) => setProjUrl(e.target.value)}
                        placeholder="https://..."
                        className="mt-1.5 bg-card"
                      />
                      {projErrors.projectUrl && (
                        <span className="text-xs text-rose-500 mt-1 block">{projErrors.projectUrl}</span>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pj_gh">GitHub Repo URL (Optional)</Label>
                      <Input
                        id="pj_gh"
                        value={projGithubUrl}
                        onChange={(e) => setProjGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="mt-1.5 bg-card"
                      />
                      {projErrors.githubUrl && (
                        <span className="text-xs text-rose-500 mt-1 block">{projErrors.githubUrl}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="pj_desc">Project Description *</Label>
                    <textarea
                      id="pj_desc"
                      rows={3}
                      value={projDescription}
                      onChange={(e) => setProjDescription(e.target.value)}
                      placeholder="Explain the problem solved, architecture, and impact..."
                      className="mt-1.5 w-full rounded-2xl border border-input bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    {projErrors.description && (
                      <span className="text-xs text-rose-500 mt-1 block">{projErrors.description}</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <Label htmlFor="pj_tch">Technologies Used (comma separated)</Label>
                    <Input
                      id="pj_tch"
                      value={projTech}
                      onChange={(e) => setProjTech(e.target.value)}
                      placeholder="e.g. Next.js, Three.js, Python, Scikit-learn"
                      className="mt-1.5 bg-card"
                    />
                    {projWarnings.map((w, i) => (
                      <span key={i} className="text-xs text-amber-600 dark:text-amber-400 mt-1 block">
                        {w}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex justify-end gap-2.5">
                    <Button variant="outline" size="sm" onClick={() => setShowProjForm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={saveProjEntry} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      Save Project
                    </Button>
                  </div>
                </div>
              )}

              {/* Project Items */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {projectsList.length === 0 ? (
                  <p className="col-span-2 text-center py-6 text-sm text-muted-foreground">
                    No projects added yet.
                  </p>
                ) : (
                  projectsList.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-indigo-200"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-slate-900">{item.title}</h4>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditProj(item)}
                              className="size-7 p-0 text-slate-500 hover:text-indigo-600"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProjEntry(item.id)}
                              className="size-7 p-0 text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-slate-600 line-clamp-3">
                          {item.description}
                        </p>
                        {item.technologies && item.technologies.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {item.technologies.map((t, i) => (
                              <Badge key={i} variant="outline" className="text-[10px]">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {(item.projectUrl || item.githubUrl) && (
                        <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
                          {item.projectUrl && (
                            <a
                              href={item.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                            >
                              <ExternalLink className="size-3" /> Live Demo
                            </a>
                          )}
                          {item.githubUrl && (
                            <a
                              href={item.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:underline"
                            >
                              <LinkIcon className="size-3" /> GitHub
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CERTIFICATIONS */}
        {activeTab === 'certifications' && (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-xs md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold">Certifications & Credentials</h2>
                <p className="text-sm text-muted-foreground">
                  Industry certificates, licenses, and verified accreditations.
                </p>
              </div>
              <Button
                onClick={openAddCert}
                size="sm"
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="size-4 mr-1.5" /> Add Certification
              </Button>
            </div>

            {/* Certification Form */}
            {showCertForm && (
              <div className="my-6 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6">
                <h3 className="font-semibold text-slate-900">Add Certification</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="crt_nm">Certification Name *</Label>
                    <Input
                      id="crt_nm"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="mt-1.5 bg-card"
                    />
                    {certErrors.name && (
                      <span className="text-xs text-rose-500 mt-1 block">{certErrors.name}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="crt_iss">Issuing Body / Organization *</Label>
                    <Input
                      id="crt_iss"
                      value={certIssuer}
                      onChange={(e) => setCertIssuer(e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                      className="mt-1.5 bg-card"
                    />
                    {certErrors.issuer && (
                      <span className="text-xs text-rose-500 mt-1 block">{certErrors.issuer}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="crt_dt">Issue Date</Label>
                    <Input
                      id="crt_dt"
                      value={certIssueDate}
                      onChange={(e) => setCertIssueDate(e.target.value)}
                      placeholder="e.g. 2023-11"
                      className="mt-1.5 bg-card"
                    />
                    {certErrors.issueDate && (
                      <span className="text-xs text-rose-500 mt-1 block">{certErrors.issueDate}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="crt_url">Credential Verification URL (Optional)</Label>
                    <Input
                      id="crt_url"
                      value={certUrl}
                      onChange={(e) => setCertUrl(e.target.value)}
                      placeholder="https://..."
                      className="mt-1.5 bg-card"
                    />
                    {certErrors.credentialUrl && (
                      <span className="text-xs text-rose-500 mt-1 block">{certErrors.credentialUrl}</span>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex justify-end gap-2.5">
                  <Button variant="outline" size="sm" onClick={() => setShowCertForm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveCertEntry} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Certification
                  </Button>
                </div>
              </div>
            )}

            {/* Certifications List */}
            <div className="mt-6 flex flex-col gap-4">
              {certificationsList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center">
                  <Award className="mx-auto size-9 text-muted-foreground/60" />
                  <p className="mt-3 text-sm font-medium text-slate-700">No certifications recorded</p>
                  <p className="text-xs text-muted-foreground">
                    Add certificates from AWS, Coursera, Google, Microsoft, etc.
                  </p>
                </div>
              ) : (
                certificationsList.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-indigo-200 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Award className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.name}</h4>
                        <p className="text-sm text-slate-600">{item.issuer}</p>
                        {item.issueDate && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Issued {item.issueDate}
                          </p>
                        )}
                        {item.credentialUrl && (
                          <a
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
                          >
                            <ExternalLink className="size-3" /> Verify Credential
                          </a>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertEntry(item.id)}
                      className="self-end text-rose-500 hover:bg-rose-50 hover:text-rose-600 sm:self-center"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
