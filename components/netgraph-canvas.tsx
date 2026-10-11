'use client'

import React, { Component, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Line, Html } from '@react-three/drei'
import * as THREE from 'three'

export type GraphNode = {
  label: string
  pos: [number, number, number]
  tone: string
}

export const GRAPH_NODES: GraphNode[] = [
  { label: 'Python', pos: [-1.8, 1.1, 0.3], tone: '#4f46e5' },
  { label: 'React', pos: [1.1, 1.45, 0.4], tone: '#38bdf8' },
  { label: 'SQL', pos: [1.9, 0.1, -0.3], tone: '#6366f1' },
  { label: 'Machine Learning', pos: [0.15, -0.85, 0.7], tone: '#8b5cf6' },
  { label: 'Project: NetGraph', pos: [-0.1, 0.3, 0.1], tone: '#4338ca' },
  { label: 'Data Scientist', pos: [-1.1, -1.4, 0.5], tone: '#4f46e5' },
  { label: 'TypeScript', pos: [1.7, 1.1, -0.5], tone: '#2563eb' },
  { label: 'Data Mining', pos: [-0.7, -0.6, -0.7], tone: '#7c3aed' },
  { label: 'Three.js', pos: [0.3, 1.7, -0.3], tone: '#14b8a6' },
  { label: 'PostgreSQL', pos: [1.3, -0.8, -0.8], tone: '#0284c7' },
  { label: 'Docker', pos: [-1.8, -0.5, -0.7], tone: '#0ea5e9' },
  { label: 'FastAPI', pos: [-1.3, 1.6, -0.4], tone: '#10b981' },
  { label: 'Data Analyst', pos: [1.8, -1.2, 0.3], tone: '#6366f1' },
]

export const GRAPH_LINKS: [number, number][] = [
  [4, 0],
  [4, 1],
  [4, 2],
  [4, 3],
  [4, 7],
  [4, 8],
  [1, 6],
  [1, 8],
  [0, 3],
  [0, 7],
  [0, 11],
  [0, 2],
  [2, 9],
  [9, 10],
  [11, 10],
  [3, 7],
  [3, 5],
  [7, 5],
  [0, 5],
  [2, 12],
  [0, 12],
  [12, 5],
  [10, 4],
  [6, 4],
]

function NetworkScene() {
  const group = useRef<THREE.Group>(null)
  const [active, setActive] = useState<string | null>(null)

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08
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
            lineWidth={0.65}
            transparent
            opacity={0.55}
          />
        )
      })}
      {GRAPH_NODES.map((node) => (
        <Float
          key={node.label}
          speed={1.2}
          rotationIntensity={0.2}
          floatIntensity={0.25}
        >
          <group
            position={node.pos}
            onPointerOver={(e) => {
              e.stopPropagation()
              setActive(node.label)
            }}
            onPointerOut={() => setActive(null)}
          >
            <mesh>
              <sphereGeometry args={[0.13, 24, 24]} />
              <meshStandardMaterial
                color={node.tone}
                emissive={node.tone}
                emissiveIntensity={0.35}
              />
            </mesh>
            {active === node.label && (
              <Html center distanceFactor={7}>
                <div className="pointer-events-none select-none whitespace-nowrap rounded-full border border-indigo-200 bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-xl backdrop-blur-sm">
                  {node.label}
                </div>
              </Html>
            )}
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
        camera={{ position: [0, 0, 6], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        fallback={fallbackNotice}
      >
        <ambientLight intensity={1.8} />
        <pointLight position={[3, 3, 4]} intensity={12} color="#a5b4fc" />
        <pointLight position={[-4, -2, 3]} intensity={8} color="#7dd3fc" />
        <NetworkScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </WebGLErrorBoundary>
  )
}
