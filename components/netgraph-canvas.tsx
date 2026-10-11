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
    pos: [-1.65, 0.85, 0.45],
    tone: '#3b82f6',
    size: 0.16,
    labelOffset: [-0.22, 0.02, 0],
    labelAlign: 'right',
  },
  // 1: Java (Middle left)
  {
    label: 'Java',
    pos: [-1.85, -0.2, -0.55],
    tone: '#2563eb',
    size: 0.15,
    labelOffset: [-0.22, 0.02, 0],
    labelAlign: 'right',
  },
  // 2: JavaScript (Top center-right)
  {
    label: 'JavaScript',
    pos: [0.55, 1.45, 0.3],
    tone: '#0ea5e9',
    size: 0.15,
    labelOffset: [0, 0.24, 0],
    labelAlign: 'center',
  },
  // 3: React (Top right)
  {
    label: 'React',
    pos: [1.7, 1.15, 0.4],
    tone: '#38bdf8',
    size: 0.16,
    labelOffset: [0.22, 0.02, 0],
    labelAlign: 'left',
  },
  // 4: Machine Learning (Lower front-center)
  {
    label: 'Machine Learning',
    pos: [0.1, -0.72, 0.8],
    tone: '#8b5cf6',
    size: 0.18,
    labelOffset: [-0.24, 0.02, 0],
    labelAlign: 'right',
  },
  // 5: Data Mining (Lower mid-back)
  {
    label: 'Data Mining',
    pos: [-0.55, -0.95, -0.6],
    tone: '#7c3aed',
    size: 0.17,
    labelOffset: [0.22, 0.02, 0],
    labelAlign: 'left',
  },
  // 6: SQL (Mid right)
  {
    label: 'SQL',
    pos: [1.6, 0.25, -0.4],
    tone: '#6366f1',
    size: 0.16,
    labelOffset: [0.22, 0.02, 0],
    labelAlign: 'left',
  },
  // 7: Data Analyst (Lower mid right)
  {
    label: 'Data Analyst',
    pos: [1.8, -0.6, 0.35],
    tone: '#4f46e5',
    size: 0.17,
    labelOffset: [0.24, 0.02, 0],
    labelAlign: 'left',
  },
  // 8: Data Scientist (Bottom center)
  {
    label: 'Data Scientist',
    pos: [0.35, -1.45, 0.45],
    tone: '#6366f1',
    size: 0.18,
    labelOffset: [0, -0.26, 0],
    labelAlign: 'center',
  },
  // 9: Software Engineer (Bottom right)
  {
    label: 'Software Engineer',
    pos: [1.35, -1.35, -0.55],
    tone: '#3b82f6',
    size: 0.18,
    labelOffset: [0.24, -0.04, 0],
    labelAlign: 'left',
  },
  // 10: AI Engineer (Bottom left)
  {
    label: 'AI Engineer',
    pos: [-1.35, -1.25, 0.6],
    tone: '#8b5cf6',
    size: 0.18,
    labelOffset: [-0.24, -0.04, 0],
    labelAlign: 'right',
  },
  // 11: Cloud Computing (Top left)
  {
    label: 'Cloud Computing',
    pos: [-1.15, 1.35, -0.45],
    tone: '#0284c7',
    size: 0.16,
    labelOffset: [0, 0.24, 0],
    labelAlign: 'center',
  },
  // 12: Projects (Center-right hub)
  {
    label: 'Projects',
    pos: [0.4, -0.15, 0.3],
    tone: '#4338ca',
    size: 0.20,
    labelOffset: [0, -0.28, 0],
    labelAlign: 'center',
  },
  // 13: Skills (Center-left hub)
  {
    label: 'Skills',
    pos: [-0.4, 0.25, 0.3],
    tone: '#4f46e5',
    size: 0.21,
    labelOffset: [0, 0.28, 0],
    labelAlign: 'center',
  },
]

export const GRAPH_LINKS: [number, number][] = [
  // Hubs
  [13, 0],
  [13, 1],
  [13, 2],
  [13, 3],
  [13, 4],
  [13, 5],
  [13, 6],
  [13, 11],
  [12, 0],
  [12, 3],
  [12, 4],
  [12, 5],
  [12, 6],
  [12, 9],
  [12, 7],
  [12, 8],

  // Skills
  [0, 4],
  [0, 5],
  [0, 6],
  [2, 3],
  [1, 9],
  [1, 11],
  [4, 5],
  [11, 10],
  [11, 9],

  // Career Roles
  [0, 8],
  [0, 7],
  [0, 10],
  [6, 7],
  [6, 8],
  [4, 8],
  [4, 10],
  [5, 8],
  [3, 9],
  [2, 9],
  [7, 8],
  [8, 10],
]

function NetworkScene() {
  const group = useRef<THREE.Group>(null)
  const [active, setActive] = useState<string | null>(null)
  const { size } = useThree()

  // Calculate responsive scale based on canvas pixel width
  const responsiveScale = useMemo(() => {
    if (size.width >= 1024) return 1.0
    if (size.width >= 768) return 0.88
    if (size.width >= 480) return 0.78
    return Math.max(0.65, Math.min(0.75, size.width / 480))
  }, [size.width])

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.05
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.035
    }
  })

  return (
    <group ref={group} scale={responsiveScale}>
      <Float
        speed={1.1}
        rotationIntensity={0.06}
        floatIntensity={0.12}
        floatingRange={[-0.06, 0.06]}
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
              lineWidth={0.8}
              transparent
              opacity={0.45}
            />
          )
        })}

        {GRAPH_NODES.map((node) => (
          <group key={node.label} position={node.pos}>
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
                emissiveIntensity={active === node.label ? 0.7 : 0.35}
                roughness={0.25}
                metalness={0.1}
              />
            </mesh>

            {/* Always visible node label directly attached without card/pill/box */}
            <Html
              position={node.labelOffset}
              center={node.labelAlign === 'center'}
              distanceFactor={9.8}
              zIndexRange={[100, 0]}
            >
              <span
                className={`pointer-events-none block select-none whitespace-nowrap tracking-tight transition-all duration-150 ${
                  node.labelAlign === 'right'
                    ? '-translate-x-full -translate-y-1/2 text-right'
                    : node.labelAlign === 'left'
                    ? '-translate-y-1/2 text-left'
                    : ''
                } ${
                  active === node.label
                    ? 'font-bold text-indigo-950 scale-105'
                    : 'font-semibold text-slate-800'
                }`}
                style={{
                  fontSize: node.size >= 0.2 ? '12.5px' : '11.5px',
                  color: active === node.label ? '#1e1b4b' : '#1e293b',
                }}
              >
                {node.label}
              </span>
            </Html>
          </group>
        ))}
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
        camera={{ position: [0, 0, 7.2], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        fallback={fallbackNotice}
      >
        <ambientLight intensity={1.9} />
        <pointLight position={[4, 4, 5]} intensity={14} color="#a5b4fc" />
        <pointLight position={[-5, -3, 4]} intensity={9} color="#7dd3fc" />
        <pointLight position={[0, -4, 2]} intensity={5} color="#c7d2fe" />
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
