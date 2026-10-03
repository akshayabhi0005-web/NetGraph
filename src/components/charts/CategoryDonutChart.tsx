import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { skillDistributionData } from '../../data/analyticsData';

export const CategoryDonutChart: React.FC = () => {
  const totalSkills = skillDistributionData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-sm font-bold text-slate-900">Skill Domain Breakdown</h3>
        <p className="text-xs text-slate-500">Distribution across technical disciplines</p>
      </div>

      <div className="flex-1 min-h-[220px] relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} Skills`, name]}
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Pie
              data={skillDistributionData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="count"
              nameKey="category"
            >
              {skillDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 leading-none">{totalSkills}</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">Skills Total</span>
        </div>
      </div>

      {/* Mini Legend */}
      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
        {skillDistributionData.slice(0, 6).map((item) => (
          <div key={item.category} className="flex items-center gap-1.5 overflow-hidden">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="text-slate-600 truncate">{item.category}</span>
            <span className="text-slate-900 font-bold ml-auto">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
