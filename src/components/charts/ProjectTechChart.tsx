import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { projectTechFrequency } from '../../data/analyticsData';

export const ProjectTechChart: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900">Project Technology Breakdown</h3>
        <p className="text-xs text-slate-500">Framework and tool frequency across documented repositories</p>
      </div>

      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={projectTechFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="tech"
              tick={{ fontSize: 11, fill: '#64748B' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={45}
            />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
            <Tooltip
              formatter={(value: any) => [`${value} Repositories`, 'Usage Count']}
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
