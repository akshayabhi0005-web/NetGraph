import { UserProfile } from './auth'
import {
  MiningResult,
  CareerRoleMatch,
  SkillGap,
  NormalisedSkill,
  AssociationRule,
  MiningDataQuality,
} from './data-mining/types'
import {
  EducationEntry,
  ProjectEntry,
  ExperienceEntry,
  CertificationEntry,
} from './profile'

export interface ReportMetadata {
  reportId: string
  generatedAt: string
  dateFormatted: string
  userName: string
  userEmail: string
  profileCompletenessScore: number
  confidenceLevel: 'low' | 'moderate' | 'high'
  isSufficientData: boolean
  hasData: boolean
}

export interface ReportProfileSection {
  headline?: string
  summary?: string
  location?: string
  careerGoal?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  education: EducationEntry[]
  experience: ExperienceEntry[]
  projects: ProjectEntry[]
  certifications: CertificationEntry[]
}

export interface ReportSkillsSection {
  totalSkills: number
  skillsByCategory: Record<string, NormalisedSkill[]>
  topProficientSkills: NormalisedSkill[]
}

export interface ReportCareerMatchesSection {
  topMatches: CareerRoleMatch[]
  totalMatchesEvaluated: number
}

export interface ReportSkillGapsSection {
  gaps: SkillGap[]
  highPriorityCount: number
  mediumPriorityCount: number
}

export interface ReportRelationshipsSection {
  rules: AssociationRule[]
  totalTransactionsMined: number
  totalRulesDiscovered: number
}

export interface ReportAnalyticsSection {
  totalSkills: number
  totalTransactions: number
  totalProjects: number
  totalExperiences: number
  totalCertifications: number
  categoryDistribution: { category: string; count: number; percentage: number }[]
}

export interface ReportLimitationsSection {
  confidenceLevel: 'low' | 'moderate' | 'high'
  warnings: string[]
  explanation: string
  isSufficientData: boolean
}

export interface ReportExecutiveSummarySection {
  summary: string
  strengths: string[]
  improvementAreas: string[]
}

export interface ReportProjectRelationshipsSection {
  projectTechAssociations: {
    projectTitle: string
    technologies: string[]
    description?: string
  }[]
  repeatedSkills: {
    skill: string
    count: number
    sources: string[]
  }[]
  graphFindings: string[]
}

export interface ReportActionPlanSection {
  prioritizedSteps: {
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    timeframe: string
  }[]
  skillsToImprove: {
    skill: string
    targetRole: string
    reason: string
    action: string
  }[]
  recommendedProjects: {
    title: string
    technologies: string[]
    purpose: string
  }[]
  careerPreparationActions: string[]
}

export interface CareerIntelligenceReport {
  metadata: ReportMetadata
  executiveSummary: ReportExecutiveSummarySection
  profile: ReportProfileSection
  skills: ReportSkillsSection
  careerMatches: ReportCareerMatchesSection
  skillGaps: ReportSkillGapsSection
  projectRelationships: ReportProjectRelationshipsSection
  relationships: ReportRelationshipsSection
  actionPlan: ReportActionPlanSection
  analytics: ReportAnalyticsSection
  limitations: ReportLimitationsSection
}
