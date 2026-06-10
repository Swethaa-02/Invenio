"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  User,
  Building,
  Key,
  Bell,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  Globe,
  Sparkles,
} from "lucide-react";
import GlassCard from "@/components/glass-card";

interface ApiKey {
  id: string;
  name: string;
  token: string;
  created: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "workspace" | "api" | "notifications">("profile");

  // Tab controls
  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "workspace" as const, label: "Workspace", icon: Building },
    { id: "api" as const, label: "API Tokens", icon: Key },
    { id: "notifications" as const, label: "Alerts", icon: Bell },
  ];

  // Profile Form States
  const [name, setName] = useState("Aria Sterling");
  const [email, setEmail] = useState("aria@invenio.io");
  const [bio, setBio] = useState("Lead AI Systems Architect & Platform Innovation Engineer.");

  // API Key States
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: "k1", name: "Invenio SDK Core", token: "inv_live_6f7261636c655f73797374656d", created: "Jun 1, 2026" },
    { id: "k2", name: "Next.js 15 Webhook", token: "inv_live_7365637572655f636c69656e74", created: "Jun 3, 2026" },
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const generateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomHex = () => Math.random().toString(16).substring(2, 10);
    const token = `inv_live_${randomHex()}${randomHex()}`;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      token,
      created: "Today",
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
  };

  const deleteKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 flex-1 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            Settings Console
            <Settings className="w-5.5 h-5.5 text-slate-400" />
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage your personal profile, team workspaces, API credentials, and notifications.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold
                transition-all duration-300 cursor-pointer
                ${
                  isSelected
                    ? "bg-white/[0.05] text-cyan-glow border-b-2 border-cyan-glow rounded-b-none"
                    : "text-slate-400 hover:text-slate-200"
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents Frame */}
      <div className="flex-1 max-w-3xl">
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard glowColor="cyan" className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block border-b border-white/5 pb-2">
                  Personal Details
                </span>

                <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
                  {/* Glowing Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-purple-glow via-magenta-glow to-cyan-glow flex items-center justify-center font-black text-black text-2xl shadow-xl" />
                    <div className="absolute inset-0 rounded-2xl bg-cyan-glow/20 blur-md -z-10 animate-pulse" />
                  </div>
                  
                  <div className="text-center md:text-left space-y-1">
                    <h3 className="text-sm font-extrabold text-white">Upload Avatar</h3>
                    <p className="text-[10px] text-slate-500 font-mono">JPG, PNG or SVG. Max 2MB.</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-glow/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-glow/50"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Profile Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-glow/50 resize-none font-mono"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-end">
                  <button className="rounded-xl bg-white text-black hover:bg-slate-200 px-5 py-2.5 text-xs font-bold transition-all active:scale-95">
                    Save Changes
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "workspace" && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard glowColor="purple" className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block border-b border-white/5 pb-2">
                  Workspace Profile
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Organization Name</label>
                    <input
                      type="text"
                      defaultValue="Invenio Technologies"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-glow/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Domain Url</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        defaultValue="invenio.io"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-cyan-glow/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-end">
                  <button className="rounded-xl bg-white text-black hover:bg-slate-200 px-5 py-2.5 text-xs font-bold transition-all active:scale-95">
                    Save Workspace settings
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "api" && (
            <motion.div
              key="api"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Existing API Keys */}
              <GlassCard glowColor="cyan" className="space-y-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block border-b border-white/5 pb-2">
                  Active Developer Credentials
                </span>

                <div className="space-y-3">
                  {apiKeys.map((key) => {
                    const isCopied = copiedId === key.id;

                    return (
                      <div
                        key={key.id}
                        className="
                          flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/3
                          bg-white/[0.01] hover:bg-white/[0.03] transition-colors
                        "
                      >
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-250">{key.name}</p>
                          <div className="flex items-center gap-2 text-slate-500 font-mono text-[9px]">
                            <Lock className="w-3 h-3 text-cyan-glow" />
                            <span>{key.token.substring(0, 12)}...••••••••</span>
                            <span>&bull; Created {key.created}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Copy Key */}
                          <button
                            onClick={() => copyToClipboard(key.id, key.token)}
                            className="
                              flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/5
                              rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 transition-all cursor-pointer
                            "
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-glow" />
                                <span className="text-emerald-glow">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteKey(key.id)}
                            className="p-1.5 hover:bg-white/5 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Generate Key form */}
              <GlassCard glowColor="magenta" className="p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block border-b border-white/5 pb-2 mb-4">
                  Generate New Developer Token
                </span>

                <form onSubmit={generateKey} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Key Label (e.g. Production Webhook)..."
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="
                      flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs
                      text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-cyan-glow/50
                    "
                  />

                  <button
                    type="submit"
                    className="
                      flex items-center gap-1.5 rounded-xl bg-white hover:bg-slate-200 px-4 py-2
                      text-xs font-bold text-black transition-all active:scale-95 cursor-pointer
                    "
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Key
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard glowColor="emerald" className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block border-b border-white/5 pb-2">
                  System Alerts & Logs
                </span>

                <div className="space-y-4">
                  {[
                    { label: "Idea submissions", desc: "Notify when a teammate proposes a new discovery record." },
                    { label: "Weekly performance digests", desc: "Compile node statistics and system R&D velocities." },
                    { label: "API system alerts", desc: "Notify when rate-limits or integration fallbacks execute." },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start justify-between gap-4 p-1">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white">{alert.label}</h4>
                        <p className="text-[10px] text-slate-550 leading-relaxed">{alert.desc}</p>
                      </div>

                      {/* Fake IOS toggle */}
                      <div className="w-9 h-5 rounded-full bg-cyan-glow p-0.5 cursor-pointer flex justify-end">
                        <div className="w-4 h-4 bg-black rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
