"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "emerald" | "magenta" | "none";
  interactive?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  glowColor = "none",
  interactive = false,
  onClick,
}: GlassCardProps) {
  const glowClasses = {
    cyan: "hover:shadow-[0_0_30px_-5px_rgba(0,242,254,0.15)] hover:border-cyan- glow/30",
    purple: "hover:shadow-[0_0_30px_-5px_rgba(155,93,229,0.15)] hover:border-purple-glow/30",
    emerald: "hover:shadow-[0_0_30px_-5px_rgba(0,245,212,0.15)] hover:border-emerald-glow/30",
    magenta: "hover:shadow-[0_0_30px_-5px_rgba(241,91,181,0.15)] hover:border-magenta-glow/30",
    none: "hover:shadow-2xl hover:border-white/15",
  };

  const cardContent = (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl border border-white/5
        bg-slate-950/45 backdrop-blur-xl p-6 transition-all duration-500
        ${interactive ? "cursor-pointer hover:bg-white/5 hover:translate-y-[-2px]" : ""}
        ${interactive && glowColor !== "none" ? glowClasses[glowColor] : ""}
        ${className}
      `}
    >
      {/* Dynamic Background Glow Spot */}
      {glowColor !== "none" && (
        <div
          className={`
            absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all duration-500
            ${glowColor === "cyan" ? "bg-cyan-glow" : ""}
            ${glowColor === "purple" ? "bg-purple-glow" : ""}
            ${glowColor === "emerald" ? "bg-emerald-glow" : ""}
            ${glowColor === "magenta" ? "bg-magenta-glow" : ""}
          `}
        />
      )}
      
      {/* Light border reflection overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none rounded-2xl" />
      
      {children}
    </div>
  );

  if (interactive) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
