/**
 * NETGRAPH Shared Career Analysis Service
 * Provides access to the data-mining engine for all client views, ensuring
 * a single source of truth and reactive recalculation when profiles update.
 */

import { UserProfile } from './auth'
import { mineUserProfile, MiningResult } from './data-mining'

/**
 * Computes the complete data-mining analysis for a given user profile.
 * Deterministic and pure function — safe to call inside useMemo or server components.
 */
export function getProfileAnalysis(profile: Partial<UserProfile> | null): MiningResult {
  return mineUserProfile(profile)
}

/**
 * Helper to check if a profile has sufficient data for meaningful analysis
 */
export function hasSufficientAnalysisData(analysis: MiningResult): boolean {
  return analysis.dataQuality.isSufficientData
}
