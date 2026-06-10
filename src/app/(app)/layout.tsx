"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState("cyan");

  const fetchActiveTheme = async () => {
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getTheme" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    } catch (err) {
      console.error("Layout theme load error:", err);
    }
  };

  const handleSetTheme = async (newTheme: string) => {
    setTheme(newTheme);
    try {
      await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setTheme", theme: newTheme }),
      });
    } catch (err) {
      console.error("Layout theme update error:", err);
    }
  };

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-slate-950/30 theme-${theme} transition-all duration-500`}>
      {/* Collapsible Sidebar with theme swapper capabilities */}
      <Sidebar currentTheme={theme} onChangeTheme={handleSetTheme} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10 px-6 py-6 md:px-10 md:py-8">
        {/* Subtle grid pattern inside app view */}
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none z-0" />
        
        {/* Children content wrapper */}
        <div className="relative z-10 flex flex-col flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
