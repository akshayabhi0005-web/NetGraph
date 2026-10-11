/**
 * NETGRAPH Career Intelligence Report Data Builder
 * Pure, deterministic functions to extract and structure verified report data
 * from the user's saved profile and data-mining engine results.
 */

import { UserProfile } from './auth'
import { MiningResult, NormalisedSkill } from './data-mining/types'
import { CareerIntelligenceReport } from './report-types'

export function buildCareerIntelligenceReport(
  user: Partial<UserProfile> | null,
  analysis: MiningResult
): CareerIntelligenceReport {
  const now = new Date()
  const dateFormatted = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const isoDate = now.toISOString().split('T')[0]
  const reportId = `NETGRAPH-RPT-${isoDate}-${(user?.id || 'ANON').slice(-6).toUpperCase()}`

  const hasName = Boolean(user?.name && user.name.trim().length > 0)
  const userName = hasName ? user!.name!.trim() : 'Anonymous Candidate'
  const userEmail = user?.email || 'unregistered@netgraph.local'

  // Extract skills and group by category
  const skillsList = analysis.normalisedSkills || []
  const skillsByCategory: Record<string, NormalisedSkill[]> = {}

  for (const skill of skillsList) {
    const cat = skill.category || 'Other'
    if (!skillsByCategory[cat]) {
      skillsByCategory[cat] = []
    }
    skillsByCategory[cat].push(skill)
  }

  // Calculate skill category distribution
  const totalSkills = skillsList.length
  const categoryDistribution = Object.entries(skillsByCategory).map(
    ([category, skills]) => ({
      category,
      count: skills.length,
      percentage: totalSkills > 0 ? Math.round((skills.length / totalSkills) * 100) : 0,
    })
  ).sort((a, b) => b.count - a.count)

  const topProficientSkills = skillsList.filter(
    (s) => s.proficiency === 'Expert' || s.proficiency === 'Advanced'
  )

  // Profile data
  const education = user?.education || []
  const experience = user?.experience || []
  const projects = user?.projects || []
  const certifications = user?.certifications || []

  // Check if profile actually has any input data
  const hasData =
    totalSkills > 0 ||
    projects.length > 0 ||
    experience.length > 0 ||
    education.length > 0 ||
    Boolean(user?.headline || user?.summary)

  // Calculate profile completeness score (0 to 100)
  let completenessPoints = 0
  if (user?.name) completenessPoints += 10
  if (user?.headline) completenessPoints += 15
  if (user?.summary) completenessPoints += 15
  if (totalSkills >= 3) completenessPoints += 20
  if (projects.length >= 1) completenessPoints += 15
  if (experience.length >= 1) completenessPoints += 15
  if (education.length >= 1) completenessPoints += 10
  const profileCompletenessScore = Math.min(100, completenessPoints)

  // Career matches (only when profile has data)
  const topMatches = hasData ? (analysis.careerMatches || []).slice(0, 6) : []
  const totalMatchesEvaluated = hasData ? (analysis.careerMatches?.length || 0) : 0

  // Skill gaps (only when profile has data)
  const gaps = hasData ? (analysis.skillGaps || []) : []
  const highPriorityCount = gaps.filter((g) => g.priority === 'high').length
  const mediumPriorityCount = gaps.filter((g) => g.priority === 'medium').length

  // Association rules (only when profile has data)
  const rules = hasData ? (analysis.associationRules || []).slice(0, 10) : []

  return {
    metadata: {
      reportId,
      generatedAt: now.toISOString(),
      dateFormatted,
      userName,
      userEmail,
      profileCompletenessScore,
      confidenceLevel: analysis.dataQuality?.confidenceLevel || 'low',
      isSufficientData: analysis.dataQuality?.isSufficientData ?? false,
      hasData,
    },
    profile: {
      headline: user?.headline?.trim() || undefined,
      summary: user?.summary?.trim() || undefined,
      location: user?.location?.trim() || undefined,
      careerGoal: user?.careerGoal?.trim() || undefined,
      linkedinUrl: user?.linkedinUrl?.trim() || undefined,
      githubUrl: user?.githubUrl?.trim() || undefined,
      portfolioUrl: user?.portfolioUrl?.trim() || undefined,
      education,
      experience,
      projects,
      certifications,
    },
    skills: {
      totalSkills,
      skillsByCategory,
      topProficientSkills,
    },
    careerMatches: {
      topMatches,
      totalMatchesEvaluated,
    },
    skillGaps: {
      gaps,
      highPriorityCount,
      mediumPriorityCount,
    },
    relationships: {
      rules,
      totalTransactionsMined: analysis.dataQuality?.totalTransactionsMined || 0,
      totalRulesDiscovered: analysis.associationRules?.length || 0,
    },
    analytics: {
      totalSkills,
      totalTransactions: analysis.dataQuality?.totalTransactionsMined || 0,
      totalProjects: projects.length,
      totalExperiences: experience.length,
      totalCertifications: certifications.length,
      categoryDistribution,
    },
    limitations: {
      confidenceLevel: analysis.dataQuality?.confidenceLevel || 'low',
      warnings: analysis.dataQuality?.warnings || [],
      explanation:
        analysis.dataQuality?.explanation ||
        'Report conclusions reflect heuristic matching and co-occurrence patterns on saved profile data.',
      isSufficientData: analysis.dataQuality?.isSufficientData ?? false,
    },
  }
}

/**
 * Standard formatted filename for report export
 */
export function getReportPdfFilename(dateString?: string): string {
  const date = dateString ? new Date(dateString) : new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `NETGRAPH_Career_Report_${yyyy}-${mm}-${dd}.pdf`
}
