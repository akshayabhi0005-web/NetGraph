'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { GraphNode, GraphEdge, GraphNodeType } from '@/lib/data-mining/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Compass,
  Search,
  Info,
  ExternalLink,
  ArrowRight,
  X,
  Plus,
  Minus,
  RotateCcw,
} from 'lucide-react'

interface ProfileGraphCanvasProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  className?: string
}

const TYPE_CONFIG: Record<
  GraphNodeType,
  {
    fill: string
    lightFill: string
    stroke: string
    text: string
    bg: string
    label: string
  }
> = {
  skill: {
    fill: '#4f46e5',
    lightFill: '#eef2ff',
    stroke: '#6366f1',
    text: '#4338ca',
    bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    label: 'Skill',
  },
  project: {
    fill: '#059669',
    lightFill: '#ecfdf5',
    stroke: '#10b981',
    text: '#047857',
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    label: 'Project',
  },
  experience: {
    fill: '#d97706',
    lightFill: '#fffbeb',
    stroke: '#f59e0b',
    text: '#b45309',
    bg: 'bg-amber-50 border-amber-200 text-amber-700',
    label: 'Experience',
  },
  education: {
    fill: '#475569',
    lightFill: '#f8fafc',
    stroke: '#64748b',
    text: '#334155',
    bg: 'bg-slate-50 border-slate-200 text-slate-700',
    label: 'Education',
  },
  certification: {
    fill: '#7c3aed',
    lightFill: '#faf5ff',
    stroke: '#8b5cf6',
    text: '#6d28d9',
    bg: 'bg-purple-50 border-purple-200 text-purple-700',
    label: 'Certification',
  },
  career_role: {
    fill: '#0284c7',
    lightFill: '#f0f9ff',
    stroke: '#0ea5e9',
    text: '#0369a1',
    bg: 'bg-sky-50 border-sky-200 text-sky-700',
    label: 'Career Role',
  },
}

function formatEdgeType(type: string): string {
  switch (type) {
    case 'used_in_project':
      return 'Used in Project'
    case 'used_in_experience':
      return 'Used in Work Experience'
    case 'supports_role':
      return 'Supports Target Role'
    case 'certified_by':
      return 'Validated by Certification'
    case 'studied_in':
      return 'Studied in Coursework'
    case 'co_occurred':
      return 'Co-Occurred in Portfolio'
    default:
      return type.replace(/_/g, ' ')
  }
}

