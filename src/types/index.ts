// Domain Types for NETGRAPH Career Intelligence Platform

export type SkillCategory =
  | 'Programming Languages'
  | 'Web Development'
  | 'Databases'
  | 'Data Science'
  | 'Machine Learning'
  | 'Cloud Computing'
  | 'Development Tools'
  | 'Soft Skills';

export type SkillType = 'technical' | 'soft' | 'tool';

export type SkillSource = 'user' | 'resume' | 'project' | 'github';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  type: SkillType;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  source: SkillSource;
  projectsCount?: number;
  marketDemand?: number; // 0 - 100
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  graduationYear: string;
  grade?: string;
  coursework?: string[];
}

export interface ExperienceItem {
  id: string;
  organization: string;
  jobTitle: string;
  employmentType: 'Full-time' | 'Internship' | 'Part-time' | 'Contract';
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  technologiesUsed: string[];
  projectUrl?: string;
  githubUrl?: string;
  role?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface ExternalLinks {
  github?: string;
  linkedin?: string;
  leetcode?: string;
  geeksforgeeks?: string;
  portfolio?: string;
  other?: string;
}

export interface CareerPreferences {
  preferredRoles: string[];
  preferredLocation: string;
  workMode: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  targetSalary?: string;
  employmentPreference: 'Full-time' | 'Internship' | 'Contract';
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  headline: string;
  bio: string;
  location: string;
  avatarUrl?: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  careerPreferences: CareerPreferences;
  links: ExternalLinks;
  resumeFile?: {
    name: string;
    size: number;
    uploadDate: string;
    extractedSkillCount?: number;
  };
  lastAnalysisDate?: string;
  lastAnalysisId?: string;
}

export interface CareerRoleMatch {
  id: string;
  title: string;
  category: string;
  description: string;
  alignmentPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  partiallyMatchedSkills: string[];
  relatedTechnologies: string[];
  averageSalary: string;
  hiringTrend: 'High' | 'Growing' | 'Stable';
  openPositionsCount: number;
  recommendedCertifications: string[];
}

// 3D Graph Node & Edge Types
export type NodeCategory =
  | 'Skill'
  | 'Technology'
  | 'Job Role'
  | 'Project'
  | 'Certification'
  | 'Skill Category';

export type RelationshipType =
  | 'REQUIRES_SKILL'
  | 'RELATED_TO'
  | 'USES_TECHNOLOGY'
  | 'MENTIONS'
  | 'BELONGS_TO'
  | 'DEMONSTRATED_IN'
  | 'CONNECTED_TO_ROLE';

export interface GraphNode {
  id: string;
  label: string;
  category: NodeCategory;
  description: string;
  connectionsCount: number;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  evidence?: string;
  relevanceScore?: number;
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  relationship: RelationshipType;
  isInferred: boolean;
  strength?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CareerMilestone {
  step: number;
  title: string;
  stage: 'Foundation' | 'Intermediate Specialization' | 'Advanced Execution' | 'Role Attainment';
  description: string;
  requiredSkills: string[];
  recommendedProjects: string[];
  estimatedTimeline: string;
  completed: boolean;
}

export interface CareerPathway {
  id: string;
  targetRole: string;
  targetCategory: string;
  summary: string;
  overallReadiness: number;
  startingSkills: string[];
  intermediateSkills: string[];
  milestones: CareerMilestone[];
  suggestedProjects: string[];
  relatedCertifications: string[];
}

export type ReportType =
  | 'complete'
  | 'skill-analysis'
  | 'career-alignment'
  | 'skill-gap'
  | 'analytics-summary';

export interface ReportConfig {
  id: string;
  title: string;
  type: ReportType;
  generatedAt: string;
  userName: string;
  selectedRole: string;
  sections: {
    cover: boolean;
    executiveSummary: boolean;
    profileOverview: boolean;
    skillAnalysis: boolean;
    careerAlignment: boolean;
    skillGap: boolean;
    analytics: boolean;
    graphInsights: boolean;
    careerPathways: boolean;
    recommendations: boolean;
    resumeSummary: boolean;
  };
  metricsSnapshot: {
    totalSkills: number;
    techSkillsCount: number;
    projectsCount: number;
    careerMatchesCount: number;
    overallCoverage: number;
    topRole: string;
  };
}

export interface ResumeDraft {
  id: string;
  template: 'minimal' | 'professional' | 'modern' | 'technical';
  personalDetails: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    photoUrl?: string;
  };
  summary: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  lastSaved: string;
}
