"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Lightbulb,
  ArrowUpRight,
  TrendingUp,
  SlidersHorizontal,
  X,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  Loader2
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface Idea {
  id: string;
  title: string;
  desc: string;
  category: "AI" | "Core Platform" | "Web3" | "Spatial UI" | "General";
  score: number;
  status: "Draft" | "Research" | "Prototype" | "Ready";
  date: string;
  details: string;
  x: number;
  y: number;
}

export default function IdeaExplorerPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"recent" | "score">("recent");
  
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  // New proposal modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<Idea["category"]>("Core Platform");

  const fetchIdeas = async () => {
    try {
      const res = await fetch("/api/ideas");
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error("Explorer fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          desc: newDesc,
          category: newCategory,
          score: Math.round((7.5 + Math.random() * 2) * 10) / 10,
          details: "Proposal created manually inside the explorer dashboard interface.",
          status: "Draft",
          x: 200,
          y: 200,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        setIdeas(resData.ideas);
        setIsModalOpen(false);
        setNewTitle("");
        setNewDesc("");
      }
    } catch (err) {
      console.error("Create proposal error:", err);
    }
  };

  // Filtering & Sorting Logic
  const filteredIdeas = ideas
    .filter((idea) => {
      const matchSearch =
        idea.title.toLowerCase().includes(search.toLowerCase()) ||
        idea.desc.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "All" || idea.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      return b.id.localeCompare(a.id); // Ordered sequentially by ID
    });

  const categories = ["All", "AI", "Core Platform", "Web3", "Spatial UI"];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-glow" />
        <span>Loading Idea Registry...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 h-full relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            Idea Explorer
            <Lightbulb className="w-5.5 h-5.5 text-cyan-glow" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Search, filter, and review active innovation records and scores.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-glow/50 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors"
        >
          <Plus className="w-4 h-4 text-cyan-glow" />
          New Proposal
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search ideas, key tech, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl
              text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50
            "
          />
        </div>

        {/* Sort & Category controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 border border-white/10 px-3 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "score")}
              className="bg-transparent text-xs text-slate-350 outline-hidden cursor-pointer"
            >
              <option value="recent">Sort: Recent</option>
              <option value="score">Sort: Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer
              ${
                selectedCategory === cat
                  ? "bg-white/[0.06] text-white border-b-2 border-cyan-glow rounded-b-none"
                  : "text-slate-400 hover:text-slate-200"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid & Drawer split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch relative">
        {/* Grid Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-max">
          {filteredIdeas.map((idea) => {
            const glowColor =
              idea.category === "AI"
                ? ("purple" as const)
                : idea.category === "Core Platform"
                ? ("cyan" as const)
                : idea.category === "Web3"
                ? ("emerald" as const)
                : ("magenta" as const);

            return (
              <GlassCard
                key={idea.id}
                interactive
                glowColor={glowColor}
                onClick={() => setSelectedIdea(idea)}
                className="flex flex-col justify-between h-[190px]"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      {idea.category} &bull; {idea.id}
                    </span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-emerald-glow" />
                      <span className="text-xs font-bold text-white font-mono">{idea.score}</span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-sm font-extrabold text-white mb-2 line-clamp-1">{idea.title}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{idea.desc}</p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold font-mono border uppercase ${
                      idea.status === "Ready"
                        ? "bg-emerald-glow/10 text-emerald-glow border-emerald-glow/20"
                        : idea.status === "Prototype"
                        ? "bg-cyan-glow/10 text-cyan-glow border-cyan-glow/20"
                        : idea.status === "Research"
                        ? "bg-purple-glow/10 text-purple-glow border-purple-glow/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {idea.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {idea.date}
                  </span>
                </div>
              </GlassCard>
            );
          })}

          {filteredIdeas.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 gap-2.5">
              <Search className="w-8 h-8 text-slate-700 animate-pulse" />
              <span className="text-xs">No ideas found matching your filters.</span>
            </div>
          )}
        </div>

        {/* Slide-in Details Drawer */}
        <AnimatePresence>
          {selectedIdea && (
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="w-full lg:w-[350px] flex-none z-30"
            >
              <GlassCard
                glowColor={
                  selectedIdea.category === "AI"
                    ? "purple"
                    : selectedIdea.category === "Core Platform"
                    ? "cyan"
                    : selectedIdea.category === "Web3"
                    ? "emerald"
                    : "magenta"
                }
                className="h-full flex flex-col justify-between p-6"
              >
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-glow" /> Ideation Dossier
                    </span>
                    <button
                      onClick={() => setSelectedIdea(null)}
                      className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Tag */}
                  <div>
                    <h3 className="text-base font-extrabold text-white leading-snug mb-2">
                      {selectedIdea.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/[0.04] border border-white/10 text-slate-350 font-mono uppercase">
                        {selectedIdea.category}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-glow/10 text-emerald-glow border border-emerald-glow/20 font-mono">
                        Score: {selectedIdea.score}
                      </span>
                    </div>
                  </div>

                  {/* Detailed summary */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                      Breakthrough Detail
                    </span>
                    <p className="text-xs text-slate-305 leading-relaxed bg-black/25 rounded-xl p-3.5 border border-white/3">
                      {selectedIdea.details}
                    </p>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                      R&D Goals
                    </span>
                    <div className="flex flex-col gap-2">
                      {[
                        { text: "Verify local database compiler", completed: true },
                        { text: "Benchmark retrieval latency logs", completed: true },
                        { text: "Integrate vector route maps", completed: false },
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                          {task.completed ? (
                            <CheckCircle className="w-4 h-4 text-emerald-glow" />
                          ) : (
                            <Clock className="w-4 h-4 text-slate-650 animate-pulse" />
                          )}
                          <span className={task.completed ? "line-through text-slate-500" : ""}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <button className="flex items-center gap-1.5 text-cyan-glow hover:underline font-bold">
                    Launch Workspace
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <span>ID: {selectedIdea.id}</span>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Proposal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-md"
            >
              <GlassCard glowColor="cyan" className="relative p-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-glow" />
                    New Innovation Proposal
                  </span>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateProposal} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Proposal Name</label>
                    <input
                      type="text"
                      placeholder="e.g. WASM local compiler thread..."
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-glow/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Short Description</label>
                    <textarea
                      placeholder="Briefly summarize the target objectives..."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      required
                      rows={2}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-glow/50 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Technical Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as Idea["category"])}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-350 outline-hidden cursor-pointer"
                    >
                      <option value="Core Platform">Core Platform</option>
                      <option value="AI">AI Systems</option>
                      <option value="Web3">Web3 Ledger</option>
                      <option value="Spatial UI">Spatial UI</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-white hover:bg-slate-200 px-4 py-2 text-xs font-bold text-black transition-all active:scale-95 cursor-pointer"
                    >
                      Create Record
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