export function ProfileGraphCanvas({ nodes, edges, className }: ProfileGraphCanvasProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null)

  // Natural Pan & Zoom state (internal camera navigation preserved without visible buttons)
  const [zoom, setZoom] = useState<number>(1)
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Node Dragging state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const dragStartRef = useRef<{ clientX: number; clientY: number }>({ clientX: 0, clientY: 0 })
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({})

  const svgRef = useRef<SVGSVGElement>(null)

  // Reset custom positions when node list changes
  useEffect(() => {
    setCustomPositions({})
  }, [nodes.length])

  // Filter nodes based on type and search query
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      const matchType = selectedType === 'all' || n.type === selectedType
      const matchSearch =
        searchQuery.trim() === '' ||
        n.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchType && matchSearch
    })
  }, [nodes, selectedType, searchQuery])

  // Visible node IDs set
  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])

  // Filter edges based on visible nodes
  const filteredEdges = useMemo(() => {
    return edges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    )
  }, [edges, visibleNodeIds])

  // Category counts based on total node set
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: nodes.length }
    for (const node of nodes) {
      counts[node.type] = (counts[node.type] || 0) + 1
    }
    return counts
  }, [nodes])

  // Spacious, centered layout positioning in a 960x600 coordinate plane with safe bounds
  const baseLayoutPositions = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>()
    const centerX = 480
    const centerY = 300

    const roles = filteredNodes.filter((n) => n.type === 'career_role')
    const skillsList = filteredNodes.filter((n) => n.type === 'skill')
    const projects = filteredNodes.filter((n) => n.type === 'project')
    const experience = filteredNodes.filter((n) => n.type === 'experience')
    const education = filteredNodes.filter((n) => n.type === 'education')
    const certs = filteredNodes.filter((n) => n.type === 'certification')

    // 1. Center concentric rings: Skills
    // Organized with generous radial spacing so labels don't collide
    const skillCount = skillsList.length
    if (skillCount > 0) {
      if (skillCount <= 7) {
        const radius = 120
        skillsList.forEach((s, idx) => {
          const angle = (idx / skillCount) * 2 * Math.PI - Math.PI / 2
          posMap.set(s.id, {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          })
        })
      } else {
        // Two concentric rings for skills if > 7
        const innerCount = Math.ceil(skillCount * 0.42)
        const outerCount = skillCount - innerCount
        const innerRadius = 85
        const outerRadius = 165

        skillsList.slice(0, innerCount).forEach((s, idx) => {
          const angle = (idx / innerCount) * 2 * Math.PI - Math.PI / 2
          posMap.set(s.id, {
            x: centerX + innerRadius * Math.cos(angle),
            y: centerY + innerRadius * Math.sin(angle),
          })
        })
        skillsList.slice(innerCount).forEach((s, idx) => {
          const angle = (idx / outerCount) * 2 * Math.PI - Math.PI / 2 + Math.PI / outerCount
          posMap.set(s.id, {
            x: centerX + outerRadius * Math.cos(angle),
            y: centerY + outerRadius * Math.sin(angle),
          })
        })
      }
    }

    // 2. Career Roles: Upper right arc (well-spaced, within safe viewport boundary)
    roles.forEach((r, idx) => {
      const startAngle = -Math.PI / 5
      const endAngle = Math.PI / 3.5
      const angle =
        roles.length === 1
          ? 0
          : startAngle + (idx / (roles.length - 1)) * (endAngle - startAngle)
      posMap.set(r.id, {
        x: Math.min(880, Math.max(80, centerX + 310 * Math.cos(angle))),
        y: Math.min(520, Math.max(70, centerY + 230 * Math.sin(angle))),
      })
    })

    // 3. Projects: Left arc
    projects.forEach((p, idx) => {
      const startAngle = Math.PI * 0.78
      const endAngle = Math.PI * 1.22
      const angle =
        projects.length === 1
          ? Math.PI
          : startAngle + (idx / (projects.length - 1)) * (endAngle - startAngle)
      posMap.set(p.id, {
        x: Math.min(880, Math.max(100, centerX + 320 * Math.cos(angle))),
        y: Math.min(520, Math.max(70, centerY + 220 * Math.sin(angle))),
      })
    })

    // 4. Work Experience: Lower right arc
    experience.forEach((e, idx) => {
      const startAngle = Math.PI * 0.38
      const endAngle = Math.PI * 0.62
      const angle =
        experience.length === 1
          ? Math.PI / 2
          : startAngle + (idx / (experience.length - 1)) * (endAngle - startAngle)
      posMap.set(e.id, {
        x: Math.min(880, Math.max(80, centerX + 300 * Math.cos(angle))),
        y: Math.min(520, Math.max(70, centerY + 235 * Math.sin(angle))),
      })
    })

    // 5. Education & Certifications: Top and top-left arc
    const eduCerts = [...education, ...certs]
    eduCerts.forEach((ec, idx) => {
      const startAngle = -Math.PI * 0.72
      const endAngle = -Math.PI * 0.28
      const angle =
        eduCerts.length === 1
          ? -Math.PI / 2
          : startAngle + (idx / (eduCerts.length - 1)) * (endAngle - startAngle)
      posMap.set(ec.id, {
        x: Math.min(880, Math.max(90, centerX + 310 * Math.cos(angle))),
        y: Math.min(520, Math.max(65, centerY + 225 * Math.sin(angle))),
      })
    })

    return posMap
  }, [filteredNodes])

  // Effective positions merging base layout with user drag adjustments
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    for (const [id, pos] of baseLayoutPositions.entries()) {
      map.set(id, customPositions[id] || pos)
    }
    return map
  }, [baseLayoutPositions, customPositions])

  // Currently selected node / edge objects
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  )

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  )

  // Direct connected edges for selected entity
  const connectedEdges = useMemo(() => {
    if (!selectedNodeId) return []
    return edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId)
  }, [edges, selectedNodeId])

  // Neighbor nodes and connected edges for hovered node (for highlighting)
  const hoverNeighbors = useMemo(() => {
    if (!hoveredNodeId) return { neighbors: new Set<string>(), edgeIds: new Set<string>() }
    const neighbors = new Set<string>()
    const edgeIds = new Set<string>()

    for (const e of edges) {
      if (e.source === hoveredNodeId) {
        neighbors.add(e.target)
        edgeIds.add(e.id)
      } else if (e.target === hoveredNodeId) {
        neighbors.add(e.source)
        edgeIds.add(e.id)
      }
    }
    return { neighbors, edgeIds }
  }, [edges, hoveredNodeId])

  // Natural wheel zoom handler (preserves camera zoom capability without visible buttons)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom((z) => {
      const next = z + zoomDelta
      return Math.min(2.5, Math.max(0.4, +next.toFixed(2)))
    })
  }, [])

  // Button zoom controls (Zoom In / Zoom Out / Reset View)
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(2.5, +(z * 1.25).toFixed(2)))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(0.4, +(z / 1.25).toFixed(2)))
  }, [])

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  // Canvas background pan handlers (preserves natural pan navigation)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || draggedNodeId) return
    setIsPanning(true)
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      })
    } else if (draggedNodeId) {
      // Dragging node
      const dx = (e.clientX - dragStartRef.current.clientX) / zoom
      const dy = (e.clientY - dragStartRef.current.clientY) / zoom
      dragStartRef.current = { clientX: e.clientX, clientY: e.clientY }

      setCustomPositions((prev) => {
        const curr = prev[draggedNodeId] || baseLayoutPositions.get(draggedNodeId) || { x: 480, y: 300 }
        return {
          ...prev,
          [draggedNodeId]: { x: curr.x + dx, y: curr.y + dy },
        }
      })
    }
  }

  const handleCanvasPointerUp = () => {
    setIsPanning(false)
    setDraggedNodeId(null)
  }

  // Node drag initiation
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation()
    setDraggedNodeId(nodeId)
    dragStartRef.current = { clientX: e.clientX, clientY: e.clientY }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  return (
    <div
      className={`relative flex flex-col rounded-3xl border border-border bg-card shadow-xs overflow-hidden ${
        className || ''
      }`}
    >
      {/* 1. Filter Bar & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/90 p-4 backdrop-blur-xs">
        {/* Category Filter Pills with dynamic node counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedType('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All ({categoryCounts.all || 0})
          </button>

          {[
            { id: 'skill', label: 'Skills' },
            { id: 'project', label: 'Projects' },
            { id: 'career_role', label: 'Career Roles' },
            { id: 'certification', label: 'Certifications' },
            { id: 'experience', label: 'Experience' },
            { id: 'education', label: 'Education' },
          ].map((item) => {
            const count = categoryCounts[item.id] || 0
            if (count === 0) return null
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedType(item.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  selectedType === item.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {item.label} ({count})
              </button>
            )
          })}
        </div>

        {/* Search Field */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph nodes..."
              className="h-9 pl-8 pr-8 text-xs bg-background rounded-full w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Graph Workspace */}
      <div className="relative grid lg:grid-cols-[1fr_360px] min-h-[600px]">
        {/* Interactive SVG Viewport (Large, Centered, Spacious) */}
        <div
          className="relative w-full h-[600px] bg-slate-50/60 overflow-hidden select-none cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerLeave={handleCanvasPointerUp}
        >
          {filteredNodes.length === 0 ? (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center">
              <Compass className="size-12 text-indigo-400" />
              <p className="mt-3 text-base font-semibold text-slate-800">
                No graph nodes match your filter
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                No entities match &quot;{searchQuery || selectedType}&quot;. Reset your search or category filter to inspect all nodes.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType('all')
                  setSearchQuery('')
                }}
                className="mt-4 rounded-full text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox="0 0 960 600"
              className="w-full h-full"
            >
              <defs>
                <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
                </filter>
                <filter id="nodeGlowActive" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.45" />
                </filter>
              </defs>

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Connecting Edges (Thin, Subtle Lines) */}
                <g className="edges">
                  {filteredEdges.map((edge) => {
                    const srcPos = nodePositions.get(edge.source)
                    const tgtPos = nodePositions.get(edge.target)
                    if (!srcPos || !tgtPos) return null

                    const isSelected = selectedEdgeId === edge.id
                    const isHovered =
                      hoveredEdgeId === edge.id ||
                      (hoveredNodeId !== null &&
                        (edge.source === hoveredNodeId || edge.target === hoveredNodeId))
                    const isEndpointSelected =
                      selectedNodeId === edge.source || selectedNodeId === edge.target

                    // Determine stroke color and style (thin and subtle by default)
                    let strokeColor = '#cbd5e1'
                    let strokeWidth = Math.max(1.0, edge.weight * 1.5)
                    let strokeOpacity = 0.65

                    if (isSelected) {
                      strokeColor = '#4f46e5'
                      strokeWidth = 2.8
                      strokeOpacity = 1
                    } else if (isHovered || isEndpointSelected) {
                      strokeColor = '#6366f1'
                      strokeWidth = 2.2
                      strokeOpacity = 0.95
                    } else if (hoveredNodeId !== null) {
                      strokeOpacity = 0.15
                    }

                    return (
                      <g key={edge.id}>
                        {/* Invisible thicker line for generous click target */}
                        <line
                          x1={srcPos.x}
                          y1={srcPos.y}
                          x2={tgtPos.x}
                          y2={tgtPos.y}
                          stroke="transparent"
                          strokeWidth={16}
                          className="cursor-pointer"
                          onPointerOver={() => setHoveredEdgeId(edge.id)}
                          onPointerOut={() => setHoveredEdgeId(null)}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEdgeId(edge.id)
                            setSelectedNodeId(null)
                          }}
                        />

                        {/* Visible rendered connecting line */}
                        <line
                          x1={srcPos.x}
                          y1={srcPos.y}
                          x2={tgtPos.x}
                          y2={tgtPos.y}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          strokeOpacity={strokeOpacity}
                          strokeDasharray={
                            edge.type === 'supports_role' ? '5 4' : undefined
                          }
                          className="transition-colors pointer-events-none"
                        />
                      </g>
                    )
                  })}
                </g>

                {/* Graph Nodes */}
                <g className="nodes">
                  {filteredNodes.map((node) => {
                    const pos = nodePositions.get(node.id)
                    if (!pos) return null

                    const isSelected = selectedNodeId === node.id
                    const isHovered = hoveredNodeId === node.id
                    const isNeighborHovered = hoverNeighbors.neighbors.has(node.id)
                    const isEdgeConnectedHovered =
                      hoveredEdgeId !== null &&
                      (edges.find((e) => e.id === hoveredEdgeId)?.source === node.id ||
                        edges.find((e) => e.id === hoveredEdgeId)?.target === node.id)

                    const isDimmed =
                      (hoveredNodeId !== null && !isHovered && !isNeighborHovered) ||
                      (hoveredEdgeId !== null && !isEdgeConnectedHovered)

                    const style = TYPE_CONFIG[node.type] || TYPE_CONFIG.skill
                    const radius =
                      node.type === 'career_role'
                        ? 22
                        : node.type === 'skill'
                        ? 18
                        : node.type === 'project'
                        ? 20
                        : 19

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className={`cursor-pointer transition-opacity ${
                          isDimmed ? 'opacity-25' : 'opacity-100'
                        }`}
                        onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        onPointerOver={() => setHoveredNodeId(node.id)}
                        onPointerOut={() => setHoveredNodeId(null)}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedNodeId(node.id)
                          setSelectedEdgeId(null)
                        }}
                      >
                        {/* Outer selection ring / glow */}
                        {isSelected && (
                          <circle
                            r={radius + 8}
                            fill="none"
                            stroke={style.fill}
                            strokeWidth="2.5"
                            strokeOpacity="0.5"
                            className="animate-pulse"
                          />
                        )}

                        {/* Node body circle */}
                        <circle
                          r={radius}
                          fill={isSelected ? style.fill : style.lightFill}
                          stroke={style.fill}
                          strokeWidth={isSelected ? 3 : 2}
                          filter={isSelected ? 'url(#nodeGlowActive)' : 'url(#nodeShadow)'}
                          className="transition-transform hover:scale-110"
                        />

                        {/* Icon letter in node center */}
                        <text
                          dy=".35em"
                          textAnchor="middle"
                          fill={isSelected ? '#ffffff' : style.fill}
                          fontSize={11}
                          fontWeight="bold"
                          className="pointer-events-none select-none"
                        >
                          {node.type === 'skill'
                            ? node.label.charAt(0)
                            : node.type === 'project'
                            ? 'P'
                            : node.type === 'career_role'
                            ? 'R'
                            : node.type === 'experience'
                            ? 'W'
                            : node.type === 'certification'
                            ? 'C'
                            : 'E'}
                        </text>

                        {/* Complete node name label without truncation */}
                        <text
                          y={radius + 15}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize={node.type === 'career_role' ? 12 : 11}
                          fontWeight={isSelected ? 'bold' : '600'}
                          className="pointer-events-none select-none"
                          style={{
                            paintOrder: 'stroke fill',
                            stroke: '#ffffff',
                            strokeWidth: 3.5,
                            strokeLinejoin: 'round',
                          }}
                        >
                          {node.label}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </g>
            </svg>
          )}

          {/* Canvas Legend */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2.5 rounded-xl bg-card/90 px-3 py-2 shadow-xs border border-border backdrop-blur-xs text-[11px]">
            <span className="font-semibold text-slate-800 mr-0.5">Legend:</span>
            {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
              const count = categoryCounts[type] || 0
              if (count === 0) return null
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: cfg.fill }}
                  />
                  <span className="capitalize text-slate-600">
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Zoom Controls — top-right corner, above legend and away from details panel */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              aria-label="Zoom in"
              title="Zoom in"
              className="size-8 p-0 rounded-lg bg-card/90 backdrop-blur-xs border-border shadow-xs hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
            >
              <Plus className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              aria-label="Zoom out"
              title="Zoom out"
              className="size-8 p-0 rounded-lg bg-card/90 backdrop-blur-xs border-border shadow-xs hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
            >
              <Minus className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
              aria-label="Reset view"
              title="Reset view"
              className="size-8 p-0 rounded-lg bg-card/90 backdrop-blur-xs border-border shadow-xs hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700"
            >
              <RotateCcw className="size-3.5" />
            </Button>
          </div>
        </div>


        {/* 3. Node & Relationship Details Panel (Side Area) */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border bg-card p-5 overflow-y-auto max-h-[600px]">
          {selectedNode ? (
            <div className="space-y-4">
              {/* Header with Type & Label */}
              <div className="flex items-start justify-between">
                <div>
                  <Badge
                    variant="outline"
                    className={`text-xs font-semibold ${
                      TYPE_CONFIG[selectedNode.type]?.bg
                    }`}
                  >
                    {TYPE_CONFIG[selectedNode.type]?.label || selectedNode.type}
                  </Badge>
                  <h3 className="mt-2 text-lg font-bold text-slate-900 leading-snug">
                    {selectedNode.label}
                  </h3>
                  {selectedNode.category && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Category: {selectedNode.category}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedNodeId(null)}
                  className="size-7 p-0 text-slate-400 hover:text-slate-700"
                  title="Close inspector"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Attributes / Metadata */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1.5">
                {selectedNode.proficiency && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Proficiency:</span>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {selectedNode.proficiency}
                    </Badge>
                  </div>
                )}
                {selectedNode.metadata?.yearsOfExperience !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Years Experience:</span>
                    <span className="font-semibold text-slate-900">
                      {String(selectedNode.metadata.yearsOfExperience)} yrs
                    </span>
                  </div>
                )}
                {selectedNode.metadata?.matchScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role Alignment:</span>
                    <Badge className="bg-sky-600 text-white text-xs">
                      {String(selectedNode.metadata.matchScore)}% Match
                    </Badge>
                  </div>
                )}
                {selectedNode.metadata?.institution !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Institution:</span>
                    <span className="font-semibold text-slate-900">
                      {String(selectedNode.metadata.institution)}
                    </span>
                  </div>
                )}
                {selectedNode.metadata?.issuer !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Issuer:</span>
                    <span className="font-semibold text-slate-900">
                      {String(selectedNode.metadata.issuer)}
                    </span>
                  </div>
                )}
                {Boolean(selectedNode.metadata?.projectUrl) && (
                  <div className="pt-1">
                    <a
                      href={String(selectedNode.metadata?.projectUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 hover:underline text-[11px]"
                    >
                      <span>Live Project</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Verified Evidence Box */}
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs">
                <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <Info className="size-3.5 text-indigo-600" />
                  Mining Evidence:
                </p>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {selectedNode.evidence}
                </p>
              </div>

              {/* Connected Relationships List */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Connected Entities ({connectedEdges.length})
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    Click to inspect
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {connectedEdges.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No direct relationships discovered for this entity yet.
                    </p>
                  ) : (
                    connectedEdges.map((e) => {
                      const otherId = e.source === selectedNode.id ? e.target : e.source
                      const otherNode = nodes.find((n) => n.id === otherId)
                      const isOtherVisible = visibleNodeIds.has(otherId)

                      return (
                        <div
                          key={e.id}
                          onClick={() => {
                            if (otherNode) setSelectedNodeId(otherNode.id)
                          }}
                          className={`cursor-pointer rounded-xl border p-2.5 text-xs transition ${
                            isOtherVisible
                              ? 'border-border bg-card hover:border-indigo-400 hover:bg-muted/30'
                              : 'border-dashed border-border/60 bg-muted/20 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span className="truncate pr-2">
                              {otherNode?.label || otherId}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[10px] whitespace-nowrap"
                            >
                              {formatEdgeType(e.type)}
                            </Badge>
                          </div>
                          <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                            {e.evidence}
                          </p>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {formatEdgeType(selectedEdge.type)}
                  </Badge>
                  <h3 className="mt-2 text-base font-bold text-slate-900">
                    Relationship Details
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEdgeId(null)}
                  className="size-7 p-0 text-slate-400 hover:text-slate-700"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Connected Source and Target */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-3">
                {(() => {
                  const srcNode = nodes.find((n) => n.id === selectedEdge.source)
                  const tgtNode = nodes.find((n) => n.id === selectedEdge.target)
                  return (
                    <>
                      <div>
                        <span className="text-[11px] text-muted-foreground block">Source Entity:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (srcNode) setSelectedNodeId(srcNode.id)
                          }}
                          className="font-bold text-indigo-700 hover:underline text-left mt-0.5"
                        >
                          {srcNode?.label || selectedEdge.source}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        <ArrowRight className="size-3.5 text-indigo-500" />
                        <span>Connected via {formatEdgeType(selectedEdge.type)}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-muted-foreground block">Target Entity:</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (tgtNode) setSelectedNodeId(tgtNode.id)
                          }}
                          className="font-bold text-indigo-700 hover:underline text-left mt-0.5"
                        >
                          {tgtNode?.label || selectedEdge.target}
                        </button>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Weight & Evidence */}
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">Relationship Weight:</span>
                  <span className="font-bold text-slate-900">{selectedEdge.weight.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[11px] block">Supporting Evidence:</span>
                  <p className="mt-1 text-slate-800 leading-relaxed text-[11px]">
                    {selectedEdge.evidence}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Default Empty Inspector State */
            <div className="py-16 text-center text-xs text-muted-foreground space-y-3">
              <Compass className="mx-auto size-10 text-indigo-400/70" />
              <p className="font-semibold text-slate-800 text-sm">
                Select any node or edge in the network to inspect its verified relationships and evidence.
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                Click on any skill, project, or role to view direct connections, metadata, and data-mining provenance. Drag nodes to customize arrangement.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
