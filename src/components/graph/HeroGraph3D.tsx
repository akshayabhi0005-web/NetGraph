import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, ZoomIn, ZoomOut, Sparkles, Info } from 'lucide-react';

interface HeroNodeData {
  id: string;
  name: string;
  category: 'Skill' | 'Role' | 'Tech' | 'Project';
  color: string;
  size: number;
  pos: [number, number, number];
  description: string;
}

const HERO_NODES: HeroNodeData[] = [
  { id: '1', name: 'Python', category: 'Skill', color: '#3B82F6', size: 1.5, pos: [-4, 3, 2], description: 'Core programming language for Data Mining & AI' },
  { id: '2', name: 'Data Mining', category: 'Skill', color: '#8B5CF6', size: 1.8, pos: [0, 0, 0], description: 'Extracting hidden relationship patterns across career data' },
  { id: '3', name: 'Data Scientist', category: 'Role', color: '#4F46E5', size: 1.7, pos: [3.5, 3, 1], description: 'Target career role requiring ML and mining competencies' },
  { id: '4', name: 'React', category: 'Tech', color: '#06B6D4', size: 1.4, pos: [-4, -3, 2], description: 'Modern UI library powering the NETGRAPH interface' },
  { id: '5', name: 'Machine Learning', category: 'Skill', color: '#7C3AED', size: 1.6, pos: [2, -2, 4], description: 'Predictive algorithms and statistical modeling' },
  { id: '6', name: 'SQL', category: 'Skill', color: '#0284C7', size: 1.3, pos: [-2, 4, -3], description: 'Relational data querying and transformation' },
  { id: '7', name: 'Software Engineer', category: 'Role', color: '#4338CA', size: 1.6, pos: [-5, 0, -2], description: 'Scalable system architecture and algorithm design' },
  { id: '8', name: 'Full-Stack Developer', category: 'Role', color: '#4F46E5', size: 1.6, pos: [4, -3, -1], description: 'End-to-end web architecture and microservices' },
  { id: '9', name: 'TypeScript', category: 'Skill', color: '#2563EB', size: 1.4, pos: [-1, -4, 2], description: 'Enterprise type safety and robust contracts' },
  { id: '10', name: 'Cloud Computing', category: 'Skill', color: '#0EA5E9', size: 1.3, pos: [5, 1, -3], description: 'Distributed infrastructure and scalable services' },
  { id: '11', name: 'Data Analyst', category: 'Role', color: '#4F46E5', size: 1.5, pos: [1, 4, 3], description: 'Visual intelligence and business KPI dashboards' },
  { id: '12', name: 'FastAPI', category: 'Tech', color: '#10B981', size: 1.2, pos: [2, 1, -4], description: 'High-speed asynchronous Python REST backend' },
  { id: '13', name: 'Docker', category: 'Tech', color: '#0284C7', size: 1.2, pos: [-3, -1, -4], description: 'Containerized deployment and reproducibility' },
  { id: '14', name: 'Projects', category: 'Project', color: '#6366F1', size: 1.4, pos: [0, -5, -2], description: 'Verified academic and GitHub repositories' },
];

const HERO_CONNECTIONS: [number, number][] = [
  [0, 1], // Python - Data Mining
  [1, 2], // Data Mining - Data Scientist
  [0, 2], // Python - Data Scientist
  [1, 4], // Data Mining - Machine Learning
  [2, 4], // Data Scientist - Machine Learning
  [0, 5], // Python - SQL
  [5, 2], // SQL - Data Scientist
  [3, 8], // React - TypeScript
  [3, 7], // React - Full-Stack Developer
  [8, 7], // TypeScript - Full-Stack Developer
  [0, 6], // Python - Software Engineer
  [8, 6], // TypeScript - Software Engineer
  [1, 10], // Data Mining - Data Analyst
  [5, 10], // SQL - Data Analyst
  [0, 11], // Python - FastAPI
  [7, 11], // Full-Stack - FastAPI
  [12, 11], // Docker - FastAPI
  [12, 9], // Docker - Cloud Computing
  [2, 9], // Data Scientist - Cloud Computing
  [13, 0], // Projects - Python
  [13, 3], // Projects - React
  [13, 1], // Projects - Data Mining
];

