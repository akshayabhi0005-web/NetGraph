'use client'

import dynamic from 'next/dynamic'

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
    <div className={className || 'relative h-full w-full overflow-visible'}>
      <NetgraphCanvas />
    </div>
  )
}
