"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  ZoomIn,
  ZoomOut,
  X,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Wand2,
  Loader2
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface GraphNode {
  id: string;
  label: string;
  group: "ai" | "core" | "web3" | "spatial" | "general";
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  r: number;
  details: string;
  status: "Draft" | "Research" | "Prototype" | "Ready";
  confidence: number;
}

interface GraphLink {
  source: string;
  target: string;
}

export default function KnowledgeGraphPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interactive navigation states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Hover & selection states
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Graph Data States
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Graph compiler prompt states
  const [graphPrompt, setGraphPrompt] = useState("Build architectural map for a micro-frontend spatial R&D console");
  const [isCompiling, setIsCompiling] = useState(false);

  // Fetch nodes from shared memory DB
  const loadDatabaseGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ideas");
      if (res.ok) {
        const dbIdeas = await res.json();
        
        // Map ideas to GraphNode structure
        const mappedNodes: GraphNode[] = dbIdeas.map((idea: any) => ({
          id: idea.id,
          label: idea.title,
          group: idea.category === "Core Platform" ? "core" : (idea.category.toLowerCase() as any),
          x: idea.x || 300,
          y: idea.y || 250,
          r: 15 + Math.round(idea.score * 0.7), // node size proportional to score
          details: idea.details || idea.desc,
          status: idea.status || "Draft",
          confidence: idea.score || 8.0,
        }));

        // Dynamically build link lines between nodes sharing categories
        const mappedLinks: GraphLink[] = [];
        for (let i = 0; i < mappedNodes.length; i++) {
          for (let j = i + 1; j < mappedNodes.length; j++) {
            if (mappedNodes[i].group === mappedNodes[j].group) {
              mappedLinks.push({
                source: mappedNodes[i].id,
                target: mappedNodes[j].id,
              });
            }
          }
        }
        
        // Ensure a sparse network layout: connect orphans to the root first node
        if (mappedNodes.length > 1) {
          mappedNodes.forEach((node, idx) => {
            if (idx > 0 && !mappedLinks.some(l => l.source === node.id || l.target === node.id)) {
              mappedLinks.push({
                source: mappedNodes[0].id,
                target: node.id
              });
            }
          });
        }

        setNodes(mappedNodes);
        setLinks(mappedLinks);
      }
    } catch (err) {
      console.error("Knowledge Graph load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseGraph();
  }, []);

  const handleCompileGraph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!graphPrompt.trim()) return;

    setIsCompiling(true);
    try {
      const response = await fetch("/api/generate-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: graphPrompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to compile custom graph");
      }

      const data = await response.json();
      
      // Update graph states with custom AI payload
      setNodes(data.nodes);
      setLinks(data.links);
      setSelectedNode(null);
    } catch (err) {
      console.error("AI Graph compiler error:", err);
    } finally {
      setIsCompiling(false);
    }
  };

  // Group colors mapping
  const groupColors = {
    ai: { fill: "rgba(155, 93, 229, 0.8)", stroke: "#9b5de5", glow: "rgba(155, 93, 229, 0.4)" },
    core: { fill: "rgba(0, 242, 254, 0.8)", stroke: "#00f2fe", glow: "rgba(0, 242, 254, 0.4)" },
    web3: { fill: "rgba(0, 245, 212, 0.8)", stroke: "#00f5d4", glow: "rgba(0, 245, 212, 0.4)" },
    spatial: { fill: "rgba(241, 91, 181, 0.8)", stroke: "#f15bb5", glow: "rgba(241, 91, 181, 0.4)" },
    general: { fill: "rgba(100, 116, 139, 0.8)", stroke: "#94a3b8", glow: "rgba(148, 163, 184, 0.4)" },
  };

  // Run canvas loops
  useEffect(() => {
    if (nodes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 800;
      canvas.height = 500;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Dynamic node drift physics
    const updatePhysics = () => {
      nodes.forEach((n) => {
        if (!n.vx) n.vx = (Math.random() - 0.5) * 0.15;
        if (!n.vy) n.vy = (Math.random() - 0.5) * 0.15;

        n.x += n.vx;
        n.y += n.vy;

        // Keep inside bounds (40px border padding)
        if (n.x < 100 || n.x > canvas.width - 100) n.vx *= -1;
        if (n.y < 100 || n.y > canvas.height - 100) n.vy *= -1;
      });
    };

    const drawGraph = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Apply Zoom & Pan
      ctx.translate(pan.x, pan.y);
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // 1. Draw Links
      links.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode) return;

        const isHighlighted = hoveredNode?.id === sourceNode.id || hoveredNode?.id === targetNode.id;

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = isHighlighted ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
        ctx.stroke();
      });

      // 2. Draw Nodes
      nodes.forEach((node) => {
        const groupKey = (node.group in groupColors ? node.group : "general") as keyof typeof groupColors;
        const color = groupColors[groupKey];
        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Node Outer Glow
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r + (isHovered ? 12 : 8), 0, Math.PI * 2);
          ctx.fillStyle = color.glow;
          ctx.fill();
        }

        // Inner Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = color.fill;
        ctx.strokeStyle = isSelected ? "#ffffff" : color.stroke;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.fill();
        ctx.stroke();

        // Node Label
        ctx.font = isSelected ? "bold 11px Inter, sans-serif" : "10px Inter, sans-serif";
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y + node.r + 15);
      });

      ctx.restore();
      
      // Update position drift
      updatePhysics();
      animationId = requestAnimationFrame(drawGraph);
    };

    drawGraph();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [nodes, zoom, pan, hoveredNode, selectedNode]);

  // Handle canvas interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert mouse coordinates back from zoom & pan translation
    const x = (clientX - pan.x - canvasRef.current.width / 2) / zoom + canvasRef.current.width / 2;
    const y = (clientY - pan.y - canvasRef.current.height / 2) / zoom + canvasRef.current.height / 2;

    // Hit test nodes
    const clickedNode = nodes.find((node) => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) < node.r + 5;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else {
      const x = (clientX - pan.x - canvasRef.current.width / 2) / zoom + canvasRef.current.width / 2;
      const y = (clientY - pan.y - canvasRef.current.height / 2) / zoom + canvasRef.current.height / 2;

      const hitNode = nodes.find((node) => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) < node.r + 5;
      });

      setHoveredNode(hitNode || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setZoom((prev) => Math.min(2.5, prev + 0.15));
  const zoomOut = () => setZoom((prev) => Math.max(0.4, prev - 0.15));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    loadDatabaseGraph();
  };

  return (
    <div className="flex flex-col gap-6 flex-1 h-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            Knowledge Graph Explorer
            <Network className="w-5.5 h-5.5 text-cyan-glow animate-pulse" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Visual relationships mapping technological dependencies and R&D categories.
          </p>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-bold uppercase">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow" /> Core Platform
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-glow/10 text-purple-glow border border-purple-glow/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-glow" /> AI Systems
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-glow/10 text-emerald-glow border border-emerald-glow/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-glow" /> Web3 Ledger
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-magenta-glow/10 text-magenta-glow border border-magenta-glow/20">
            <span className="w-1.5 h-1.5 rounded-full bg-magenta-glow" /> Spatial UI
          </span>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="flex items-center gap-2.5 bg-cyan-900/10 border border-cyan-500/20 text-[11px] text-cyan-400 rounded-xl px-4 py-2">
        <Info className="w-4 h-4 flex-none" />
        <span>
          <strong>Interactive Visualizer:</strong> Drag the background to pan the network. Use the controls to zoom. Submit an architectural concept to recompile the graph utilizing AI.
        </span>
      </div>

      {/* AI Graph Input Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-slate-900/30 border border-white/5 rounded-2xl p-4">
        <div className="relative flex-1">
          <Wand2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-glow animate-pulse" />
          <input
            type="text"
            placeholder="Type a systems design concept to visualize (e.g. 'Multiplayer collaborative spatial workspace'...)"
            value={graphPrompt}
            onChange={(e) => setGraphPrompt(e.target.value)}
            disabled={isCompiling}
            className="
              w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl
              text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50
            "
          />
        </div>

        <button
          onClick={handleCompileGraph}
          disabled={isCompiling}
          className="
            flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-glow to-purple-glow
            px-5 py-2.5 text-xs font-bold text-black transition-all active:scale-95 disabled:opacity-55 cursor-pointer
          "
        >
          {isCompiling ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Compiling Graph...</span>
            </>
          ) : (
            <>
              <Network className="w-3.5 h-3.5" />
              <span>Compile Graph</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch relative min-h-[500px]">
        {/* Graph Canvas Wrapper */}
        <div className="flex-1 border border-white/5 bg-slate-950/45 rounded-2xl overflow-hidden relative flex flex-col justify-between">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-slate-450 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-glow" />
              <span>Loading Graph Network...</span>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full flex-1 cursor-grab active:cursor-grabbing bg-slate-950/20"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          )}

          {/* Graph Zoom Controls */}
          <div className="absolute bottom-5 left-5 flex items-center gap-2.5 z-25">
            <button
              onClick={zoomIn}
              className="p-2 bg-slate-900 border border-white/10 hover:border-cyan-glow/50 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all shadow-md"
            >
              <ZoomIn className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={zoomOut}
              className="p-2 bg-slate-900 border border-white/10 hover:border-cyan-glow/50 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all shadow-md"
            >
              <ZoomOut className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-2 bg-slate-900 border border-white/10 hover:border-cyan-glow/50 text-xs text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all shadow-md font-medium"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* Slide-in glassmorphic node details panel (on the right) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="w-full lg:w-[320px] flex-none z-30"
            >
              <GlassCard
                glowColor={
                  selectedNode.group === "ai"
                    ? "purple"
                    : selectedNode.group === "core"
                    ? "cyan"
                    : selectedNode.group === "web3"
                    ? "emerald"
                    : selectedNode.group === "spatial"
                    ? "magenta"
                    : "none"
                }
                className="h-full flex flex-col justify-between p-6"
              >
                <div className="space-y-6">
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-glow" /> Node Dossier
                    </span>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Tag */}
                  <div>
                    <h3 className="text-lg font-extrabold text-white leading-tight mb-2">
                      {selectedNode.label}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono border uppercase ${
                        selectedNode.group === "ai"
                          ? "bg-purple-glow/10 text-purple-glow border-purple-glow/20"
                          : selectedNode.group === "core"
                          ? "bg-cyan-glow/10 text-cyan-glow border-cyan-glow/20"
                          : selectedNode.group === "web3"
                          ? "bg-emerald-glow/10 text-emerald-glow border-emerald-glow/20"
                          : selectedNode.group === "spatial"
                          ? "bg-magenta-glow/10 text-magenta-glow border-magenta-glow/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {selectedNode.group} cluster
                    </span>
                  </div>

                  {/* Description */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                      Research Summary
                    </span>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      {selectedNode.details}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4 font-mono">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">R&D Status</span>
                      <p className="text-xs text-white font-bold">{selectedNode.status}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Confidence</span>
                      <p className="text-xs text-emerald-glow font-bold">{selectedNode.confidence}/10</p>
                    </div>
                  </div>

                  {/* Connections */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                      Active Links
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {links
                        .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                        .map((l, i) => {
                          const connectedId = l.source === selectedNode.id ? l.target : l.source;
                          const targetObj = nodes.find((n) => n.id === connectedId);
                          return (
                            <div
                              key={i}
                              onClick={() => setSelectedNode(targetObj || null)}
                              className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-[11px] text-slate-300 cursor-pointer transition-colors"
                            >
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                              <span>{targetObj?.label || connectedId}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Checked: June 2026
                  </span>
                  <span>ID: #{selectedNode.id.toUpperCase()}</span>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
