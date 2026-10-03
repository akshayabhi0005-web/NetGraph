import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { skillDemandTrends6M, skillDemandTrends1Y } from '../../data/analyticsData';

const SKILL_COLORS: Record<string, string> = {
  Python: '#3B82F6',
  React: '#06B6D4',
  TypeScript: '#2563EB',
  'Machine Learning': '#8B5CF6',
  SQL: '#0284C7',
  Docker: '#F59E0B',
};

export const SkillDemandTrendChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'6M' | '1Y'>('6M');
  const [visibleSkills, setVisibleSkills] = useState<Record<string, boolean>>({
    Python: true,
    React: true,
    TypeScript: true,
    'Machine Learning': true,
    SQL: false,
    Docker: false,
  });

  const data = timeframe === '6M' ? skillDemandTrends6M : skillDemandTrends1Y;

  const toggleSkill = (skill: string) => {
    setVisibleSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Skill Demand Trends</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200">
              Illustrative Sample Data
            </span>
          </div>
          <p className="text-xs text-slate-500">Longitudinal demand trends extracted from market postings</p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setTimeframe('6M')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              timeframe === '6M' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past 6 Months
          </button>
          <button
            onClick={() => setTimeframe('1Y')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              timeframe === '1Y' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1 Year Trajectory
          </button>
        </div>
      </div>

      {/* Skill Toggle Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {Object.keys(visibleSkills).map((skill) => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              visibleSkills[skill]
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: SKILL_COLORS[skill] }}
            />
            {skill}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            {Object.keys(visibleSkills).map(
              (skill) =>
                visibleSkills[skill] && (
                  <Line
                    key={skill}
                    type="monotone"
                    dataKey={skill}
                    stroke={SKILL_COLORS[skill]}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: SKILL_COLORS[skill] }}
                    activeDot={{ r: 5 }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
