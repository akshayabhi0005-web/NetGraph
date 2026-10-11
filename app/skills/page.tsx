'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/auth-context'
import { useCareerAnalysis } from '@/hooks/use-career-analysis'
import {
  Wrench,
  Plus,
  Trash2,
  Layers,
  Award,
  Search,
  CheckCircle2,
  TrendingUp,
  Link2,
  HelpCircle,
  Briefcase,
  FolderGit2,
} from 'lucide-react'
import {
  SkillEntry,
  SkillCategory,
  SkillProficiency,
  SKILL_CATEGORIES,
  SKILL_PROFICIENCIES,
} from '@/lib/profile'

const PROFICIENCY_PERCENT: Record<SkillProficiency, number> = {
  Beginner: 30,
  Intermediate: 60,
  Advanced: 85,
  Expert: 100,
}

export default function SkillsPage() {
  const { user, updateProfile } = useAuth()
  const { analysis, coOccurrences, associationRules, dataQuality } = useCareerAnalysis()

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCat, setNewSkillCat] = useState<SkillCategory>('Programming Languages')
  const [newSkillProf, setNewSkillProf] = useState<SkillProficiency>('Intermediate')
  const [newSkillYears, setNewSkillYears] = useState('2')
  const [notification, setNotification] = useState<string | null>(null)
  const [showMetricExplainer, setShowMetricExplainer] = useState(false)

  // Derive skills list from user
  const skills: SkillEntry[] =
    user?.skillsList && user.skillsList.length > 0
      ? user.skillsList
      : (user?.skills || []).map((name, i) => ({
          id: `sk_gen_${i}`,
          name,
          category: 'Programming Languages' as SkillCategory,
          proficiency: 'Intermediate' as SkillProficiency,
          yearsOfExperience: 2,
        }))

  // Filter skills
  const filteredSkills = skills.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Metric stats
  const totalCount = skills.length
  const expertCount = skills.filter(
    (s) => s.proficiency === 'Advanced' || s.proficiency === 'Expert'
  ).length
  const distinctCategories = new Set(skills.map((s) => s.category)).size

  // Add skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkillName.trim()) return

    const exists = skills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    )
    if (exists) {
      alert(`Skill "${newSkillName.trim()}" is already present in your skills.`)
      return
    }

    const newSkill: SkillEntry = {
      id: `sk_${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCat,
      proficiency: newSkillProf,
      yearsOfExperience: parseInt(newSkillYears) || 1,
    }

    const updated = [...skills, newSkill]
    updateProfile({ skillsList: updated })
    setNewSkillName('')
    setShowAddModal(false)
    setNotification(`"${newSkill.name}" added to your skills profile!`)
    setTimeout(() => setNotification(null), 3000)
  }

  // Remove skill
  const handleRemoveSkill = (id: string) => {
    const updated = skills.filter((s) => s.id !== id)
    updateProfile({ skillsList: updated })
  }

  // Change proficiency
  const handleProficiencyChange = (id: string, newProf: SkillProficiency) => {
    const updated = skills.map((s) => (s.id === id ? { ...s, proficiency: newProf } : s))
    updateProfile({ skillsList: updated })
  }

  // Helper to find co-occurring skills and rules for a given skill name
  const getSkillCoOccurrences = (skillName: string) => {
    const target = skillName.toLowerCase()
    const matches = coOccurrences.filter(
      (c) => c.skillA.toLowerCase() === target || c.skillB.toLowerCase() === target
    )
    return matches.map((m) => {
      const other = m.skillA.toLowerCase() === target ? m.skillB : m.skillA
      return { otherSkill: other, count: m.count }
    })
  }

  const getSkillRules = (skillName: string) => {
    const target = skillName.toLowerCase()
    return associationRules.filter(
      (r) => r.antecedent[0]?.toLowerCase() === target
    )
  }

  // Find where skill was used in projects or experience
  const getSkillProvenance = (skillName: string) => {
    const target = skillName.toLowerCase()
    const foundProjects = (user?.projects || []).filter((p) =>
      (p.technologies || []).some((t) => t.toLowerCase() === target)
    )
    const foundExperience = (user?.experience || []).filter((e) =>
      (e.technologies || []).some((t) => t.toLowerCase() === target)
    )
    return { projects: foundProjects, experience: foundExperience }
  }

  return (
    <AppShell title="Skills">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              Mined Skill Intelligence
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Skill inventory & relationship mining
            </h1>
            <p className="mt-2 text-muted-foreground">
              Verified competencies paired with empirical co-occurrence patterns discovered from your projects.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="rounded-full border-border bg-card hover:bg-muted"
            >
              <Link href="/profile">Manage in Profile</Link>
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="size-4 mr-1.5" /> Add Skill
            </Button>
          </div>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Metric Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cataloged skills</span>
              <Wrench className="size-4 text-indigo-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-.05em]">{totalCount}</p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Mapped to graph</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Advanced & Expert</span>
              <Award className="size-4 text-indigo-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-.05em]">{expertCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">High proficiency anchors</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Domain categories</span>
              <Layers className="size-4 text-indigo-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-.05em]">
              {distinctCategories} / {SKILL_CATEGORIES.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Breadth of experience</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mined associations</span>
              <Link2 className="size-4 text-indigo-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-.05em]">{coOccurrences.length}</p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Empirical pairings</p>
          </div>
        </div>

        {/* Association Metrics Explainer Toggle */}
        <div className="mt-6 flex flex-col rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
              <HelpCircle className="size-4 text-indigo-600" />
              How are skill relationships mined?
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMetricExplainer(!showMetricExplainer)}
              className="text-xs text-indigo-700 hover:text-indigo-900 h-7 px-2"
            >
              {showMetricExplainer ? 'Hide explanation' : 'Learn about Support, Confidence & Lift'}
            </Button>
          </div>

          {showMetricExplainer && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3 border-t border-indigo-100 pt-3 text-xs text-slate-600">
              <div>
                <strong className="text-slate-900 block mb-0.5">Support</strong>
                Fraction of total projects containing both technologies. Formula: Count(A & B) / Total Projects.
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Confidence</strong>
                Probability of using Skill B whenever you use Skill A. Formula: Count(A & B) / Count(A).
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Lift</strong>
                Strength of co-occurrence relative to random pairing. Lift &gt; 1.0 indicates a strong technology synergy in your work.
              </div>
              <div className="sm:col-span-3 text-[11px] text-slate-500 italic mt-1">
                * Note: Mined associations reflect co-occurrence in your specific portfolio transactions, not causation or external market standards.
              </div>
            </div>
          )}
        </div>

        {/* Inline Add Skill Modal */}
        {showAddModal && (
          <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Add New Skill</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="size-8 p-0"
              >
                &times;
              </Button>
            </div>
            <form onSubmit={handleAddSkill} className="mt-4 grid gap-4 sm:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Skill Name</label>
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. PyTorch, TypeScript"
                  className="mt-1 bg-card"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={newSkillCat}
                  onChange={(e) => setNewSkillCat(e.target.value as SkillCategory)}
                  className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Proficiency</label>
                <select
                  value={newSkillProf}
                  onChange={(e) => setNewSkillProf(e.target.value as SkillProficiency)}
                  className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {SKILL_PROFICIENCIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Years Experience</label>
                <Input
                  type="number"
                  min="1"
                  max="40"
                  value={newSkillYears}
                  onChange={(e) => setNewSkillYears(e.target.value)}
                  className="mt-1 bg-card"
                />
              </div>

              <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add to Skills
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All ({skills.length})
            </button>
            {SKILL_CATEGORIES.map((cat) => {
              const count = skills.filter((s) => s.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="pl-9 bg-card"
            />
          </div>
        </div>

        {/* Skill Cards Grid with Mined Relationships */}
        <div className="mt-6">
          {filteredSkills.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border py-16 text-center">
              <Wrench className="mx-auto size-10 text-muted-foreground/60" />
              <h3 className="mt-4 text-base font-semibold text-slate-800">No skills found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                {skills.length === 0
                  ? "You haven't added any skills to your profile yet. Add skills to power your career intelligence network."
                  : 'No skills match your current search and filter selection.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="size-4 mr-1.5" /> Add Skill Now
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((skill) => {
                const percentage = PROFICIENCY_PERCENT[skill.proficiency] || 60
                const coItems = getSkillCoOccurrences(skill.name)
                const rules = getSkillRules(skill.name)
                const provenance = getSkillProvenance(skill.name)

                return (
                  <div
                    key={skill.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs transition hover:border-indigo-200"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-base">{skill.name}</h4>
                          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            {skill.category}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="size-7 p-0 text-slate-400 hover:text-rose-600"
                          title="Remove skill"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {/* Proficiency Bar & Selector */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Proficiency</span>
                          <select
                            value={skill.proficiency}
                            onChange={(e) =>
                              handleProficiencyChange(skill.id, e.target.value as SkillProficiency)
                            }
                            className="rounded-md border border-input bg-card px-2 py-0.5 text-xs font-semibold text-indigo-700 capitalize outline-none focus:ring-1 focus:ring-indigo-300"
                          >
                            {SKILL_PROFICIENCIES.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Provenance: Project & Experience References */}
                      {(provenance.projects.length > 0 || provenance.experience.length > 0) && (
                        <div className="mt-3.5 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {provenance.projects.length > 0 && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                              <FolderGit2 className="size-3 text-indigo-500" />
                              {provenance.projects.length} project{provenance.projects.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {provenance.experience.length > 0 && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                              <Briefcase className="size-3 text-emerald-500" />
                              {provenance.experience.length} job{provenance.experience.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Mined Co-occurrences */}
                      {coItems.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <span className="text-[11px] font-semibold text-slate-700 block">
                            Frequently Co-Occurs With:
                          </span>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {coItems.slice(0, 3).map((co, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="bg-indigo-50 text-indigo-700 text-[10px]"
                                title={`Appeared together in ${co.count} portfolio transaction(s)`}
                              >
                                {co.otherSkill} ({co.count}x)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Association Rule Metrics */}
                      {rules.length > 0 && (
                        <div className="mt-2.5 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <span>
                            Top Rule: {rules[0].antecedent[0]} &rarr; {rules[0].consequent[0]}
                          </span>
                          <span className="block text-indigo-600 font-medium">
                            Conf: {(rules[0].confidence * 100).toFixed(0)}% · Lift: {rules[0].lift.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                      <span>
                        {skill.yearsOfExperience
                          ? `${skill.yearsOfExperience} yr${skill.yearsOfExperience > 1 ? 's' : ''} exp`
                          : 'Demonstrated'}
                      </span>
                      <span className="font-medium text-slate-600">{percentage}% score</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
