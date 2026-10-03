import { describe, it, expect } from 'vitest';
import { routesConfig } from '../app/router';
import { mockCareerRoles } from '../data/careerRoles';

describe('Router & Route Definitions', () => {
  it('has all public and protected routes configured', () => {
    const paths = routesConfig.map((r: any) => r.path).filter(Boolean);

    // Public routes
    expect(paths).toContain('/');
    expect(paths).toContain('/login');
    expect(paths).toContain('/signup');
    expect(paths).toContain('/forgot-password');
    expect(paths).toContain('/privacy');
    expect(paths).toContain('/terms');

    // Protected child routes under AppLayout
    const layoutRoute = routesConfig.find((r: any) => r.children);
    expect(layoutRoute).toBeDefined();

    const childPaths = layoutRoute?.children?.map((c: any) => c.path);
    expect(childPaths).toContain('/dashboard');
    expect(childPaths).toContain('/profile');
    expect(childPaths).toContain('/skill-analysis');
    expect(childPaths).toContain('/career-matches');
    expect(childPaths).toContain('/skill-gap');
    expect(childPaths).toContain('/analytics');
    expect(childPaths).toContain('/graph-explorer');
    expect(childPaths).toContain('/career-paths');
    expect(childPaths).toContain('/reports');
    expect(childPaths).toContain('/resume-builder');
    expect(childPaths).toContain('/settings');
  });

  it('verifies all career roles have non-empty required data', () => {
    mockCareerRoles.forEach((role) => {
      expect(role.id).toBeTruthy();
      expect(role.title).toBeTruthy();
      expect(role.alignmentPercentage).toBeGreaterThan(0);
      expect(role.matchedSkills.length).toBeGreaterThan(0);
      expect(role.missingSkills.length).toBeGreaterThan(0);
      expect(role.recommendedCertifications.length).toBeGreaterThan(0);
    });
  });
});
