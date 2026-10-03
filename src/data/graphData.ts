import { GraphData, GraphNode, GraphEdge } from '../types';

export const mockGraphNodes: GraphNode[] = [
  // --- Job Roles ---
  { id: 'node_role_ds', label: 'Data Scientist', category: 'Job Role', description: 'Extracts strategic insights through predictive modeling, data mining, and machine learning.', connectionsCount: 8, color: '#4F46E5', size: 1.4, evidence: 'Labor market demand index 2026' },
  { id: 'node_role_fs', label: 'Full-Stack Developer', category: 'Job Role', description: 'Architects comprehensive web solutions across client interfaces and backend microservices.', connectionsCount: 9, color: '#4338CA', size: 1.4, evidence: 'Industry career taxonomy v4' },
  { id: 'node_role_ml', label: 'ML Engineer', category: 'Job Role', description: 'Deploys production-grade inference pipelines and scalable machine learning workflows.', connectionsCount: 7, color: '#6366F1', size: 1.3, evidence: 'Tech hiring benchmark 2026' },
  { id: 'node_role_se', label: 'Software Engineer', category: 'Job Role', description: 'Builds core software algorithms, distributed architectures, and maintainable services.', connectionsCount: 8, color: '#3730A3', size: 1.3, evidence: 'Core computing standard curriculum' },
  { id: 'node_role_da', label: 'Data Analyst', category: 'Job Role', description: 'Translates raw transactional data into business intelligence dashboards and statistical summaries.', connectionsCount: 6, color: '#4F46E5', size: 1.2, evidence: 'Analytics hiring requirements' },

  // --- Skills ---
  { id: 'node_sk_python', label: 'Python', category: 'Skill', description: 'Core multi-paradigm programming language for data mining, AI, scripting, and web backends.', connectionsCount: 11, color: '#3B82F6', size: 1.2, evidence: 'Demonstrated in 6 projects & resume' },
  { id: 'node_sk_react', label: 'React', category: 'Skill', description: 'Component-based declarative UI library for high-performance interactive web applications.', connectionsCount: 7, color: '#06B6D4', size: 1.1, evidence: 'Lead framework in NETGRAPH project' },
  { id: 'node_sk_ts', label: 'TypeScript', category: 'Skill', description: 'Typed superset of JavaScript providing static compile-time safety for enterprise codebases.', connectionsCount: 8, color: '#2563EB', size: 1.1, evidence: 'Used in 5 repository codebases' },
  { id: 'node_sk_sql', label: 'SQL', category: 'Skill', description: 'Structured Query Language for relational database querying, schema design, and aggregation.', connectionsCount: 8, color: '#0284C7', size: 1.1, evidence: 'Demonstrated in projects and internships' },
  { id: 'node_sk_ml', label: 'Machine Learning', category: 'Skill', description: 'Algorithms and statistical models that learn from training data to predict outcomes.', connectionsCount: 7, color: '#8B5CF6', size: 1.15, evidence: 'Academic coursework & predictive analyzer' },
  { id: 'node_sk_mining', label: 'Data Mining', category: 'Skill', description: 'Discovery of hidden patterns, association rules, and clusters in large multidimensional datasets.', connectionsCount: 6, color: '#7C3AED', size: 1.2, evidence: 'Core project theme and research publication' },
  { id: 'node_sk_docker', label: 'Docker', category: 'Skill', description: 'Operating-system-level container virtualization for reproducible deployments.', connectionsCount: 5, color: '#0284C7', size: 1.0, evidence: 'Internship & microservices deployment' },
  { id: 'node_sk_graphalgo', label: 'Graph Algorithms', category: 'Skill', description: 'Breadth/depth traversal, PageRank, Dijkstra shortest path, and community detection.', connectionsCount: 5, color: '#9333EA', size: 1.05, evidence: 'Academic specialization' },
  { id: 'node_sk_cloud', label: 'Cloud Computing', category: 'Skill', description: 'Architecting distributed compute, storage, and networking on elastic cloud providers.', connectionsCount: 5, color: '#0EA5E9', size: 1.0, evidence: 'AWS Certified Cloud Practitioner' },
  { id: 'node_sk_fastapi', label: 'FastAPI', category: 'Skill', description: 'Modern asynchronous Python REST API framework based on standard type hints.', connectionsCount: 6, color: '#10B981', size: 1.0, evidence: 'Backend API for NETGRAPH' },
  { id: 'node_sk_soft', label: 'Analytical Thinking', category: 'Skill', description: 'Structured decomposition of ambiguous problems into verifiable empirical hypotheses.', connectionsCount: 5, color: '#F59E0B', size: 0.95, evidence: 'Demonstrated in peer-reviewed research' },

  // --- Technologies ---
  { id: 'node_tech_threejs', label: 'Three.js', category: 'Technology', description: 'WebGL-powered 3D computer graphics library rendering real-time network graphs.', connectionsCount: 4, color: '#14B8A6', size: 1.0, evidence: '3D Graph Engine implementation' },
  { id: 'node_tech_postgres', label: 'PostgreSQL', category: 'Technology', description: 'Advanced open-source object-relational database with ACID compliance and JSON support.', connectionsCount: 6, color: '#336791', size: 1.05, evidence: 'Primary transactional storage' },
  { id: 'node_tech_neo4j', label: 'Neo4j', category: 'Technology', description: 'Native graph database engine optimized for Cypher traversal across skill relationships.', connectionsCount: 5, color: '#008CC1', size: 1.0, evidence: 'Research internship graph queries' },
  { id: 'node_tech_tailwind', label: 'Tailwind CSS', category: 'Technology', description: 'Utility-first modern CSS framework enabling refined, responsive SaaS designs.', connectionsCount: 4, color: '#38BDF8', size: 0.95, evidence: 'Frontend styling layer' },
  { id: 'node_tech_pytorch', label: 'PyTorch', category: 'Technology', description: 'Deep learning framework for tensor computation with strong GPU acceleration.', connectionsCount: 4, color: '#EE4C2C', size: 0.95, evidence: 'Target skill gap requirement' },
  { id: 'node_tech_git', label: 'Git & GitHub', category: 'Technology', description: 'Distributed version control and social coding platform tracking project repositories.', connectionsCount: 6, color: '#475569', size: 0.95, evidence: 'Public profile activity verified' },

  // --- Projects ---
  { id: 'node_proj_netgraph', label: 'Project: NETGRAPH', category: 'Project', description: 'Interactive career intelligence platform analyzing relationships between skills and opportunities.', connectionsCount: 8, color: '#4F46E5', size: 1.25, evidence: 'Lead academic capstone project' },
  { id: 'node_proj_demand', label: 'Project: Demand Miner', category: 'Project', description: 'Market vacancy extraction engine identifying required tech stacks from 40k+ listings.', connectionsCount: 5, color: '#6366F1', size: 1.1, evidence: 'GitHub repository published' },
  { id: 'node_proj_recommender', label: 'Project: Career Graph Rec', category: 'Project', description: 'Community detection recommendation engine routing users along optimal skill pathways.', connectionsCount: 5, color: '#4338CA', size: 1.1, evidence: 'Research lab implementation' },

  // --- Certifications ---
  { id: 'node_cert_aws', label: 'Cert: AWS Practitioner', category: 'Certification', description: 'Amazon Web Services foundational cloud computing credential.', connectionsCount: 3, color: '#F59E0B', size: 0.95, evidence: 'Credential ID AWSCP-7741' },
  { id: 'node_cert_mining', label: 'Cert: Data Mining Specialist', category: 'Certification', description: 'Advanced certification in knowledge discovery and associative pattern analysis.', connectionsCount: 3, color: '#EAB308', size: 0.95, evidence: 'Verified academic certificate' },

  // --- Skill Categories ---
  { id: 'node_cat_lang', label: 'Prog Languages', category: 'Skill Category', description: 'Foundational syntax and compilers supporting all software development.', connectionsCount: 4, color: '#64748B', size: 1.0, evidence: 'Taxonomy Category' },
  { id: 'node_cat_web', label: 'Web Tech', category: 'Skill Category', description: 'Client and server protocols, frameworks, and responsive rendering systems.', connectionsCount: 4, color: '#64748B', size: 1.0, evidence: 'Taxonomy Category' },
  { id: 'node_cat_data', label: 'Data Science & AI', category: 'Skill Category', description: 'Mathematical, mining, and algorithmic methods converting raw bits into knowledge.', connectionsCount: 5, color: '#64748B', size: 1.0, evidence: 'Taxonomy Category' },
];

