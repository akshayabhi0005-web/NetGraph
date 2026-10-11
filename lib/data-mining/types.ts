/**
 * NETGRAPH Data-Mining Engine — Core Type Definitions
 * Strongly typed interfaces for preprocessing, association rule mining,
 * career role matching, skill gap analysis, and graph generation.
 */

import { SkillCategory, SkillProficiency } from '../profile'

export type SkillProvenance =
  | 'profile_skills'
  | 'project'
  | 'experience'
  | 'education_coursework'
  | 'certification'

export interface NormalisedSkill {
  id: string
  rawName: string
  normalisedName: string
  category: SkillCategory
  proficiency: SkillProficiency
  provenance: SkillProvenance[]
  yearsOfExperience?: number
}

export interface Transaction {
  id: string
  sourceType: 'project' | 'experience' | 'coursework'
  sourceTitle: string
  items: string[] // Normalised skill names
}

export interface SkillCoOccurrence {
  skillA: string
  skillB: string
  count: number
  transactions: string[] // Transaction IDs
}

export interface FrequentItemset {
  items: string[]
  count: number
  support: number
}

export interface AssociationRule {
  antecedent: string[]
  consequent: string[]
  antecedentSupport: number
  consequentSupport: number
  support: number
  confidence: number
  lift: number
  transactionCount: number
  evidence: string
}

export type GraphNodeType =
  | 'skill'
  | 'project'
  | 'experience'
  | 'education'
  | 'certification'
  | 'career_role'

export interface GraphNode {
  id: string
  label: string
  type: GraphNodeType
  category?: string
  proficiency?: SkillProficiency
  evidence: string
  metadata?: Record<string, unknown>
}

export type GraphEdgeType =
  | 'co_occurred'
  | 'used_in_project'
  | 'used_in_experience'
  | 'supports_role'
  | 'certified_by'
  | 'studied_in'

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: GraphEdgeType
  weight: number
  evidence: string
}

export interface CareerSkillWeight {
  name: string
  weight: number // 0.1 to 1.0 importance
  critical: boolean // true = must-have core skill
}

export interface CareerRoleRequirement {
  id: string
  title: string
  category: string
  description: string
  requiredSkills: CareerSkillWeight[]
  recommendedSkills: CareerSkillWeight[]
}

export interface CareerRoleMatch {
  roleId: string
  roleTitle: string
  category: string
  matchScore: number // 0 to 100 percentage
  unweightedMatchPercentage: number
  matchedSkills: { name: string; weight: number; proficiency?: SkillProficiency }[]
  missingRequiredSkills: { name: string; weight: number; priority: 'high' | 'medium' | 'low' }[]
  missingRecommendedSkills: { name: string; weight: number; priority: 'medium' | 'low' }[]
  additionalRelevantSkills: string[]
  explanation: string
  dataLimitations?: string[]
}

export interface SkillGap {
  id: string
  skillName: string
  category: SkillCategory
  targetRole: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  roleRequirementType: 'required' | 'recommended'
  suggestedAction: string
}

export interface MiningDataQuality {
  totalSkillsIdentified: number
  totalTransactionsMined: number
  hasProjects: boolean
  hasExperience: boolean
  hasEducation: boolean
  isSufficientData: boolean
  confidenceLevel: 'low' | 'moderate' | 'high'
  warnings: string[]
  explanation: string
}

export interface MiningResult {
  version: string
  engine: string
  timestamp: string
  profileId: string
  dataQuality: MiningDataQuality
  normalisedSkills: NormalisedSkill[]
  transactions: Transaction[]
  coOccurrences: SkillCoOccurrence[]
  frequentItemsets: FrequentItemset[]
  associationRules: AssociationRule[]
  careerMatches: CareerRoleMatch[]
  skillGaps: SkillGap[]
  graphData: {
    nodes: GraphNode[]
    edges: GraphEdge[]
  }
}
