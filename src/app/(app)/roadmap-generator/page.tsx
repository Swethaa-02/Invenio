"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Milestone,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
  Wand2,
  Loader2,
  CheckCircle,
  ClipboardCheck,
  Download,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface Idea {
  id: string;
  title: string;
  desc: string;
  category: string;
  score: number;
}

interface Phase {
  phase_name: string;
  timeline: string;
  milestones: string[];
  tasks: string[];
  dependencies: string[];
  deliverables: string[];
  progress: number;
}

export default function RoadmapGeneratorPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Load existing ideas for dropdown selection
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const res = await fetch("/api/ideas");
        if (res.ok) {
          const data = await res.json();
          setIdeas(data);
          if (data.length > 0) {
            setSelectedIdeaId(data[0].id);
            setCustomTitle(data[0].title);
            setCustomSummary(data[0].desc);
          }
        }
      } catch (err) {
        console.error("Failed to load ideas:", err);
      }
    };
    fetchIdeas();
  }, []);

  const handleIdeaChange = (id: string) => {
    setSelectedIdeaId(id);
    const idea = ideas.find((i) => i.id === id);
    if (idea) {
      setCustomTitle(idea.title);
      setCustomSummary(idea.desc);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customSummary.trim()) return;

    setIsLoading(true);
    setPhases([]);

    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customTitle,
          summary: customSummary,
        }),
      });

      if (!res.ok) {
        throw new Error("Generation failed");
      }

      const data = await res.json();
      if (data && data.phases) {
        setPhases(data.phases);
        setSelectedPhaseIndex(0);
      }
    } catch (err) {
      console.error("Roadmap generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePhaseProgress = (index: number, progress: number) => {
    setPhases((prev) =>
      prev.map((p, i) => (i === index ? { ...p, progress } : p))
    );
  };

  const copyToClipboard = () => {
    if (phases.length === 0) return;
    const reportText = `
ROADMAP LIFECYCLE PITCH DOSSIER
-------------------------------
Venture: ${customTitle}

${phases.map((p, idx) => `
PHASE ${idx + 1}: ${p.phase_name} (${p.timeline}) - Progress: ${p.progress}%
-------------------------------------------------------------------
Milestones:
${p.milestones.map((m) => ` - [x] ${m}`).join("\n")}
Tasks:
${p.tasks.map((t) => ` - [ ] ${t}`).join("\n")}
Dependencies:
${p.dependencies.map((d) => ` - ${d}`).join("\n")}
Deliverables:
${p.deliverables.map((dl) => ` - ${dl}`).join("\n")}
`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPhaseColor = (index: number, activeIndex: number, progress: number) => {
    if (index === activeIndex) return "border-cyan-glow bg-cyan-glow/20 text-white shadow-[0_0_15px_#00f2fe]";
    if (progress === 100) return "border-emerald-glow bg-emerald-glow/10 text-emerald-glow";
    if (progress > 0) return "border-purple-glow bg-purple-glow/10 text-purple-glow";
    return "border-slate-800 bg-slate-900/50 text-slate-500";
  };

  const getPhaseLineColor = (index: number, progress: number) => {
    if (progress === 100) return "bg-emerald-glow";
    if (progress > 0) return "bg-purple-glow";
    return "bg-slate-800";
  };

  return (
    <div className="flex flex-col gap-6 flex-1 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            AI Roadmap Generator
            <Milestone className="w-5.5 h-5.5 text-emerald-glow" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Chronological Gantt compiler. Map out product lifecycle phases, track milestones, and audit deliverables.
          </p>
        </div>

        {/* Custom vs Saved toggle */}
        <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 text-xs">
          <button
            onClick={() => {
              setIsCustomMode(false);
              if (ideas.length > 0) {
                handleIdeaChange(selectedIdeaId || ideas[0].id);
              }
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              !isCustomMode ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Saved Ideas
          </button>
          <button
            onClick={() => {
              setIsCustomMode(true);
              setCustomTitle("");
              setCustomSummary("");
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              isCustomMode ? "bg-white/10 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            Custom Idea
          </button>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="flex items-center gap-2.5 bg-emerald-900/10 border border-emerald-500/20 text-[11px] text-emerald-400 rounded-xl px-4 py-2">
        <Info className="w-4 h-4 flex-none" />
        <span>
          <strong>Interactive Timeline:</strong> Setup the target project parameters below, generate the roadmap, and click on each phase circle node to view task list dossiers.
        </span>
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left column: Setup form */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <GlassCard glowColor="emerald" className="p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-glow" /> Project Parameters
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              {!isCustomMode && ideas.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                    Select Target Idea
                  </label>
                  <select
                    value={selectedIdeaId}
                    onChange={(e) => handleIdeaChange(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-hidden hover:border-emerald-glow/50"
                  >
                    {ideas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        [{idea.category}] {idea.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                  Concept Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Decentralized File Indexing Mesh"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-glow/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                  Venture Summary
                </label>
                <textarea
                  placeholder="Describe your project goals so the AI can compile tailored tasks and milestones..."
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  rows={5}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-glow/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !customTitle.trim() || !customSummary.trim()}
                className="
                  w-full mt-2 py-3 bg-linear-to-r from-cyan-glow via-emerald-glow to-purple-glow text-black
                  text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-55
                  flex items-center justify-center gap-2 cursor-pointer
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Compiling Lifecycle...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate AI Roadmap</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right columns: Visual timeline and Phase dossier details */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="border border-white/5 bg-slate-950/45 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center gap-4"
              >
                <div className="relative w-16 h-16">
                  <Loader2 className="w-full h-full animate-spin text-emerald-glow" />
                  <Milestone className="absolute inset-0 m-auto w-6 h-6 text-purple-glow animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Compiling chronological development tracks</h4>
                  <p className="text-slate-500 text-xs mt-1">Analyzing dependencies, plotting timelines, and generating phase tasks and deliverables...</p>
                </div>
              </motion.div>
            )}

            {!isLoading && phases.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-white/5 bg-slate-950/45 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center text-slate-500 gap-4"
              >
                <Sparkles className="w-12 h-12 text-slate-650 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">No Active Roadmap</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-1 mx-auto">
                    Fill out the venture summary on the left or select an idea, then click run to visualize your 6-phase chronological launch roadmap.
                  </p>
                </div>
              </motion.div>
            )}

            {!isLoading && phases.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6"
              >
                {/* Horizontal 6-Node Timeline Bar */}
                <GlassCard glowColor="cyan" className="p-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-6 block border-b border-white/5 pb-2">
                    Visual Chronological Lifecycle
                  </span>

                  <div className="relative flex flex-col md:flex-row justify-between items-center px-4 py-8 select-none">
                    {/* Horizontal connector line */}
                    <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-800 -translate-y-1/2 hidden md:block z-0" />
                    
                    {phases.map((phase, idx) => {
                      const isActive = selectedPhaseIndex === idx;
                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-3 cursor-pointer group mb-6 md:mb-0" onClick={() => setSelectedPhaseIndex(idx)}>
                          {/* Circle node */}
                          <div
                            className={`
                              w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300
                              ${getPhaseColor(idx, selectedPhaseIndex, phase.progress)}
                            `}
                          >
                            P{idx + 1}
                          </div>

                          {/* Phase name and progress under circle */}
                          <div className="text-center">
                            <p className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-glow transition-colors max-w-[100px] leading-tight truncate">
                              {phase.phase_name.replace("Phase " + (idx + 1) + " ", "")}
                            </p>
                            <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                              {phase.progress}% done
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Selected Phase Detail Dossier Drawer */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Left Column: Milestones & Progress Slider */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <GlassCard glowColor="emerald" className="p-6 flex flex-col justify-between h-full">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Phase Parameters
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">P{selectedPhaseIndex + 1}</span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-white leading-tight mb-2">
                            {phases[selectedPhaseIndex].phase_name}
                          </h3>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/[0.04] border border-white/10 text-slate-300 font-mono uppercase">
                            <Clock className="w-3 h-3 text-cyan-glow" /> {phases[selectedPhaseIndex].timeline}
                          </span>
                        </div>

                        {/* Interactive Progress slider */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 font-mono">
                            <span>Interactive Progress</span>
                            <span className="text-white font-mono">{phases[selectedPhaseIndex].progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={phases[selectedPhaseIndex].progress}
                            onChange={(e) => updatePhaseProgress(selectedPhaseIndex, parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-glow"
                          />
                        </div>

                        {/* Milestones check list */}
                        <div className="space-y-3.5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                            Milestones
                          </span>
                          <div className="flex flex-col gap-3">
                            {phases[selectedPhaseIndex].milestones.map((m, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-350">
                                <CheckCircle className="w-4 h-4 text-emerald-glow flex-none mt-0.5" />
                                <span className="leading-tight">{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Right Column: Tasks, Dependencies & Deliverables */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <GlassCard glowColor="purple" className="p-6 flex flex-col justify-between h-full">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Task Registry & Artifacts
                          </span>
                          <Layers className="w-4 h-4 text-purple-glow animate-pulse" />
                        </div>

                        {/* Tasks checkbox checklist */}
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                            Required Tasks
                          </span>
                          <div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                            {phases[selectedPhaseIndex].tasks.map((task, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-white/3 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                                <input
                                  type="checkbox"
                                  className="mt-0.5 rounded-sm border-white/20 accent-cyan-glow cursor-pointer"
                                />
                                <span className="text-xs text-slate-250 leading-tight">{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dependencies pills */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                            Phase Dependencies
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {phases[selectedPhaseIndex].dependencies.map((dep, i) => (
                              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 border border-white/5 text-slate-400 font-mono">
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Key deliverables */}
                        <div className="space-y-2.5">
                          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                            Key Deliverables
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {phases[selectedPhaseIndex].deliverables.map((dl, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/20 border border-emerald-500/20 text-emerald-400">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-glow" />
                                {dl}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>

                {/* Dossier Actions Footer */}
                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button
                    onClick={copyToClipboard}
                    className="
                      flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10
                      hover:border-white/20 text-xs font-semibold text-slate-250 bg-slate-900 transition-all active:scale-95 cursor-pointer
                    "
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-glow" />
                        <span>Copied Roadmap!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-4 h-4 text-cyan-glow" />
                        <span>Copy Roadmap Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={copyToClipboard} // Same copy behavior
                    className="
                      flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200
                      text-xs font-bold text-black transition-all active:scale-95 cursor-pointer
                    "
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Roadmap</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
