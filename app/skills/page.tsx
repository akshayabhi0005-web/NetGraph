'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/auth-context'
import {
  Wrench,
  Plus,
  Trash2,
  Layers,
  Award,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import {
  SkillEntry,
  SkillCategory,
  SkillProficiency,
  SKILL_CATEGORIES,
  SKILL_PROFICIENCIES,
  POPULAR_TECH_SKILLS,
} from '@/lib/profile'

const PROFICIENCY_PERCENT: Record<SkillProficiency, number> = {
  Beginner: 30,
  Intermediate: 60,
  Advanced: 85,
  Expert: 100,
}

export default function SkillsPage() {
  const { user, updateProfile } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCat, setNewSkillCat] = useState<SkillCategory>('Programming Languages')
  const [newSkillProf, setNewSkillProf] = useState<SkillProficiency>('Intermediate')
  const [newSkillYears, setNewSkillYears] = useState('2')
  const [notification, setNotification] = useState<string | null>(null)

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

  return (
    <AppShell title="Skills">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
              Live Profile Skills
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] md:text-4xl">
              Skill-gap analysis & inventory
            </h1>
            <p className="mt-2 text-muted-foreground">
              A comprehensive breakdown of your represented technical and domain capabilities.
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
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cataloged skills</span>
              <Wrench className="size-4 text-indigo-500" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-.05em]">{totalCount}</p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Mapped to 3D graph</p>
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
        </div>

        {/* Inline Add Skill Modal / Drawer */}
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

        {/* Skill Cards Grid */}
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
                {skills.length === 0 && (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href="/onboarding">Run Guided Onboarding</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map((skill) => {
                const percentage = PROFICIENCY_PERCENT[skill.proficiency] || 60

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
                      <div className="mt-5">
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

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>
                        {skill.yearsOfExperience
                          ? `${skill.yearsOfExperience} yr${skill.yearsOfExperience > 1 ? 's' : ''} exp`
                          : 'Demonstrated'}
                      </span>
                      <span className="font-medium text-slate-600">{percentage}% proficiency</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Skill Recommendations / Exploration Section */}
        <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6 md:flex md:items-center md:justify-between">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-indigo-600 shadow-xs">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Recommended Growth Trajectory</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Based on your current skill cluster, gaining proficiency in Machine Learning, Cloud Computing,
                and Data Mining will boost your alignment for Senior AI and Data Science roles.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="mt-4 rounded-full bg-card md:mt-0">
            <Link href="/career">Explore Target Careers</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
