/**
 * NETGRAPH Data-Mining Engine — Skill Normalizer & Standardizer
 * Ensures consistent canonical naming, alias resolution, and category tagging.
 */

import { SkillCategory } from '../profile'

/**
 * Standardized mapping of known aliases and abbreviations to canonical names.
 * Key: Lowercase trimmed variant
 * Value: Canonical display name
 */
export const SKILL_ALIAS_MAP: Record<string, string> = {
  // Programming Languages
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'es6': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'py': 'Python',
  'python': 'Python',
  'python3': 'Python',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'golang': 'Go',
  'go': 'Go',
  'rust': 'Rust',
  'java': 'Java',
  'kotlin': 'Kotlin',
  'ruby': 'Ruby',
  'php': 'PHP',
  'r': 'R',

  // Frameworks & Libraries
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'next': 'Next.js',
  'next.js': 'Next.js',
  'nextjs': 'Next.js',
  'vue': 'Vue.js',
  'vue.js': 'Vue.js',
  'angular': 'Angular',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express',
  'express.js': 'Express',
  'fastapi': 'FastAPI',
  'django': 'Django',
  'flask': 'Flask',
  'spring': 'Spring Boot',
  'spring boot': 'Spring Boot',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',

  // Databases
  'sql': 'SQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'postgre sql': 'PostgreSQL',
  'mysql': 'MySQL',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'sqlite': 'SQLite',
  'cassandra': 'Cassandra',
  'dynamodb': 'DynamoDB',
  'neo4j': 'Neo4j',

  // Cloud & DevOps
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'Google Cloud (GCP)',
  'google cloud': 'Google Cloud (GCP)',
  'google cloud platform': 'Google Cloud (GCP)',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'terraform': 'Terraform',
  'linux': 'Linux',

  // Data Science & Machine Learning
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'dl': 'Deep Learning',
  'deep learning': 'Deep Learning',
  'ai': 'Artificial Intelligence',
  'artificial intelligence': 'Artificial Intelligence',
  'nlp': 'Natural Language Processing',
  'natural language processing': 'Natural Language Processing',
  'cv': 'Computer Vision',
  'computer vision': 'Computer Vision',
  'data mining': 'Data Mining',
  'statistics': 'Statistics',
  'stats': 'Statistics',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scikit-learn': 'Scikit-Learn',
  'scikitlearn': 'Scikit-Learn',
  'sklearn': 'Scikit-Learn',
  'pytorch': 'PyTorch',
  'torch': 'PyTorch',
  'tensorflow': 'TensorFlow',
  'tf': 'TensorFlow',
  'keras': 'Keras',
  'tableau': 'Tableau',
  'power bi': 'Power BI',
  'powerbi': 'Power BI',
  'spark': 'Apache Spark',
  'apache spark': 'Apache Spark',

  // Tools & Methodologies
  'git': 'Git',
  'github': 'GitHub',
  'graphql': 'GraphQL',
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'restful': 'REST APIs',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'jira': 'Jira',
}

/**
 * Mapping of canonical skills to their standard category
 */
const CANONICAL_CATEGORY_MAP: Record<string, SkillCategory> = {
  'JavaScript': 'Programming Languages',
  'TypeScript': 'Programming Languages',
  'Python': 'Programming Languages',
  'C++': 'Programming Languages',
  'C#': 'Programming Languages',
  'Go': 'Programming Languages',
  'Rust': 'Programming Languages',
  'Java': 'Programming Languages',
  'Kotlin': 'Programming Languages',
  'Ruby': 'Programming Languages',
  'PHP': 'Programming Languages',
  'R': 'Programming Languages',

  'React': 'Frameworks',
  'Next.js': 'Frameworks',
  'Vue.js': 'Frameworks',
  'Angular': 'Frameworks',
  'Node.js': 'Frameworks',
  'Express': 'Frameworks',
  'FastAPI': 'Frameworks',
  'Django': 'Frameworks',
  'Flask': 'Frameworks',
  'Spring Boot': 'Frameworks',
  'Tailwind CSS': 'Frameworks',

  'SQL': 'Databases',
  'PostgreSQL': 'Databases',
  'MySQL': 'Databases',
  'MongoDB': 'Databases',
  'Redis': 'Databases',
  'SQLite': 'Databases',
  'Cassandra': 'Databases',
  'DynamoDB': 'Databases',
  'Neo4j': 'Databases',

  'AWS': 'Cloud Computing',
  'Google Cloud (GCP)': 'Cloud Computing',
  'Azure': 'Cloud Computing',
  'Docker': 'Cloud Computing',
  'Kubernetes': 'Cloud Computing',
  'CI/CD': 'Cloud Computing',
  'Terraform': 'Cloud Computing',
  'Linux': 'Cloud Computing',

  'Data Mining': 'Data Science',
  'Statistics': 'Data Science',
  'Pandas': 'Data Science',
  'NumPy': 'Data Science',
  'Tableau': 'Data Science',
  'Power BI': 'Data Science',
  'Apache Spark': 'Data Science',

  'Machine Learning': 'Machine Learning',
  'Deep Learning': 'Machine Learning',
  'Artificial Intelligence': 'Machine Learning',
  'Natural Language Processing': 'Machine Learning',
  'Computer Vision': 'Machine Learning',
  'Scikit-Learn': 'Machine Learning',
  'PyTorch': 'Machine Learning',
  'TensorFlow': 'Machine Learning',
  'Keras': 'Machine Learning',

  'Git': 'Tools',
  'GitHub': 'Tools',
  'GraphQL': 'Tools',
  'REST APIs': 'Tools',
  'Agile': 'Other',
  'Scrum': 'Other',
  'Jira': 'Tools',
}

/**
 * Normalises a raw skill string:
 * 1. Trims whitespace and removes leading/trailing punctuation
 * 2. Checks against alias dictionary
 * 3. Falls back to Title Case representation
 */
export function normaliseSkillName(rawName: string): string {
  if (!rawName) return ''
  const trimmed = rawName.trim().replace(/^[\s,.;:/-]+|[\s,.;:/-]+$/g, '')
  if (!trimmed) return ''

  const lookupKey = trimmed.toLowerCase()
  if (SKILL_ALIAS_MAP[lookupKey]) {
    return SKILL_ALIAS_MAP[lookupKey]
  }

  // Preserve acronyms if all uppercase (e.g. "SQL", "API", "GNN")
  if (trimmed === trimmed.toUpperCase() && trimmed.length <= 5) {
    return trimmed
  }

  // Default to standard Title Case for unmapped skills
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Infers a standard SkillCategory for a given normalised skill name
 */
export function inferSkillCategory(skillName: string, fallback?: SkillCategory): SkillCategory {
  const canonical = normaliseSkillName(skillName)
  if (CANONICAL_CATEGORY_MAP[canonical]) {
    return CANONICAL_CATEGORY_MAP[canonical]
  }
  if (fallback && fallback !== 'Other') {
    return fallback
  }

  const lower = canonical.toLowerCase()
  if (lower.includes('cloud') || lower.includes('server') || lower.includes('devops')) return 'Cloud Computing'
  if (lower.includes('data') || lower.includes('analytics') || lower.includes('statistics')) return 'Data Science'
  if (lower.includes('learn') || lower.includes('intelligence') || lower.includes('neural')) return 'Machine Learning'
  if (lower.includes('database') || lower.includes('db') || lower.includes('sql')) return 'Databases'
  if (lower.includes('framework') || lower.includes('library') || lower.includes('ui')) return 'Frameworks'
  if (lower.includes('language') || lower.includes('script')) return 'Programming Languages'

  return 'Tools'
}
