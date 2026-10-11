/**
 * NETGRAPH Data-Mining Engine — Career Roles Reference Catalog
 * Transparent baseline domain model defining required and recommended skill weights for 8 industry paths.
 */

import { CareerRoleRequirement } from './types'

export const REFERENCE_CAREER_ROLES: CareerRoleRequirement[] = [
  {
    id: 'role_data_analyst',
    title: 'Data Analyst',
    category: 'Analytics & BI',
    description: 'Analyzes structured datasets, formulates business metrics, and delivers dashboards and stakeholder insights.',
    requiredSkills: [
      { name: 'SQL', weight: 1.0, critical: true },
      { name: 'Python', weight: 0.9, critical: true },
      { name: 'Statistics', weight: 0.8, critical: true },
      { name: 'Tableau', weight: 0.7, critical: false },
      { name: 'Pandas', weight: 0.8, critical: true },
    ],
    recommendedSkills: [
      { name: 'Data Mining', weight: 0.6, critical: false },
      { name: 'Power BI', weight: 0.5, critical: false },
      { name: 'PostgreSQL', weight: 0.5, critical: false },
      { name: 'Git', weight: 0.4, critical: false },
    ],
  },
  {
    id: 'role_data_scientist',
    title: 'Data Scientist',
    category: 'Advanced Analytics',
    description: 'Designs predictive statistical models, builds experimentation pipelines, and mines complex relationships.',
    requiredSkills: [
      { name: 'Python', weight: 1.0, critical: true },
      { name: 'SQL', weight: 0.9, critical: true },
      { name: 'Machine Learning', weight: 1.0, critical: true },
      { name: 'Statistics', weight: 0.9, critical: true },
      { name: 'Pandas', weight: 0.8, critical: false },
      { name: 'Scikit-Learn', weight: 0.9, critical: true },
    ],
    recommendedSkills: [
      { name: 'Data Mining', weight: 0.7, critical: false },
      { name: 'Deep Learning', weight: 0.6, critical: false },
      { name: 'Apache Spark', weight: 0.5, critical: false },
      { name: 'AWS', weight: 0.5, critical: false },
      { name: 'Docker', weight: 0.5, critical: false },
    ],
  },
  {
    id: 'role_ml_engineer',
    title: 'Machine Learning Engineer',
    category: 'AI & Systems',
    description: 'Bridges data science and software engineering to deploy, monitor, and optimize ML pipelines in production.',
    requiredSkills: [
      { name: 'Python', weight: 1.0, critical: true },
      { name: 'Machine Learning', weight: 1.0, critical: true },
      { name: 'PyTorch', weight: 0.9, critical: true },
      { name: 'Docker', weight: 0.8, critical: true },
      { name: 'Scikit-Learn', weight: 0.8, critical: false },
      { name: 'FastAPI', weight: 0.7, critical: false },
    ],
    recommendedSkills: [
      { name: 'Deep Learning', weight: 0.7, critical: false },
      { name: 'Kubernetes', weight: 0.6, critical: false },
      { name: 'AWS', weight: 0.6, critical: false },
      { name: 'CI/CD', weight: 0.5, critical: false },
      { name: 'SQL', weight: 0.6, critical: false },
    ],
  },
  {
    id: 'role_software_engineer',
    title: 'Software Engineer',
    category: 'Core Engineering',
    description: 'Builds robust, maintainable full-stack software architectures and reliable backend systems.',
    requiredSkills: [
      { name: 'TypeScript', weight: 0.9, critical: false },
      { name: 'Python', weight: 0.9, critical: false },
      { name: 'Java', weight: 0.8, critical: false },
      { name: 'Git', weight: 0.9, critical: true },
      { name: 'SQL', weight: 0.8, critical: true },
      { name: 'REST APIs', weight: 0.8, critical: true },
    ],
    recommendedSkills: [
      { name: 'Docker', weight: 0.7, critical: false },
      { name: 'PostgreSQL', weight: 0.6, critical: false },
      { name: 'CI/CD', weight: 0.6, critical: false },
      { name: 'Node.js', weight: 0.6, critical: false },
      { name: 'Linux', weight: 0.5, critical: false },
    ],
  },
  {
    id: 'role_frontend_developer',
    title: 'Frontend Developer',
    category: 'Web Engineering',
    description: 'Creates responsive, accessible user interfaces and client-side applications with modern frameworks.',
    requiredSkills: [
      { name: 'JavaScript', weight: 1.0, critical: true },
      { name: 'TypeScript', weight: 0.9, critical: true },
      { name: 'React', weight: 1.0, critical: true },
      { name: 'Next.js', weight: 0.8, critical: false },
      { name: 'Tailwind CSS', weight: 0.7, critical: false },
    ],
    recommendedSkills: [
      { name: 'REST APIs', weight: 0.7, critical: false },
      { name: 'GraphQL', weight: 0.6, critical: false },
      { name: 'Git', weight: 0.7, critical: false },
      { name: 'Node.js', weight: 0.5, critical: false },
    ],
  },
  {
    id: 'role_backend_developer',
    title: 'Backend Developer',
    category: 'Server Engineering',
    description: 'Architects scalable microservices, database schemas, authentication systems, and performant APIs.',
    requiredSkills: [
      { name: 'Node.js', weight: 0.9, critical: false },
      { name: 'Python', weight: 0.9, critical: false },
      { name: 'PostgreSQL', weight: 0.9, critical: true },
      { name: 'REST APIs', weight: 0.9, critical: true },
      { name: 'SQL', weight: 0.9, critical: true },
      { name: 'Docker', weight: 0.8, critical: true },
    ],
    recommendedSkills: [
      { name: 'Redis', weight: 0.7, critical: false },
      { name: 'FastAPI', weight: 0.6, critical: false },
      { name: 'AWS', weight: 0.6, critical: false },
      { name: 'CI/CD', weight: 0.6, critical: false },
      { name: 'MongoDB', weight: 0.5, critical: false },
    ],
  },
  {
    id: 'role_cloud_engineer',
    title: 'Cloud Engineer',
    category: 'Cloud & Infrastructure',
    description: 'Deploys resilient multi-cloud architectures, automates provisioning with IaC, and oversees operations.',
    requiredSkills: [
      { name: 'AWS', weight: 1.0, critical: true },
      { name: 'Docker', weight: 0.9, critical: true },
      { name: 'Kubernetes', weight: 0.9, critical: true },
      { name: 'Linux', weight: 0.8, critical: true },
      { name: 'CI/CD', weight: 0.8, critical: true },
    ],
    recommendedSkills: [
      { name: 'Terraform', weight: 0.7, critical: false },
      { name: 'Google Cloud (GCP)', weight: 0.6, critical: false },
      { name: 'Python', weight: 0.6, critical: false },
      { name: 'Git', weight: 0.6, critical: false },
    ],
  },
  {
    id: 'role_ai_engineer',
    title: 'AI Engineer',
    category: 'AI & Systems',
    description: 'Integrates foundation models, fine-tunes architectures, and constructs intelligent reasoning workflows.',
    requiredSkills: [
      { name: 'Python', weight: 1.0, critical: true },
      { name: 'Artificial Intelligence', weight: 1.0, critical: true },
      { name: 'Deep Learning', weight: 0.9, critical: true },
      { name: 'PyTorch', weight: 0.9, critical: true },
      { name: 'Natural Language Processing', weight: 0.8, critical: false },
    ],
    recommendedSkills: [
      { name: 'Docker', weight: 0.7, critical: false },
      { name: 'FastAPI', weight: 0.6, critical: false },
      { name: 'Machine Learning', weight: 0.8, critical: false },
      { name: 'AWS', weight: 0.5, critical: false },
    ],
  },
]
