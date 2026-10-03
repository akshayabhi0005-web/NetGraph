import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  Route,
} from 'lucide-react';
import { SkillCoverageChart } from '../components/charts/SkillCoverageChart';

export const SkillGapPage: React.FC = () => {
  const { careerRoles, selectedRole, setSelectedRoleId, profile } = useAppData();
  const navigate = useNavigate();

  const matchedCount = selectedRole.matchedSkills.length;
  const missingCount = selectedRole.missingSkills.length;
  const totalRequired = matchedCount + missingCount;
  const coveragePercent = Math.round((matchedCount / totalRequired) * 100);

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
              <Target className="w-3.5 h-3.5 text-rose-600" />
              <span>Diagnostic Gap Analysis</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Skill Gap Analysis & Requirement Benchmarking
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-1">
              Evaluates current verified competencies against market requirements for a selected target job role to generate targeted learning areas.
            </p>
          </div>

          {/* Role Selector Dropdown */}
          <div className="w-full md:w-auto">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Target Career Role:
            </label>
            <select
              value={selectedRole.id}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              {careerRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.alignmentPercentage}% match)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Disclaimer Note (Section 13) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
          <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Diagnostic context:</strong> Skills marked as "missing" are competencies not currently recorded in your profile artifacts. This does not imply you lack these capabilities in practice. Adding relevant projects or certifications will update your coverage score.
          </p>
        </div>
      </div>

      {/* Coverage Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Skill Coverage Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-indigo-600">{coveragePercent}%</span>
              <span className="text-xs text-slate-400">of required skills</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {matchedCount} of {totalRequired} core requirements satisfied
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Represented Competencies</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-2">{matchedCount}</div>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block mt-4">
            High alignment in primary tools & languages
          </span>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Bridge Opportunities</span>
            <div className="text-3xl font-extrabold text-rose-600 mt-2">{missingCount}</div>
          </div>
          <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded-md inline-block mt-4">
            High-yield competencies to acquire
          </span>
        </div>
      </div>

      {/* Two Columns: Represented vs Missing Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Represented Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Skills Represented ({matchedCount})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>

          <div className="space-y-2">
            {selectedRole.matchedSkills.map((sk) => (
              <div
                key={sk}
                className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-slate-800">{sk}</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Demonstrated in profile</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Identified Skill Deficits ({missingCount})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>

          <div className="space-y-2">
            {selectedRole.missingSkills.map((sk) => (
              <div
                key={sk}
                className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-semibold text-slate-800">{sk}</span>
                </div>
                <span className="text-[11px] text-rose-700 font-medium">Target for mastery</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stacked Coverage Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs">
        <SkillCoverageChart />
      </div>

      {/* Suggested Bridge Action Box */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 max-w-xl">
          <h3 className="text-lg font-bold">Bridge Your {selectedRole.title} Gap</h3>
          <p className="text-xs text-indigo-200/80 leading-relaxed">
            Explore step-by-step career milestones and recommended open-source projects designed to acquire {selectedRole.missingSkills.slice(0, 2).join(' and ')}.
          </p>
        </div>
        <button
          onClick={() => navigate('/career-paths')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Route className="w-4 h-4 text-indigo-600" />
          <span>Explore Career Pathway</span>
        </button>
      </div>
    </div>
  );
};
