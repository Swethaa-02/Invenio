"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  Plus,
  Trash2,
  Maximize2,
  Layers,
  Sparkles,
  Info,
  X,
  BrainCircuit,
  Loader2
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface Note {
  id: string;
  title: string;
  desc: string;
  category: string;
  score: number;
  status: "Draft" | "Research" | "Prototype" | "Ready";
  x: number;
  y: number;
}

export default function InnovationLabPage() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI Generation States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Local Category Adding State
  const [activeCategory, setActiveCategory] = useState("AI");
  const categories = ["AI", "Core Platform", "Web3", "Spatial UI", "General"];

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/ideas");
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error("Innovation Lab fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    const randomOffset = () => Math.floor(Math.random() * 80) - 40;
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Breakthrough Proposal",
          desc: "Write down a brief R&D description here...",
          category: activeCategory,
          score: 7.0,
          details: "A next-generation architectural breakdown.",
          x: 250 + randomOffset(),
          y: 180 + randomOffset(),
          status: "Draft",
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        setNotes(resData.ideas);
      }
    } catch (err) {
      console.error("Add note error:", err);
    }
  };

  const handleAiGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiGenerating(true);
    try {
      const response = await fetch("/api/generate-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        throw new Error("AI Generation request failed");
      }

      // Fetch the updated list of notes directly from db
      await fetchNotes();
      setAiPrompt("");
      setIsAiModalOpen(false);
    } catch (err) {
      console.error("AI Generation error:", err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });

      if (response.ok) {
        const resData = await response.json();
        setNotes(resData.ideas);
      }
    } catch (err) {
      console.error("Delete note error:", err);
    }
  };

  const saveNotePosition = async (id: string, x: number, y: number) => {
    try {
      await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id,
          fields: { x, y },
        }),
      });
    } catch (err) {
      console.error("Failed to save note coordinates:", err);
    }
  };

  const updateNoteContent = async (id: string, newText: string) => {
    // Separate title and description if we want, or save as title
    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id,
          fields: { title: newText },
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        setNotes(resData.ideas);
      }
    } catch (err) {
      console.error("Update note content error:", err);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "AI": "from-purple-glow to-indigo-600",
      "Core Platform": "from-cyan-glow to-blue-500",
      "Web3": "from-emerald-glow to-teal-600",
      "Spatial UI": "from-magenta-glow to-pink-600",
      "General": "from-slate-400 to-slate-600",
    };
    return colors[category] || colors["General"];
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-glow" />
        <span>Loading Board Canvas...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 h-full relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            Innovation Lab
            <FlaskConical className="w-5.5 h-5.5 text-purple-glow animate-bounce" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Visual brainstorming sandbox. Create, drag, and organize ideas on an open digital board.
          </p>
        </div>

        {/* Board Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 outline-hidden hover:border-cyan-glow/50"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={addNote}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 px-4 py-2 text-xs font-semibold text-slate-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-cyan-glow" />
            Add Note
          </button>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="
              flex items-center gap-1.5 rounded-xl bg-linear-to-r from-cyan-glow to-purple-glow px-4 py-2 text-xs font-bold text-black
              hover:shadow-[0_0_20px_0_rgba(0,242,254,0.3)] transition-all active:scale-95
            "
          >
            <BrainCircuit className="w-4 h-4" />
            AI Assist
          </button>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="flex items-center gap-2.5 bg-blue-900/10 border border-blue-500/20 text-[11px] text-blue-400 rounded-xl px-4 py-2">
        <Info className="w-4 h-4 flex-none" />
        <span>
          <strong>Pro-Tip:</strong> Grab any card to drag it across the board. Double-click the text to edit the idea card contents.
        </span>
      </div>

      {/* Canvas board container */}
      <div
        ref={constraintsRef}
        className="
          flex-1 min-h-[500px] border border-white/5 bg-slate-950/45 grid-bg rounded-2xl relative
          overflow-hidden select-none cursor-crosshair
        "
      >
        {/* Glow point */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-glow/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Draggable notes rendering */}
        {notes.map((note) => {
          const isEditing = editingId === note.id;

          return (
            <motion.div
              key={note.id}
              drag
              dragMomentum={false}
              dragConstraints={constraintsRef}
              dragElastic={0.05}
              initial={{ x: note.x, y: note.y, scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileDrag={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)" }}
              className="absolute z-20 cursor-grab active:cursor-grabbing"
              style={{ left: 0, top: 0, x: note.x, y: note.y }}
              onDragEnd={(_, info) => {
                const newX = note.x + info.delta.x;
                const newY = note.y + info.delta.y;
                note.x = newX;
                note.y = newY;
                saveNotePosition(note.id, newX, newY);
              }}
            >
              <div
                className={`
                  w-[260px] p-5 rounded-2xl border border-white/10
                  bg-slate-900/85 backdrop-blur-md flex flex-col justify-between gap-4
                  shadow-xl relative overflow-hidden group
                `}
              >
                {/* Note Top border indicator */}
                <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${getCategoryColor(note.category)}`} />

                {/* Note Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {note.category}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold font-mono text-cyan-glow">
                      ★ {note.score}
                    </span>
                    {/* Delete button (shows on hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-1 rounded-md hover:bg-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Note Text area */}
                <div
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingId(note.id);
                  }}
                  className="min-h-[70px] text-xs text-slate-200 leading-relaxed cursor-text"
                >
                  {isEditing ? (
                    <textarea
                      value={note.title}
                      onChange={(e) => {
                        const updated = notes.map((item) => item.id === note.id ? { ...item, title: e.target.value } : item);
                        setNotes(updated);
                      }}
                      onBlur={() => {
                        setEditingId(null);
                        updateNoteContent(note.id, note.title);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          setEditingId(null);
                          updateNoteContent(note.id, note.title);
                        }
                      }}
                      autoFocus
                      className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-slate-100 focus:outline-hidden focus:border-cyan-glow"
                      rows={3}
                    />
                  ) : (
                    <div>
                      <p className="font-bold mb-1">{note.title}</p>
                      <p className="text-slate-450 leading-relaxed text-[11px]">{note.desc}</p>
                    </div>
                  )}
                </div>

                {/* Note Footer */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>ID: #{note.id}</span>
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-2.5 h-2.5" />
                    <span>Draggable</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {notes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
            <Layers className="w-10 h-10 text-slate-600 animate-pulse" />
            <span className="text-xs">Brainstorming board is empty. Click 'Add Note' to start.</span>
          </div>
        )}
      </div>

      {/* AI Assist Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-md"
            >
              <GlassCard glowColor="purple" className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-purple-glow animate-pulse" />
                    AI Brainstorm Assistant
                  </span>
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="text-slate-500 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAiGenerate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                      What concept are we exploring?
                    </label>
                    <textarea
                      placeholder="e.g. A spatial gesture mapper for threejs, or a decentralized transactional log sync..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                      required
                      disabled={isAiGenerating}
                      className="
                        w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200
                        placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50 resize-none
                      "
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAiModalOpen(false)}
                      disabled={isAiGenerating}
                      className="px-4 py-2 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs font-semibold hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isAiGenerating}
                      className="
                        flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-200 px-4 py-2 text-xs font-bold text-black
                        transition-all active:scale-95 disabled:opacity-55 cursor-pointer
                      "
                    >
                      {isAiGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-purple-glow" />
                          <span>Generate Note</span>
                        </>
                      )}
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
