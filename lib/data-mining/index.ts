/**
 * NETGRAPH Data-Mining Engine — Main Pipeline & Facade
 * Orchestrates preprocessing, skill normalization, co-occurrence mining,
 * career path alignment, skill gap analysis, and relationship graph generation.
 */

import { UserProfile } from '../auth'
import {
  MiningResult,
  NormalisedSkill,
  Transaction,
  SkillCoOccurrence,
  FrequentItemset,
  AssociationRule,
  CareerRoleMatch,
  SkillGap,
  GraphNode,
  GraphEdge,
  MiningDataQuality,
} from './types'

import { preprocessProfile } from './preprocessor'
import { mineAssociationRules } from './association-rules'
import { matchCareerRoles } from './career-matcher'
import { analyzeSkillGaps } from './skill-gaps'
import { generateGraphData } from './graph-generator'

// Re-export all sub-modules & types
export * from './types'
export * from './normalizer'
export * from './preprocessor'
export * from './association-rules'
export * from './career-roles'
export * from './career-matcher'
export * from './skill-gaps'
export * from './graph-generator'

export const ENGINE_VERSION = '1.0.0'

/**
 * End-to-end data-mining pipeline for a user career profile.
 * Completely deterministic and explainable: no random numbers or fabricated statistical significance.
 */
export function mineUserProfile(profile: Partial<UserProfile> | null): MiningResult {
  const profileId = profile?.id || 'anonymous_user'
  const timestamp = new Date().toISOString()

  // 1. Preprocess & extract clean normalized skills and transactions
  const { skills, transactions, dataQuality } = preprocessProfile(profile)

  // 2. Mine skill co-occurrences, frequent itemsets, and association rules
  const { coOccurrences, frequentItemsets, rules } = mineAssociationRules(transactions, {
    minSupport: 0.1,
    minConfidence: 0.25,
    maxRules: 40,
  })

  // 3. Match against reference career catalogue
  const careerMatches = matchCareerRoles(skills)

  // 4. Derive prioritized skill gaps
  const skillGaps = analyzeSkillGaps(careerMatches)

  // 5. Generate comprehensive graph nodes and edges
  const graphData = generateGraphData(profile, skills, coOccurrences, careerMatches)

  return {
    version: ENGINE_VERSION,
    engine: 'NETGRAPH Career Relationship Mining Engine',
    timestamp,
    profileId,
    dataQuality,
    normalisedSkills: skills,
    transactions,
    coOccurrences,
    frequentItemsets,
    associationRules: rules,
    careerMatches,
    skillGaps,
    graphData,
  }
}
