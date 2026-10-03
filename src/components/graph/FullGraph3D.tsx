import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  Layers,
  Link as LinkIcon,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { GraphData, GraphNode, GraphEdge, NodeCategory, RelationshipType } from '../../types';
import { useNavigate } from 'react-router-dom';

interface FullGraph3DProps {
  data: GraphData;
}

export const FullGraph3D: React.FC<FullGraph3DProps> = ({ data }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRelationship, setSelectedRelationship] = useState<string>('All');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webGLError, setWebGLError] = useState(false);

  // References for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const graphGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const edgeLinesMapRef = useRef<Map<string, THREE.Line>>(new Map());
  const labelSpritesMapRef = useRef<Map<string, THREE.Sprite>>(new Map());

  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Filtered dataset
  const filteredNodes = useMemo(() => {
    return data.nodes.filter((node) => {
      const matchesSearch =
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || node.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.nodes, searchTerm, selectedCategory]);

  const activeNodeIds = useMemo(() => {
    return new Set(filteredNodes.map((n) => n.id));
  }, [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return data.edges.filter((edge) => {
      const connectsActive =
        activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target);
      const matchesRel =
        selectedRelationship === 'All' ||
        edge.relationship === selectedRelationship;
      return connectsActive && matchesRel;
    });
  }, [data.edges, activeNodeIds, selectedRelationship]);

  // Compute connected nodes for selected node
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const directEdges = data.edges.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id
    );
    const nodeMap = new Map(data.nodes.map((n) => [n.id, n]));

    return directEdges.map((edge) => {
      const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
      const otherNode = nodeMap.get(otherId);
      return {
        node: otherNode,
        relationship: edge.relationship,
        isInferred: edge.isInferred,
      };
    }).filter((item) => item.node !== undefined);
  }, [selectedNode, data]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        50,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 30);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.2);
      dirLight1.position.set(15, 20, 15);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.5);
      dirLight2.position.set(-15, -15, -15);
      scene.add(dirLight2);

      const graphGroup = new THREE.Group();
      scene.add(graphGroup);
      graphGroupRef.current = graphGroup;

      // Position nodes in a 3D force-like sphere arrangement
      const nodeCount = data.nodes.length;
      const phiSpan = Math.PI * (3 - Math.sqrt(5)); // Golden ratio

      data.nodes.forEach((node, i) => {
        const y = 1 - (i / (nodeCount - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = phiSpan * i;
        const r = 10 + (i % 3) * 1.5;

        node.x = Math.cos(theta) * radiusAtY * r;
        node.y = y * r;
        node.z = Math.sin(theta) * radiusAtY * r;
      });

      // Label sprite generator
      const createLabel = (text: string, color: string) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.roundRect(10, 10, 236, 44, 10);
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = color || '#818cf8';
          ctx.stroke();

          ctx.font = 'bold 20px Inter, system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(text, 128, 32);
        }
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(3.4, 0.85, 1);
        return sprite;
      };

      // Create Meshes
      nodeMeshesMapRef.current.clear();
      edgeLinesMapRef.current.clear();
      labelSpritesMapRef.current.clear();

      data.nodes.forEach((node) => {
        const sphereGeo = new THREE.SphereGeometry((node.size || 1.1) * 0.7, 32, 32);
        const sphereMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(node.color || '#4F46E5'),
          roughness: 0.25,
          metalness: 0.15,
          emissive: new THREE.Color(node.color || '#4F46E5'),
          emissiveIntensity: 0.25,
        });

        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(node.x || 0, node.y || 0, node.z || 0);
        mesh.userData = { node };

        const label = createLabel(node.label, node.color || '#4F46E5');
        label.position.set(node.x || 0, (node.y || 0) + (node.size || 1.1) * 0.8 + 0.6, node.z || 0);
        graphGroup.add(label);
        labelSpritesMapRef.current.set(node.id, label);

        graphGroup.add(mesh);
        nodeMeshesMapRef.current.set(node.id, mesh);
      });

      // Create Edges
      const nodePosMap = new Map(data.nodes.map((n) => [n.id, new THREE.Vector3(n.x, n.y, n.z)]));

      data.edges.forEach((edge, idx) => {
        const srcPos = nodePosMap.get(edge.source);
        const tgtPos = nodePosMap.get(edge.target);
        if (!srcPos || !tgtPos) return;

        const points = [srcPos, tgtPos];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const lineMat = new THREE.LineBasicMaterial({
          color: edge.isInferred ? 0x06b6d4 : 0x94a3b8,
          transparent: true,
          opacity: edge.isInferred ? 0.6 : 0.4,
          linewidth: edge.isInferred ? 2 : 1,
        });

        const line = new THREE.Line(lineGeo, lineMat);
        const edgeKey = `${edge.source}->${edge.target}_${idx}`;
        graphGroup.add(line);
        edgeLinesMapRef.current.set(edgeKey, line);
      });

      // Controls setup
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
          graphGroupRef.current.rotation.y += deltaX * 0.006;
          graphGroupRef.current.rotation.x += deltaY * 0.006;
          prevMousePosRef.current = { x: clientX, y: clientY };
        }

        const rect = container.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const meshes = Array.from(nodeMeshesMapRef.current.values());
        const intersects = raycaster.intersectObjects(meshes);
        container.style.cursor = intersects.length > 0 ? 'pointer' : isDraggingRef.current ? 'grabbing' : 'grab';
      };

      const handlePointerUp = (e: MouseEvent | TouchEvent) => {
        if (isDraggingRef.current) {
          const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
          const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
          const rect = container.getBoundingClientRect();
          mouse.x = ((clientX - rect.left) / container.clientWidth) * 2 - 1;
          mouse.y = -((clientY - rect.top) / container.clientHeight) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const meshes = Array.from(nodeMeshesMapRef.current.values());
          const intersects = raycaster.intersectObjects(meshes);
          if (intersects.length > 0) {
            const hit = intersects[0].object.userData.node as GraphNode;
            setSelectedNode(hit);
          }
        }
        isDraggingRef.current = false;
      };

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        camera.position.z = Math.min(48, Math.max(14, camera.position.z + e.deltaY * 0.03));
      };

      const domEl = renderer.domElement;
      domEl.addEventListener('mousedown', handlePointerDown);
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      domEl.addEventListener('touchstart', handlePointerDown, { passive: true });
      window.addEventListener('touchmove', handlePointerMove, { passive: true });
      window.addEventListener('touchend', handlePointerUp);
      domEl.addEventListener('wheel', handleWheel, { passive: false });

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      // Render loop
      let animId: number;
      const clock = new THREE.Clock();

      const animate = () => {
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();

        if (autoRotateRef.current && !isDraggingRef.current && graphGroupRef.current) {
          graphGroupRef.current.rotation.y += delta * 0.22;
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
    } catch (err) {
      console.error('WebGL init error:', err);
      setWebGLError(true);
    }
  }, [data]);

  // Update visibility based on active filters
  useEffect(() => {
    nodeMeshesMapRef.current.forEach((mesh, id) => {
      const isVisible = activeNodeIds.has(id);
      mesh.visible = isVisible;
      const label = labelSpritesMapRef.current.get(id);
      if (label) label.visible = isVisible;
    });
  }, [activeNodeIds]);

  const handleResetCamera = () => {
    if (cameraRef.current && graphGroupRef.current) {
      cameraRef.current.position.set(0, 0, 30);
      graphGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const handleZoom = (dir: 'in' | 'out') => {
    if (cameraRef.current) {
      const delta = dir === 'in' ? -4 : 4;
      cameraRef.current.position.z = Math.min(48, Math.max(14, cameraRef.current.position.z + delta));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const focusOnNode = (node: GraphNode) => {
    setSelectedNode(node);
    if (graphGroupRef.current && cameraRef.current) {
      // Rotate scene so target node aligns toward camera
      const targetAngle = -Math.atan2(node.x || 0, node.z || 1);
      graphGroupRef.current.rotation.y = targetAngle;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl border border-slate-200/90 bg-slate-900 shadow-xl overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[680px]'
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-lg text-white">
        {/* Search */}
        <div className="relative min-w-[220px] flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, roles, tech..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories ({data.nodes.length})</option>
            <option value="Skill">Skills</option>
            <option value="Technology">Technologies</option>
            <option value="Job Role">Job Roles</option>
            <option value="Project">Projects</option>
            <option value="Certification">Certifications</option>
            <option value="Skill Category">Skill Categories</option>
          </select>
        </div>

        {/* Relationship Filter */}
        <div className="flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedRelationship}
            onChange={(e) => setSelectedRelationship(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Relationships</option>
            <option value="REQUIRES_SKILL">REQUIRES_SKILL</option>
            <option value="RELATED_TO">RELATED_TO</option>
            <option value="USES_TECHNOLOGY">USES_TECHNOLOGY</option>
            <option value="DEMONSTRATED_IN">DEMONSTRATED_IN</option>
            <option value="BELONGS_TO">BELONGS_TO</option>
            <option value="MENTIONS">MENTIONS</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg text-xs transition-colors ${
              autoRotate ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleResetCamera}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom('in')}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas Mount */}
      {!webGLError ? (
        <div ref={mountRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing bg-slate-950" />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-8 text-center text-slate-300 bg-slate-950">
          <div>
            <Info className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">WebGL Hardware Acceleration Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              Your browser or environment has WebGL disabled. You can still inspect node relationships in the list below.
            </p>
          </div>
        </div>
      )}

      {/* Legend Overlay at Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3 p-2.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-[11px] text-slate-300">
        <span className="font-semibold text-slate-400">Legend:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" /> Job Role</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Skill</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" /> Technology</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" /> Project</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Certification</span>
        <span className="flex items-center gap-1.5"><span className="w-3.5 h-0.5 bg-cyan-400 border border-cyan-400 border-dashed" /> Inferred Link</span>
      </div>

      {/* Collapsible Node Inspector Drawer */}
      {selectedNode && (
        <div className="absolute top-20 right-4 bottom-4 w-80 md:w-96 z-20 bg-slate-900/95 backdrop-blur-lg border border-slate-700/90 rounded-2xl shadow-2xl p-5 flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-right duration-200">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span
                className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-white mb-1.5"
                style={{ backgroundColor: selectedNode.color || '#4F46E5' }}
              >
                {selectedNode.category}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">{selectedNode.label}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-slate-300 text-xs">
            <div>
              <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="leading-relaxed text-slate-200">{selectedNode.description}</p>
            </div>

            {selectedNode.evidence && (
              <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
                <span className="font-semibold text-indigo-400 block mb-0.5">Evidence / Provenance:</span>
                <span className="text-slate-300">{selectedNode.evidence}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Connected Nodes ({connectedNodes.length})
                </h4>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {connectedNodes.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => item.node && focusOnNode(item.node)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.node?.color || '#94A3B8' }}
                      />
                      <span className="font-medium text-slate-200 truncate">{item.node?.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                        {item.relationship}
                      </span>
                      {item.isInferred && (
                        <span className="px-1 py-0.5 rounded bg-cyan-950 text-cyan-300 font-semibold" title="Inferred through Data Mining association">
                          Inferred
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => navigate('/skill-analysis')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
              >
                <span>View in Skill Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate('/career-matches')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium transition-colors"
              >
                <span>Explore Career Matches</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
