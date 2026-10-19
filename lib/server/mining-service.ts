/**
 * NETGRAPH Server-Side Real Data-Mining Service
 *
 * Orchestrates the full data-mining pipeline for authenticated users:
 * 1. Scoped PostgreSQL profile retrieval (Prisma)
 * 2. Data validation, normalization & deduplication
 * 3. Feature extraction & co-occurrence transaction generation
 * 4. Deterministic Apriori association rule mining (Support, Confidence, Lift)
 * 5. Explainable career role matching and prioritized skill gap derivation
 * 6. Multi-entity relationship graph generation (Nodes, Edges, Weights)
 * 7. In-memory caching with instant invalidation on profile mutations
 */

import { isDatabaseConfigured } from './prisma'
import { getCompleteUserProfile } from './profile-service'
import {
  mineUserProfile,
  mineAssociationRules,
  MiningResult,
  NormalisedSkill,
  CareerRoleMatch,
  SkillGap,
  SkillCoOccurrence,
  AssociationRule,
  FrequentItemset,
  GraphNode,
  GraphEdge,
  MiningDataQuality,
} from '../data-mining'
import { normalizeServerUser, ServerUserRecord } from '../api-client'
import { calculateProfileCompleteness } from '../profile'
import {
  getCachedMiningResult,
  setCachedMiningResult,
  invalidateMiningCache,
} from './mining-cache'

export { invalidateMiningCache }

// ─────────────────────────────────────────────────────────────────────────────
// 2. Core Mining Pipeline Execution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Executes the complete data-mining engine against the authenticated user's
 * real profile stored in PostgreSQL.
 */
export async function getAuthenticatedMiningResult(
  userId: string
): Promise<{ result: MiningResult; completeness: number } | null> {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED')
  }

  // Check valid cache entry
  const cached = getCachedMiningResult(userId)
  if (cached) {
    return { result: cached.result, completeness: cached.completeness }
  }

  // Retrieve complete user profile strictly scoped to userId
  const rawRecord = await getCompleteUserProfile(userId)
  if (!rawRecord) {
    return null
  }

  // Normalize server record to standard UserProfile structure
  const normalizedUser = normalizeServerUser(rawRecord as unknown as ServerUserRecord)

  // Execute deterministic data-mining engine
  const miningResult = mineUserProfile(normalizedUser)
  const completeness = calculateProfileCompleteness(normalizedUser)

  // Store in cache
  setCachedMiningResult(userId, miningResult, completeness)

  return { result: miningResult, completeness }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Analytics Overview Data Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsOverviewData {
  summary: {
    totalSkills: number
    totalProjects: number
    totalExperience: number
    totalEducation: number
    totalCertifications: number
    totalTransactions: number
    profileCompleteness: number
    isSufficientData: boolean
    confidenceLevel: 'low' | 'moderate' | 'high'
  }
  skillCategories: { category: string; count: number }[]
  skillProficiencies: { proficiency: string; count: number }[]
  topCareerMatches: CareerRoleMatch[]
  topAssociationRules: AssociationRule[]
  dataQuality: MiningDataQuality
  meta: {
    engine: string
    version: string
    timestamp: string
    isDemoData: boolean
  }
}

