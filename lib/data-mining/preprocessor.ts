/**
 * NETGRAPH Data-Mining Engine — Preprocessor & Transaction Builder
 * Extracts, standardizes, deduplicates profile entities, and builds co-occurrence transactions.
 */

import { UserProfile } from '../auth'
import { SkillProficiency } from '../profile'
import {
  NormalisedSkill,
  Transaction,
  SkillProvenance,
  MiningDataQuality,
} from './types'
import { normaliseSkillName, inferSkillCategory } from './normalizer'

export interface PreprocessedProfile {
  skills: NormalisedSkill[]
  transactions: Transaction[]
  dataQuality: MiningDataQuality
}

/**
 * Preprocesses a raw user profile into normalized entities and transaction sets.
 */
export function preprocessProfile(profile: Partial<UserProfile> | null): PreprocessedProfile {
  const skillMap = new Map<string, NormalisedSkill>()
  const transactions: Transaction[] = []

  if (!profile) {
    return {
      skills: [],
      transactions: [],
      dataQuality: {
        totalSkillsIdentified: 0,
        totalTransactionsMined: 0,
        hasProjects: false,
        hasExperience: false,
        hasEducation: false,
        isSufficientData: false,
        confidenceLevel: 'low',
        warnings: ['Profile is empty or uninitialized. No data available for mining.'],
        explanation: 'Add technical skills, projects, or work history to begin relationship mining.',
      },
    }
  }

  // 1. Ingest explicit skills from user profile
  if (profile.skillsList && Array.isArray(profile.skillsList)) {
    for (const item of profile.skillsList) {
      if (!item || !item.name) continue
      const canonical = normaliseSkillName(item.name)
      if (!canonical) continue

      const category = item.category || inferSkillCategory(canonical)
      const proficiency = item.proficiency || 'Intermediate'
      const years = item.yearsOfExperience

      addOrMergeSkill(skillMap, {
        id: item.id || `sk_${canonical.toLowerCase().replace(/\s+/g, '_')}`,
        rawName: item.name,
        normalisedName: canonical,
        category,
        proficiency,
        provenance: ['profile_skills'],
        yearsOfExperience: years,
      })
    }
  }

  // 2. Ingest legacy skills string array if present
  if (profile.skills && Array.isArray(profile.skills)) {
    for (const raw of profile.skills) {
      if (typeof raw !== 'string') continue
      const canonical = normaliseSkillName(raw)
      if (!canonical) continue

      addOrMergeSkill(skillMap, {
        id: `sk_leg_${canonical.toLowerCase().replace(/\s+/g, '_')}`,
        rawName: raw,
        normalisedName: canonical,
        category: inferSkillCategory(canonical),
        proficiency: 'Intermediate',
        provenance: ['profile_skills'],
      })
    }
  }

  // 3. Process Projects into Transactions & Extract Tech
  if (profile.projects && Array.isArray(profile.projects)) {
    profile.projects.forEach((proj, idx) => {
      if (!proj) return
      const rawTechs = Array.isArray(proj.technologies) ? proj.technologies : []
      const projectItems = new Set<string>()

      for (const t of rawTechs) {
        if (!t || typeof t !== 'string') continue
        const canonical = normaliseSkillName(t)
        if (!canonical) continue

        projectItems.add(canonical)

        // Register skill in master inventory if not already present
        addOrMergeSkill(skillMap, {
          id: `sk_proj_${canonical.toLowerCase().replace(/\s+/g, '_')}`,
          rawName: t,
          normalisedName: canonical,
          category: inferSkillCategory(canonical),
          proficiency: 'Intermediate',
          provenance: ['project'],
        })
      }

      if (projectItems.size > 0) {
        transactions.push({
          id: proj.id || `tx_proj_${idx}`,
          sourceType: 'project',
          sourceTitle: proj.title || `Project #${idx + 1}`,
          items: Array.from(projectItems).sort(),
        })
      }
    })
  }

  // 4. Process Experience into Transactions & Extract Tech
  if (profile.experience && Array.isArray(profile.experience)) {
    profile.experience.forEach((exp, idx) => {
      if (!exp) return
      const rawTechs = Array.isArray(exp.technologies) ? exp.technologies : []
      const expItems = new Set<string>()

      for (const t of rawTechs) {
        if (!t || typeof t !== 'string') continue
        const canonical = normaliseSkillName(t)
        if (!canonical) continue

        expItems.add(canonical)

        addOrMergeSkill(skillMap, {
          id: `sk_exp_${canonical.toLowerCase().replace(/\s+/g, '_')}`,
          rawName: t,
          normalisedName: canonical,
          category: inferSkillCategory(canonical),
          proficiency: 'Advanced',
          provenance: ['experience'],
        })
      }

      if (expItems.size > 0) {
        transactions.push({
          id: exp.id || `tx_exp_${idx}`,
          sourceType: 'experience',
          sourceTitle: `${exp.jobTitle || 'Role'} at ${exp.company || 'Company'}`,
          items: Array.from(expItems).sort(),
        })
      }
    })
  }

  // 5. Process Coursework from Education
  if (profile.education && Array.isArray(profile.education)) {
    profile.education.forEach((edu, idx) => {
      if (!edu || !edu.coursework) return
      const courses = edu.coursework.split(/[,;\n]+/).map((c) => c.trim()).filter(Boolean)
      const eduItems = new Set<string>()

      for (const course of courses) {
        const canonical = normaliseSkillName(course)
        if (!canonical) continue
        eduItems.add(canonical)

        addOrMergeSkill(skillMap, {
          id: `sk_edu_${canonical.toLowerCase().replace(/\s+/g, '_')}`,
          rawName: course,
          normalisedName: canonical,
          category: inferSkillCategory(canonical, 'Data Science'),
          proficiency: 'Beginner',
          provenance: ['education_coursework'],
        })
      }

      if (eduItems.size >= 2) {
        transactions.push({
          id: edu.id || `tx_edu_${idx}`,
          sourceType: 'coursework',
          sourceTitle: `Coursework at ${edu.institution || 'University'}`,
          items: Array.from(eduItems).sort(),
        })
      }
    })
  }

  // 6. Process Certifications
  if (profile.certifications && Array.isArray(profile.certifications)) {
    for (const cert of profile.certifications) {
      if (!cert || !cert.name) continue
      const canonical = normaliseSkillName(cert.name)
      if (!canonical) continue

      addOrMergeSkill(skillMap, {
        id: cert.id || `sk_cert_${canonical.toLowerCase().replace(/\s+/g, '_')}`,
        rawName: cert.name,
        normalisedName: canonical,
        category: inferSkillCategory(canonical, 'Cloud Computing'),
        proficiency: 'Advanced',
        provenance: ['certification'],
      })
    }
  }

  // 7. Evaluate Data Quality & Confidence
  const totalSkills = skillMap.size
  const totalTx = transactions.length
  const hasProjects = (profile.projects?.length || 0) > 0
  const hasExperience = (profile.experience?.length || 0) > 0
  const hasEducation = (profile.education?.length || 0) > 0

  const warnings: string[] = []
  let confidenceLevel: 'low' | 'moderate' | 'high' = 'high'

  if (totalSkills === 0) {
    warnings.push('No technical skills discovered in profile.')
    confidenceLevel = 'low'
  } else if (totalSkills < 4) {
    warnings.push(`Only ${totalSkills} skills found. Add more skills for richer network mining.`)
    confidenceLevel = 'low'
  }

  if (totalTx === 0) {
    warnings.push('No co-occurrence transactions found (add technologies to projects or experience).')
    confidenceLevel = 'low'
  } else if (totalTx < 3) {
    warnings.push(`Small transaction sample (${totalTx} transaction${totalTx > 1 ? 's' : ''}). Association metrics reflect personal portfolio patterns rather than population-scale rules.`)
    if (confidenceLevel !== 'low') confidenceLevel = 'moderate'
  }

  const isSufficientData = totalSkills >= 2 && totalTx >= 1

  const explanation =
    confidenceLevel === 'high'
      ? `Strong profile fidelity: mined ${totalSkills} skills across ${totalTx} project/work transactions.`
      : confidenceLevel === 'moderate'
      ? `Moderate profile fidelity: mined ${totalSkills} skills across ${totalTx} transactions. Associations represent your personal technology combinations.`
      : 'Initial profile data: Add more projects, experience, or skills to unlock high-confidence association rules.'

  return {
    skills: Array.from(skillMap.values()),
    transactions,
    dataQuality: {
      totalSkillsIdentified: totalSkills,
      totalTransactionsMined: totalTx,
      hasProjects,
      hasExperience,
      hasEducation,
      isSufficientData,
      confidenceLevel,
      warnings,
      explanation,
    },
  }
}

/**
 * Helper to add or merge a skill into the map, merging provenance and preserving higher proficiency.
 */
function addOrMergeSkill(
  map: Map<string, NormalisedSkill>,
  incoming: {
    id: string
    rawName: string
    normalisedName: string
    category: import('../profile').SkillCategory
    proficiency: SkillProficiency
    provenance: SkillProvenance[]
    yearsOfExperience?: number
  }
) {
  const key = incoming.normalisedName.toLowerCase()
  const existing = map.get(key)

  if (!existing) {
    map.set(key, { ...incoming })
    return
  }

  // Merge provenance without duplicates
  const provSet = new Set([...existing.provenance, ...incoming.provenance])
  existing.provenance = Array.from(provSet)

  // Preserve highest proficiency
  const rank: Record<SkillProficiency, number> = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
    Expert: 4,
  }
  if (rank[incoming.proficiency] > rank[existing.proficiency]) {
    existing.proficiency = incoming.proficiency
  }

  // Preserve max years of experience if present
  if (incoming.yearsOfExperience) {
    existing.yearsOfExperience = Math.max(
      existing.yearsOfExperience || 0,
      incoming.yearsOfExperience
    )
  }
}
