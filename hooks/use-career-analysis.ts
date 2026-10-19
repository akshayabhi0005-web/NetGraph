'use client'

import { useMemo } from 'react'
import { useAuth } from '@/context/auth-context'
import { getProfileAnalysis } from '@/lib/analysis-service'
import {
  MiningResult,
  CareerRoleMatch,
  SkillGap,
  NormalisedSkill,
  SkillCoOccurrence,
  AssociationRule,
  GraphNode,
  GraphEdge,
  MiningDataQuality,
} from '@/lib/data-mining/types'

export interface CareerAnalysisHook {
  analysis: MiningResult
  user: ReturnType<typeof useAuth>['user']
  isLoading: boolean
  authMode: 'server' | 'demo' | null
  isDemoData: boolean
  careerMatches: CareerRoleMatch[]
  skillGaps: SkillGap[]
  skills: NormalisedSkill[]
  coOccurrences: SkillCoOccurrence[]
  associationRules: AssociationRule[]
  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]
  dataQuality: MiningDataQuality
  topMatch: CareerRoleMatch | undefined
}

/**
 * Custom hook to provide real-time, reactive data-mining intelligence
 * across any component or page in the NETGRAPH application.
 * Recalculates deterministically whenever the user's profile changes in auth context.
 */
export function useCareerAnalysis(): CareerAnalysisHook {
  const { user, isLoading, authMode } = useAuth()

  // Deterministically recompute mining analysis whenever the user object updates
  const analysis = useMemo(() => {
    return getProfileAnalysis(user)
  }, [user])

  const isDemoData = authMode === 'demo'

  return {
    analysis,
    user,
    isLoading,
    authMode,
    isDemoData,
    careerMatches: analysis.careerMatches,
    skillGaps: analysis.skillGaps,
    skills: analysis.normalisedSkills,
    coOccurrences: analysis.coOccurrences,
    associationRules: analysis.associationRules,
    graphNodes: analysis.graphData.nodes,
    graphEdges: analysis.graphData.edges,
    dataQuality: analysis.dataQuality,
    topMatch: analysis.careerMatches[0],
  }
}