export const HeroGraph3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<HeroNodeData | null>(HERO_NODES[1]); // Default to Data Mining
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<HeroNodeData | null>(null);

  // References to keep Three.js animation and controls state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const graphGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const nodeMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 24);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient and directional lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.0);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Group for nodes and lines
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);
    graphGroupRef.current = graphGroup;

    // Create Text Sprites for Labels
    const createLabelSprite = (text: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.roundRect(10, 10, 236, 44, 12);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#c7d2fe';
        ctx.stroke();

        ctx.font = 'bold 22px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(3.2, 0.8, 1);
      return sprite;
    };

    // Build Node Meshes
    nodeMeshesRef.current = [];
    HERO_NODES.forEach((node) => {
      const sphereGeo = new THREE.SphereGeometry(node.size * 0.55, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(node.color),
        roughness: 0.25,
        metalness: 0.15,
        emissive: new THREE.Color(node.color),
        emissiveIntensity: 0.25,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(...node.pos);
      mesh.userData = { nodeData: node };

      // Add label above node
      const label = createLabelSprite(node.name);
      label.position.set(node.pos[0], node.pos[1] + node.size * 0.7 + 0.6, node.pos[2]);
      graphGroup.add(label);

      // Outer glow ring
      const ringGeo = new THREE.RingGeometry(node.size * 0.62, node.size * 0.72, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(...node.pos);
      graphGroup.add(ringMesh);

      graphGroup.add(mesh);
      nodeMeshesRef.current.push(mesh);
    });

    // Build Connections (Lines)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.45,
      linewidth: 1,
    });

    HERO_CONNECTIONS.forEach(([srcIdx, tgtIdx]) => {
      const srcNode = HERO_NODES[srcIdx];
      const tgtNode = HERO_NODES[tgtIdx];
      if (!srcNode || !tgtNode) return;

      const points = [
        new THREE.Vector3(...srcNode.pos),
        new THREE.Vector3(...tgtNode.pos),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      graphGroup.add(line);
    });

    // Raycaster for Hover and Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMousePosRef.current = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDraggingRef.current && graphGroupRef.current) {
        const deltaX = clientX - prevMousePosRef.current.x;
        const deltaY = clientY - prevMousePosRef.current.y;
        graphGroupRef.current.rotation.y += deltaX * 0.007;
        graphGroupRef.current.rotation.x += deltaY * 0.007;
        prevMousePosRef.current = { x: clientX, y: clientY };
      }

      // Check hover
      const rect = container.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current);
      if (intersects.length > 0) {
        container.style.cursor = 'pointer';
        const hitNode = intersects[0].object.userData.nodeData as HeroNodeData;
        setHoveredNode(hitNode);
      } else {
        container.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
        setHoveredNode(null);
      }
    };

    const handlePointerUp = (e: MouseEvent | TouchEvent) => {
      if (isDraggingRef.current) {
        // If not dragged far, treat as click
        const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
        const rect = container.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeMeshesRef.current);
        if (intersects.length > 0) {
          const hit = intersects[0].object.userData.nodeData as HeroNodeData;
          setSelectedNode(hit);
        }
      }
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.min(36, Math.max(12, camera.position.z + e.deltaY * 0.02));
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);
    domEl.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Window Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotateRef.current && !isDraggingRef.current && graphGroupRef.current) {
        graphGroupRef.current.rotation.y += delta * 0.35;
        graphGroupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domEl.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      domEl.removeEventListener('wheel', handleWheel);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, []);

  const handleResetCamera = () => {
    if (cameraRef.current && graphGroupRef.current) {
      cameraRef.current.position.set(0, 0, 24);
      graphGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (cameraRef.current) {
      const delta = direction === 'in' ? -3 : 3;
      cameraRef.current.position.z = Math.min(36, Math.max(12, cameraRef.current.position.z + delta));
    }
  };

  return (
    <div className="relative w-full h-[460px] md:h-[540px] rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-md shadow-xl overflow-hidden group">
      {/* 3D Canvas Mounting Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Decorative Brand Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Interactive Controls Floating Overlay */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200/80 shadow-sm z-10">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            autoRotate ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
          }`}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />
        <button
          onClick={() => handleZoom('in')}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interaction Hint Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium shadow-sm pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
        <span>Drag to rotate 3D graph • Scroll to zoom</span>
      </div>

      {/* Selected Node Details Card */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-xs p-3.5 bg-white/95 backdrop-blur-md rounded-xl border border-indigo-100 shadow-lg text-left transition-all z-10">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md text-white"
              style={{ backgroundColor: selectedNode.color }}
            >
              {selectedNode.category}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Selected Node</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">{selectedNode.name}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedNode.description}</p>
        </div>
      )}

      {/* Hovered Node Quick Tooltip */}
      {hoveredNode && hoveredNode.id !== selectedNode?.id && (
        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-md pointer-events-none">
          Click node: <span className="font-semibold text-indigo-300">{hoveredNode.name}</span>
        </div>
      )}
    </div>
  );
};
