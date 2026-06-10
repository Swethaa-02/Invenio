"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Sparkles,
  Bold,
  Italic,
  Code,
  Link2,
  List,
  CheckCircle,
  Plus,
  Trash2,
  FileText,
  CheckSquare,
  Bookmark,
  Wand2,
  Loader2,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  tag: "Core" | "AI" | "UX" | "Ledger";
}

export default function ProjectWorkspacePage() {
  // Mock Editor States
  const [docTitle, setDocTitle] = useState("Alpha Deployment Specification");
  const [docBody, setDocBody] = useState(
    `# Project specification for Alpha build deployment.

We are implementing the local SQLite WASM compiler alongside state-sync pipelines. 

## Goals
1. Establish sub-15ms local query speed using indexing.
2. Compile WASM runtime targets in background web worker scopes.
3. Validate decentralized identity validations for auth headers.

## Risks
- Thread safety in shared worker scopes.
- Sync conflicts when reconciling clock trees.`
  );

  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });

  const handleTextSelection = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (target.selectionStart !== target.selectionEnd) {
      // Show floating text toolbar
      setShowToolbar(true);
      setToolbarPos({
        x: e.clientX - 100,
        y: e.clientY - 60,
      });
    } else {
      setShowToolbar(false);
    }
  };

  // Task List States
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: "T1", text: "Configure client WASM compilation threads", completed: true, tag: "Core" },
    { id: "T2", text: "Implement Merkle clock conflict resolutions", completed: true, tag: "Core" },
    { id: "T3", text: "Map local DB sync events to active socket pipelines", completed: false, tag: "Ledger" },
    { id: "T4", text: "Audit SQLite schema execution indices", completed: false, tag: "Core" },
    { id: "T5", text: "Anchor token routers on fallback reasoning nodes", completed: false, tag: "AI" },
    { id: "T6", text: "Test gesture panning responsiveness on spatial dashboard", completed: false, tag: "UX" },
  ]);

  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskTag, setNewTaskTag] = useState<TaskItem["tag"]>("Core");

  // Tab controls for right pane
  const [rightPanelTab, setRightPanelTab] = useState<"checklist" | "copilot">("checklist");

  // AI Copilot states
  const [copilotPrompt, setCopilotPrompt] = useState("");
  const [copilotResponse, setCopilotResponse] = useState("");
  const [isCopilotRunning, setIsCopilotRunning] = useState(false);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const task: TaskItem = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      tag: newTaskTag,
    };
    setTasks([...tasks, task]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const runAiCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotPrompt.trim()) return;

    setCopilotResponse("");
    setIsCopilotRunning(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docTitle,
          docBody,
          prompt: copilotPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Copilot stream request failed");
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        setCopilotResponse((prev) => prev + textChunk);
      }
    } catch (err) {
      console.error("Copilot stream error:", err);
      setCopilotResponse("Error generating suggestion. Please check your credentials.");
    } finally {
      setIsCopilotRunning(false);
    }
  };

  const applySuggestionToSpec = () => {
    if (!copilotResponse) return;
    setDocBody((prev) => `${prev}\n\n${copilotResponse}`);
    setCopilotResponse("");
    setCopilotPrompt("");
  };

  // Calculation for progress bar
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 flex-1 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            Project Workspace
            <Layers className="w-5.5 h-5.5 text-magenta-glow animate-pulse" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Write technical specs, log breakthroughs, and check active R&D sprint goals.
          </p>
        </div>

        {/* Info pills */}
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-350 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-xl">
          <Bookmark className="w-3.5 h-3.5 text-cyan-glow" />
          Workspace: R&D-Alpha
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Pane: Vercel-style Specification Document Editor */}
        <div className="flex-1 border border-white/5 bg-slate-950/45 rounded-2xl p-6 md:p-8 flex flex-col justify-between relative">
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono font-bold uppercase">
              <FileText className="w-4 h-4 text-cyan-glow" /> spec_specifications_v1.md
            </div>

            {/* Document Title Input */}
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="bg-transparent text-xl md:text-2xl font-black text-white focus:outline-hidden border-b border-transparent focus:border-white/5 pb-2"
            />

            {/* Document Body Textarea */}
            <textarea
              value={docBody}
              onChange={(e) => setDocBody(e.target.value)}
              onMouseUp={handleTextSelection}
              className="
                w-full flex-1 bg-transparent text-xs text-slate-300 leading-relaxed font-mono resize-none
                focus:outline-hidden py-2 min-h-[300px]
              "
            />
          </div>

          {/* Simulated floating editor toolbar */}
          <AnimatePresence>
            {showToolbar && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="absolute z-40 bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-xl p-1.5 flex items-center gap-1.5 shadow-xl"
                style={{ left: toolbarPos.x, top: toolbarPos.y }}
              >
                {[
                  { icon: Bold, label: "Bold" },
                  { icon: Italic, label: "Italic" },
                  { icon: Code, label: "Code" },
                  { icon: Link2, label: "Link" },
                  { icon: List, label: "List" },
                ].map((tool, i) => (
                  <button
                    key={i}
                    onClick={() => setShowToolbar(false)}
                    className="p-1.5 hover:bg-white/5 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title={tool.label}
                  >
                    <tool.icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer stats */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>Chars: {docBody.length} &bull; Words: {docBody.split(/\s+/).filter(Boolean).length}</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-glow" /> Saved in memory
            </span>
          </div>
        </div>

        {/* Right Pane: Tabs for Checklist & AI Copilot */}
        <div className="w-full lg:w-[380px] flex-none flex flex-col gap-6">
          
          {/* Progress Tracker Card */}
          <GlassCard glowColor="cyan" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Sprint Goal Progress
              </span>
              <CheckSquare className="w-4 h-4 text-cyan-glow" />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between font-mono text-[10px]">
                <span className="text-white font-bold">{completedCount} of {tasks.length} Completed</span>
                <span className="text-cyan-glow font-bold">{progressPercent}%</span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/3">
                <motion.div
                  className="h-full bg-linear-to-r from-cyan-glow to-purple-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Tab Selection buttons */}
          <div className="flex border-b border-white/5 pb-1 font-mono text-[10px] uppercase font-bold text-slate-400 gap-4 pl-2">
            <button
              onClick={() => setRightPanelTab("checklist")}
              className={`pb-1.5 cursor-pointer border-b-2 transition-all ${
                rightPanelTab === "checklist" ? "border-cyan-glow text-white" : "border-transparent hover:text-white"
              }`}
            >
              Task Checklist
            </button>
            
            <button
              onClick={() => setRightPanelTab("copilot")}
              className={`pb-1.5 cursor-pointer border-b-2 transition-all flex items-center gap-1.5 ${
                rightPanelTab === "copilot" ? "border-purple-glow text-white animate-pulse" : "border-transparent hover:text-white"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-glow" /> AI Copilot
            </button>
          </div>

          {/* Tab Content Box */}
          <AnimatePresence mode="wait">
            {rightPanelTab === "checklist" ? (
              <motion.div
                key="checklist"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <GlassCard glowColor="magenta" className="flex-1 flex flex-col justify-between p-5 h-full">
                  <div className="space-y-5 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block border-b border-white/5 pb-2">
                      Active Checklist
                    </span>

                    {/* Task Items List */}
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="
                            flex items-center justify-between gap-3 p-3 rounded-xl border border-white/3
                            bg-white/[0.01] hover:bg-white/[0.03] transition-colors group
                          "
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Checkbox Trigger */}
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-0.5 text-slate-500 hover:text-cyan-glow transition-colors cursor-pointer"
                            >
                              {task.completed ? (
                                <CheckCircle className="w-4 h-4 text-emerald-glow" />
                              ) : (
                                <div className="w-4 h-4 rounded-md border border-white/20 hover:border-cyan-glow" />
                              )}
                            </button>

                            <span
                              className={`text-xs leading-normal truncate ${
                                task.completed ? "line-through text-slate-500" : "text-slate-200"
                              }`}
                            >
                              {task.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-none">
                            <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-sm bg-white/5 text-slate-400 border border-white/3">
                              {task.tag}
                            </span>

                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task Add Form */}
                  <form onSubmit={addTask} className="border-t border-white/5 pt-4 mt-6 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Insert sprint task..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="
                          flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs
                          text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50
                        "
                      />

                      <select
                        value={newTaskTag}
                        onChange={(e) => setNewTaskTag(e.target.value as TaskItem["tag"])}
                        className="bg-slate-900 border border-white/10 rounded-xl px-2 text-[10px] text-slate-300 font-mono outline-hidden cursor-pointer"
                      >
                        <option value="Core">Core</option>
                        <option value="AI">AI</option>
                        <option value="UX">UX</option>
                        <option value="Ledger">Ledger</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-white text-black hover:bg-slate-200 text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Sprint Task
                    </button>
                  </form>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="copilot"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <GlassCard glowColor="purple" className="flex-1 flex flex-col justify-between p-5 h-full">
                  <div className="space-y-4 flex-1 flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block border-b border-white/5 pb-2">
                      AI R&D Assistant
                    </span>

                    {/* Prompter Form */}
                    <form onSubmit={runAiCopilot} className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. 'Draft thread safety specs'..."
                          value={copilotPrompt}
                          onChange={(e) => setCopilotPrompt(e.target.value)}
                          disabled={isCopilotRunning}
                          className="
                            flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs
                            text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50
                          "
                        />
                        <button
                          type="submit"
                          disabled={isCopilotRunning || !copilotPrompt.trim()}
                          className="
                            flex-none p-2 rounded-xl bg-purple-glow text-black hover:bg-purple-400
                            transition-all active:scale-95 disabled:opacity-55 cursor-pointer
                          "
                        >
                          {isCopilotRunning ? (
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-4.5 h-4.5" />
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Stream response block */}
                    <div className="flex-1 border border-white/5 bg-black/40 rounded-xl p-3.5 overflow-y-auto max-h-[220px]">
                      {copilotResponse ? (
                        <div className="text-[11px] font-mono text-slate-350 leading-relaxed whitespace-pre-wrap">
                          {copilotResponse}
                        </div>
                      ) : (
                        <div className="text-slate-550 text-[10px] font-mono flex flex-col items-center justify-center h-full text-center gap-1.5 py-10">
                          <Wand2 className="w-6 h-6 text-slate-650" />
                          <span>Enter an instruction above to compile doc modifications.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply suggestion action */}
                  {copilotResponse && !isCopilotRunning && (
                    <button
                      onClick={applySuggestionToSpec}
                      className="
                        w-full mt-4 py-2 bg-linear-to-r from-cyan-glow to-purple-glow text-black
                        text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer
                      "
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      <span>Append to Document</span>
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
