/**
 * NETGRAPH Data-Mining Engine — Graph Data Generator
 * Translates processed profile entities, mined co-occurrences, and career alignments into a graph structure.
 */

import { UserProfile } from '../auth'
import {
  NormalisedSkill,
  SkillCoOccurrence,
  CareerRoleMatch,
  GraphNode,
  GraphEdge,
} from './types'
import { normaliseSkillName } from './normalizer'

export interface GeneratedGraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

/**
 * Builds deduplicated Graph Nodes and Edges from profile data and data-mining results.
 */
export function generateGraphData(
  profile: Partial<UserProfile> | null,
  skills: NormalisedSkill[],
  coOccurrences: SkillCoOccurrence[],
  careerMatches: CareerRoleMatch[]
): GeneratedGraphData {
  const nodeMap = new Map<string, GraphNode>()
  const edgeMap = new Map<string, GraphEdge>()

  // Helper to safely add node
  const addNode = (node: GraphNode) => {
    if (!nodeMap.has(node.id)) {
      nodeMap.set(node.id, node)
    }
  }

  // Helper to add edge with deduplication
  const addEdge = (edge: GraphEdge) => {
    // Only add if both source and target exist
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      return
    }

    // Normalise pair key for undirected or directed deduplication
    const edgeKey = `${edge.source}--->${edge.target}:::${edge.type}`
    if (!edgeMap.has(edgeKey)) {
      edgeMap.set(edgeKey, edge)
    }
  }

  // 1. Generate Skill Nodes
  for (const s of skills) {
    const nodeId = `skill_${s.normalisedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    addNode({
      id: nodeId,
      label: s.normalisedName,
      type: 'skill',
      category: s.category,
      proficiency: s.proficiency,
      evidence: `Appears across ${s.provenance.join(', ')}. Demonstrated at ${s.proficiency} proficiency.`,
      metadata: {
        rawName: s.rawName,
        yearsOfExperience: s.yearsOfExperience,
      },
    })
  }

  // 2. Generate Project Nodes & 'used_in_project' Edges
  if (profile?.projects && Array.isArray(profile.projects)) {
    profile.projects.forEach((proj, idx) => {
      if (!proj || !proj.title) return
      const projNodeId = `proj_${proj.id || idx}`
      addNode({
        id: projNodeId,
        label: proj.title,
        type: 'project',
        evidence: `Project portfolio entry. Technologies: ${(proj.technologies || []).join(', ') || 'None specified'}.`,
        metadata: {
          projectUrl: proj.projectUrl,
          githubUrl: proj.githubUrl,
        },
      })

      // Create edges to skills
      if (proj.technologies && Array.isArray(proj.technologies)) {
        for (const t of proj.technologies) {
          const canonical = normaliseSkillName(t)
          const targetSkillId = `skill_${canonical.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
          if (nodeMap.has(targetSkillId)) {
            addEdge({
              id: `edge_${projNodeId}_${targetSkillId}`,
              source: projNodeId,
              target: targetSkillId,
              type: 'used_in_project',
              weight: 0.9,
              evidence: `Implemented within project "${proj.title}".`,
            })
          }
        }
      }
    })
  }

  // 3. Generate Experience Nodes & 'used_in_experience' Edges
  if (profile?.experience && Array.isArray(profile.experience)) {
    profile.experience.forEach((exp, idx) => {
      if (!exp || !exp.company) return
      const expNodeId = `exp_${exp.id || idx}`
      addNode({
        id: expNodeId,
        label: `${exp.jobTitle || 'Role'} @ ${exp.company}`,
        type: 'experience',
        evidence: `Work experience at ${exp.company} (${exp.startDate || ''} to ${exp.isCurrent ? 'Present' : exp.endDate || ''}).`,
      })

      if (exp.technologies && Array.isArray(exp.technologies)) {
        for (const t of exp.technologies) {
          const canonical = normaliseSkillName(t)
          const targetSkillId = `skill_${canonical.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
          if (nodeMap.has(targetSkillId)) {
            addEdge({
              id: `edge_${expNodeId}_${targetSkillId}`,
              source: expNodeId,
              target: targetSkillId,
              type: 'used_in_experience',
              weight: 1.0,
              evidence: `Utilized during role at ${exp.company}.`,
            })
          }
        }
      }
    })
  }

  // 4. Generate Education Nodes & 'studied_in' Edges
  if (profile?.education && Array.isArray(profile.education)) {
    profile.education.forEach((edu, idx) => {
      if (!edu || !edu.institution) return
      const eduNodeId = `edu_${edu.id || idx}`
      addNode({
        id: eduNodeId,
        label: `${edu.degree || 'Degree'} (${edu.institution})`,
        type: 'education',
        evidence: `Academic program at ${edu.institution} in ${edu.fieldOfStudy || 'Field'}.`,
        metadata: {
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          graduationYear: edu.graduationYear,
        },
      })

      // Connect education to skills mentioned in coursework
      if (edu.coursework) {
        const courses = edu.coursework.split(/[,;\n]+/).map((c) => c.trim()).filter(Boolean)
        for (const c of courses) {
          const canonical = normaliseSkillName(c)
          const targetSkillId = `skill_${canonical.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
          if (nodeMap.has(targetSkillId)) {
            addEdge({
              id: `edge_${eduNodeId}_${targetSkillId}`,
              source: eduNodeId,
              target: targetSkillId,
              type: 'studied_in',
              weight: 0.8,
              evidence: `Covered in academic coursework "${c}" at ${edu.institution}.`,
            })
          }
        }
      }
    })
  }

  // 5. Generate Certification Nodes & 'certified_by' Edges
  if (profile?.certifications && Array.isArray(profile.certifications)) {
    profile.certifications.forEach((cert, idx) => {
      if (!cert || !cert.name) return
      const certNodeId = `cert_${cert.id || idx}`
      addNode({
        id: certNodeId,
        label: cert.name,
        type: 'certification',
        evidence: `Industry certification accredited by ${cert.issuer || 'Issuer'}.`,
        metadata: {
          issuer: cert.issuer,
          issueDate: cert.issueDate,
          credentialUrl: cert.credentialUrl,
        },
      })

      // Connect certification to related skill if name directly correlates
      const canonical = normaliseSkillName(cert.name)
      const directTargetSkillId = `skill_${canonical.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      if (nodeMap.has(directTargetSkillId)) {
        addEdge({
          id: `edge_${certNodeId}_${directTargetSkillId}`,
          source: certNodeId,
          target: directTargetSkillId,
          type: 'certified_by',
          weight: 0.85,
          evidence: `Verified credential for ${canonical}.`,
        })
      }

      // Also check if any profile skill is referenced in the certification name
      const certLower = cert.name.toLowerCase()
      for (const s of skills) {
        if (s.normalisedName.length >= 3 && certLower.includes(s.normalisedName.toLowerCase())) {
          const targetSkillId = `skill_${s.normalisedName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
          if (nodeMap.has(targetSkillId)) {
            addEdge({
              id: `edge_${certNodeId}_${targetSkillId}`,
              source: certNodeId,
              target: targetSkillId,
              type: 'certified_by',
              weight: 0.85,
              evidence: `Credential accredited by ${cert.issuer || 'Issuer'} verifies proficiency in ${s.normalisedName}.`,
            })
          }
        }
      }
    })
  }

  // 6. Generate Skill Co-Occurrence Edges (Skill <-> Skill)
  const maxCoCount = Math.max(...coOccurrences.map((c) => c.count), 1)
  for (const co of coOccurrences) {
    const skillAId = `skill_${co.skillA.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
    const skillBId = `skill_${co.skillB.toLowerCase().replace(/[^a-z0-9]/g, '_')}`

    if (nodeMap.has(skillAId) && nodeMap.has(skillBId)) {
      // Normalize weight between 0.3 and 1.0
      const weight = 0.3 + (co.count / maxCoCount) * 0.7
      addEdge({
        id: `edge_co_${skillAId}_${skillBId}`,
        source: skillAId,
        target: skillBId,
        type: 'co_occurred',
        weight: Math.round(weight * 100) / 100,
        evidence: `Co-occurred in ${co.count} portfolio transaction${co.count > 1 ? 's' : ''}.`,
      })
    }
  }

  // 7. Generate Career Role Nodes & 'supports_role' Edges for top matches (>= 25%)
  const topMatches = careerMatches.filter((m) => m.matchScore >= 25).slice(0, 4)
  for (const match of topMatches) {
    const roleNodeId = `role_${match.roleId}`
    addNode({
      id: roleNodeId,
      label: match.roleTitle,
      type: 'career_role',
      category: match.category,
      evidence: `Target career path with ${match.matchScore}% alignment based on profile skills.`,
      metadata: {
        matchScore: match.matchScore,
      },
    })

    // Connect matched skills to this role
    for (const matchedSkill of match.matchedSkills) {
      const canonical = normaliseSkillName(matchedSkill.name)
      const skillNodeId = `skill_${canonical.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      if (nodeMap.has(skillNodeId)) {
        addEdge({
          id: `edge_${skillNodeId}_${roleNodeId}`,
          source: skillNodeId,
          target: roleNodeId,
          type: 'supports_role',
          weight: matchedSkill.weight,
          evidence: `Constitutes a core capability for ${match.roleTitle}.`,
        })
      }
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  }
}
