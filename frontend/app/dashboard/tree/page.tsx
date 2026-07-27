"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplets,
  Sparkles,
  TreeDeciduous,
  Heart,
  Award,
  Zap,
  RefreshCw,
  Flame,
  Calendar,
  Activity,
  Flower2,
} from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface TreeState {
  root_label: string;
  stage: string;
  trunk_health: number;
  branches: number;
  leaves: number;
  fruits: number;
  flowers: number;
  water_level: number;
  status: string;
  positive_events: number;
  difficult_days: number;
  points: number;
  planting_date?: string;
  recent_activities?: any[];
}

export default function TreePage() {
  const { token } = useAuth();
  const [tree, setTree] = useState<TreeState | null>(null);
  const [watering, setWatering] = useState(false);
  const [nurtureMsg, setNurtureMsg] = useState("");

  const fetchTreeStatus = async () => {
    try {
      const res = await api.get('/api/tree/status', {
        headers: authHeaders(token || undefined),
      });
      setTree(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTreeStatus();
    const handleTreeUpdate = () => fetchTreeStatus();
    if (typeof window !== "undefined") {
      window.addEventListener("tree_updated", handleTreeUpdate);
      window.addEventListener("journal_updated", handleTreeUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("tree_updated", handleTreeUpdate);
        window.removeEventListener("journal_updated", handleTreeUpdate);
      }
    };
  }, [token]);

  const handleWaterTree = async () => {
    setWatering(true);
    try {
      const res = await api.post('/api/tree/water', {}, {
        headers: authHeaders(token || undefined),
      });
      if (res.data?.message) {
        setNurtureMsg(res.data.message);
        setTimeout(() => setNurtureMsg(""), 4000);
        fetchTreeStatus();
        window.dispatchEvent(new Event("insights_updated"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWatering(false);
    }
  };

  const stage = tree?.stage || "Seed";

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-violet-300">Data-Driven Emotional Tree</p>
              <h1 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
                Living Life Tree 🌱
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-violet-400" />
                {tree?.planting_date ? `Planting Date (DOB): ${tree.planting_date}` : tree?.root_label || "Rooted in self-care"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                Stage: {stage}
              </span>
              <span className="rounded-full bg-violet-500/20 px-4 py-1.5 text-xs font-bold text-violet-300 ring-1 ring-violet-500/30">
                {tree?.points ?? 10} Growth Points
              </span>
            </div>
          </div>

          {/* Interactive Visual Canvas & Stats Grid */}
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8">
            {/* Animated Tree Canvas */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="rounded-[36px] border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-8 shadow-2xl backdrop-blur-xl relative flex flex-col items-center justify-center min-h-[480px] overflow-hidden"
            >
              {/* Radial Particle Glow */}
              <div className="absolute inset-0 bg-radial-gradient from-violet-600/10 via-transparent to-transparent pointer-events-none" />

              {/* Dynamic SVG Tree Renderer based on 8 Stages */}
              <div className="relative z-10 my-4 flex flex-col items-center">
                <svg className="h-72 w-72 drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]" viewBox="0 0 200 200">
                  {/* Fertile Soil & Roots */}
                  <ellipse cx="100" cy="180" rx="65" ry="12" fill="#1e293b" />
                  <path d="M90 180 Q85 192 75 195 M100 180 Q100 195 105 198 M110 180 Q115 192 125 195" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Dynamic Stage Graphics */}
                  {stage === "Seed" && (
                    <g className="animate-pulse">
                      <circle cx="100" cy="175" r="7" fill="#f59e0b" />
                      <path d="M100 170 Q100 162 103 158" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
                      <circle cx="103" cy="158" r="3" fill="#34d399" />
                    </g>
                  )}

                  {stage === "Sprout" && (
                    <g className="animate-bounce">
                      <path d="M100 180 Q98 150 100 135" stroke="#059669" strokeWidth="5" strokeLinecap="round" fill="none" />
                      <ellipse cx="92" cy="135" rx="10" ry="5" fill="#34d399" transform="rotate(-30 92 135)" />
                      <ellipse cx="108" cy="135" rx="10" ry="5" fill="#10b981" transform="rotate(30 108 135)" />
                    </g>
                  )}

                  {stage === "Small Plant" && (
                    <g>
                      <path d="M100 180 Q98 130 100 110" stroke="#047857" strokeWidth="8" strokeLinecap="round" fill="none" />
                      <path d="M100 145 Q85 135 75 130" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none" />
                      <path d="M100 130 Q115 120 125 115" stroke="#047857" strokeWidth="4" strokeLinecap="round" fill="none" />
                      <circle cx="75" cy="130" r="14" fill="#34d399" opacity="0.9" />
                      <circle cx="125" cy="115" r="14" fill="#10b981" opacity="0.9" />
                      <circle cx="100" cy="98" r="18" fill="#6ee7b7" opacity="0.95" />
                    </g>
                  )}

                  {(stage === "Young Tree" || stage === "Growing Tree") && (
                    <g>
                      <path d="M100 180 Q97 120 100 85" stroke="#a78bfa" strokeWidth="12" strokeLinecap="round" fill="none" />
                      <path d="M100 135 Q120 115 135 105" stroke="#a78bfa" strokeWidth="7" strokeLinecap="round" fill="none" />
                      <path d="M100 115 Q80 98 65 90" stroke="#a78bfa" strokeWidth="7" strokeLinecap="round" fill="none" />
                      <g className="animate-pulse">
                        <circle cx="100" cy="65" r="32" fill="#10b981" opacity="0.85" />
                        <circle cx="70" cy="85" r="26" fill="#34d399" opacity="0.8" />
                        <circle cx="130" cy="95" r="26" fill="#059669" opacity="0.8" />
                        <circle cx="100" cy="45" r="20" fill="#6ee7b7" opacity="0.9" />
                      </g>
                      {(tree?.fruits ?? 0) > 0 && (
                        <>
                          <circle cx="85" cy="65" r="4" fill="#f59e0b" />
                          <circle cx="115" cy="80" r="4" fill="#ec4899" />
                        </>
                      )}
                    </g>
                  )}

                  {(stage === "Strong Tree" || stage === "Blooming Tree" || stage === "Ancient Tree") && (
                    <g>
                      <path d="M100 180 Q95 110 100 70" stroke="#8b5cf6" strokeWidth="16" strokeLinecap="round" fill="none" />
                      <path d="M100 130 Q130 105 150 95" stroke="#8b5cf6" strokeWidth="9" strokeLinecap="round" fill="none" />
                      <path d="M100 110 Q70 88 50 80" stroke="#8b5cf6" strokeWidth="9" strokeLinecap="round" fill="none" />
                      <path d="M100 90 Q115 70 125 55" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" fill="none" />

                      {/* Full Lush Canopy */}
                      <g className="animate-pulse">
                        <circle cx="100" cy="55" r="42" fill="#059669" opacity="0.9" />
                        <circle cx="65" cy="75" r="34" fill="#10b981" opacity="0.85" />
                        <circle cx="135" cy="80" r="34" fill="#34d399" opacity="0.85" />
                        <circle cx="100" cy="30" r="26" fill="#6ee7b7" opacity="0.95" />
                      </g>

                      {/* Flowers & Fruits */}
                      <circle cx="80" cy="50" r="5" fill="#fb7185" />
                      <circle cx="120" cy="60" r="5" fill="#f43f5e" />
                      <circle cx="100" cy="75" r="5" fill="#f59e0b" />
                      <circle cx="60" cy="80" r="4" fill="#a855f7" />
                      <circle cx="140" cy="85" r="4" fill="#ec4899" />

                      {/* Floating Magical Embers for Ancient Tree */}
                      {stage === "Ancient Tree" && (
                        <g className="animate-ping">
                          <circle cx="50" cy="50" r="2" fill="#fef08a" />
                          <circle cx="150" cy="40" r="2" fill="#a7f3d0" />
                          <circle cx="100" cy="15" r="2" fill="#c084fc" />
                        </g>
                      )}
                    </g>
                  )}
                </svg>

                <p className="text-base font-extrabold text-white mt-4">{stage}</p>
                <p className="text-xs text-slate-400">{tree?.root_label || "Rooted in daily self-care"}</p>
              </div>

              {/* Water Button */}
              <div className="mt-6 flex flex-col items-center gap-2">
                {nurtureMsg && (
                  <span className="text-xs font-semibold text-emerald-400 animate-bounce">{nurtureMsg}</span>
                )}
                <button
                  onClick={handleWaterTree}
                  disabled={watering}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-3.5 text-xs font-bold text-white shadow-xl shadow-emerald-500/20 hover:scale-105 transition disabled:opacity-50"
                >
                  <Droplets className="h-4 w-4" />
                  {watering ? "Watering..." : "Water & Nurture Tree (+10 pts)"}
                </button>
              </div>
            </motion.div>

            {/* Tree Statistics & Growth Activity Log */}
            <div className="space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 space-y-4 shadow-xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" /> Ecosystem Health
                </h3>

                <ProgressBar label="Trunk Strength" value={tree?.trunk_health ?? 50} color="bg-violet-500" />
                <ProgressBar label="Water Reserve" value={tree?.water_level ?? 40} color="bg-teal-400" />
                <ProgressBar label="Leaves Density" value={tree?.leaves ?? 20} color="bg-emerald-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard label="Branches Grown" value={`${tree?.branches ?? 0}`} icon={TreeDeciduous} />
                <StatCard label="Flowers & Fruits" value={`${(tree?.fruits ?? 0) + (tree?.flowers ?? 0)}`} icon={Flower2} />
                <StatCard label="Positive Events" value={`${tree?.positive_events ?? 0}`} icon={Heart} />
                <StatCard label="Total Points" value={`${tree?.points ?? 10}`} icon={Zap} />
              </div>

              {/* Growth Activity Log */}
              <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" /> Growth Activity Log
                </h3>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {(!tree?.recent_activities || tree.recent_activities.length === 0) ? (
                    <p className="text-xs text-slate-400 text-center py-4">No recent growth activity logged yet.</p>
                  ) : (
                    tree.recent_activities.map((act) => (
                      <div key={act.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white">{act.description}</p>
                          <p className="text-[10px] text-slate-500">{act.date}</p>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-400">+{act.score} pts</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-300 font-medium">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 space-y-2 backdrop-blur-md">
      <div className="flex items-center justify-between text-violet-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}