export async function getUserAnalyticsOverview(userId: string): Promise<AnalyticsOverviewData | null> {
  const data = await getAuthenticatedMiningResult(userId)
  if (!data) return null

  const { result, completeness } = data

  // Calculate category distribution
  const categoryMap = new Map<string, number>()
  const proficiencyMap = new Map<string, number>()

  for (const s of result.normalisedSkills) {
    categoryMap.set(s.category, (categoryMap.get(s.category) || 0) + 1)
    proficiencyMap.set(s.proficiency, (proficiencyMap.get(s.proficiency) || 0) + 1)
  }

  const skillCategories = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const skillProficiencies = Array.from(proficiencyMap.entries())
    .map(([proficiency, count]) => ({ proficiency, count }))
    .sort((a, b) => b.count - a.count)

  return {
    summary: {
      totalSkills: result.normalisedSkills.length,
      totalProjects: result.dataQuality.hasProjects ? 1 : 0, // Profile entity verification
      totalExperience: result.dataQuality.hasExperience ? 1 : 0,
      totalEducation: result.dataQuality.hasEducation ? 1 : 0,
      totalCertifications: result.graphData.nodes.filter((n) => n.type === 'certification').length,
      totalTransactions: result.transactions.length,
      profileCompleteness: completeness,
      isSufficientData: result.dataQuality.isSufficientData,
      confidenceLevel: result.dataQuality.confidenceLevel,
    },
    skillCategories,
    skillProficiencies,
    topCareerMatches: result.careerMatches.slice(0, 5),
    topAssociationRules: result.associationRules.slice(0, 6),
    dataQuality: result.dataQuality,
    meta: {
      engine: result.engine,
      version: result.version,
      timestamp: result.timestamp,
      isDemoData: false,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Skills Specific Analytics Data Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface SkillsAnalyticsData {
  skills: NormalisedSkill[]
  totalCount: number
  categoryDistribution: { category: string; count: number }[]
  proficiencyDistribution: { proficiency: string; count: number }[]
  provenanceDistribution: { provenance: string; count: number }[]
  dataQuality: MiningDataQuality
}

export async function getUserSkillsAnalytics(userId: string): Promise<SkillsAnalyticsData | null> {
  const data = await getAuthenticatedMiningResult(userId)
  if (!data) return null

  const { result } = data
  const skills = result.normalisedSkills

  const catMap = new Map<string, number>()
  const profMap = new Map<string, number>()
  const provMap = new Map<string, number>()

  for (const s of skills) {
    catMap.set(s.category, (catMap.get(s.category) || 0) + 1)
    profMap.set(s.proficiency, (profMap.get(s.proficiency) || 0) + 1)
    for (const p of s.provenance) {
      provMap.set(p, (provMap.get(p) || 0) + 1)
    }
  }

  return {
    skills,
    totalCount: skills.length,
    categoryDistribution: Array.from(catMap.entries()).map(([category, count]) => ({ category, count })),
    proficiencyDistribution: Array.from(profMap.entries()).map(([proficiency, count]) => ({ proficiency, count })),
    provenanceDistribution: Array.from(provMap.entries()).map(([provenance, count]) => ({ provenance, count })),
    dataQuality: result.dataQuality,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Careers & Skill Gaps Analytics Data Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface CareersAnalyticsData {
  careerMatches: CareerRoleMatch[]
  topMatch: CareerRoleMatch | undefined
  skillGaps: SkillGap[]
  availableCategories: string[]
  totalRolesEvaluated: number
  dataQuality: MiningDataQuality
}

export async function getUserCareersAnalytics(
  userId: string,
  options?: { category?: string; minScore?: number; limit?: number }
): Promise<CareersAnalyticsData | null> {
  const data = await getAuthenticatedMiningResult(userId)
  if (!data) return null

  const { result } = data
  let matches = [...result.careerMatches]

  // Filter by category if specified
  if (options?.category && options.category !== 'all') {
    matches = matches.filter((m) => m.category.toLowerCase() === options.category!.toLowerCase())
  }

  // Filter by minScore if specified
  if (options?.minScore !== undefined && options.minScore > 0) {
    matches = matches.filter((m) => m.matchScore >= options.minScore!)
  }

  // Apply limit
  const limit = options?.limit ?? 20
  const limitedMatches = matches.slice(0, limit)

  // Derive unique categories
  const catSet = new Set<string>()
  result.careerMatches.forEach((m) => catSet.add(m.category))

  return {
    careerMatches: limitedMatches,
    topMatch: result.careerMatches[0],
    skillGaps: result.skillGaps,
    availableCategories: Array.from(catSet).sort(),
    totalRolesEvaluated: result.careerMatches.length,
    dataQuality: result.dataQuality,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Association Rules Data Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface AssociationAnalyticsData {
  coOccurrences: SkillCoOccurrence[]
  frequentItemsets: FrequentItemset[]
  rules: AssociationRule[]
  metricsSummary: {
    totalTransactions: number
    totalCoOccurrences: number
    totalFrequentItemsets: number
    totalRules: number
    minSupport: number
    minConfidence: number
  }
  metricsExplanations: {
    support: string
    confidence: string
    lift: string
  }
  dataQuality: MiningDataQuality
}

export async function getUserAssociationAnalytics(
  userId: string,
  options?: { minSupport?: number; minConfidence?: number; limit?: number }
): Promise<AssociationAnalyticsData | null> {
  const data = await getAuthenticatedMiningResult(userId)
  if (!data) return null

  const { result } = data

  // If custom thresholds provided, run Apriori with user-specified parameters
  let coOccurrences = result.coOccurrences
  let frequentItemsets = result.frequentItemsets
  let rules = result.associationRules

  const minSup = options?.minSupport ?? 0.1
  const minConf = options?.minConfidence ?? 0.25
  const limit = options?.limit ?? 40

  if (minSup !== 0.1 || minConf !== 0.25 || limit !== 40) {
    const custom = mineAssociationRules(result.transactions, {
      minSupport: minSup,
      minConfidence: minConf,
      maxRules: limit,
    })
    coOccurrences = custom.coOccurrences
    frequentItemsets = custom.frequentItemsets
    rules = custom.rules
  } else if (limit < rules.length) {
    rules = rules.slice(0, limit)
  }

  return {
    coOccurrences,
    frequentItemsets,
    rules,
    metricsSummary: {
      totalTransactions: result.transactions.length,
      totalCoOccurrences: coOccurrences.length,
      totalFrequentItemsets: frequentItemsets.length,
      totalRules: rules.length,
      minSupport: minSup,
      minConfidence: minConf,
    },
    metricsExplanations: {
      support: 'Frequency with which the skill itemset co-occurs across your projects and work history (Count / Total Transactions).',
      confidence: 'Likelihood that Skill B is present given that Skill A is used in the same project or experience (Count(A ∪ B) / Count(A)).',
      lift: 'Strength of the association compared to random chance. Lift > 1.0 indicates positive correlation; Lift < 1.0 indicates substitute technologies.',
    },
    dataQuality: result.dataQuality,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Relationship Graph Data Provider
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphAnalyticsData {
  nodes: GraphNode[]
  edges: GraphEdge[]
  summary: {
    totalNodes: number
    totalEdges: number
    nodeTypeCounts: Record<string, number>
    edgeTypeCounts: Record<string, number>
  }
  dataQuality: MiningDataQuality
}

export async function getUserGraphAnalytics(
  userId: string,
  options?: { nodeType?: string; limit?: number }
): Promise<GraphAnalyticsData | null> {
  const data = await getAuthenticatedMiningResult(userId)
  if (!data) return null

  const { result } = data
  let nodes = [...result.graphData.nodes]
  let edges = [...result.graphData.edges]

  // Filter nodes if specific type requested
  if (options?.nodeType && options.nodeType !== 'all') {
    nodes = nodes.filter((n) => n.type === options.nodeType)
    const validNodeIds = new Set(nodes.map((n) => n.id))
    edges = edges.filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
  }

  // Apply node limit if specified
  if (options?.limit && options.limit > 0 && nodes.length > options.limit) {
    nodes = nodes.slice(0, options.limit)
    const validNodeIds = new Set(nodes.map((n) => n.id))
    edges = edges.filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target))
  }

  // Count breakdowns
  const nodeTypeCounts: Record<string, number> = {}
  for (const n of result.graphData.nodes) {
    nodeTypeCounts[n.type] = (nodeTypeCounts[n.type] || 0) + 1
  }

  const edgeTypeCounts: Record<string, number> = {}
  for (const e of result.graphData.edges) {
    edgeTypeCounts[e.type] = (edgeTypeCounts[e.type] || 0) + 1
  }

  return {
    nodes,
    edges,
    summary: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypeCounts,
      edgeTypeCounts,
    },
    dataQuality: result.dataQuality,
  }
}
