"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Heart,
  Smile,
  Zap,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  BookOpen,
} from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface InsightData {
  happiness_percentage: number;
  stress_level: number;
  confidence_level: number;
  gratitude_score: number;
  mindfulness_score: number;
  weekly_streak: number;
  monthly_growth: number;
  top_moods: string[];
  emotion_timeline: any[];
  weekly_summary: str;
  achievements: any[];
  stress_mentions?: number;
  anxiety_mentions?: number;
  total_reflections?: number;
  total_memories?: number;
}

export default function InsightsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<InsightData | null>(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    try {
      const res = await api.get('/api/insights/summary', {
        headers: authHeaders(token || undefined),
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
    const handleInsightsUpdate = () => loadInsights();
    if (typeof window !== "undefined") {
      window.addEventListener("insights_updated", handleInsightsUpdate);
      window.addEventListener("journal_updated", handleInsightsUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("insights_updated", handleInsightsUpdate);
        window.removeEventListener("journal_updated", handleInsightsUpdate);
      }
    };
  }, [token]);

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-r from-violet-950/60 via-slate-900 to-slate-950 p-8 shadow-2xl backdrop-blur-xl relative space-y-4">
            <span className="rounded-full bg-violet-500/20 px-3.5 py-1 text-[10px] font-bold text-violet-300 uppercase tracking-widest">
              Shared Ecosystem Emotional Analytics
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Your Growth Story</h1>
            
            {/* AI Growth Summary Narrative */}
            {data?.weekly_summary && (
              <div className="rounded-2xl border border-violet-500/30 bg-violet-900/20 p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-violet-300 flex items-center gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5 text-violet-400" /> AI Progress Synthesis
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {data.weekly_summary}
                </p>
              </div>
            )}

            {/* Timeframe Filter */}
            <div className="flex gap-2 pt-2">
              {(['weekly', 'monthly', 'yearly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold capitalize transition ${
                    timeframe === tf
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                      : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {tf} View
                </button>
              ))}
            </div>
          </div>

          {/* Real Analytics Overview Meters */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <DimensionMeter label="Happiness Index" value={data?.happiness_percentage ?? 50} color="from-amber-400 to-rose-400" />
            <DimensionMeter label="Stress Balance" value={data ? Math.max(0, 100 - data.stress_level) : 50} color="from-teal-400 to-emerald-400" />
            <DimensionMeter label="Confidence" value={data?.confidence_level ?? 50} color="from-violet-400 to-indigo-400" />
            <DimensionMeter label="Gratitude Index" value={data?.gratitude_score ?? 50} color="from-rose-400 to-pink-400" />
            <DimensionMeter label="Mindfulness" value={data?.mindfulness_score ?? 50} color="from-indigo-400 to-purple-400" />
          </div>

          {/* Activity Breakdown Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Reflections" value={`${data?.total_reflections ?? 0}`} icon={BookOpen} color="text-violet-400" />
            <MetricCard label="Memories Stored" value={`${data?.total_memories ?? 0}`} icon={Sparkles} color="text-amber-400" />
            <MetricCard label="Stress Mentions" value={`${data?.stress_mentions ?? 0}`} icon={AlertTriangle} color="text-rose-400" />
            <MetricCard label="Weekly Streak" value={`${data?.weekly_streak ?? 1} Days`} icon={TrendingUp} color="text-emerald-400" />
          </div>

          {/* Growth Radar & Timeline Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Timeline Breakdown */}
            <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-400" /> Emotion Pulse Log
                </h3>
                <span className="text-xs text-slate-400">{timeframe} trend</span>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(!data?.emotion_timeline || data.emotion_timeline.length === 0) ? (
                  <p className="text-xs text-slate-400 text-center py-8">Write your first reflection to generate your emotion log.</p>
                ) : (
                  data.emotion_timeline.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/60 p-3.5 text-xs">
                      <span className="text-slate-400 font-mono">{item.date}</span>
                      <span className="font-semibold text-white capitalize flex items-center gap-1.5">
                        <span>{item.emoji}</span> {item.mood}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Achievements Unlocked */}
            <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" /> Growth Badges & Milestones
                </h3>
                <span className="text-xs text-violet-300 font-semibold">Real Milestones</span>
              </div>

              <div className="space-y-3">
                {data?.achievements?.map((ach) => (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                      ach.unlocked
                        ? "border-violet-500/40 bg-violet-950/20 text-white"
                        : "border-white/5 bg-slate-950/40 text-slate-500 opacity-60"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-bold ${
                      ach.unlocked ? "bg-amber-400/20 text-amber-300" : "bg-slate-800 text-slate-500"
                    }`}>
                      🏆
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{ach.title}</p>
                      <p className="text-xs text-slate-400 truncate">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function DimensionMeter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-2 text-center backdrop-blur-md">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-extrabold text-white">{value}%</p>
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mt-2">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 space-y-2 backdrop-blur-md">
      <div className={`flex items-center justify-between ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}
