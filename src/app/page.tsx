"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Network,
  Cpu,
  Workflow,
  Zap,
  Globe,
  LineChart,
} from "lucide-react";
import GlassCard from "@/components/glass-card";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };

  const logoTicker = [
    { name: "Vercel", icon: Globe },
    { name: "Linear", icon: Layers },
    { name: "Stripe", icon: Shield },
    { name: "Perplexity", icon: Cpu },
    { name: "Apple", icon: Sparkles },
  ];

  const features = [
    {
      title: "Interactive Innovation Lab",
      desc: "Brainstorm and map ideas visually on a responsive digital canvas with dynamic categorization.",
      icon: Workflow,
      glow: "cyan" as const,
    },
    {
      title: "Knowledge Graphs",
      desc: "Visualize multi-dimensional links between technology clusters, market data, and R&D pipelines.",
      icon: Network,
      glow: "purple" as const,
    },
    {
      title: "Roadmap Generator",
      desc: "Generate production-grade timelines, Gantt Milestones, and phase rollouts in seconds.",
      icon: LineChart,
      glow: "emerald" as const,
    },
    {
      title: "AI Co-pilot Workspace",
      desc: "Collaborate within structured workspaces with rich document tracking and task management.",
      icon: Zap,
      glow: "magenta" as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      {/* 1. TOP NAVBAR */}
      <header className="fixed top-0 inset-x-0 h-20 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl z-50 flex items-center justify-between px-6 md:px-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-linear-to-br from-cyan-glow to-purple-glow shadow-[0_0_15px_-3px_rgba(0,242,254,0.4)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-base tracking-wider bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
            INVENIO
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Platform</a>
          <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a>
        </nav>

        {/* Action Button */}
        <div>
          <Link
            href="/dashboard"
            className="
              relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-xs font-semibold
              bg-white text-black hover:bg-slate-200 shadow-[0_0_20px_0_rgba(255,255,255,0.15)]
              transition-all duration-300 hover:scale-105 active:scale-95
            "
          >
            Launch Console
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-44 pb-24 px-6 md:px-16 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Subtle grid in background */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none z-0" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-4xl flex flex-col items-center"
        >
          {/* Top Banner Tag */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-glow/20 bg-cyan-glow/5 px-4 py-1.5 text-xs text-cyan-glow font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Introducing Next-Gen Innovation Intelligence
          </motion.div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-none mb-6"
          >
            <span className="gradient-text">Engineered to Discover</span>
            <br />
            <span className="gradient-text-accent">Tomorrow's Architecture.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Accelerate your startup's R&D cycle, model complex knowledge pipelines,
            generate dynamic roadmap rollouts, and visually map your SaaS ecosystem.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-20">
            <Link
              href="/dashboard"
              className="
                flex items-center justify-center gap-2 rounded-xl px-7 py-4 text-sm font-semibold
                bg-linear-to-r from-cyan-glow to-purple-glow text-black transition-all duration-300
                hover:shadow-[0_0_35px_0_rgba(0,242,254,0.35)] hover:scale-105 active:scale-95
              "
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="
                flex items-center justify-center gap-2 rounded-xl border border-white/10 px-7 py-4 text-sm font-semibold
                text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-300
              "
            >
              Explore Features
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. TRUST TICKER */}
      <section className="py-12 border-y border-white/5 bg-slate-900/10 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold font-mono">
            Inspired by Design Standards of
          </span>
          <div className="flex flex-wrap items-center gap-8 md:gap-12 opacity-60">
            {logoTicker.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <item.icon className="w-4 h-4 text-cyan-glow" />
                <span className="text-sm font-bold tracking-wider">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PLATFORM FEATURES PREVIEW */}
      <section id="features" className="py-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
              A Complete Hub for Innovation
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Say goodbye to messy whiteboard sketches and disjointed roadmaps. Integrate structure, mapping, and generation in one unified interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <GlassCard
                key={i}
                interactive
                glowColor={feat.glow}
                className="h-full flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-6">
                    <feat.icon className="w-6 h-6 text-slate-200" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
                </div>
                
                <div className="mt-8 flex items-center gap-1.5 text-xs font-semibold text-slate-300 group cursor-pointer hover:text-white transition-colors">
                  Learn more
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE DASHBOARD TEASER */}
      <section id="demo" className="py-20 px-6 md:px-16 border-t border-white/5 bg-slate-950/40">
        <div className="max-w-6xl mx-auto">
          <GlassCard glowColor="purple" className="relative p-0 overflow-hidden border border-white/10 bg-slate-900/20">
            {/* Fake macOS toolbar */}
            <div className="h-10 bg-slate-900/80 border-b border-white/5 px-4 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <div className="ml-4 text-[10px] text-slate-500 font-mono">console.invenio.io</div>
            </div>

            {/* Dashboard Teaser Frame */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-glow/10 border border-purple-glow/20 px-3 py-1 text-[10px] font-mono text-purple-glow">
                  LIVE INTERFACE PREVIEW
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Premium Visual Ecosystem.
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Our workspaces incorporate responsive layouts, smooth sidebar panels, and interactive grids loaded with deep metadata. Build with the speed of Linear and the aesthetics of Apple Vision Pro.
                </p>
                <div className="pt-4">
                  <Link
                    href="/dashboard"
                    className="
                      inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold
                      bg-white text-black hover:bg-slate-200 transition-all hover:scale-105 active:scale-95
                    "
                  >
                    Open Platform Demo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Graphic element */}
              <div className="flex-1 w-full bg-slate-950/60 rounded-xl border border-white/5 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-glow animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-400">RESEARCH VELOCITY</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-cyan-glow">+24.5%</span>
                </div>
                {/* Simulated small area chart */}
                <div className="h-28 flex items-end justify-between gap-1 pt-4">
                  {[20, 35, 25, 45, 60, 40, 75, 90, 85].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <motion.div
                        className="w-full bg-linear-to-t from-cyan-glow/20 to-cyan-glow/70 rounded-t-sm"
                        style={{ height: `${h}%` }}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 6. CTA BANNER */}
      <section className="py-32 px-6 md:px-16 relative z-10 border-t border-white/5">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none z-0" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-6">
            Empower Your Startup Today.
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-10 leading-relaxed">
            Create interactive canvases, manage project goals, track innovation structures, and build responsive SaaS models with our next-gen stack.
          </p>
          <Link
            href="/dashboard"
            className="
              inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold
              bg-white text-black hover:bg-slate-200 shadow-xl transition-all duration-300 hover:scale-105
            "
          >
            Launch the Innovation Engine
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-12 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 opacity-55">
            <Sparkles className="w-4 h-4 text-cyan-glow" />
            <span className="text-xs font-bold tracking-wider font-mono text-slate-300">INVENIO PLATFORM</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            &copy; 2026 Invenio Technologies, Inc. All rights reserved. Built using Next.js 15, Tailwind v4, & Framer Motion.
          </p>
        </div>
      </footer>
    </div>
  );
}
