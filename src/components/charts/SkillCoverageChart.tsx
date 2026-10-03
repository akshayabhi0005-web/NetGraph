import React from 'react';
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
import { roleCoverageDataset } from '../../data/analyticsData';

export const SkillCoverageChart: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Skill Coverage vs. Role Deficit</h3>
          <p className="text-xs text-slate-500">Represented competencies vs. skills needed per role</p>
        </div>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={roleCoverageDataset} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="role"
              tick={{ fontSize: 11, fill: '#64748B' }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={45}
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
            <Legend wrapperStyle={{ paddingTop: '6px', fontSize: '12px' }} />
            <Bar dataKey="matched" name="Represented Skills" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="gap" name="Identified Gaps" fill="#F43F5E" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
