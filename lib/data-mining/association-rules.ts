/**
 * NETGRAPH Data-Mining Engine — Association Rule & Co-Occurrence Mining
 * Computes frequency counts, Support, Confidence, and Lift across profile transactions.
 * Distinguishes empirically mined personal co-occurrences from population-wide priors.
 */

import {
  Transaction,
  SkillCoOccurrence,
  FrequentItemset,
  AssociationRule,
} from './types'

export interface AssociationMiningOptions {
  minSupport?: number // Default: 0.1 (or 1 transaction if small sample)
  minConfidence?: number // Default: 0.3
  maxRules?: number // Default: 50
}

export interface AssociationMiningOutput {
  coOccurrences: SkillCoOccurrence[]
  frequentItemsets: FrequentItemset[]
  rules: AssociationRule[]
}

/**
 * Mines item co-occurrences, frequent itemsets, and association rules from transactions.
 *
 * Mathematical Definitions:
 * - Support(A) = Count(A) / N
 * - Support(A -> B) = Count(A ∪ B) / N
 * - Confidence(A -> B) = Count(A ∪ B) / Count(A)
 * - Lift(A -> B) = Confidence(A -> B) / Support(B) = (Count(A ∪ B) * N) / (Count(A) * Count(B))
 */
export function mineAssociationRules(
  transactions: Transaction[],
  options: AssociationMiningOptions = {}
): AssociationMiningOutput {
  const N = transactions.length

  // Edge cases: No transactions
  if (N === 0) {
    return {
      coOccurrences: [],
      frequentItemsets: [],
      rules: [],
    }
  }

  // 1. Calculate Single Item Frequencies (1-itemsets)
  const itemCounts = new Map<string, number>()
  for (const tx of transactions) {
    for (const item of tx.items) {
      itemCounts.set(item, (itemCounts.get(item) || 0) + 1)
    }
  }

  // 2. Calculate Pairwise Co-occurrences (2-itemsets)
  const pairCounts = new Map<string, { count: number; txIds: string[] }>()

  for (const tx of transactions) {
    const items = [...new Set(tx.items)].sort()
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const pairKey = `${items[i]}|||${items[j]}`
        const existing = pairCounts.get(pairKey)
        if (existing) {
          existing.count += 1
          existing.txIds.push(tx.id)
        } else {
          pairCounts.set(pairKey, { count: 1, txIds: [tx.id] })
        }
      }
    }
  }

  // 3. Format Co-occurrences List
  const coOccurrences: SkillCoOccurrence[] = []
  pairCounts.forEach((data, key) => {
    const [skillA, skillB] = key.split('|||')
    coOccurrences.push({
      skillA,
      skillB,
      count: data.count,
      transactions: data.txIds,
    })
  })
  coOccurrences.sort((a, b) => b.count - a.count)

  // 4. Frequent Itemsets (1-itemsets and 2-itemsets)
  // Adaptive minSupport: at least 1 transaction
  const minSup = Math.max(options.minSupport ?? 0.1, 1 / N)
  const frequentItemsets: FrequentItemset[] = []

  // Add frequent 1-itemsets
  itemCounts.forEach((cnt, item) => {
    const sup = cnt / N
    if (sup >= minSup) {
      frequentItemsets.push({
        items: [item],
        count: cnt,
        support: round4(sup),
      })
    }
  })

  // Add frequent 2-itemsets
  for (const co of coOccurrences) {
    const sup = co.count / N
    if (sup >= minSup) {
      frequentItemsets.push({
        items: [co.skillA, co.skillB],
        count: co.count,
        support: round4(sup),
      })
    }
  }

  // 5. Generate Directional Association Rules (A -> B and B -> A)
  const minConf = options.minConfidence ?? 0.3
  const rawRules: AssociationRule[] = []

  for (const co of coOccurrences) {
    const pairCount = co.count
    const pairSupport = pairCount / N

    const countA = itemCounts.get(co.skillA) || 0
    const countB = itemCounts.get(co.skillB) || 0

    // Rule: SkillA -> SkillB
    if (countA > 0 && countB > 0) {
      const confAtoB = pairCount / countA
      const supB = countB / N
      const liftAtoB = supB > 0 ? confAtoB / supB : 0

      if (confAtoB >= minConf) {
        rawRules.push({
          antecedent: [co.skillA],
          consequent: [co.skillB],
          antecedentSupport: round4(countA / N),
          consequentSupport: round4(supB),
          support: round4(pairSupport),
          confidence: round4(confAtoB),
          lift: round4(liftAtoB),
          transactionCount: pairCount,
          evidence: `Mined from ${pairCount} transaction${pairCount > 1 ? 's' : ''} (Support: ${(pairSupport * 100).toFixed(0)}%, Confidence: ${(confAtoB * 100).toFixed(0)}%, Lift: ${liftAtoB.toFixed(2)}).`,
        })
      }

      // Rule: SkillB -> SkillA
      const confBtoA = pairCount / countB
      const supA = countA / N
      const liftBtoA = supA > 0 ? confBtoA / supA : 0

      if (confBtoA >= minConf) {
        rawRules.push({
          antecedent: [co.skillB],
          consequent: [co.skillA],
          antecedentSupport: round4(countB / N),
          consequentSupport: round4(supA),
          support: round4(pairSupport),
          confidence: round4(confBtoA),
          lift: round4(liftBtoA),
          transactionCount: pairCount,
          evidence: `Mined from ${pairCount} transaction${pairCount > 1 ? 's' : ''} (Support: ${(pairSupport * 100).toFixed(0)}%, Confidence: ${(confBtoA * 100).toFixed(0)}%, Lift: ${liftBtoA.toFixed(2)}).`,
        })
      }
    }
  }

  // Sort rules primarily by Confidence desc, secondarily by Lift desc
  rawRules.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence
    return b.lift - a.lift
  })

  const maxRules = options.maxRules ?? 50
  const rules = rawRules.slice(0, maxRules)

  return {
    coOccurrences,
    frequentItemsets,
    rules,
  }
}

/**
 * Utility to round floats to 4 decimal places for clean display and math stability
 */
function round4(val: number): number {
  return Math.round((val + Number.EPSILON) * 10000) / 10000
}
