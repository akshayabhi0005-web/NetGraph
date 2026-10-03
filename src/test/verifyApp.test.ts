import { describe, it, expect } from 'vitest';
import { initialDemoProfile } from '../data/demoUser';
import { mockCareerRoles } from '../data/careerRoles';
import { fullMockGraph } from '../data/graphData';
import { generateCareerReportPDF } from '../utils/pdfGenerator';
import { initialReportHistory } from '../data/sampleReports';

describe('NETGRAPH Platform Core Logic & Data Verification', () => {
  it('loads valid initial demo user profile', () => {
    expect(initialDemoProfile.fullName).toBe('Akshay N');
    expect(initialDemoProfile.skills.length).toBeGreaterThanOrEqual(15);
    expect(initialDemoProfile.projects.length).toBeGreaterThanOrEqual(3);
    expect(initialDemoProfile.education.length).toBeGreaterThanOrEqual(1);
  });

  it('contains comprehensive career roles with aligned competencies', () => {
    expect(mockCareerRoles.length).toBeGreaterThanOrEqual(6);
    const dataScientist = mockCareerRoles.find((r) => r.id === 'role_data_scientist');
    expect(dataScientist).toBeDefined();
    expect(dataScientist?.alignmentPercentage).toBe(88);
    expect(dataScientist?.matchedSkills).toContain('Python');
    expect(dataScientist?.missingSkills.length).toBeGreaterThan(0);
  });

  it('has consistent 3D knowledge graph structure', () => {
    expect(fullMockGraph.nodes.length).toBeGreaterThanOrEqual(20);
    expect(fullMockGraph.edges.length).toBeGreaterThanOrEqual(30);

    const nodeIds = new Set(fullMockGraph.nodes.map((n) => n.id));
    fullMockGraph.edges.forEach((edge) => {
      expect(nodeIds.has(edge.source)).toBe(true);
      expect(nodeIds.has(edge.target)).toBe(true);
    });
  });

  it('generates multi-page A4 PDF career report successfully', () => {
    const report = initialReportHistory[0];
    const role = mockCareerRoles[0];
    const doc = generateCareerReportPDF(report, initialDemoProfile, role);

    expect(doc).toBeDefined();
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210, 0); // A4 width mm
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297, 0); // A4 height mm
  });
});
