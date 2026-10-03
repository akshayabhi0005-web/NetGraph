import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  Brain,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Flame,
} from 'lucide-react';
import { SkillDistributionChart } from '../components/charts/SkillDistributionChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { SkillSource, SkillCategory } from '../types';

export const SkillAnalysisPage: React.FC = () => {
  const { profile, runSkillAnalysis, isAnalyzing, analysisProgress, analysisStage } = useAppData();

  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredSkills = profile.skills.filter((s) => {
    const matchesSource = selectedSource === 'All' || s.source === selectedSource.toLowerCase();
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSource && matchesCategory;
  });

  const technicalCount = profile.skills.filter((s) => s.type === 'technical').length;
  const toolCount = profile.skills.filter((s) => s.type === 'tool').length;
  const softCount = profile.skills.filter((s) => s.type === 'soft').length;

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5 text-indigo-600" />
            <span>Association Rule & Entity Extraction Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Skill Analysis & Competency Diagnostics
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Data mining algorithms extract and normalize competencies across your profile, project repositories, and uploaded artifacts to build an interconnected competency profile.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Analyzed: {profile.lastAnalysisDate || '2026-10-03 16:30'}</span>
            <span>•</span>
            <span className="font-mono">ID: {profile.lastAnalysisId || 'ANL-20261003-8839'}</span>
          </div>
        </div>

        <button
          onClick={() => runSkillAnalysis()}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all shrink-0 cursor-pointer disabled:opacity-70"
        >
          <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{isAnalyzing ? 'Mining Skills...' : 'Analyze My Skills'}</span>
        </button>
      </div>

      {/* Live Mining Progress Card when Analyzing */}
      {isAnalyzing && (
        <div className="p-5 rounded-2xl bg-indigo-900 text-white shadow-xl border border-indigo-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                Data Mining Execution in Progress
              </span>
            </div>
            <span className="font-mono font-bold text-sm text-indigo-300">{analysisProgress}%</span>
          </div>
          <div className="w-full bg-indigo-950 h-2.5 rounded-full overflow-hidden border border-indigo-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-blue-400 h-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <p className="text-xs text-indigo-200 font-mono">{analysisStage}</p>
        </div>
      )}

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Total Skills Identified</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{profile.skills.length}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Normalized</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Core Technical</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{technicalCount}</div>
          <span className="text-[10px] text-slate-400">Languages & Algorithms</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Tools & Frameworks</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">{toolCount}</div>
          <span className="text-[10px] text-slate-400">React, Docker, FastAPI</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Soft & Methodological</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{softCount}</div>
          <span className="text-[10px] text-slate-400">Analytical & Leadership</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <SkillDistributionChart />
        </div>
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <CategoryDonutChart />
        </div>
      </div>

      {/* Skills Table & Source Provenance Filter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Extracted Skills & Provenance Trace</h3>
            <p className="text-xs text-slate-500">Traceable source evidence for each candidate competency</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Source:</span>
            </div>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="All">All Sources</option>
              <option value="user">User Entered</option>
              <option value="project">Project Derived</option>
              <option value="resume">Resume Extracted</option>
              <option value="github">GitHub Profile</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Programming Languages">Programming Languages</option>
              <option value="Web Development">Web Development</option>
              <option value="Databases">Databases</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Cloud Computing">Cloud Computing</option>
              <option value="Soft Skills">Soft Skills</option>
            </select>
          </div>
        </div>

        {/* Skill Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredSkills.map((sk) => (
            <div
              key={sk.id}
              className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between text-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900">{sk.name}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md font-semibold uppercase ${
                    sk.type === 'technical'
                      ? 'bg-blue-100 text-blue-800'
                      : sk.type === 'tool'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {sk.type}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">{sk.category}</div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-semibold text-indigo-600">{sk.proficiency}</span>
                <span className="capitalize px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-700">
                  {sk.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
