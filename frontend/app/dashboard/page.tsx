"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  MessageCircle,
  Notebook,
  Sparkles,
  TreeDeciduous,
  Flame,
  ArrowRight,
  Smile,
  Bookmark,
  Calendar,
  Zap,
} from 'lucide-react';
import { DashboardShell } from '../../components/DashboardShell';
import { ProtectedPage } from '../../components/ProtectedPage';
import { useAuth } from '../../context/AuthContext';
import { api, authHeaders } from '../../lib/api';

interface SummaryData {
  happiness_percentage: number;
  stress_level: number;
  weekly_streak: number;
  monthly_growth: number;
  top_moods: string[];
  weekly_summary: string;
}

interface TreeStatusData {
  stage: string;
  points: number;
  status: string;
}

interface JournalEntry {
  id: number;
  title: string;
  reflection: string;
  mood: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [treeStatus, setTreeStatus] = useState<TreeStatusData | null>(null);
  const [recentJournals, setRecentJournals] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Time-of-day greeting
  const [greeting, setGreeting] = useState("Good Evening");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const headers = authHeaders(token || undefined);
        const [sumRes, treeRes, journalsRes] = await Promise.all([
          api.get('/api/insights/summary', { headers }).catch(() => null),
          api.get('/api/tree/status', { headers }).catch(() => null),
          api.get('/api/journal/entries?limit=3', { headers }).catch(() => null),
        ]);

        if (sumRes?.data) setSummary(sumRes.data);
        if (treeRes?.data) setTreeStatus(treeRes.data);
        if (journalsRes?.data) setRecentJournals(journalsRes.data.slice(0, 3));
      } catch (err) {
        console.error("Dashboard fetch note:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [token]);

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-8">
          {/* Welcome Banner */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[32px] border border-white/10 bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet-500/20 px-3 py-1 text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                    Daily Reflection Space
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                    <Flame className="h-3.5 w-3.5" /> {summary?.weekly_streak || 1} Day Streak
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  {greeting}, {user?.name?.split(' ')[0] || "Explorer"}.
                </h1>
                <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                  Your Life Tree is flourishing with every thought you honor. Connect with Nova AI or log today's guided reflection.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/journal"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition"
                >
                  <Notebook className="h-4 w-4" />
                  New Guided Reflection
                </Link>
                <Link
                  href="/dashboard/assistant"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                >
                  <MessageCircle className="h-4 w-4 text-violet-400" />
                  Chat with Nova
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Quick Access Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <QuickCard
              title="Guided Journal"
              desc="Log gratitude, lessons learned, and tomorrow's focus."
              href="/dashboard/journal"
              icon={Notebook}
              badge="Auto-Saved"
            />
            <QuickCard
              title="Nova AI Companion"
              desc="Real-time streaming conversation with emotional memory."
              href="/dashboard/assistant"
              icon={MessageCircle}
              badge="Memory Active"
            />
            <QuickCard
              title="Life Tree Preview"
              desc={`Current Stage: ${treeStatus?.stage || "Seed"}`}
              href="/dashboard/tree"
              icon={TreeDeciduous}
              badge={`${treeStatus?.points ?? 0} Growth Points`}
            />
          </div>

          {/* Highlights & Recent Memories */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Summary */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-violet-300">Emotional Overview</p>
                  <h2 className="text-xl font-bold text-white mt-1">Weekly Momentum</h2>
                </div>
                <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-300">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatTile label="Happiness Index" value={summary ? `${summary.happiness_percentage}%` : "0%"} />
                <StatTile label="Stress Balance" value={summary ? `${summary.stress_level}%` : "0%"} />
                <StatTile label="Current Streak" value={summary ? `${summary.weekly_streak} Days` : "0 Days"} />
                <StatTile label="Top Moods" value={summary?.top_moods?.length ? summary.top_moods.join(', ') : "None yet"} />
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
                <p className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" /> Weekly Insight Summary
                </p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {summary?.weekly_summary || "Write your first daily reflection to begin building emotional clarity and tracking growth."}
                </p>
              </div>
            </motion.div>


            {/* Recent Reflections */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 shadow-xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-violet-300">Memory Vault</p>
                  <h2 className="text-xl font-bold text-white mt-1">Recent Memories</h2>
                </div>
                <Link href="/dashboard/memories" className="text-xs font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentJournals.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <p className="text-xs text-slate-400">No reflections logged yet today.</p>
                    <Link href="/dashboard/journal" className="inline-block rounded-xl bg-violet-600/30 px-4 py-2 text-xs font-semibold text-violet-200">
                      Write First Reflection
                    </Link>
                  </div>
                ) : (
                  recentJournals.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 space-y-1 hover:border-violet-500/30 transition">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-white">{entry.title}</span>
                        <span className="capitalize text-violet-300">{entry.mood}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{entry.reflection}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function QuickCard({ title, desc, href, icon: Icon, badge }: any) {
  return (
    <Link href={href} className="block group">
      <div className="rounded-[28px] border border-white/10 bg-slate-900/50 p-6 space-y-4 shadow-lg group-hover:border-violet-500/40 group-hover:bg-slate-900/80 transition">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-300 ring-1 ring-violet-500/20">
            <Icon className="h-5 w-5" />
          </div>
          {badge && (
            <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold text-slate-300 border border-white/10">
              {badge}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition">{title}</h3>
          <p className="text-xs text-slate-400 mt-1">{desc}</p>
        </div>
      </div>
    </Link>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-4">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-white mt-1 truncate">{value}</p>
    </div>
  );
}
