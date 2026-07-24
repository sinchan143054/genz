"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Clock3, Heart, Sparkles } from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface InsightSnapshot {
  happiness_percentage: number;
  weekly_streak: number;
  monthly_growth: number;
  emotion_timeline: Array<{ date: string; mood: string; emoji: string }>;
  top_moods: string[];
}

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood: string;
  emoji: string;
  created_at: string;
}

export default function InsightsPage() {
  const { token } = useAuth();
  const [insights, setInsights] = useState<InsightSnapshot | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsights() {
      if (!token) return;
      try {
        const [summaryResponse, journalResponse] = await Promise.all([
          api.get('/api/insights/summary', { headers: authHeaders(token) }),
          api.get('/api/journal/entries', { headers: authHeaders(token) }),
        ]);
        setInsights(summaryResponse.data);
        setEntries(journalResponse.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadInsights();
  }, [token]);

  const latestEntry = entries[0];
  const todayMood = insights?.top_moods?.[0] ?? 'reflective';

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card rounded-[32px] border border-white/10 p-8 shadow-glow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Insights</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Understand your emotional trends and growth score.</h1>
                <p className="mt-3 max-w-2xl text-slate-300">Track your mood rhythm, celebrate streaks, and discover the patterns beneath your reflections.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Mood balance</p>
                <p className="mt-2 text-2xl font-semibold text-white">{insights?.happiness_percentage ?? '--'}%</p>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 lg:grid-cols-3">
            <InsightCard icon={<Heart className="h-5 w-5 text-rose-300" />} label="Happiness" value={`${insights?.happiness_percentage ?? '--'}%`} />
            <InsightCard icon={<Clock3 className="h-5 w-5 text-cyan-300" />} label="Weekly streak" value={`${insights?.weekly_streak ?? '--'} days`} />
            <InsightCard icon={<Sparkles className="h-5 w-5 text-violet-300" />} label="Growth score" value={`${insights?.monthly_growth ?? '--'}%`} />
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-semibold text-white">Journal activity</h2>
              <p className="text-sm text-slate-400">{loading ? 'Loading your journal rhythm...' : `${entries.length} entries collected`}</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Latest entry</p>
                <p className="mt-2 text-lg font-semibold text-white">{latestEntry?.title ?? 'No journal entry yet'}</p>
                <p className="mt-2 text-sm text-slate-400">{latestEntry?.created_at ? new Date(latestEntry.created_at).toLocaleDateString() : 'Start journaling to unlock insights'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Favorite mood</p>
                <p className="mt-2 text-lg font-semibold text-white">{todayMood}</p>
                <p className="mt-2 text-sm text-slate-400">Based on the entries that are most common for you.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <p className="text-sm text-slate-400">Mood balance</p>
                <p className="mt-2 text-lg font-semibold text-white">{insights?.happiness_percentage ?? '--'}%</p>
                <p className="mt-2 text-sm text-slate-400">Positive reflections are shaping your growth score.</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
            <h2 className="text-xl font-semibold text-white">Emotion timeline</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(insights?.emotion_timeline ?? []).slice(-6).map((entry) => (
                <div key={entry.date + entry.mood} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-400">{entry.date}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{entry.mood}</p>
                  <p className="mt-2 text-3xl">{entry.emoji}</p>
                </div>
              ))}
              {!insights?.emotion_timeline?.length && !loading && <p className="text-sm text-slate-400">Write more journal entries to populate your emotional timeline.</p>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
            <h2 className="text-xl font-semibold text-white">Top moods</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {insights?.top_moods?.map((mood) => (
                <span key={mood} className="rounded-full bg-violet-500/10 px-4 py-2 text-sm text-slate-100">{mood}</span>
              ))}
              {!insights?.top_moods?.length && !loading && <p className="text-sm text-slate-400">Your most common moods will appear here once you journal consistently.</p>}
            </div>
          </motion.div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function InsightCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
      <div className="flex items-center gap-4">
        <div className="rounded-3xl bg-slate-900/70 p-4">{icon}</div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
