/**
 * NETGRAPH Data-Mining Engine — Career Role Matcher
 * Computes deterministic, explainable career alignment scores and identifies skill overlaps.
 */

import { SkillProficiency } from '../profile'
import {
  NormalisedSkill,
  CareerRoleRequirement,
  CareerRoleMatch,
} from './types'
import { REFERENCE_CAREER_ROLES } from './career-roles'

const PROFICIENCY_MULTIPLIERS: Record<SkillProficiency, number> = {
  Expert: 1.05,
  Advanced: 1.0,
  Intermediate: 0.85,
  Beginner: 0.65,
}

/**
 * Evaluates a user's normalized skills against the reference career catalogue.
 *
 * Mathematical Formula:
 * - Base Required Score (%) = [ Sum( weight(s) * proficiencyMultiplier(s) ) / Sum( weight(s) ) ] * 90
 * - Recommended Bonus (%) = [ Sum( weight(r) ) / Sum( totalRecommendedWeight ) ] * 10
 * - Total Match Score = Min(100, Round(Base Required Score + Recommended Bonus))
 */
export function matchCareerRoles(
  userSkills: NormalisedSkill[],
  roles: CareerRoleRequirement[] = REFERENCE_CAREER_ROLES
): CareerRoleMatch[] {
  const userSkillMap = new Map<string, NormalisedSkill>()
  for (const s of userSkills) {
    userSkillMap.set(s.normalisedName.toLowerCase(), s)
  }

  const results: CareerRoleMatch[] = []

  for (const role of roles) {
    const totalRequiredWeight = role.requiredSkills.reduce((sum, s) => sum + s.weight, 0)
    const totalRecommendedWeight = role.recommendedSkills.reduce((sum, s) => sum + s.weight, 0)

    const matchedSkills: { name: string; weight: number; proficiency?: SkillProficiency }[] = []
    const missingRequired: { name: string; weight: number; priority: 'high' | 'medium' | 'low' }[] = []
    const missingRecommended: { name: string; weight: number; priority: 'medium' | 'low' }[] = []

    let earnedRequiredWeight = 0

    // Evaluate Required Skills
    for (const req of role.requiredSkills) {
      const found = userSkillMap.get(req.name.toLowerCase())
      if (found) {
        const multiplier = PROFICIENCY_MULTIPLIERS[found.proficiency] || 0.85
        const credit = Math.min(req.weight, req.weight * multiplier)
        earnedRequiredWeight += credit
        matchedSkills.push({
          name: req.name,
          weight: req.weight,
          proficiency: found.proficiency,
        })
      } else {
        missingRequired.push({
          name: req.name,
          weight: req.weight,
          priority: req.critical ? 'high' : 'medium',
        })
      }
    }

    // Evaluate Recommended Skills
    let earnedRecommendedWeight = 0
    for (const rec of role.recommendedSkills) {
      const found = userSkillMap.get(rec.name.toLowerCase())
      if (found) {
        earnedRecommendedWeight += rec.weight
        matchedSkills.push({
          name: rec.name,
          weight: rec.weight,
          proficiency: found.proficiency,
        })
      } else {
        missingRecommended.push({
          name: rec.name,
          weight: rec.weight,
          priority: 'low',
        })
      }
    }

    // Unweighted percentage: raw count of required skills satisfied
    const unweightedPct = role.requiredSkills.length > 0
      ? Math.round(
          (role.requiredSkills.filter((r) => userSkillMap.has(r.name.toLowerCase())).length /
            role.requiredSkills.length) *
            100
        )
      : 0

    // Compute Final Weighted Match Score
    let finalScore = 0
    if (totalRequiredWeight > 0 && userSkills.length > 0) {
      const baseScore = (earnedRequiredWeight / totalRequiredWeight) * 90
      const bonus = totalRecommendedWeight > 0
        ? (earnedRecommendedWeight / totalRecommendedWeight) * 10
        : 0
      finalScore = Math.min(100, Math.round(baseScore + bonus))
    }

    // Discover additional user skills relevant to this domain
    const roleSkillNames = new Set([
      ...role.requiredSkills.map((s) => s.name.toLowerCase()),
      ...role.recommendedSkills.map((s) => s.name.toLowerCase()),
    ])
    const additionalRelevant = userSkills
      .filter((s) => !roleSkillNames.has(s.normalisedName.toLowerCase()))
      .map((s) => s.normalisedName)

    // Formulate transparent explanation & limitations
    const limitations: string[] = []
    let explanation = ''

    if (userSkills.length === 0) {
      explanation = 'No technical skills have been recorded in your profile yet. Add skills to evaluate alignment with this pathway.'
      limitations.push('Zero user profile skills provided.')
    } else {
      explanation = `Matches ${matchedSkills.length} of ${role.requiredSkills.length + role.recommendedSkills.length} cataloged competencies (${unweightedPct}% core requirement coverage). Score incorporates skill weights and demonstrated proficiencies.`
      if (missingRequired.filter((m) => m.priority === 'high').length > 0) {
        const topMissing = missingRequired
          .filter((m) => m.priority === 'high')
          .map((m) => m.name)
          .join(', ')
        explanation += ` Core requirements to develop: ${topMissing}.`
      }
      if (userSkills.length < 5) {
        limitations.push('Based on a small initial profile skill sample (< 5 skills).')
      }
    }

    results.push({
      roleId: role.id,
      roleTitle: role.title,
      category: role.category,
      matchScore: finalScore,
      unweightedMatchPercentage: unweightedPct,
      matchedSkills,
      missingRequiredSkills: missingRequired,
      missingRecommendedSkills: missingRecommended,
      additionalRelevantSkills: additionalRelevant.slice(0, 5),
      explanation,
      dataLimitations: limitations.length > 0 ? limitations : undefined,
    })
  }

  // Sort by highest match score first
  return results.sort((a, b) => b.matchScore - a.matchScore)
}
