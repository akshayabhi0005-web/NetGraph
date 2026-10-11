'use client'

import React, { Component, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Float, Line, Html } from '@react-three/drei'
import * as THREE from 'three'

export type GraphNode = {
  label: string
  pos: [number, number, number]
  tone: string
  size: number
  labelOffset: [number, number, number]
  labelAlign: 'left' | 'right' | 'center'
}

export const GRAPH_NODES: GraphNode[] = [
  // 0: Python (Upper left)
  {
    label: 'Python',
    pos: [-2.7, 1.3, 0.7],
    tone: '#3b82f6',
    size: 0.20,
    labelOffset: [-0.28, 0.04, 0],
    labelAlign: 'right',
  },
  // 1: Java (Mid outer-left)
  {
    label: 'Java',
    pos: [-3.1, -0.3, -0.8],
    tone: '#2563eb',
    size: 0.18,
    labelOffset: [-0.26, 0.02, 0],
    labelAlign: 'right',
  },
  // 2: JavaScript (Top center)
  {
    label: 'JavaScript',
    pos: [0.6, 2.5, 0.4],
    tone: '#0ea5e9',
    size: 0.18,
    labelOffset: [0, 0.28, 0],
    labelAlign: 'center',
  },
  // 3: React (Top outer-right)
  {
    label: 'React',
    pos: [2.8, 2.0, 0.5],
    tone: '#38bdf8',
    size: 0.19,
    labelOffset: [0.26, 0.04, 0],
    labelAlign: 'left',
  },
  // 4: Machine Learning (Lower foreground)
  {
    label: 'Machine Learning',
    pos: [0.2, -1.1, 1.2],
    tone: '#8b5cf6',
    size: 0.22,
    labelOffset: [-0.28, 0.02, 0],
    labelAlign: 'right',
  },
  // 5: Data Mining (Lower depth/background)
  {
    label: 'Data Mining',
    pos: [-1.1, -1.4, -0.9],
    tone: '#7c3aed',
    size: 0.21,
    labelOffset: [0.26, 0.02, 0],
    labelAlign: 'left',
  },
  // 6: SQL (Mid outer-right)
  {
    label: 'SQL',
    pos: [2.9, 0.6, -0.5],
    tone: '#6366f1',
    size: 0.19,
    labelOffset: [0.26, 0.04, 0],
    labelAlign: 'left',
  },
  // 7: Data Analyst (Lower far-right)
  {
    label: 'Data Analyst',
    pos: [3.2, -0.8, 0.6],
    tone: '#4f46e5',
    size: 0.21,
    labelOffset: [0.28, 0.02, 0],
    labelAlign: 'left',
  },
  // 8: Data Scientist (Bottom center)
  {
    label: 'Data Scientist',
    pos: [0.5, -2.4, 0.6],
    tone: '#6366f1',
    size: 0.23,
    labelOffset: [0, -0.32, 0],
    labelAlign: 'center',
  },
  // 9: Software Engineer (Bottom right)
  {
    label: 'Software Engineer',
    pos: [2.2, -2.2, -0.7],
    tone: '#3b82f6',
    size: 0.22,
    labelOffset: [0.28, -0.06, 0],
    labelAlign: 'left',
  },
  // 10: AI Engineer (Bottom left)
  {
    label: 'AI Engineer',
    pos: [-2.4, -2.0, 0.8],
    tone: '#8b5cf6',
    size: 0.22,
    labelOffset: [-0.28, -0.06, 0],
    labelAlign: 'right',
  },
  // 11: Cloud Computing (Top far-left)
  {
    label: 'Cloud Computing',
    pos: [-2.2, 2.3, -0.6],
    tone: '#0284c7',
    size: 0.19,
    labelOffset: [0, 0.28, 0],
    labelAlign: 'center',
  },
  // 12: Projects (Center-right hub)
  {
    label: 'Projects',
    pos: [0.7, -0.2, 0.4],
    tone: '#4338ca',
    size: 0.24,
    labelOffset: [0, -0.35, 0],
    labelAlign: 'center',
  },
  // 13: Skills (Center-left hub)
  {
    label: 'Skills',
    pos: [-0.8, 0.4, 0.4],
    tone: '#4f46e5',
    size: 0.25,
    labelOffset: [0, 0.35, 0],
    labelAlign: 'center',
  },
]

export const GRAPH_LINKS: [number, number][] = [
  // Hub: Skills (13) connections
  [13, 0],  // Skills - Python
  [13, 1],  // Skills - Java
  [13, 2],  // Skills - JavaScript
  [13, 3],  // Skills - React
  [13, 4],  // Skills - Machine Learning
  [13, 5],  // Skills - Data Mining
  [13, 6],  // Skills - SQL
  [13, 11], // Skills - Cloud Computing

  // Hub: Projects (12) connections
  [12, 0],  // Projects - Python
  [12, 3],  // Projects - React
  [12, 4],  // Projects - Machine Learning
  [12, 5],  // Projects - Data Mining
  [12, 6],  // Projects - SQL
  [12, 7],  // Projects - Data Analyst
  [12, 8],  // Projects - Data Scientist
  [12, 9],  // Projects - Software Engineer
  [12, 10], // Projects - AI Engineer
  [12, 13], // Projects - Skills (core bridge)

  // Technology & Skill inter-connections
  [0, 4],   // Python - ML
  [0, 5],   // Python - Data Mining
  [0, 6],   // Python - SQL
  [2, 3],   // JS - React
  [1, 9],   // Java - Software Engineer
  [1, 11],  // Java - Cloud Computing
  [4, 5],   // ML - Data Mining
  [11, 2],  // Cloud Computing - JavaScript
  [11, 0],  // Cloud Computing - Python
  [11, 9],  // Cloud Computing - Software Engineer
  [11, 10], // Cloud Computing - AI Engineer
  [3, 9],   // React - Software Engineer
  [2, 9],   // JS - Software Engineer

  // Career Role pathways
  [0, 8],   // Python - Data Scientist
  [0, 7],   // Python - Data Analyst
  [0, 10],  // Python - AI Engineer
  [6, 7],   // SQL - Data Analyst
  [6, 8],   // SQL - Data Scientist
  [4, 8],   // ML - Data Scientist
  [4, 10],  // ML - AI Engineer
  [5, 8],   // Data Mining - Data Scientist
  [5, 7],   // Data Mining - Data Analyst
  [7, 8],   // Data Analyst - Data Scientist
  [8, 10],  // Data Scientist - AI Engineer
  [9, 10],  // Software Engineer - AI Engineer
]

