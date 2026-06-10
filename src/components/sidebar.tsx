"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FlaskConical,
  Network,
  Lightbulb,
  Milestone,
  Layers,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Palette,
  Rocket
} from "lucide-react";

interface SidebarProps {
  className?: string;
  currentTheme?: string;
  onChangeTheme?: (theme: string) => void;
}

export default function Sidebar({
  className = "",
  currentTheme = "cyan",
  onChangeTheme,
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Innovation Lab", href: "/innovation-lab", icon: FlaskConical },
    { name: "Knowledge Graph", href: "/knowledge-graph", icon: Network },
    { name: "Idea Explorer", href: "/idea-explorer", icon: Lightbulb },
    { name: "Roadmap Gen", href: "/roadmap-generator", icon: Milestone },
    { name: "Workspace", href: "/project-workspace", icon: Layers },
    { name: "Startup Analyzer", href: "/startup-analyzer", icon: Rocket },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const themeOptions = [
    { id: "cyan", color: "bg-cyan-glow shadow-[0_0_10px_#00f2fe]" },
    { id: "purple", color: "bg-purple-glow shadow-[0_0_10px_#9b5de5]" },
    { id: "emerald", color: "bg-emerald-glow shadow-[0_0_10px_#00f5d4]" },
    { id: "magenta", color: "bg-magenta-glow shadow-[0_0_10px_#f15bb5]" },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`
        relative h-screen flex flex-col glass-panel border-r border-white/5
        bg-slate-950/70 text-slate-200 z-30 select-none ${className}
      `}
    >
      {/* Sidebar Header / Logo */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 h-20">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex-none p-2 rounded-xl bg-linear-to-br from-brand-accent to-brand-accent-secondary shadow-[0_0_15px_-3px_var(--color-accent)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-base tracking-wider bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent whitespace-nowrap"
              >
                INVENIO
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="
          absolute right-[-14px] top-7 w-7 h-7 rounded-full bg-slate-900 border border-white/10
          flex items-center justify-center cursor-pointer text-slate-400 hover:text-white
          hover:border-brand-accent/50 transition-all shadow-md z-40
        "
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium
                transition-all duration-300 group
                ${isActive ? "text-brand-accent" : "text-slate-400 hover:text-slate-100"}
              `}
            >
              {/* Active Item Background Pill */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-white/[0.05] border-l-2 border-brand-accent rounded-xl pointer-events-none"
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center">
                <item.icon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-105 ${
                    isActive ? "text-brand-accent filter drop-shadow-[0_0_5px_var(--color-accent)]" : "text-slate-400"
                  }`}
                />
              </div>

              {/* Text */}
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10 whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Theme Swapper Accordion footer */}
      <div className="px-6 py-4 border-t border-white/5 bg-black/10">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                <Palette className="w-3.5 h-3.5 text-brand-accent" />
                <span>Theme Accent</span>
              </div>
              
              {/* Color dots row */}
              <div className="flex items-center gap-3">
                {themeOptions.map((opt) => {
                  const isActive = currentTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onChangeTheme?.(opt.id)}
                      className={`
                        w-4.5 h-4.5 rounded-full cursor-pointer transition-all duration-300
                        ${opt.color}
                        ${isActive ? "ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110" : "hover:scale-105 opacity-60 hover:opacity-100"}
                      `}
                      title={`${opt.id} accent`}
                    />
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center text-slate-500">
              <Palette className="w-4 h-4 text-brand-accent animate-pulse" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar Footer / User Profile */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 overflow-hidden rounded-xl p-2">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-brand-accent-secondary via-magenta-glow to-brand-accent flex items-center justify-center font-bold text-black text-sm flex-none shadow-md">
            AS
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-semibold text-slate-200 truncate">Aria Sterling</p>
                <p className="text-[10px] text-slate-500 truncate">aria@invenio.io</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isCollapsed && (
            <Link href="/" className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5">
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
