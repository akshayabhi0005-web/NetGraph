import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { mockCareerRoles } from '../../data/careerRoles';

interface RoleAlignmentChartProps {
  onSelectRole?: (roleId: string) => void;
  selectedRoleId?: string;
}

export const RoleAlignmentChart: React.FC<RoleAlignmentChartProps> = ({
  onSelectRole,
  selectedRoleId,
}) => {
  const chartData = mockCareerRoles.map((r) => ({
    id: r.id,
    role: r.title,
    alignment: r.alignmentPercentage,
    positions: r.openPositionsCount,
  }));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Career Role Alignment</h3>
          <p className="text-xs text-slate-500">Predicted match percentage based on profile evidence</p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
          Click bar to inspect
        </span>
      </div>

      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const item = state.activePayload[0].payload;
                if (onSelectRole) onSelectRole(item.id);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis
              type="category"
              dataKey="role"
              width={140}
              tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }}
            />
            <Tooltip
              formatter={(value: any) => [`${value}% Match`, 'Alignment']}
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="alignment" radius={[0, 4, 4, 0]} cursor="pointer">
              {chartData.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={
                    entry.id === selectedRoleId
                      ? '#4338CA'
                      : entry.alignment >= 90
                      ? '#4F46E5'
                      : entry.alignment >= 80
                      ? '#6366F1'
                      : '#94A3B8'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
