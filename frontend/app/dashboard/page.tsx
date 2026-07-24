"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, MessageCircle, Notebook, Sparkles, TreeDeciduous, SunMoon } from 'lucide-react';
import { DashboardShell } from '../../components/DashboardShell';
import { ProtectedPage } from '../../components/ProtectedPage';
import { useAuth } from '../../context/AuthContext';
import { api, authHeaders } from '../../lib/api';

interface SummaryData {
  happiness_percentage: number;
  weekly_streak: number;
  monthly_growth: number;
  top_moods: string[];
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    async function loadSummary() {
      if (!token) return;
      try {
        const response = await api.get('/api/insights/summary', { headers: authHeaders(token) });
        setSummary(response.data);
      } catch (error) {
        console.error(error);
      }
    }
    loadSummary();
  }, [token]);

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card rounded-[32px] border border-white/10 p-8 shadow-glow">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Daily nurture</p>
                <h1 className="mt-3 text-4xl font-semibold text-white">Good to see you, {user?.name}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">Your life tree is growing with every emotion you honor. Explore the companion, journal, and insights to turn feeling into flow.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-6 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Mood pulse</p>
                <p className="mt-3 text-5xl font-semibold text-white">{summary ? `${summary.happiness_percentage}%` : '--'}</p>
                <p className="mt-2 text-sm text-slate-400">Positive momentum from your reflections.</p>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card title="AI companion" description="Tap into supportive conversation, voice input, and mindful prompts." icon={MessageCircle} />
            <Card title="Journal rituals" description="Capture a safe, polished diary entry anytime with soft autosave." icon={Notebook} />
            <Card title="Life tree" description="See your emotional ecosystem grow and shift with every insight." icon={TreeDeciduous} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="glass-card rounded-[32px] border border-white/10 p-7 shadow-glow">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Your highlights</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Weekly momentum</h2>
                </div>
                <div className="rounded-full bg-violet-500/10 p-3 text-violet-300">
                  <SunMoon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <Stat label="Mood streak" value={summary ? `${summary.weekly_streak} days` : '—'} />
                <Stat label="Growth pulse" value={summary ? `${summary.monthly_growth}%` : '—'} />
                <Stat label="Most common moods" value={summary ? summary.top_moods.join(', ') : '—'} />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="glass-card rounded-[32px] border border-white/10 p-7 shadow-glow">
              <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Today’s prompt</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">What felt nurturing today?</h2>
              <p className="mt-3 text-slate-300">Write down one small moment of calm, one intention for tomorrow, or one act of kindness you can give yourself.</p>
            </motion.div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function Card({ title, description, icon: Icon }: { title: string; description: string; icon: typeof BarChart3 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
      <div className="flex items-center gap-4">
        <div className="rounded-3xl bg-violet-500/10 p-4 text-violet-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 px-5 py-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
