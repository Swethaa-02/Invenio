"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Network,
  FlaskConical,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  Loader2,
  Wand2,
  CheckCircle,
  AlertTriangle,
  FileText
} from "lucide-react";
import GlassCard from "@/components/glass-card";
import { AreaChart, BarChart, DonutChart } from "@/components/custom-charts";

interface Idea {
  id: string;
  title: string;
  desc: string;
  category: "AI" | "Core Platform" | "Web3" | "Spatial UI" | "General";
  score: number;
  status: "Draft" | "Research" | "Prototype" | "Ready";
  date: string;
  details: string;
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // SWOT Audit states
  const [swotReport, setSwotReport] = useState("");
  const [isSwotRunning, setIsSwotRunning] = useState(false);

  const fetchIdeas = async () => {
    try {
      const res = await fetch("/api/ideas");
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const runSwotAudit = async () => {
    setSwotReport("");
    setIsSwotRunning(true);

    try {
      const res = await fetch("/api/dashboard-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Audit generation failed");
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        setSwotReport((prev) => prev + textChunk);
      }
    } catch (err) {
      console.error("SWOT Audit error:", err);
      setSwotReport("Error executing SWOT portfolio audit. Verify key parameters.");
    } finally {
      setIsSwotRunning(false);
    }
  };

  // Calculate dynamic stats
  const totalIdeasCount = ideas.length;
  const activeLabsCount = ideas.filter((i) => i.status === "Prototype" || i.status === "Research").length;
  const knowledgeNodesCount = totalIdeasCount * 8 + 120; // 8 connections per idea + base nodes
  
  const averageScore = totalIdeasCount > 0 
    ? ideas.reduce((acc, curr) => acc + curr.score, 0) / totalIdeasCount 
    : 8.2;
  const rdVelocityPercent = Math.round(averageScore * 10.5);

  const stats = [
    {
      title: "Total Innovation Ideas",
      value: String(totalIdeasCount),
      change: `+${Math.max(1, Math.round(totalIdeasCount * 0.15))}%`,
      changeType: "positive",
      icon: Lightbulb,
      glow: "cyan" as const,
    },
    {
      title: "Knowledge Nodes Connected",
      value: String(knowledgeNodesCount),
      change: "+8.3%",
      changeType: "positive",
      icon: Network,
      glow: "purple" as const,
    },
    {
      title: "Active Lab Instances",
      value: String(activeLabsCount),
      change: "Stable",
      changeType: "neutral",
      icon: FlaskConical,
      glow: "emerald" as const,
    },
    {
      title: "R&D Generation Velocity",
      value: `${rdVelocityPercent}%`,
      change: "+4.1%",
      changeType: "positive",
      icon: Activity,
      glow: "magenta" as const,
    },
  ];

  // Dynamic Category distribution bar chart
  const categoriesCount = {
    "Core Platform": 0,
    "AI": 0,
    "Web3": 0,
    "Spatial UI": 0,
    "General": 0,
  };

  ideas.forEach((i) => {
    if (i.category in categoriesCount) {
      categoriesCount[i.category as keyof typeof categoriesCount]++;
    } else {
      categoriesCount["General"]++;
    }
  });

  const categoryDistributionData = [
    { label: "Core", value: categoriesCount["Core Platform"] },
    { label: "AI/ML", value: categoriesCount["AI"] },
    { label: "Web3", value: categoriesCount["Web3"] },
    { label: "UX/UI", value: categoriesCount["Spatial UI"] },
    { label: "Misc", value: categoriesCount["General"] },
  ];

  const innovationVelocityData = [
    { label: "Jan", value: 34 },
    { label: "Feb", value: 45 },
    { label: "Mar", value: 40 },
    { label: "Apr", value: 65 },
    { label: "May", value: 78 },
    { label: "Jun", value: Math.max(80, rdVelocityPercent) },
  ];

  const resourceAllocationData = [
    { name: "Core Engine", value: 45000, color: "#00f2fe" },
    { name: "AI/ML Compute", value: 60000, color: "#9b5de5" },
    { name: "UX Design & Res", value: 30000, color: "#00f5d4" },
    { name: "Compliance & Sec", value: 20000, color: "#f15bb5" },
  ];

  // Sort ideas by id to show recent additions
  const recentIdeas = [...ideas]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-glow" />
        <span>Loading R&D Analytics...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 flex-1">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            Innovation Console
            <Sparkles className="w-5 h-5 text-brand-accent animate-pulse" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time analytics and ideation tracking for your platform.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-purple-glow" />
          System Active: June 2026
        </div>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <GlassCard key={i} glowColor={stat.glow} interactive>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {stat.title}
              </span>
              <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10">
                <stat.icon className="w-4 h-4 text-slate-300" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
                {stat.value}
              </span>
              <span
                className={`text-xs font-semibold font-mono ${
                  stat.changeType === "positive"
                    ? "text-emerald-glow"
                    : stat.changeType === "negative"
                    ? "text-red-400"
                    : "text-slate-500"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Grid: Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart Card */}
        <GlassCard className="lg:col-span-2 flex flex-col justify-between" glowColor="cyan">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-200">Innovation Velocity</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Weighted R&D pipeline outputs</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-accent" />
          </div>
          <AreaChart data={innovationVelocityData} height={200} color="var(--color-accent)" />
        </GlassCard>

        {/* Bar Chart Card */}
        <GlassCard className="flex flex-col justify-between" glowColor="purple">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-200">Submissions by Tag</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Total ideations submitted</p>
            </div>
            <Lightbulb className="w-4 h-4 text-purple-glow" />
          </div>
          <BarChart data={categoryDistributionData} height={200} color="#9b5de5" />
        </GlassCard>
      </div>

      {/* Grid: Bottom 3 Columns (Donut, Recent, SWOT Auditor) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <GlassCard glowColor="emerald" className="flex flex-col justify-between">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-200">Resource Allocation</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Computational & Personnel Budget</p>
          </div>
          <DonutChart data={resourceAllocationData} size={150} />
        </GlassCard>

        {/* Recent Ideas Table */}
        <GlassCard className="flex flex-col justify-between" glowColor="magenta">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-200">Recent Discoveries</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Ideas under active review</p>
            </div>
            <span className="text-xs font-semibold text-brand-accent flex items-center gap-1.5 cursor-pointer hover:underline">
              Logs
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="overflow-x-auto w-full flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-slate-500 font-mono">
                  <th className="py-2.5">Name</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {recentIdeas.map((idea, i) => (
                  <tr key={i} className="border-b border-white/5 text-[11px] text-slate-350 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 truncate max-w-[130px] font-medium text-slate-200" title={idea.title}>
                      {idea.title}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                          idea.status === "Ready"
                            ? "bg-emerald-glow/10 text-emerald-glow border border-emerald-glow/20"
                            : idea.status === "Prototype"
                            ? "bg-cyan-glow/10 text-cyan-glow border border-cyan-glow/20"
                            : idea.status === "Research"
                            ? "bg-purple-glow/10 text-purple-glow border border-purple-glow/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {idea.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-100 font-mono">{idea.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* AI R&D SWOT Auditor Panel */}
        <GlassCard className="flex flex-col justify-between" glowColor="cyan">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <div>
              <h2 className="text-base font-bold text-slate-200">R&D SWOT Auditor</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">AI portfolio gap analysis</p>
            </div>
            <Wand2 className="w-4.5 h-4.5 text-brand-accent animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[140px] border border-white/5 bg-black/30 rounded-xl p-3 mb-4">
            {swotReport ? (
              <div className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {swotReport}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-550 text-[10px] gap-2 py-6">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
                <span>Trigger audit to review R&D risk metrics.</span>
              </div>
            )}
          </div>

          <button
            onClick={runSwotAudit}
            disabled={isSwotRunning}
            className="
              w-full py-2 bg-white hover:bg-slate-200 text-black text-xs font-bold rounded-xl
              transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5
            "
          >
            {isSwotRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing Portfolio...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-brand-accent-secondary" />
                <span>Perform SWOT Audit</span>
              </>
            )}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
