import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  CareerRoleMatch,
  GraphData,
  ReportConfig,
  ResumeDraft,
  SkillItem,
  ProjectItem,
  EducationItem,
  ExperienceItem,
  CertificationItem,
} from '../types';
import { initialDemoProfile } from '../data/demoUser';
import { mockCareerRoles } from '../data/careerRoles';
import { fullMockGraph } from '../data/graphData';
import { initialReportHistory } from '../data/sampleReports';

interface AppDataContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addSkill: (skill: Omit<SkillItem, 'id'>) => void;
  removeSkill: (id: string) => void;
  updateSkill: (id: string, updates: Partial<SkillItem>) => void;
  addProject: (project: Omit<ProjectItem, 'id'>) => void;
  removeProject: (id: string) => void;
  addEducation: (edu: Omit<EducationItem, 'id'>) => void;
  removeEducation: (id: string) => void;
  addExperience: (exp: Omit<ExperienceItem, 'id'>) => void;
  removeExperience: (id: string) => void;
  addCertification: (cert: Omit<CertificationItem, 'id'>) => void;
  removeCertification: (id: string) => void;
  handleResumeUpload: (file: File) => Promise<{ success: boolean; extractedSkills: number }>;
  removeResumeFile: () => void;
  careerRoles: CareerRoleMatch[];
  selectedRole: CareerRoleMatch;
  setSelectedRoleId: (id: string) => void;
  graphData: GraphData;
  reports: ReportConfig[];
  addReport: (report: ReportConfig) => void;
  deleteReport: (id: string) => void;
  resumeDraft: ResumeDraft;
  updateResumeDraft: (draft: Partial<ResumeDraft>) => void;
  isAnalyzing: boolean;
  analysisProgress: number;
  analysisStage: string;
  runSkillAnalysis: () => Promise<void>;
  resetToDemoData: () => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialResumeDraft: ResumeDraft = {
  id: 'draft_default_01',
  template: 'professional',
  personalDetails: {
    fullName: initialDemoProfile.fullName,
    professionalTitle: initialDemoProfile.headline,
    email: initialDemoProfile.email,
    phone: initialDemoProfile.phone || '+91 98765 43210',
    location: initialDemoProfile.location,
    portfolioUrl: initialDemoProfile.links.portfolio,
    githubUrl: initialDemoProfile.links.github,
    linkedinUrl: initialDemoProfile.links.linkedin,
  },
  summary: initialDemoProfile.bio,
  education: initialDemoProfile.education,
  experience: initialDemoProfile.experience,
  skills: initialDemoProfile.skills.map((s) => s.name),
  projects: initialDemoProfile.projects,
  certifications: initialDemoProfile.certifications,
  lastSaved: '2026-10-03 16:45',
};

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('netgraph_profile_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialDemoProfile;
      }
    }
    return initialDemoProfile;
  });

  const [careerRoles, setCareerRoles] = useState<CareerRoleMatch[]>(mockCareerRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('role_data_scientist');
  const [graphData, setGraphData] = useState<GraphData>(fullMockGraph);
  const [reports, setReports] = useState<ReportConfig[]>(() => {
    const saved = localStorage.getItem('netgraph_reports_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialReportHistory;
      }
    }
    return initialReportHistory;
  });

  const [resumeDraft, setResumeDraft] = useState<ResumeDraft>(initialResumeDraft);

  // Analysis simulation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');

  // Persist profile changes
  useEffect(() => {
    localStorage.setItem('netgraph_profile_data', JSON.stringify(profile));
  }, [profile]);

  // Persist reports
  useEffect(() => {
    localStorage.setItem('netgraph_reports_history', JSON.stringify(reports));
  }, [reports]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const addSkill = (newSkill: Omit<SkillItem, 'id'>) => {
    const skill: SkillItem = {
      ...newSkill,
      id: `sk_${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
  };

  const removeSkill = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id),
    }));
  };

  const updateSkill = (id: string, updates: Partial<SkillItem>) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const addProject = (proj: Omit<ProjectItem, 'id'>) => {
    const project: ProjectItem = {
      ...proj,
      id: `proj_${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  };

  const removeProject = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  const addEducation = (edu: Omit<EducationItem, 'id'>) => {
    const education: EducationItem = {
      ...edu,
      id: `edu_${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, education],
    }));
  };

  const removeEducation = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const addExperience = (exp: Omit<ExperienceItem, 'id'>) => {
    const experience: ExperienceItem = {
      ...exp,
      id: `exp_${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, experience],
    }));
  };

  const removeExperience = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  const addCertification = (cert: Omit<CertificationItem, 'id'>) => {
    const certification: CertificationItem = {
      ...cert,
      id: `cert_${Date.now()}`,
    };
    setProfile((prev) => ({
      ...prev,
      certifications: [...prev.certifications, certification],
    }));
  };

  const removeCertification = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  };

  const handleResumeUpload = async (file: File) => {
    // Mock resume analysis & extraction
    await new Promise((r) => setTimeout(r, 1200));
    setProfile((prev) => ({
      ...prev,
      resumeFile: {
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        extractedSkillCount: 16,
      },
    }));
    return { success: true, extractedSkills: 16 };
  };

  const removeResumeFile = () => {
    setProfile((prev) => {
      const copy = { ...prev };
      delete copy.resumeFile;
      return copy;
    });
  };

  const selectedRole =
    careerRoles.find((r) => r.id === selectedRoleId) || careerRoles[0];

  const addReport = (report: ReportConfig) => {
    setReports((prev) => [report, ...prev]);
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const updateResumeDraft = (draftUpdates: Partial<ResumeDraft>) => {
    setResumeDraft((prev) => ({
      ...prev,
      ...draftUpdates,
      lastSaved: new Date().toLocaleString(),
    }));
  };

  // 12-Step Mock Data Mining & Skill Analysis Engine
  const runSkillAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setAnalysisStage('Extracting tokens and entity tuples from user profile...');

    await new Promise((r) => setTimeout(r, 400));
    setAnalysisProgress(25);
    setAnalysisStage('Parsing technical competencies & project descriptions...');

    await new Promise((r) => setTimeout(r, 500));
    setAnalysisProgress(50);
    setAnalysisStage('Mining co-occurrence relationships and building knowledge graph...');

    await new Promise((r) => setTimeout(r, 600));
    setAnalysisProgress(75);
    setAnalysisStage('Evaluating career alignment vectors across 40,000+ job taxonomy benchmarks...');

    await new Promise((r) => setTimeout(r, 500));
    setAnalysisProgress(90);
    setAnalysisStage('Computing skill gap deficits and generating learning milestones...');

    await new Promise((r) => setTimeout(r, 400));
    setAnalysisProgress(100);
    setAnalysisStage('Analysis complete! Synchronization active.');

    const newDate = new Date();
    const dateFormatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(
      newDate.getDate()
    ).padStart(2, '0')} ${String(newDate.getHours()).padStart(2, '0')}:${String(
      newDate.getMinutes()
    ).padStart(2, '0')}`;
    const newId = `ANL-${Date.now()}`;

    setProfile((prev) => ({
      ...prev,
      lastAnalysisDate: dateFormatted,
      lastAnalysisId: newId,
    }));

    // Slight variance in scores to show dynamic reaction
    setCareerRoles((prev) =>
      prev.map((role) => {
        const bonus = Math.floor(Math.random() * 3) - 1;
        return {
          ...role,
          alignmentPercentage: Math.min(99, Math.max(70, role.alignmentPercentage + bonus)),
        };
      })
    );

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setAnalysisStage('');
    }, 600);
  };

  const resetToDemoData = () => {
    setProfile(initialDemoProfile);
    setCareerRoles(mockCareerRoles);
    setSelectedRoleId('role_data_scientist');
    setReports(initialReportHistory);
    setResumeDraft(initialResumeDraft);
    localStorage.removeItem('netgraph_profile_data');
    localStorage.removeItem('netgraph_reports_history');
  };

  return (
    <AppDataContext.Provider
      value={{
        profile,
        updateProfile,
        addSkill,
        removeSkill,
        updateSkill,
        addProject,
        removeProject,
        addEducation,
        removeEducation,
        addExperience,
        removeExperience,
        addCertification,
        removeCertification,
        handleResumeUpload,
        removeResumeFile,
        careerRoles,
        selectedRole,
        setSelectedRoleId,
        graphData,
        reports,
        addReport,
        deleteReport,
        resumeDraft,
        updateResumeDraft,
        isAnalyzing,
        analysisProgress,
        analysisStage,
        runSkillAnalysis,
        resetToDemoData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