function NetworkScene() {
  const group = useRef<THREE.Group>(null)
  const [active, setActive] = useState<string | null>(null)
  const { size } = useThree()

  // Calculate responsive scale based on canvas pixel width
  const responsiveScale = useMemo(() => {
    if (size.width >= 1280) return 1.0
    if (size.width >= 1024) return 0.92
    if (size.width >= 768) return 0.82
    if (size.width >= 480) return 0.70
    return Math.max(0.58, Math.min(0.66, size.width / 480))
  }, [size.width])

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.05
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
    }
  })

  return (
    <group ref={group} scale={responsiveScale}>
      <Float
        speed={1.1}
        rotationIntensity={0.05}
        floatIntensity={0.10}
        floatingRange={[-0.05, 0.05]}
      >
        {GRAPH_LINKS.map(([a, b], index) => {
          const p1 = GRAPH_NODES[a]?.pos
          const p2 = GRAPH_NODES[b]?.pos
          if (!p1 || !p2) return null
          return (
            <Line
              key={index}
              points={[p1, p2]}
              color="#a5b4fc"
              lineWidth={0.9}
              transparent
              opacity={0.42}
            />
          )
        })}

        {GRAPH_NODES.map((node) => {
          const isHub = node.label === 'Skills' || node.label === 'Projects'
          return (
            <group key={node.label} position={node.pos}>
              {/* Optional subtle glow ring for intelligence hubs */}
              {isHub && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[node.size + 0.03, node.size + 0.06, 32]} />
                  <meshBasicMaterial
                    color="#818cf8"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}

              {/* Interactive sphere mesh */}
              <mesh
                onPointerOver={(e) => {
                  e.stopPropagation()
                  setActive(node.label)
                }}
                onPointerOut={() => setActive(null)}
              >
                <sphereGeometry args={[node.size, 24, 24]} />
                <meshStandardMaterial
                  color={node.tone}
                  emissive={node.tone}
                  emissiveIntensity={active === node.label ? 0.75 : 0.38}
                  roughness={0.2}
                  metalness={0.1}
                />
              </mesh>

              {/* Always visible node label directly attached without card/pill/box */}
              <Html
                position={node.labelOffset}
                center={node.labelAlign === 'center'}
                distanceFactor={10.5}
                zIndexRange={[100, 0]}
              >
                <span
                  className={`pointer-events-none block select-none whitespace-nowrap font-semibold tracking-tight transition-all duration-150 ${
                    node.labelAlign === 'right'
                      ? '-translate-x-full -translate-y-1/2 text-right'
                      : node.labelAlign === 'left'
                      ? '-translate-y-1/2 text-left'
                      : ''
                  } ${
                    active === node.label
                      ? 'font-bold text-indigo-950 scale-105'
                      : 'text-slate-800'
                  }`}
                  style={{
                    fontSize: node.size >= 0.22 ? '13px' : '11.5px',
                    color: active === node.label ? '#1e1b4b' : '#1e293b',
                    textShadow: '0 1px 2px rgba(255,255,255,0.7)',
                  }}
                >
                  {node.label}
                </span>
              </Html>
            </group>
          )
        })}
      </Float>
    </group>
  )
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    return Boolean(gl && gl instanceof WebGLRenderingContext)
  } catch {
    return false
  }
}

class WebGLErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('WebGL Rendering Error caught by boundary:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export function NetgraphCanvas() {
  const [hasWebGL, setHasWebGL] = useState<boolean | null>(null)

  useEffect(() => {
    setHasWebGL(checkWebGLSupport())
  }, [])

  const fallbackNotice = (
    <div className="flex h-full w-full items-center justify-center p-8 text-center text-sm text-slate-500">
      Interactive graph unavailable in this browser.
    </div>
  )

  if (hasWebGL === false) {
    return fallbackNotice
  }

  return (
    <WebGLErrorBoundary fallback={fallbackNotice}>
      <Canvas
        camera={{ position: [0, 0, 7.8], fov: 48 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        fallback={fallbackNotice}
      >
        <ambientLight intensity={1.9} />
        <pointLight position={[5, 5, 5]} intensity={14} color="#a5b4fc" />
        <pointLight position={[-6, -4, 4]} intensity={9} color="#7dd3fc" />
        <pointLight position={[0, -5, 3]} intensity={5} color="#c7d2fe" />
        <NetworkScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          dampingFactor={0.05}
          rotateSpeed={0.6}
        />
      </Canvas>
    </WebGLErrorBoundary>
  )
}
