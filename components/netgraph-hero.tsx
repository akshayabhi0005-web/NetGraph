'use client'

import dynamic from 'next/dynamic'
import { GRAPH_NODES, GRAPH_LINKS } from './netgraph-canvas'

function GraphLoadingPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2.5">
        <div className="size-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span className="text-xs font-medium text-slate-400">
          Loading 3D network...
        </span>
      </div>
    </div>
  )
}

const NetgraphCanvas = dynamic(
  () => import('./netgraph-canvas').then((mod) => mod.NetgraphCanvas),
  {
    ssr: false,
    loading: () => <GraphLoadingPlaceholder />,
  }
)

export function NetgraphHero({ className }: { className?: string }) {
  return (
    <div
      className={
        className ||
        'relative h-[420px] w-full overflow-hidden rounded-[28px] border border-indigo-100/80 bg-[radial-gradient(circle_at_50%_40%,#eef2ff_0%,#eaf4ff_38%,#f8fafc_78%)] shadow-[0_24px_80px_rgba(79,70,229,0.14)] md:h-[500px]'
      }
    >
      <div className="absolute left-5 top-5 z-10 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 backdrop-blur">
        Live relationship map
      </div>

      <NetgraphCanvas />

      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs text-slate-500">
        <span>Drag to explore connections</span>
        <span className="font-mono text-indigo-500">
          {GRAPH_NODES.length} nodes · {GRAPH_LINKS.length} edges
        </span>
      </div>
    </div>
  )
}

export { GRAPH_NODES, GRAPH_LINKS }
