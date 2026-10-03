import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Briefcase,
  ChevronRight,
  Filter,
  Search,
  ExternalLink,
  Target,
  Sparkles,
  X,
  Route,
} from 'lucide-react';
import { CareerRoleMatch } from '../types';

export const CareerMatchesPage: React.FC = () => {
  const { careerRoles, setSelectedRoleId, selectedRole } = useAppData();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeDetailRole, setActiveDetailRole] = useState<CareerRoleMatch | null>(null);

  const filteredRoles = careerRoles.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'All' || role.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAndInspect = (role: CareerRoleMatch) => {
    setSelectedRoleId(role.id);
    setActiveDetailRole(role);
  };

  const handleJumpToSkillGap = (role: CareerRoleMatch) => {
    setSelectedRoleId(role.id);
    navigate('/skill-gap');
  };

  const handleJumpToPath = (role: CareerRoleMatch) => {
    setSelectedRoleId(role.id);
    navigate('/career-paths');
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>Multidimensional Role Matching</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Career Matches & Profile Alignment
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
          Predicted profile alignment estimates based on ontology vectors and demonstrated project experience.
          <span className="text-slate-400 block mt-0.5">
            Note: Match percentages reflect candidate profile evidence and are not formal employment guarantees.
          </span>
        </p>

        {/* Search & Filter Toolbar */}
        <div className="pt-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search job roles or domains..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              <option value="Data Science & AI">Data Science & AI</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Analytics & BI">Analytics & BI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className={`bg-white rounded-2xl p-6 border transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
              selectedRole.id === role.id ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs' : 'border-slate-200/90'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {role.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{role.title}</h3>
                </div>
                {/* Alignment Percentage Badge */}
                <div className="flex flex-col items-end">
                  <span className="text-xl font-extrabold text-indigo-600 leading-none">
                    {role.alignmentPercentage}%
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">Profile Fit</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                {role.description}
              </p>

              {/* Matched vs Missing Skills Summary */}
              <div className="space-y-2 pt-2 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-700 block mb-1">
                    Represented Skills ({role.matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.matchedSkills.slice(0, 4).map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px]">
                        ✓ {sk}
                      </span>
                    ))}
                    {role.matchedSkills.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{role.matchedSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-rose-700 block mb-1">
                    Skills to Explore ({role.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {role.missingSkills.slice(0, 3).map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px]">
                        ○ {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleSelectAndInspect(role)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleJumpToSkillGap(role)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                Gap Analysis
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Details Modal */}
      {activeDetailRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-left space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {activeDetailRole.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{activeDetailRole.title}</h3>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Est. Salary: {activeDetailRole.averageSalary} • Hiring Trend: {activeDetailRole.hiringTrend}
                </span>
              </div>
              <button
                onClick={() => setActiveDetailRole(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {activeDetailRole.description}
            </p>

            {/* Represented Skills */}
            <div>
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                Represented in Profile ({activeDetailRole.matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeDetailRole.matchedSkills.map((sk) => (
                  <span key={sk} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-medium text-xs">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Identified Skill Gaps */}
            <div>
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                Identified Skill Deficits ({activeDetailRole.missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeDetailRole.missingSkills.map((sk) => (
                  <span key={sk} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium text-xs">
                    ○ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Certifications */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Target Industry Certifications
              </h4>
              <div className="space-y-1">
                {activeDetailRole.recommendedCertifications.map((cert) => (
                  <div key={cert} className="text-xs text-slate-600 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                Data mining match: <strong className="text-slate-800">{activeDetailRole.alignmentPercentage}%</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleJumpToPath(activeDetailRole)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>View Career Pathway</span>
                </button>
                <button
                  onClick={() => handleJumpToSkillGap(activeDetailRole)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Open Skill Gap Analysis</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
