import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { mockCareerPathways } from '../data/careerPathsData';
import {
  Route,
  CheckCircle2,
  Circle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  Layers,
  Award,
  Calendar,
} from 'lucide-react';

export const CareerPathsPage: React.FC = () => {
  const { selectedRole, setSelectedRoleId } = useAppData();
  const [activePathwayId, setActivePathwayId] = useState<string>('path_data_scientist');

  const activePathway =
    mockCareerPathways.find((p) => p.id === activePathwayId) || mockCareerPathways[0];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <Route className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target Role Roadmapping</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Career Pathway Exploration
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-stage milestone progressions connecting starting competencies to target roles through recommended learning areas and hands-on portfolio projects.
          </p>
        </div>

        {/* Pathway Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {mockCareerPathways.map((path) => (
            <button
              key={path.id}
              onClick={() => setActivePathwayId(path.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activePathway.id === path.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {path.targetRole} ({path.overallReadiness}% Ready)
            </button>
          ))}
        </div>
      </div>

      {/* Pathway Overview Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase">
              {activePathway.targetCategory} Focus
            </span>
            <h3 className="text-2xl font-bold tracking-tight">
              Pathway to {activePathway.targetRole}
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              {activePathway.summary}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-center shrink-0">
            <span className="text-[11px] text-indigo-200 block mb-0.5">Readiness Score</span>
            <span className="text-3xl font-extrabold text-emerald-400">{activePathway.overallReadiness}%</span>
            <span className="text-[10px] text-indigo-300 block mt-1">Based on profile tokens</span>
          </div>
        </div>
      </div>

      {/* 4 Milestones Progression Timeline */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          Step-by-Step Transition Milestones
        </h3>

        <div className="space-y-6 relative">
          {/* Vertical Connecting Line */}
          <div className="absolute left-4.5 top-6 bottom-6 w-0.5 bg-slate-200 -z-0" />

          {activePathway.milestones.map((milestone, idx) => (
            <div key={milestone.step} className="flex items-start gap-5 relative z-10">
              {/* Step indicator circle */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 font-bold text-xs ${
                  milestone.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-indigo-600 text-indigo-600'
                }`}
              >
                {milestone.completed ? <CheckCircle2 className="w-5 h-5" /> : milestone.step}
              </div>

              {/* Milestone Content Box */}
              <div className="flex-1 p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all text-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      {milestone.stage}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{milestone.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{milestone.estimatedTimeline}</span>
                    </span>
                    {milestone.completed && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{milestone.description}</p>

                {/* Required Skills & Projects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Required Competencies
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {milestone.requiredSkills.map((sk) => (
                        <span key={sk} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px]">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Recommended Deliverable
                    </span>
                    <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{milestone.recommendedProjects[0]}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
