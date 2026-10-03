import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import {
  BarChart3,
  Sparkles,
  FileText,
  Download,
  Filter,
  TrendingUp,
  Layers,
  Compass,
  CheckCircle2,
  Clock,
  RotateCcw,
  Info,
} from 'lucide-react';
import { SkillDistributionChart } from '../components/charts/SkillDistributionChart';
import { RoleAlignmentChart } from '../components/charts/RoleAlignmentChart';
import { SkillDemandTrendChart } from '../components/charts/SkillDemandTrendChart';
import { SkillCoverageChart } from '../components/charts/SkillCoverageChart';
import { ProjectTechChart } from '../components/charts/ProjectTechChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { generateCareerReportPDF } from '../utils/pdfGenerator';

export const AnalyticsPage: React.FC = () => {
  const { profile, careerRoles, selectedRole, setSelectedRoleId, reports, runSkillAnalysis, isAnalyzing } = useAppData();
  const navigate = useNavigate();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const latestReport = reports[0];

  const handleDownload = () => {
    if (latestReport) {
      const doc = generateCareerReportPDF(latestReport, profile, selectedRole);
      doc.save(`NETGRAPH_Career_Analysis_${profile.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } else {
      navigate('/reports');
    }
  };

  const dynamicInsightSummary = `Your profile currently represents strong technical competencies in ${profile.skills.slice(0, 3).map((s) => s.name).join(', ')}. For the selected career target (${selectedRole.title}), you currently maintain an estimated ${selectedRole.alignmentPercentage}% alignment. Addressing recommended bridge areas in ${selectedRole.missingSkills.slice(0, 2).join(' and ')} will further optimize your market positioning.`;

  return (
    <div className="space-y-6 text-left">
      {/* Analytics Header matching Section 14.1 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Real-Time Career Intelligence & Data Mining</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Career Analytics & Insights
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Explore your skills, identify opportunities, and understand your career profile through data mining.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Latest Analysis: {profile.lastAnalysisDate || '2026-10-03 16:30'}</span>
            <span>•</span>
            <span className="font-mono text-indigo-600 font-semibold">{profile.lastAnalysisId || 'ANL-20261003-8839'}</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => runSkillAnalysis()}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-70"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Mining...' : 'Analyze My Profile'}</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Download Latest PDF Report"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic Summary Insight Card (Section 14.10) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-indigo-950">
          <span className="font-bold block text-indigo-900">Career Insights Summary (Empirical Synthesis)</span>
          <p className="leading-relaxed text-indigo-800/90">{dynamicInsightSummary}</p>
        </div>
      </div>

      {/* Overview Metrics Grid (Section 14.2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Total Skills</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{profile.skills.length}</div>
          <span className="text-[10px] text-slate-400">Verified entities</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Technologies</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {profile.skills.filter((s) => s.type === 'tool' || s.type === 'technical').length}
          </div>
          <span className="text-[10px] text-slate-400">Tools & frameworks</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Career Matches</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{careerRoles.length}</div>
          <span className="text-[10px] text-slate-400">Target roles</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Skill Coverage</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {selectedRole.alignmentPercentage}%
          </div>
          <span className="text-[10px] text-slate-400">For {selectedRole.title}</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Projects Analyzed</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{profile.projects.length}</div>
          <span className="text-[10px] text-slate-400">Repositories</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs">
          <span className="text-[11px] text-slate-500 font-medium">Roles Explored</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{careerRoles.length}</div>
          <span className="text-[10px] text-slate-400">Active taxonomies</span>
        </div>
      </div>

      {/* Row 1: Skill Distribution & Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <SkillDistributionChart />
        </div>
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Row 2: Skill Demand Trends & Skill Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <SkillDemandTrendChart />
        </div>
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <SkillCoverageChart />
        </div>
      </div>

      {/* Row 3: Role Alignment & Project Technology Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <RoleAlignmentChart
            selectedRoleId={selectedRole.id}
            onSelectRole={(id) => setSelectedRoleId(id)}
          />
        </div>
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <ProjectTechChart />
        </div>
      </div>
    </div>
  );
};
