import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import {
  Brain,
  Compass,
  BarChart3,
  Share2,
  FileText,
  FileCheck2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { SkillDistributionChart } from '../components/charts/SkillDistributionChart';
import { RoleAlignmentChart } from '../components/charts/RoleAlignmentChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { generateCareerReportPDF } from '../utils/pdfGenerator';

export const DashboardPage: React.FC = () => {
  const { profile, careerRoles, selectedRole, reports, runSkillAnalysis, isAnalyzing } = useAppData();
  const navigate = useNavigate();

  const techSkillsCount = profile.skills.filter((s) => s.type === 'technical').length;
  const topRole = careerRoles[0] || selectedRole;
  const latestReport = reports[0];

  const handleDownloadLatestReport = () => {
    if (latestReport) {
      const doc = generateCareerReportPDF(latestReport, profile, selectedRole);
      doc.save(`${latestReport.id}_${profile.fullName.replace(/\s+/g, '_')}.pdf`);
    } else {
      navigate('/reports');
    }
  };

  const recentActivities = [
    {
      title: 'Skill Vector Re-indexed',
      desc: `${profile.skills.length} skills mapped into knowledge graph taxonomy`,
      time: profile.lastAnalysisDate || 'Today 16:30',
      icon: <Brain className="w-4 h-4 text-indigo-600" />,
    },
    {
      title: 'Role Alignment Evaluated',
      desc: `High affinity detected with ${topRole.title} (${topRole.alignmentPercentage}% match)`,
      time: 'Today 15:45',
      icon: <Compass className="w-4 h-4 text-blue-600" />,
    },
    {
      title: 'Project Repository Verified',
      desc: `Extracted technology tokens from ${profile.projects[0]?.title || 'NETGRAPH'}`,
      time: 'Yesterday',
      icon: <Layers className="w-4 h-4 text-purple-600" />,
    },
    {
      title: 'Career Report Prepared',
      desc: latestReport?.title || 'Comprehensive Career Intelligence Report ready for download',
      time: '2 days ago',
      icon: <FileText className="w-4 h-4 text-emerald-600" />,
    },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Data Mining Synchronized • Analysis Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile.fullName.split(' ')[0]}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
              Explore your competencies, career alignment, and professional growth insights uncovered through graph-based relationship mining.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => runSkillAnalysis()}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-70"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'Mining Profile...' : 'Analyze My Skills'}</span>
            </button>
            <Link
              to="/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>Generate Report</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Total Skills</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{profile.skills.length}</span>
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">{techSkillsCount} Technical • {profile.skills.length - techSkillsCount} Soft</span>
        </div>

        <div className="p-4.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Tech Stack Count</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-indigo-600">{techSkillsCount}</span>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Multi-domain ontologies</span>
        </div>

        <div className="p-4.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Projects Analyzed</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{profile.projects.length}</span>
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Repos
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Full-stack & data mining</span>
        </div>

        <div className="p-4.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Career Matches</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-900">{careerRoles.length}</span>
            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              Roles
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Top fit: {topRole.title}</span>
        </div>

        <div className="p-4.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-slate-500">Top Role Fit</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">{topRole.alignmentPercentage}%</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1">{topRole.missingSkills.length} bridge areas identified</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Skill Distribution */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <SkillDistributionChart />
        </div>

        {/* Skill Domain Donut */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Second Row: Role Alignment & Quick Actions / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Alignment Chart */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <RoleAlignmentChart
            selectedRoleId={selectedRole.id}
            onSelectRole={(id) => navigate('/career-matches')}
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions Panel */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/profile"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-colors font-medium text-slate-700 flex items-center justify-between"
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/career-matches"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-colors font-medium text-slate-700 flex items-center justify-between"
              >
                <span>Career Roles</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/skill-gap"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-colors font-medium text-slate-700 flex items-center justify-between"
              >
                <span>Skill Gaps</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/graph-explorer"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-colors font-medium text-slate-700 flex items-center justify-between"
              >
                <span>3D Explorer</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/reports"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-colors font-medium text-slate-700 flex items-center justify-between"
              >
                <span>PDF Reports</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/resume-builder"
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 transition-colors font-medium text-slate-700 flex items-center justify-between"
              >
                <span>Resume Builder</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Recent Activity List */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Research Activity</h3>
            <div className="space-y-3">
              {recentActivities.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                    {act.icon}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-slate-800">{act.title}</div>
                    <div className="text-[11px] text-slate-500 leading-snug">{act.desc}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reports Quick Download Bar */}
      {latestReport && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Latest Career Intelligence Report</h4>
              <p className="text-[11px] text-slate-500">
                Generated for {latestReport.selectedRole} on {latestReport.generatedAt} ({latestReport.metricsSnapshot.totalSkills} skills analyzed)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/reports"
              className="px-3 py-1.5 rounded-lg bg-white text-indigo-600 border border-indigo-200 text-xs font-semibold hover:bg-indigo-50 transition-colors"
            >
              View Preview
            </Link>
            <button
              onClick={handleDownloadLatestReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
