"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  TrendingUp,
  Target,
  DollarSign,
  Compass,
  Info,
  Loader2,
  Sparkles,
  Download,
  ClipboardCheck,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Briefcase
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface Idea {
  id: string;
  title: string;
  desc: string;
  category: string;
  score: number;
  details?: string;
}

interface StartupAnalysis {
  startup_potential_score: number;
  market_size_score: number;
  competition_score: number;
  revenue_potential_score: number;
  scalability_score: number;
  customer_demand_score: number;
  business_model: string;
  target_customers: string[];
  revenue_streams: string[];
  go_to_market_strategy: string[];
  explanation: string;
}

export default function StartupAnalyzerPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [customTech, setCustomTech] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<StartupAnalysis | null>(null);
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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customSummary.trim()) return;

    setIsLoading(true);
    setAnalysis(null);

    const technologies = customTech
      ? customTech.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch("/api/startup-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customTitle,
          summary: customSummary,
          technologies,
        }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!analysis) return;
    const reportText = `
STARTUP POTENTIAL ANALYSIS DOSSIER
----------------------------------
Title: ${customTitle}
Overall Startup Potential: ${analysis.startup_potential_score}/100

METRICS BREAKDOWN
- Market Size Score: ${analysis.market_size_score}/100
- Competition Score (Moat Favorable): ${analysis.competition_score}/100
- Revenue Potential: ${analysis.revenue_potential_score}/100
- Scalability: ${analysis.scalability_score}/100
- Customer Demand: ${analysis.customer_demand_score}/100

BUSINESS MODEL
${analysis.business_model}

TARGET CUSTOMERS
${analysis.target_customers.map((c, i) => `${i + 1}. ${c}`).join("\n")}

REVENUE STREAMS
${analysis.revenue_streams.map((r, i) => `${i + 1}. ${r}`).join("\n")}

GO-TO-MARKET STRATEGY
${analysis.go_to_market_strategy.map((s, i) => `${i + 1}. ${s}`).join("\n")}

INVESTMENT THESIS / SUMMARY
${analysis.explanation}
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Circular progress math
  const getCircumference = (radius: number) => 2 * Math.PI * radius;
  const strokeRadius = 70;
  const strokeCircumference = getCircumference(strokeRadius);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-glow stroke-emerald-glow";
    if (score >= 60) return "text-cyan-glow stroke-cyan-glow";
    if (score >= 40) return "text-purple-glow stroke-purple-glow";
    return "text-magenta-glow stroke-magenta-glow";
  };

  return (
    <div className="flex flex-col gap-6 flex-1 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            Startup Potential Analyzer
            <Rocket className="w-5.5 h-5.5 text-cyan-glow animate-bounce" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Evaluate product-market fit, scalability indexes, and compile professional GTM rollout dossiers.
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
      <div className="flex items-center gap-2.5 bg-cyan-900/10 border border-cyan-500/20 text-[11px] text-cyan-400 rounded-xl px-4 py-2">
        <Info className="w-4 h-4 flex-none" />
        <span>
          <strong>Viability Engine:</strong> Choose an idea from your lab portfolio or write a new venture proposal. Click 'Analyze Venture Potential' to calculate feasibility indexes.
        </span>
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Idea Setup Form */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <GlassCard glowColor="cyan" className="p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-cyan-glow" /> Venture Input
            </h3>

            <form onSubmit={handleAnalyze} className="space-y-4">
              {!isCustomMode && ideas.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                    Select Target Idea
                  </label>
                  <select
                    value={selectedIdeaId}
                    onChange={(e) => handleIdeaChange(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-hidden hover:border-cyan-glow/50"
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
                  Venture Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Decentralized File Indexing Mesh"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                  Concept Summary
                </label>
                <textarea
                  placeholder="Describe the problem, core solution, and customer value proposition..."
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  rows={4}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                  Technologies (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. zkp, web3, rust, sqlite"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !customTitle.trim() || !customSummary.trim()}
                className="
                  w-full mt-2 py-3 bg-linear-to-r from-cyan-glow to-purple-glow text-black
                  text-xs font-bold rounded-xl transition-all active:scale-95 disabled:opacity-55
                  flex items-center justify-center gap-2 cursor-pointer
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Viability...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Analyze Venture Potential</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Side: Analysis Results Display */}
        <div className="xl:col-span-2">
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
                  <Loader2 className="w-full h-full animate-spin text-cyan-glow" />
                  <Rocket className="absolute inset-0 m-auto w-6 h-6 text-purple-glow animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Running Market Viability Audits</h4>
                  <p className="text-slate-500 text-xs mt-1">Analyzing customer acquisition parameters, scaling indexes, and modeling monetization flows...</p>
                </div>
              </motion.div>
            )}

            {!isLoading && !analysis && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-white/5 bg-slate-950/45 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center text-slate-500 gap-4"
              >
                <Sparkles className="w-12 h-12 text-slate-650 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Awaiting Input</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-1 mx-auto">
                    Fill out the venture dossier specifications on the left, or select an existing note card from the lab, then click run.
                  </p>
                </div>
              </motion.div>
            )}

            {!isLoading && analysis && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6"
              >
                {/* Score Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  
                  {/* Big Circular Score */}
                  <GlassCard glowColor="cyan" className="p-6 md:col-span-1 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-4 block">
                      Venture Potential
                    </span>

                    {/* SVG Progress Circle */}
                    <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                      <svg width="160" height="160" className="transform -rotate-90">
                        {/* Track circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r={strokeRadius}
                          fill="transparent"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="12"
                        />
                        {/* Progress circle */}
                        <motion.circle
                          cx="80"
                          cy="80"
                          r={strokeRadius}
                          fill="transparent"
                          strokeWidth="12"
                          strokeDasharray={strokeCircumference}
                          initial={{ strokeDashoffset: strokeCircumference }}
                          animate={{
                            strokeDashoffset:
                              strokeCircumference -
                              (analysis.startup_potential_score / 100) * strokeCircumference,
                          }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          strokeLinecap="round"
                          className={getScoreColor(analysis.startup_potential_score)}
                        />
                      </svg>
                      {/* Central label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-3xl font-black text-white font-mono"
                        >
                          {Math.round(analysis.startup_potential_score)}%
                        </motion.span>
                        <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold font-mono mt-0.5">
                          Viability Index
                        </span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-medium px-2 leading-relaxed">
                      This score reflects cumulative ratings for scalability, market footprint, and barriers.
                    </div>
                  </GlassCard>

                  {/* Horizontal Sub-Scores Bar Grid */}
                  <GlassCard glowColor="purple" className="p-6 md:col-span-2 flex flex-col justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-4 block border-b border-white/5 pb-2">
                      Venture Sub-Indices
                    </span>

                    <div className="space-y-4.5 flex-1 flex flex-col justify-around">
                      {[
                        { label: "Market Size", val: analysis.market_size_score, color: "from-cyan-glow to-blue-500", icon: TrendingUp },
                        { label: "Competition (Barrier Moat)", val: analysis.competition_score, color: "from-emerald-glow to-teal-500", icon: Target },
                        { label: "Revenue Potential", val: analysis.revenue_potential_score, color: "from-purple-glow to-indigo-600", icon: DollarSign },
                        { label: "Scalability", val: analysis.scalability_score, color: "from-magenta-glow to-pink-600", icon: Compass },
                        { label: "Customer Demand", val: analysis.customer_demand_score, color: "from-amber-400 to-orange-500", icon: Users },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-slate-300 flex items-center gap-1.5 font-sans font-medium">
                              <item.icon className="w-3.5 h-3.5 text-slate-500" />
                              {item.label}
                            </span>
                            <span className="text-white font-bold">{Math.round(item.val)}/100</span>
                          </div>

                          {/* Progress slot */}
                          <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={{ width: `${item.val}%` }}
                              transition={{ duration: 1.0, delay: idx * 0.1, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                {/* Investment Thesis Narrative */}
                <GlassCard glowColor="magenta" className="p-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-white/5 pb-3 mb-3">
                    VC Investment Thesis
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {analysis.explanation}
                  </p>
                </GlassCard>

                {/* business parameters grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Business Model description */}
                  <GlassCard glowColor="emerald" className="p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-white/5 pb-3 mb-3">
                      Business Model
                    </h4>
                    <p className="text-xs text-slate-350 leading-relaxed">
                      {analysis.business_model}
                    </p>
                  </GlassCard>

                  {/* Target Customer Segments */}
                  <GlassCard glowColor="cyan" className="p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-white/5 pb-3 mb-3">
                      Target Customers
                    </h4>
                    <div className="space-y-2.5">
                      {analysis.target_customers.map((segment, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-cyan-glow flex-none mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="leading-normal">{segment}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* Monetization streams */}
                  <GlassCard glowColor="purple" className="p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-white/5 pb-3 mb-3">
                      Monetization Streams
                    </h4>
                    <div className="space-y-2.5">
                      {analysis.revenue_streams.map((stream, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-purple-glow flex-none mt-0.5">
                            $
                          </div>
                          <span className="leading-normal">{stream}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>

                  {/* GTM Rollout phases */}
                  <GlassCard glowColor="magenta" className="p-6">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-white/5 pb-3 mb-3">
                      Go-To-Market Strategy
                    </h4>
                    <div className="space-y-2.5">
                      {analysis.go_to_market_strategy.map((phase, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-mono text-magenta-glow flex-none mt-0.5">
                            P{idx + 1}
                          </div>
                          <span className="leading-normal">{phase}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
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
                        <span>Copied Report!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-4 h-4 text-cyan-glow" />
                        <span>Copy Dossier Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={copyToClipboard} // Same download behavior (copied as text)
                    className="
                      flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200
                      text-xs font-bold text-black transition-all active:scale-95 cursor-pointer
                    "
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Pitch Dossier</span>
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
