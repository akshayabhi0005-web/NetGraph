/**
 * NETGRAPH In-Memory Data-Mining Result Cache
 *
 * Provides short-TTL caching for computationally derived data-mining results
 * with instant invalidation upon profile mutations.
 */

import { MiningResult } from '../data-mining'

export interface CachedMiningEntry {
  timestamp: number
  result: MiningResult
  completeness: number
}

const CACHE_TTL_MS = 10_000 // 10 seconds TTL
const cache = new Map<string, CachedMiningEntry>()

export function getCachedMiningResult(userId: string): CachedMiningEntry | null {
  const entry = cache.get(userId)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(userId)
    return null
  }
  return entry
}

export function setCachedMiningResult(userId: string, result: MiningResult, completeness: number): void {
  cache.set(userId, {
    timestamp: Date.now(),
    result,
    completeness,
  })
}

export function invalidateMiningCache(userId: string): void {
  cache.delete(userId)
}

export function clearMiningCache(): void {
  cache.clear()
}
