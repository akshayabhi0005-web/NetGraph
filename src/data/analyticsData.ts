// Analytics Data for NETGRAPH Career Intelligence Platform

export interface SkillCategoryDist {
  category: string;
  count: number;
  marketAvg: number;
  color: string;
}

export const skillDistributionData: SkillCategoryDist[] = [
  { category: 'Prog Languages', count: 4, marketAvg: 3.2, color: '#3B82F6' },
  { category: 'Web Development', count: 4, marketAvg: 3.8, color: '#06B6D4' },
  { category: 'Databases', count: 2, marketAvg: 2.1, color: '#0284C7' },
  { category: 'Data Science', count: 3, marketAvg: 2.4, color: '#8B5CF6' },
  { category: 'Machine Learning', count: 2, marketAvg: 1.8, color: '#A855F7' },
  { category: 'Cloud Computing', count: 2, marketAvg: 2.0, color: '#0EA5E9' },
  { category: 'Development Tools', count: 2, marketAvg: 2.9, color: '#64748B' },
  { category: 'Soft Skills', count: 3, marketAvg: 2.5, color: '#F59E0B' },
];

export interface RoleCoverageData {
  role: string;
  matched: number;
  gap: number;
  coveragePct: number;
}

export const roleCoverageDataset: RoleCoverageData[] = [
  { role: 'Data Scientist', matched: 7, gap: 3, coveragePct: 88 },
  { role: 'Full-Stack Developer', matched: 7, gap: 3, coveragePct: 92 },
  { role: 'ML Engineer', matched: 5, gap: 4, coveragePct: 79 },
  { role: 'Software Engineer', matched: 6, gap: 3, coveragePct: 90 },
  { role: 'Data Analyst', matched: 6, gap: 3, coveragePct: 94 },
  { role: 'BI Analyst', matched: 4, gap: 3, coveragePct: 81 },
];

export interface TrendPoint {
  period: string;
  Python: number;
  React: number;
  TypeScript: number;
  'Machine Learning': number;
  SQL: number;
  Docker: number;
}

export const skillDemandTrends6M: TrendPoint[] = [
  { period: 'May 2026', Python: 82, React: 78, TypeScript: 76, 'Machine Learning': 70, SQL: 85, Docker: 68 },
  { period: 'Jun 2026', Python: 84, React: 80, TypeScript: 79, 'Machine Learning': 72, SQL: 85, Docker: 70 },
  { period: 'Jul 2026', Python: 87, React: 83, TypeScript: 82, 'Machine Learning': 76, SQL: 87, Docker: 73 },
  { period: 'Aug 2026', Python: 91, React: 86, TypeScript: 86, 'Machine Learning': 81, SQL: 88, Docker: 77 },
  { period: 'Sep 2026', Python: 93, React: 89, TypeScript: 89, 'Machine Learning': 85, SQL: 90, Docker: 82 },
  { period: 'Oct 2026', Python: 95, React: 92, TypeScript: 92, 'Machine Learning': 88, SQL: 91, Docker: 85 },
];

export const skillDemandTrends1Y: TrendPoint[] = [
  { period: 'Q4 2025', Python: 78, React: 74, TypeScript: 71, 'Machine Learning': 65, SQL: 82, Docker: 64 },
  { period: 'Q1 2026', Python: 83, React: 79, TypeScript: 78, 'Machine Learning': 71, SQL: 84, Docker: 69 },
  { period: 'Q2 2026', Python: 88, React: 84, TypeScript: 83, 'Machine Learning': 77, SQL: 87, Docker: 75 },
  { period: 'Q3 2026', Python: 95, React: 92, TypeScript: 92, 'Machine Learning': 88, SQL: 91, Docker: 85 },
];

export const projectTechFrequency = [
  { tech: 'Python', count: 6, percentage: 85 },
  { tech: 'React', count: 5, percentage: 71 },
  { tech: 'TypeScript', count: 5, percentage: 71 },
  { tech: 'FastAPI', count: 4, percentage: 57 },
  { tech: 'PostgreSQL / SQL', count: 4, percentage: 57 },
  { tech: 'Docker', count: 3, percentage: 42 },
  { tech: 'Three.js', count: 2, percentage: 28 },
  { tech: 'Neo4j', count: 2, percentage: 28 },
];
