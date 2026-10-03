import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { FullGraph3D } from '../components/graph/FullGraph3D';
import { Share2, Sparkles, Network, Layers, ShieldCheck } from 'lucide-react';

export const GraphExplorerPage: React.FC = () => {
  const { graphData } = useAppData();

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5 text-teal-600" />
            <span>Multi-Relational Knowledge Graph Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            3D Interactive Graph Explorer
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rotate in 3D, inspect vertices, and uncover multi-hop relationships connecting skills, technologies, projects, and career opportunities.
          </p>
        </div>

        {/* Graph Summary Badges */}
        <div className="flex items-center gap-3 shrink-0 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nodes</span>
            <span className="font-extrabold text-slate-900 text-base">{graphData.nodes.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Edges</span>
            <span className="font-extrabold text-indigo-600 text-base">{graphData.edges.length}</span>
          </div>
        </div>
      </div>

      {/* Main 3D Graph Component */}
      <div className="w-full">
        <FullGraph3D data={graphData} />
      </div>

      {/* Architecture and Legend Note */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Network className="w-4 h-4 text-indigo-600" />
            <span>Force-Directed Kinematics</span>
          </span>
          <p className="text-slate-500 leading-relaxed">
            Nodes self-organize based on graph connectivity, clustering closely related skill clusters together in 3D Euclidean space.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-600" />
            <span>Inferred Relationship Discovery</span>
          </span>
          <p className="text-slate-500 leading-relaxed">
            Cyan dashed edges highlight latent relationships discovered through association rule mining algorithms on market data.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Local WebGL Execution</span>
          </span>
          <p className="text-slate-500 leading-relaxed">
            Accelerated real-time Three.js rendering runs completely client-side with zero external latency or cloud compute dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};
