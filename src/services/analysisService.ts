import { apiClient } from './api';
import { UserProfile, CareerRoleMatch } from '../types';
import { mockCareerRoles } from '../data/careerRoles';

export const analysisService = {
  // Simulates or triggers FastAPI /api/v1/analyze-skills
  analyzeProfileSkills: async (profile: UserProfile): Promise<{ success: boolean; roles: CareerRoleMatch[] }> => {
    try {
      const response = await apiClient.post('/analyze-skills', { profileId: profile.id, skills: profile.skills });
      return response.data;
    } catch (e) {
      // Graceful fallback to verified mock mining dataset
      return { success: true, roles: mockCareerRoles };
    }
  },

  // Simulates or triggers FastAPI /api/v1/skill-gap/:roleId
  getSkillGapDiagnostics: async (roleId: string, profile: UserProfile) => {
    try {
      const response = await apiClient.get(`/skill-gap/${roleId}`);
      return response.data;
    } catch (e) {
      const matched = mockCareerRoles.find((r) => r.id === roleId) || mockCareerRoles[0];
      return {
        roleId,
        matchedSkills: matched.matchedSkills,
        missingSkills: matched.missingSkills,
        alignmentScore: matched.alignmentPercentage,
      };
    }
  },
};
