'use client'

import React, { Component, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Line, Html } from '@react-three/drei'
import * as THREE from 'three'

export type GraphNode = {
  label: string
  pos: [number, number, number]
  tone: string
  size: number
}

export const GRAPH_NODES: GraphNode[] = [
  { label: 'Python', pos: [-1.7, 1.2, 0.4], tone: '#3b82f6', size: 0.16 },
  { label: 'Java', pos: [-2.1, -0.4, -0.7], tone: '#2563eb', size: 0.15 },
  { label: 'JavaScript', pos: [1.2, 2.0, 0.3], tone: '#0ea5e9', size: 0.15 },
  { label: 'React', pos: [2.2, 1.5, 0.5], tone: '#38bdf8', size: 0.16 },
  { label: 'Machine Learning', pos: [0.2, -1.3, 0.8], tone: '#8b5cf6', size: 0.17 },
  { label: 'Data Mining', pos: [-0.8, -1.5, -0.6], tone: '#7c3aed', size: 0.17 },
  { label: 'SQL', pos: [1.8, 0.6, -0.4], tone: '#6366f1', size: 0.16 },
  { label: 'Data Analyst', pos: [2.4, -0.5, 0.4], tone: '#4f46e5', size: 0.18 },
  { label: 'Data Scientist', pos: [0.9, -1.8, -0.4], tone: '#6366f1', size: 0.19 },
  { label: 'Software Engineer', pos: [1.9, -1.3, -0.8], tone: '#3b82f6', size: 0.18 },
  { label: 'AI Engineer', pos: [-1.5, -1.6, 0.7], tone: '#8b5cf6', size: 0.18 },
  { label: 'Cloud Computing', pos: [-1.2, 1.9, -0.5], tone: '#0284c7', size: 0.16 },
  { label: 'Projects', pos: [0.5, -0.2, 0.4], tone: '#4338ca', size: 0.20 },
  { label: 'Skills', pos: [-0.5, 0.4, 0.5], tone: '#4f46e5', size: 0.21 },
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

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.05
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.04
    }
  })

  return (
    <group ref={group}>
      {GRAPH_LINKS.map(([a, b], index) => {
        const p1 = GRAPH_NODES[a]?.pos
        const p2 = GRAPH_NODES[b]?.pos
        if (!p1 || !p2) return null
        return (
          <Line
            key={index}
            points={[p1, p2]}
            color="#a5b4fc"
            lineWidth={0.7}
            transparent
            opacity={0.5}
          />
        )
      })}

      {GRAPH_NODES.map((node) => (
        <Float
          key={node.label}
          speed={1.1}
          rotationIntensity={0.15}
          floatIntensity={0.2}
        >
          <group position={node.pos}>
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
                emissiveIntensity={active === node.label ? 0.65 : 0.35}
                roughness={0.2}
                metalness={0.1}
              />
            </mesh>

            {/* Always visible node label */}
            <Html
              position={[0, node.size + 0.16, 0]}
              center
              distanceFactor={8.2}
              zIndexRange={[100, 0]}
            >
              <div
                className={`pointer-events-none select-none whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-tight transition-all duration-200 ${
                  active === node.label
                    ? 'scale-110 bg-indigo-950 text-white shadow-lg ring-2 ring-indigo-400'
                    : 'border border-slate-200/80 bg-white/92 text-slate-800 shadow-xs backdrop-blur-[2px]'
                }`}
              >
                {node.label}
              </div>
            </Html>
          </group>
        </Float>
      ))}
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
        camera={{ position: [0.35, 0, 6.6], fov: 44 }}
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