export const mockGraphEdges: GraphEdge[] = [
  // Role requirements
  { source: 'node_role_ds', target: 'node_sk_python', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.95 },
  { source: 'node_role_ds', target: 'node_sk_sql', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.90 },
  { source: 'node_role_ds', target: 'node_sk_ml', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.92 },
  { source: 'node_role_ds', target: 'node_sk_mining', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.88 },
  { source: 'node_role_ds', target: 'node_tech_pytorch', relationship: 'REQUIRES_SKILL', isInferred: true, strength: 0.75 },

  { source: 'node_role_fs', target: 'node_sk_react', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.94 },
  { source: 'node_role_fs', target: 'node_sk_ts', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.92 },
  { source: 'node_role_fs', target: 'node_sk_fastapi', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.85 },
  { source: 'node_role_fs', target: 'node_sk_sql', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.88 },
  { source: 'node_role_fs', target: 'node_sk_docker', relationship: 'REQUIRES_SKILL', isInferred: true, strength: 0.80 },

  { source: 'node_role_ml', target: 'node_sk_python', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.96 },
  { source: 'node_role_ml', target: 'node_sk_ml', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.95 },
  { source: 'node_role_ml', target: 'node_tech_pytorch', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.90 },
  { source: 'node_role_ml', target: 'node_sk_docker', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.82 },

  { source: 'node_role_se', target: 'node_sk_python', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.88 },
  { source: 'node_role_se', target: 'node_sk_ts', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.89 },
  { source: 'node_role_se', target: 'node_tech_git', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.92 },
  { source: 'node_role_se', target: 'node_sk_sql', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.85 },

  { source: 'node_role_da', target: 'node_sk_sql', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.95 },
  { source: 'node_role_da', target: 'node_sk_python', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.86 },
  { source: 'node_role_da', target: 'node_sk_soft', relationship: 'REQUIRES_SKILL', isInferred: false, strength: 0.90 },

  // Project demonstrations
  { source: 'node_proj_netgraph', target: 'node_sk_react', relationship: 'DEMONSTRATED_IN', isInferred: false, strength: 0.95 },
  { source: 'node_proj_netgraph', target: 'node_sk_ts', relationship: 'DEMONSTRATED_IN', isInferred: false, strength: 0.92 },
  { source: 'node_proj_netgraph', target: 'node_tech_threejs', relationship: 'USES_TECHNOLOGY', isInferred: false, strength: 0.96 },
  { source: 'node_proj_netgraph', target: 'node_sk_fastapi', relationship: 'USES_TECHNOLOGY', isInferred: false, strength: 0.88 },
  { source: 'node_proj_netgraph', target: 'node_tech_tailwind', relationship: 'USES_TECHNOLOGY', isInferred: false, strength: 0.90 },
  { source: 'node_proj_netgraph', target: 'node_sk_mining', relationship: 'DEMONSTRATED_IN', isInferred: false, strength: 0.94 },

  { source: 'node_proj_demand', target: 'node_sk_python', relationship: 'DEMONSTRATED_IN', isInferred: false, strength: 0.90 },
  { source: 'node_proj_demand', target: 'node_sk_mining', relationship: 'DEMONSTRATED_IN', isInferred: false, strength: 0.92 },
  { source: 'node_proj_demand', target: 'node_tech_postgres', relationship: 'USES_TECHNOLOGY', isInferred: false, strength: 0.85 },

  { source: 'node_proj_recommender', target: 'node_sk_graphalgo', relationship: 'DEMONSTRATED_IN', isInferred: false, strength: 0.94 },
  { source: 'node_proj_recommender', target: 'node_tech_neo4j', relationship: 'USES_TECHNOLOGY', isInferred: false, strength: 0.90 },
  { source: 'node_proj_recommender', target: 'node_sk_python', relationship: 'DEMONSTRATED_IN', isInferred: false, strength: 0.86 },

  // Relationships between skills and technologies
  { source: 'node_sk_python', target: 'node_sk_ml', relationship: 'RELATED_TO', isInferred: false, strength: 0.92 },
  { source: 'node_sk_ml', target: 'node_sk_mining', relationship: 'RELATED_TO', isInferred: false, strength: 0.88 },
  { source: 'node_sk_mining', target: 'node_sk_graphalgo', relationship: 'RELATED_TO', isInferred: false, strength: 0.85 },
  { source: 'node_sk_react', target: 'node_sk_ts', relationship: 'RELATED_TO', isInferred: false, strength: 0.90 },
  { source: 'node_sk_react', target: 'node_tech_threejs', relationship: 'RELATED_TO', isInferred: true, strength: 0.72 },
  { source: 'node_sk_sql', target: 'node_tech_postgres', relationship: 'RELATED_TO', isInferred: false, strength: 0.95 },
  { source: 'node_sk_graphalgo', target: 'node_tech_neo4j', relationship: 'RELATED_TO', isInferred: false, strength: 0.89 },
  { source: 'node_sk_docker', target: 'node_sk_cloud', relationship: 'RELATED_TO', isInferred: false, strength: 0.82 },
  { source: 'node_cert_aws', target: 'node_sk_cloud', relationship: 'MENTIONS', isInferred: false, strength: 0.95 },
  { source: 'node_cert_mining', target: 'node_sk_mining', relationship: 'MENTIONS', isInferred: false, strength: 0.94 },

  // Category associations
  { source: 'node_sk_python', target: 'node_cat_lang', relationship: 'BELONGS_TO', isInferred: false, strength: 0.98 },
  { source: 'node_sk_ts', target: 'node_cat_lang', relationship: 'BELONGS_TO', isInferred: false, strength: 0.98 },
  { source: 'node_sk_react', target: 'node_cat_web', relationship: 'BELONGS_TO', isInferred: false, strength: 0.95 },
  { source: 'node_sk_fastapi', target: 'node_cat_web', relationship: 'BELONGS_TO', isInferred: false, strength: 0.90 },
  { source: 'node_sk_mining', target: 'node_cat_data', relationship: 'BELONGS_TO', isInferred: false, strength: 0.96 },
  { source: 'node_sk_ml', target: 'node_cat_data', relationship: 'BELONGS_TO', isInferred: false, strength: 0.95 },
];

export const fullMockGraph: GraphData = {
  nodes: mockGraphNodes,
  edges: mockGraphEdges,
};
