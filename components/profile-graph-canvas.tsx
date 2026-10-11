'use client'

import React, { useState, useMemo } from 'react'
import { GraphNode, GraphEdge, GraphNodeType } from '@/lib/data-mining/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Compass,
  Search,
  Filter,
  Info,
  Layers,
  Sparkles,
  Link2,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'

interface ProfileGraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  className?: string
}

const TYPE_COLORS: Record<GraphNodeType, { fill: string; stroke: string; text: string; bg: string }> = {
  skill: { fill: '#4f46e5', stroke: '#818cf8', text: '#4338ca', bg: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  project: { fill: '#059669', stroke: '#34d399', text: '#047857', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  experience: { fill: '#d97706', stroke: '#fbbf24', text: '#b45309', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
  education: { fill: '#475569', stroke: '#94a3b8', text: '#334155', bg: 'bg-slate-50 border-slate-200 text-slate-700' },
  certification: { fill: '#7c3aed', stroke: '#a78bfa', text: '#6d28d9', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
  career_role: { fill: '#0284c7', stroke: '#38bdf8', text: '#0369a1', bg: 'bg-sky-50 border-sky-200 text-sky-700' },
}

export function ProfileGraphCanvas({ nodes, edges, className }: ProfileGraphCanvasProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  // Filter nodes based on type and search query
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchType = selectedType === 'all' || n.type === selectedType
      const matchSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType && matchSearch
    })
  }, [nodes, selectedType, searchQuery])

  // Filter edges based on visible nodes
  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])
  const filteredEdges = useMemo(() => {
    return edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    )
  }, [edges, visibleNodeIds])

  // Dynamic Layout Positioning in a 800x560 canvas coordinate space
  const layoutPositions = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>()
    const centerX = 400
    const centerY = 280
    const count = filteredNodes.length

    if (count === 0) return posMap

    // Group nodes by type to arrange them in organic concentric shells
    const roles = filteredNodes.filter((n) => n.type === 'career_role')
    const skillsList = filteredNodes.filter((n) => n.type === 'skill')
    const projects = filteredNodes.filter((n) => n.type === 'project')
    const others = filteredNodes.filter(
      (n) => n.type !== 'career_role' && n.type !== 'skill' && n.type !== 'project'
    )

    // Inner ring: Skills
    const innerRadius = Math.min(180, 70 + skillsList.length * 7)
    skillsList.forEach((s, idx) => {
      const angle = (idx / Math.max(skillsList.length, 1)) * 2 * Math.PI - Math.PI / 2
      posMap.set(s.id, {
        x: centerX + innerRadius * Math.cos(angle),
        y: centerY + innerRadius * Math.sin(angle),
      })
    })

    // Outer right/top: Career roles
    roles.forEach((r, idx) => {
      const angle = (idx / Math.max(roles.length, 1)) * Math.PI - Math.PI / 2
      posMap.set(r.id, {
        x: centerX + 270 * Math.cos(angle),
        y: centerY + 220 * Math.sin(angle),
      })
    })

    // Outer left/bottom: Projects
    projects.forEach((p, idx) => {
      const angle = (idx / Math.max(projects.length, 1)) * Math.PI + Math.PI / 2
      posMap.set(p.id, {
        x: centerX + 270 * Math.cos(angle),
        y: centerY + 220 * Math.sin(angle),
      })
    })

    // Others (Experience, Education, Certs) placed in corners
    others.forEach((o, idx) => {
      const angle = (idx / Math.max(others.length, 1)) * 2 * Math.PI
      posMap.set(o.id, {
        x: centerX + 290 * Math.cos(angle),
        y: centerY + 230 * Math.sin(angle),
      })
    })

    return posMap
  }, [filteredNodes])

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  )

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId),
    [edges, selectedEdgeId]
  )

  // Find edges connected to selected node
  const connectedEdges = useMemo(() => {
    if (!selectedNodeId) return []
    return edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId)
  }, [edges, selectedNodeId])

  return (
    <div className={`relative flex flex-col rounded-3xl border border-border bg-card shadow-xs overflow-hidden ${className || ''}`}>
      {/* Canvas Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/80 p-4 backdrop-blur-xs">
        {/* Type Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All ({nodes.length})
          </button>
          {[
            { id: 'skill', label: 'Skills' },
            { id: 'project', label: 'Projects' },
            { id: 'experience', label: 'Experience' },
            { id: 'career_role', label: 'Career Roles' },
            { id: 'certification', label: 'Certifications' },
          ].map((item) => {
            const count = nodes.filter((n) => n.type === item.id).length
            if (count === 0) return null
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedType(item.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition whitespace-nowrap ${
                  selectedType === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {item.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search graph nodes..."
            className="h-8 pl-8 text-xs bg-background w-48 sm:w-56"
          />
        </div>
      </div>

      {/* Main Visualization Container */}
      <div className="relative grid lg:grid-cols-[1fr_320px] min-h-[560px]">
        {/* SVG Graph Viewport */}
        <div className="relative w-full h-full flex items-center justify-center bg-slate-50/50 p-4 overflow-hidden">
          {filteredNodes.length === 0 ? (
            <div className="text-center py-16">
              <Compass className="mx-auto size-10 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No matching nodes in view</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try selecting &quot;All&quot; or clearing your search term.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType('all')
                  setSearchQuery('')
                }}
                className="mt-3 rounded-full text-xs"
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <svg
              viewBox="0 0 800 560"
              className="w-full h-full max-h-[600px] select-none"
            >
              <defs>
                <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                </filter>
              </defs>

              {/* Connecting Edges */}
              <g className="edges">
                {filteredEdges.map((edge) => {
                  const srcPos = layoutPositions.get(edge.source)
                  const tgtPos = layoutPositions.get(edge.target)
                  if (!srcPos || !tgtPos) return null

                  const isHighlighted =
                    selectedEdgeId === edge.id ||
                    selectedNodeId === edge.source ||
                    selectedNodeId === edge.target

                  return (
                    <line
                      key={edge.id}
                      x1={srcPos.x}
                      y1={srcPos.y}
                      x2={tgtPos.x}
                      y2={tgtPos.y}
                      stroke={isHighlighted ? '#4f46e5' : '#cbd5e1'}
                      strokeWidth={isHighlighted ? 2.5 : Math.max(1, edge.weight * 1.5)}
                      strokeDasharray={edge.type === 'supports_role' ? '4 3' : undefined}
                      className="transition-colors cursor-pointer hover:stroke-indigo-600"
                      onClick={() => {
                        setSelectedEdgeId(edge.id)
                        setSelectedNodeId(null)
                      }}
                    />
                  )
                })}
              </g>

              {/* Graph Nodes */}
              <g className="nodes">
                {filteredNodes.map((node) => {
                  const pos = layoutPositions.get(node.id)
                  if (!pos) return null

                  const isSelected = selectedNodeId === node.id
                  const style = TYPE_COLORS[node.type] || TYPE_COLORS.skill
                  const radius = node.type === 'career_role' ? 22 : node.type === 'skill' ? 17 : 19

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      className="cursor-pointer group"
                      onClick={() => {
                        setSelectedNodeId(node.id)
                        setSelectedEdgeId(null)
                      }}
                    >
                      {/* Pulse Circle when selected */}
                      {isSelected && (
                        <circle
                          r={radius + 6}
                          fill="none"
                          stroke={style.fill}
                          strokeWidth="2"
                          strokeOpacity="0.4"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={radius}
                        fill={isSelected ? style.fill : '#ffffff'}
                        stroke={style.fill}
                        strokeWidth={isSelected ? 3 : 2}
                        filter="url(#nodeGlow)"
                        className="transition-all hover:scale-110"
                      />

                      {/* Node Label Text */}
                      <text
                        y={radius + 14}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize={node.type === 'career_role' ? 11 : 10}
                        fontWeight={isSelected ? 'bold' : '600'}
                        className="pointer-events-none drop-shadow-xs"
                      >
                        {node.label}
                      </text>

                      {/* Type icon/glyph in center of circle */}
                      <text
                        dy=".3em"
                        textAnchor="middle"
                        fill={isSelected ? '#ffffff' : style.fill}
                        fontSize={10}
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {node.label.charAt(0)}
                      </text>
                    </g>
                  )
                })}
              </g>
            </svg>
          )}

          {/* Canvas Legend */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-xl bg-card/90 p-2.5 shadow-xs border border-border text-[10px]">
            <span className="font-semibold text-slate-700 mr-1">Legend:</span>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: color.fill }}
                />
                <span className="capitalize text-slate-600">
                  {type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Node & Relationship Inspector Panel */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border bg-card p-5 overflow-y-auto max-h-[600px]">
          {selectedNode ? (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className={`text-xs capitalize ${TYPE_COLORS[selectedNode.type]?.bg}`}>
                    {selectedNode.type.replace('_', ' ')}
                  </Badge>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{selectedNode.label}</h3>
                  {selectedNode.category && (
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedNode.category}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNodeId(null)}
                  className="size-7 p-0 text-slate-400"
                >
                  &times;
                </Button>
              </div>

              {selectedNode.proficiency && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Proficiency:</span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedNode.proficiency}
                  </Badge>
                </div>
              )}

              {/* Evidence Box */}
              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
                  <Info className="size-3.5 text-indigo-600" /> Mining Evidence:
                </p>
                <p className="leading-relaxed">{selectedNode.evidence}</p>
              </div>

              {/* Connected Relationships */}
              <div className="mt-5 border-t border-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
                  Connected Edges ({connectedEdges.length})
                </h4>
                <div className="mt-2.5 flex flex-col gap-2">
                  {connectedEdges.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No direct edges for this entity.</p>
                  ) : (
                    connectedEdges.map((e) => {
                      const otherId = e.source === selectedNode.id ? e.target : e.source
                      const otherNode = nodes.find((n) => n.id === otherId)
                      return (
                        <div
                          key={e.id}
                          onClick={() => setSelectedEdgeId(e.id)}
                          className="cursor-pointer rounded-xl border border-border bg-card p-2.5 text-xs hover:border-indigo-300 transition"
                        >
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-slate-900">{otherNode?.label || otherId}</span>
                            <Badge variant="secondary" className="text-[10px] capitalize">
                              {e.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground">{e.evidence}</p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          ) : selectedEdge ? (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {selectedEdge.type.replace('_', ' ')} Relationship
                  </Badge>
                  <h3 className="mt-2 text-base font-bold text-slate-900">
                    Relationship Details
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEdgeId(null)}
                  className="size-7 p-0 text-slate-400"
                >
                  &times;
                </Button>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs space-y-2">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Weight / Strength:</span>
                  <span className="font-semibold text-slate-900">{selectedEdge.weight.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Evidence:</span>
                  <p className="text-slate-800 leading-relaxed">{selectedEdge.evidence}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Compass className="mx-auto size-8 text-indigo-400/60" />
              <p className="mt-3 font-semibold text-slate-800">Select any node or edge</p>
              <p className="mt-1">
                Click a skill, project, or career role in the network to inspect its verified relationships and evidence.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
