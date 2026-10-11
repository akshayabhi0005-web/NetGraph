/**
 * NETGRAPH Data-Mining Engine — Skill Gap Analyzer
 * Computes deterministic skill gaps between user profile competencies and target career requirements.
 */

import { CareerRoleMatch, SkillGap } from './types'
import { inferSkillCategory } from './normalizer'

/**
 * Extracts and prioritizes skill gaps from career role matching results.
 * Priority Rules:
 * - 'high': Missing required skill in a role where the user already has >= 50% match score.
 * - 'medium': Missing required skill in other roles, or missing recommended skill in high-match roles.
 * - 'low': Missing recommended skills in lower-match roles.
 */
export function analyzeSkillGaps(matches: CareerRoleMatch[]): SkillGap[] {
  const gapsMap = new Map<string, SkillGap>()

  for (const match of matches) {
    // Process Missing Required Skills
    for (const missing of match.missingRequiredSkills) {
      const key = `${missing.name.toLowerCase()}|||${match.roleId}`
      const priority: 'high' | 'medium' | 'low' =
        match.matchScore >= 50 && missing.priority === 'high'
          ? 'high'
          : missing.priority === 'high'
          ? 'medium'
          : 'medium'

      if (!gapsMap.has(key)) {
        gapsMap.set(key, {
          id: `gap_${match.roleId}_${missing.name.toLowerCase().replace(/\s+/g, '_')}`,
          skillName: missing.name,
          category: inferSkillCategory(missing.name),
          targetRole: match.roleTitle,
          priority,
          reason: `Core prerequisite for ${match.roleTitle} (weight: ${missing.weight.toFixed(1)}).`,
          roleRequirementType: 'required',
          suggestedAction: `Acquiring ${missing.name} directly strengthens your alignment for ${match.roleTitle}.`,
        })
      }
    }

    // Process Missing Recommended Skills for roles with reasonable traction
    if (match.matchScore >= 35) {
      for (const rec of match.missingRecommendedSkills) {
        const key = `${rec.name.toLowerCase()}|||${match.roleId}`
        if (!gapsMap.has(key)) {
          gapsMap.set(key, {
            id: `gap_${match.roleId}_${rec.name.toLowerCase().replace(/\s+/g, '_')}`,
            skillName: rec.name,
            category: inferSkillCategory(rec.name),
            targetRole: match.roleTitle,
            priority: 'low',
            reason: `Recommended expansion capability for ${match.roleTitle} (weight: ${rec.weight.toFixed(1)}).`,
            roleRequirementType: 'recommended',
            suggestedAction: `Strengthens secondary profile depth for ${match.roleTitle}.`,
          })
        }
      }
    }
  }

  // Sort by priority ('high' first, then 'medium', then 'low')
  const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 }
  return Array.from(gapsMap.values()).sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )
}
