'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Line, Html } from '@react-three/drei'
import { useRef, useState } from 'react'
import * as THREE from 'three'

const nodes = [
  { label: 'Python', pos: [-1.8, 1.1, 0.2], tone: '#4f46e5' },
  { label: 'React', pos: [0.9, 1.55, 0.4], tone: '#38bdf8' },
  { label: 'SQL', pos: [2.0, 0.2, 0.1], tone: '#6366f1' },
  { label: 'ML', pos: [0.15, -0.8, 0.5], tone: '#8b5cf6' },
  { label: 'Projects', pos: [-1.6, -1.2, 0.1], tone: '#0ea5e9' },
  { label: 'Data Scientist', pos: [1.5, -1.2, -0.2], tone: '#4338ca' },
]
const links = [[0, 1], [0, 3], [1, 2], [1, 5], [2, 3], [3, 4], [3, 5], [4, 0]]

function Network() {
  const group = useRef<THREE.Group>(null)
  const [active, setActive] = useState<string | null>(null)
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.08 })
  return <group ref={group}>
    {links.map(([a, b], index) => <Line key={index} points={[nodes[a].pos, nodes[b].pos]} color="#a5b4fc" lineWidth={0.65} transparent opacity={0.55} />)}
    {nodes.map((node) => <Float key={node.label} speed={1.2} rotationIntensity={0.2} floatIntensity={0.25}>
      <group position={node.pos as [number, number, number]} onPointerOver={() => setActive(node.label)} onPointerOut={() => setActive(null)}>
        <mesh><sphereGeometry args={[0.13, 24, 24]} /><meshStandardMaterial color={node.tone} emissive={node.tone} emissiveIntensity={0.35} /></mesh>
        {active === node.label && <Html center distanceFactor={7}><div className="whitespace-nowrap rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-xl">{node.label}</div></Html>}
      </group>
    </Float>)}
  </group>
}

export function NetgraphHero() {
  return <div className="relative h-[420px] w-full overflow-hidden rounded-[28px] border border-indigo-100/80 bg-[radial-gradient(circle_at_50%_40%,#eef2ff_0%,#eaf4ff_38%,#f8fafc_78%)] shadow-[0_24px_80px_rgba(79,70,229,0.14)] md:h-[500px]">
    <div className="absolute left-5 top-5 z-10 rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 backdrop-blur">Live relationship map</div>
    <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 1.5]} fallback={<div className="flex h-full items-center justify-center p-8 text-center text-sm text-slate-500">Interactive graph unavailable in this browser.</div>}>
      <ambientLight intensity={1.8} /><pointLight position={[3, 3, 4]} intensity={12} color="#a5b4fc" /><pointLight position={[-4, -2, 3]} intensity={8} color="#7dd3fc" />
      <Network /><OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-xs text-slate-500"><span>Drag to explore connections</span><span className="font-mono text-indigo-500">13 nodes · 24 edges</span></div>
  </div>
}
