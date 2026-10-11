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

  // Executive Summary derivation
  const primaryRole = topMatches[0]?.roleTitle || 'Technical Specialist'
  const primaryMatchScore = topMatches[0]?.matchScore || 0
  const executiveSummaryText = hasData
    ? `${userName} presents an active technical portfolio encompassing ${totalSkills} verified skills across ${categoryDistribution.length} functional domain${categoryDistribution.length !== 1 ? 's' : ''}, supported by ${projects.length} project implementation${projects.length !== 1 ? 's' : ''} and ${experience.length} work experience record${experience.length !== 1 ? 's' : ''}. Career matching algorithms evaluate "${primaryRole}" as the top alignment target with a ${primaryMatchScore}% weighted requirement coverage score.`
    : 'No profile data is currently available. Add technical skills, projects, and work experience to compile an executive career intelligence summary.'

  const strengthsList: string[] = []
  if (categoryDistribution[0]) {
    strengthsList.push(
      `Strong technical depth in ${categoryDistribution[0].category} with ${categoryDistribution[0].count} verified competencies (${categoryDistribution[0].percentage}% of total skill set).`
    )
  }
  if (topProficientSkills.length > 0) {
    const profNames = topProficientSkills.slice(0, 4).map((s) => s.normalisedName).join(', ')
    strengthsList.push(
      `${topProficientSkills.length} competencies demonstrated at Advanced or Expert proficiency level, including ${profNames}.`
    )
  }
  if (projects.length > 0) {
    strengthsList.push(
      `${projects.length} portfolio project${projects.length > 1 ? 's' : ''} with documented technology stacks demonstrating applied software implementation.`
    )
  }
  if (certifications.length > 0) {
    strengthsList.push(
      `${certifications.length} verified industry certification${certifications.length > 1 ? 's' : ''} providing formal external accreditation.`
    )
  }
  if (strengthsList.length === 0) {
    strengthsList.push('Initial profile created. Ready for skills and experience entries.')
  }

  const improvementAreasList: string[] = []
  const topMissing = topMatches[0]?.missingRequiredSkills || []
  if (topMissing.length > 0) {
    improvementAreasList.push(
      `Critical capability gaps for top target role (${primaryRole}): ${topMissing.slice(0, 3).map((s) => s.name).join(', ')}.`
    )
  }
  if (analysis.dataQuality?.totalTransactionsMined < 3) {
    improvementAreasList.push(
      'Transaction sample is modest; add technologies to multiple projects and work experiences to uncover deeper association rules.'
    )
  }
  if (highPriorityCount > 0) {
    improvementAreasList.push(
      `${highPriorityCount} high-priority skill gap${highPriorityCount > 1 ? 's' : ''} currently distance your profile from target job specifications.`
    )
  }
  if (improvementAreasList.length === 0) {
    improvementAreasList.push('Continue updating projects to maintain verified alignment across emerging industry roles.')
  }

  // Project & Technology Relationships derivation
  const projectTechAssociations = projects.map((p) => ({
    projectTitle: p.title || 'Untitled Project',
    technologies: p.technologies || [],
    description: p.description,
  }))

  // Track skills appearing repeatedly across portfolio sources
  const skillSourceCount = new Map<string, { count: number; sources: Set<string> }>()
  for (const p of projects) {
    for (const t of p.technologies || []) {
      const canonical = t.trim()
      if (!skillSourceCount.has(canonical)) {
        skillSourceCount.set(canonical, { count: 0, sources: new Set() })
      }
      const entry = skillSourceCount.get(canonical)!
      entry.count++
      entry.sources.add(`Project: ${p.title}`)
    }
  }
  for (const exp of experience) {
    for (const t of exp.technologies || []) {
      const canonical = t.trim()
      if (!skillSourceCount.has(canonical)) {
        skillSourceCount.set(canonical, { count: 0, sources: new Set() })
      }
      const entry = skillSourceCount.get(canonical)!
      entry.count++
      entry.sources.add(`Experience: ${exp.company}`)
    }
  }

  const repeatedSkills = Array.from(skillSourceCount.entries())
    .filter(([_, data]) => data.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([skill, data]) => ({
      skill,
      count: data.count,
      sources: Array.from(data.sources),
    }))

  const graphFindings: string[] = []
  if (analysis.graphData?.nodes?.length) {
    graphFindings.push(
      `Relationship graph structure comprises ${analysis.graphData.nodes.length} verified entity nodes and ${analysis.graphData.edges.length} connecting edges.`
    )
  }
  if (repeatedSkills.length > 0) {
    graphFindings.push(
      `Core anchor technologies utilized repeatedly across your portfolio: ${repeatedSkills.slice(0, 3).map((r) => `${r.skill} (${r.count}x)`).join(', ')}.`
    )
  }
  if (rules.length > 0) {
    graphFindings.push(
      `Top association pattern discovered: ${rules[0].antecedent.join(', ')} -> ${rules[0].consequent.join(', ')} (Confidence: ${Math.round(rules[0].confidence * 100)}%, Lift: ${rules[0].lift.toFixed(1)}x).`
    )
  }

  // Action Plan derivation
  const prioritizedSteps = [
    {
      title: topMissing[0] ? `Acquire Critical Capability: ${topMissing[0].name}` : 'Deepen Primary Technology Depth',
      description: topMissing[0]
        ? `Bridge the highest-weighted requirement gap for ${primaryRole} by completing structured coursework or hands-on implementations in ${topMissing[0].name}.`
        : 'Continue advancing proficiency in your core programming language or data stack.',
      priority: 'high' as const,
      timeframe: 'Next 30 Days',
    },
    {
      title: 'Strengthen Transaction Co-Occurrence Depth',
      description: 'Build a dedicated portfolio project integrating your current primary technologies with 1-2 target skills to establish verified transaction evidence.',
      priority: 'medium' as const,
      timeframe: 'Next 60 Days',
    },
    {
      title: 'Document Industry Credentials & Certifications',
      description: 'Pursue recognized vendor or industry certifications to validate proficiency and reinforce candidate marketability.',
      priority: 'medium' as const,
      timeframe: 'Next 90 Days',
    },
  ]

  const skillsToImprove = gaps.slice(0, 6).map((g) => ({
    skill: g.skillName,
    targetRole: g.targetRole,
    reason: g.reason,
    action: g.suggestedAction,
  }))

  const recommendedProjects = [
    {
      title: `${primaryRole} Reference Architecture Project`,
      technologies: [
        topProficientSkills[0]?.normalisedName || 'Python',
        topMissing[0]?.name || 'Docker',
        categoryDistribution[0]?.category === 'Databases' ? 'SQL' : 'Cloud Infrastructure',
      ],
      purpose: `Directly demonstrates required capabilities for ${primaryRole} while reinforcing core competencies in ${topProficientSkills[0]?.normalisedName || 'primary tech'}.`,
    },
  ]

  const careerPreparationActions = [
    `Optimize resume and portfolio highlights emphasizing alignment with ${primaryRole}.`,
    `Review foundational interview questions regarding ${topProficientSkills.slice(0, 2).map((s) => s.normalisedName).join(' and ') || 'core skills'}.`,
    `Contribute to open-source or public code repositories to showcase verifiable project artifacts.`,
  ]

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
    executiveSummary: {
      summary: executiveSummaryText,
      strengths: strengthsList,
      improvementAreas: improvementAreasList,
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
    projectRelationships: {
      projectTechAssociations,
      repeatedSkills,
      graphFindings,
    },
    relationships: {
      rules,
      totalTransactionsMined: analysis.dataQuality?.totalTransactionsMined || 0,
      totalRulesDiscovered: analysis.associationRules?.length || 0,
    },
    actionPlan: {
      prioritizedSteps,
      skillsToImprove,
      recommendedProjects,
      careerPreparationActions,
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
