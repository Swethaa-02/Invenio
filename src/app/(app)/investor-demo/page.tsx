"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation,
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
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Award,
  BookOpen
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface Idea {
  id: string;
  title: string;
  desc: string;
  category: string;
  score: number;
}

interface Slide {
  slide_id: number;
  section: string;
  title: string;
  subtitle: string;
  bullet_points: string[];
  chart_type: string;
  chart_data: Array<{
    label?: string;
    name?: string;
    value: number;
    color?: string;
  }>;
}

interface InvestorPitch {
  executive_summary: string;
  investment_highlights: string[];
  pitch_deck: Slide[];
}

export default function InvestorDemoPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");
  const [customTitle, setCustomTitle] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [customTech, setCustomTech] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [pitch, setPitch] = useState<InvestorPitch | null>(null);
  const [activeTab, setActiveTab] = useState<"deck" | "summary" | "highlights">("deck");
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
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
    setPitch(null);
    setCurrentSlideIndex(0);

    const technologies = customTech
      ? customTech.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      const res = await fetch("/api/investor-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: customTitle,
          summary: customSummary,
          technologies,
        }),
      });

      if (!res.ok) {
        throw new Error("Generation failed");
      }

      const data = await res.json();
      setPitch(data);
    } catch (err) {
      console.error("Pitch generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    if (!pitch) return;
    setCurrentSlideIndex((prev) => (prev + 1) % pitch.pitch_deck.length);
  };

  const prevSlide = () => {
    if (!pitch) return;
    setCurrentSlideIndex((prev) => (prev - 1 + pitch.pitch_deck.length) % pitch.pitch_deck.length);
  };

  const copyToClipboard = () => {
    if (!pitch) return;
    const reportText = `
INVESTOR PITCH DOSSIER: ${customTitle}
=======================================

EXECUTIVE SUMMARY
-----------------
${pitch.executive_summary}

INVESTMENT HIGHLIGHTS
---------------------
${pitch.investment_highlights.map((h, i) => ` - ${h}`).join("\n")}

PITCH DECK SLIDES
-----------------
${pitch.pitch_deck.map((slide) => `
SLIDE ${slide.slide_id}: ${slide.section.toUpperCase()}
Title: ${slide.title}
Subtitle: ${slide.subtitle}
Bullet Points:
${slide.bullet_points.map((b) => ` * ${b}`).join("\n")}
`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render mini visual inside slides depending on chart type
  const renderSlideChart = (slide: Slide) => {
    if (slide.chart_type === "bar" && slide.chart_data.length > 0) {
      const maxVal = Math.max(...slide.chart_data.map((d) => d.value), 1.0);
      return (
        <div className="flex flex-col gap-3.5 w-full bg-black/20 p-4 border border-white/5 rounded-xl">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Performance Metric</span>
          <div className="space-y-3">
            {slide.chart_data.map((data, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-350">{data.label}</span>
                  <span className="text-white font-bold">{data.value}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: data.color || "#00f2fe" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.value / maxVal) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (slide.chart_type === "pie" && slide.chart_data.length > 0) {
      const total = slide.chart_data.reduce((acc, curr) => acc + curr.value, 0);
      return (
        <div className="flex items-center gap-5 w-full bg-black/20 p-4 border border-white/5 rounded-xl">
          <div className="relative w-24 h-24 flex-none">
            {/* SVG mini donut */}
            <svg width="96" height="96" className="transform -rotate-90">
              <circle cx="48" cy="48" r="32" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
              {slide.chart_data.map((data, i) => {
                const percentage = data.value / total;
                const circumference = 2 * Math.PI * 32;
                const strokeOffset = circumference - percentage * circumference;
                return (
                  <motion.circle
                    key={i}
                    cx="48"
                    cy="48"
                    r="32"
                    fill="transparent"
                    stroke={data.color || "#9b5de5"}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeOffset }}
                    transition={{ duration: 1.0, delay: 0.3 }}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[9px] text-slate-400">
              <span>TAM / SAM</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {slide.chart_data.map((data, i) => (
              <div key={i} className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color || "#00f5d4" }} />
                  <span className="text-slate-350 truncate max-w-[80px]">{data.name}</span>
                </div>
                <span className="text-white font-bold">${data.value}B</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (slide.chart_type === "radar" && slide.chart_data.length > 0) {
      return (
        <div className="flex flex-col gap-3 w-full bg-black/20 p-4 border border-white/5 rounded-xl">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Moat Strengths</span>
          <div className="grid grid-cols-3 gap-2">
            {slide.chart_data.map((data, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center flex flex-col justify-center items-center">
                <span className="text-[9px] text-slate-450 leading-tight block mb-1">{data.label}</span>
                <span className="text-xs font-bold font-mono text-cyan-glow">{data.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default illustration placeholder
    return (
      <div className="w-full h-full min-h-[140px] bg-linear-to-br from-white/[0.01] to-white/[0.04] border border-white/5 rounded-xl flex flex-col items-center justify-center text-center p-4">
        <Presentation className="w-8 h-8 text-slate-650 animate-pulse mb-1.5" />
        <span className="text-[9px] uppercase tracking-wider font-mono text-slate-500 font-bold">Invenio Venture Deck Stage</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 flex-1 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            Investor Demo Mode
            <Award className="w-5.5 h-5.5 text-cyan-glow" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Automated startup pitch slide stage. Generate 8-slide decks, investment highlights, and target summaries.
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
          <strong>VC Demo Stage:</strong> Compile slide decks automatically based on target summaries and display them in a premium presentation format.
        </span>
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left side: Setup form */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <GlassCard glowColor="cyan" className="p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-glow" /> Venture Input
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
                  Venture Summary
                </label>
                <textarea
                  placeholder="Describe your solution, target market sizing, and monetization assumptions..."
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  rows={5}
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
                  placeholder="e.g. zkp, rust, sqlite"
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
                    <span>Compiling Presentation...</span>
                  </>
                ) : (
                  <>
                    <Presentation className="w-4 h-4" />
                    <span>Generate Pitch Deck</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right columns: Presentation stage */}
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
                  <Loader2 className="w-full h-full animate-spin text-cyan-glow" />
                  <Presentation className="absolute inset-0 m-auto w-6 h-6 text-purple-glow animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Synthesizing startup pitch assets</h4>
                  <p className="text-slate-500 text-xs mt-1">Generating 8 core slides, writing executive summaries, and compiling investment highlight metrics...</p>
                </div>
              </motion.div>
            )}

            {!isLoading && !pitch && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border border-white/5 bg-slate-950/45 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px] text-center text-slate-500 gap-4"
              >
                <Sparkles className="w-12 h-12 text-slate-650 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">No Active Pitch</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-1 mx-auto">
                    Fill out the venture summary on the left or select an idea, then click run to generate your premium slide deck presentation.
                  </p>
                </div>
              </motion.div>
            )}

            {!isLoading && pitch && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-6"
              >
                {/* Tab selector buttons */}
                <div className="flex border-b border-white/5 pb-1 font-mono text-[10px] uppercase font-bold text-slate-400 gap-6 pl-2">
                  <button
                    onClick={() => setActiveTab("deck")}
                    className={`pb-2.5 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === "deck" ? "border-cyan-glow text-white" : "border-transparent hover:text-white"
                    }`}
                  >
                    <Presentation className="w-4 h-4 text-cyan-glow" /> 16:9 Pitch Deck
                  </button>
                  <button
                    onClick={() => setActiveTab("summary")}
                    className={`pb-2.5 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === "summary" ? "border-purple-glow text-white" : "border-transparent hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-purple-glow" /> Executive Summary
                  </button>
                  <button
                    onClick={() => setActiveTab("highlights")}
                    className={`pb-2.5 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                      activeTab === "highlights" ? "border-magenta-glow text-white animate-pulse" : "border-transparent hover:text-white"
                    }`}
                  >
                    <Award className="w-4 h-4 text-magenta-glow" /> Investment Highlights
                  </button>
                </div>

                {/* Tab contents */}
                <AnimatePresence mode="wait">
                  {activeTab === "deck" && (
                    <motion.div
                      key="deck"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex flex-col gap-6"
                    >
                      {/* Premium Slide stage */}
                      <div className="border border-white/5 bg-slate-950/65 rounded-2xl p-6 md:p-8 min-h-[360px] relative overflow-hidden flex flex-col justify-between shadow-2xl stage-glow">
                        {/* Background light shapes */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-glow/5 rounded-full blur-[140px] pointer-events-none" />
                        
                        {/* Slide Top Details */}
                        <div className="flex justify-between items-center border-b border-white/5 pb-3.5 z-10">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            {pitch.pitch_deck[currentSlideIndex].section}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            Slide {currentSlideIndex + 1} of {pitch.pitch_deck.length}
                          </span>
                        </div>

                        {/* Slide Middle Split stage */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center z-10 flex-1">
                          
                          {/* Slide Left: Text Content */}
                          <div className="md:col-span-7 space-y-4">
                            <div>
                              <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">
                                {pitch.pitch_deck[currentSlideIndex].title}
                              </h2>
                              <p className="text-xs text-slate-400 font-medium font-sans">
                                {pitch.pitch_deck[currentSlideIndex].subtitle}
                              </p>
                            </div>

                            {/* Bullet points */}
                            <div className="space-y-2.5 pt-2">
                              {pitch.pitch_deck[currentSlideIndex].bullet_points.map((point, i) => (
                                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow mt-2 flex-none animate-pulse" />
                                  <span className="leading-relaxed">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Slide Right: Visual indicators */}
                          <div className="md:col-span-5 flex justify-center items-center min-h-[140px]">
                            {renderSlideChart(pitch.pitch_deck[currentSlideIndex])}
                          </div>
                        </div>

                        {/* Slide Navigation controllers */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-4 z-10">
                          <button
                            onClick={prevSlide}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 text-xs text-slate-450 hover:text-white transition-all bg-slate-900/40 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4" /> Previous
                          </button>
                          
                          {/* Slide Dots indicators */}
                          <div className="flex gap-2.5">
                            {pitch.pitch_deck.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentSlideIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                  currentSlideIndex === idx ? "bg-cyan-glow w-4" : "bg-slate-800 hover:bg-slate-600"
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={nextSlide}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/15 text-xs text-slate-450 hover:text-white transition-all bg-slate-900/40 cursor-pointer"
                          >
                            Next <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "summary" && (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <GlassCard glowColor="purple" className="p-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-purple-glow animate-pulse" /> Executive Proposal Summary
                        </h4>
                        <p className="text-xs text-slate-250 leading-relaxed font-sans font-medium">
                          {pitch.executive_summary}
                        </p>
                      </GlassCard>
                    </motion.div>
                  )}

                  {activeTab === "highlights" && (
                    <motion.div
                      key="highlights"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pitch.investment_highlights.map((highlight, idx) => (
                          <GlassCard key={idx} glowColor="magenta" className="p-5 flex flex-col justify-between min-h-[140px]">
                            <div className="flex items-center justify-between mb-3 border-b border-white/3 pb-2">
                              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">Highlight {idx + 1}</span>
                              <Award className="w-4 h-4 text-magenta-glow" />
                            </div>
                            <p className="text-xs font-medium text-slate-200 leading-relaxed">
                              {highlight}
                            </p>
                          </GlassCard>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                        <span>Copied Pitch Assets!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-4 h-4 text-cyan-glow" />
                        <span>Copy Pitch Assets</span>
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
                    <span>Export Investor Dossier</span>
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
