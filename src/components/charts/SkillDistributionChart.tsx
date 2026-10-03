import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { skillDistributionData } from '../../data/analyticsData';

export const SkillDistributionChart: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Technical' | 'Soft'>('All');

  const filteredData = skillDistributionData.filter((item) => {
    if (activeFilter === 'Technical') return item.category !== 'Soft Skills';
    if (activeFilter === 'Soft') return item.category === 'Soft Skills';
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Skill Distribution by Category</h3>
          <p className="text-xs text-slate-500">Candidate skills vs. average market benchmark</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          {(['All', 'Technical', 'Soft'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: '#64748B' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }} />
            <Bar dataKey="count" name="Your Profile Skills" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="marketAvg" name="Industry Average" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
