"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Droplet, Leaf, Sparkles, TreeDeciduous } from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface TreeState {
  root_label: string;
  trunk_health: number;
  branches: number;
  leaves: number;
  fruits: number;
  water_level: number;
  status: string;
  positive_events: number;
  difficult_days: number;
}

export default function TreePage() {
  const { token } = useAuth();
  const [state, setState] = useState<TreeState | null>(null);

  useEffect(() => {
    async function fetchTree() {
      if (!token) return;
      try {
        const response = await api.get('/api/tree/status', { headers: authHeaders(token) });
        setState(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchTree();
  }, [token]);

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card rounded-[32px] border border-white/10 p-8 shadow-glow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Life tree</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Your emotional tree grows with every journal and reflection.</h1>
                <p className="mt-3 max-w-2xl text-slate-300">Watch the roots, trunk, branches and leaves respond to your positive moments, difficult days, and nourishing routines.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Current mood</p>
                <p className="mt-2 text-2xl font-semibold text-white">{state?.status ?? 'Loading...'}</p>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <div className="relative overflow-hidden rounded-[28px] bg-slate-950/80 p-8">
                <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-violet-500/15 to-transparent" />
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <TreeDeciduous className="h-10 w-10 text-violet-300" />
                    <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">{state?.root_label}</p>
                  </div>
                  <div className="relative flex h-72 w-full items-end justify-center">
                    <div className="absolute bottom-0 left-1/2 h-64 w-14 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-700 to-amber-950 shadow-[inset_0_-30px_80px_rgba(15,23,42,0.94)]" />
                    <div className="absolute bottom-20 left-1/2 h-10 w-32 -translate-x-1/2 rounded-full bg-amber-950/80 blur-sm" />
                    <motion.div animate={{ scale: [1, 1.03, 1], rotate: [0, 1.5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-24 left-1/2 h-72 w-64 -translate-x-1/2 rounded-full bg-slate-950/10 blur-2xl" />
                    <div className="absolute bottom-24 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-300 via-lime-400 to-emerald-700 shadow-[0_0_40px_rgba(74,222,128,0.45)]" />
                    <div className="absolute bottom-24 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-gradient-to-br from-green-200 to-emerald-500" />
                    <div className="absolute bottom-24 left-[38%] h-28 w-28 rounded-full bg-gradient-to-br from-emerald-200 to-green-500" />
                    <div className="absolute bottom-24 right-[38%] h-28 w-28 rounded-full bg-gradient-to-br from-lime-200 to-emerald-600" />
                    <div className="absolute bottom-28 left-[51%] h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-br from-rose-300 to-orange-400" />
                    <div className="absolute bottom-12 left-1/2 h-16 w-80 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500/70 via-lime-400/60 to-emerald-700/70 blur-[2px]" />
                    {[...Array(state?.branches ?? 4)].map((_, branchIndex) => (
                      <motion.div
                        key={`branch-${branchIndex}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: branchIndex * 0.08 }}
                        className="absolute bottom-32 h-16 w-4 origin-bottom rounded-full bg-gradient-to-b from-amber-800 to-amber-950"
                        style={{
                          left: `calc(50% + ${branchIndex * 10 - 12}px)`,
                          transform: `translateX(-50%) rotate(${branchIndex % 2 === 0 ? -24 : 24}deg)`
                        }}
                      />
                    ))}
                    <div className="absolute -top-2 left-1/2 flex w-full -translate-x-1/2 justify-center gap-2">
                      {[...Array(Math.max(6, Math.min(14, Math.floor((state?.leaves ?? 12) / 3))))].map((_, i) => (
                        <motion.div
                          key={`leaf-${i}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.08 }}
                          className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-200 to-green-500 shadow-lg"
                          style={{ transform: `translateY(${(i % 2) * 3}px) rotate(${i * 16}deg)` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Trunk strength</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{state?.trunk_health ?? '—'}%</p>
                    </div>
                    <Droplet className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500" style={{ width: `${state?.trunk_health ?? 0}%` }} />
                  </div>
                </div>
                <InfoCard label="Branches" value={state?.branches ?? 0} icon={<Leaf className="h-5 w-5 text-emerald-300" />} />
                <InfoCard label="Leaves" value={state?.leaves ?? 0} icon={<Sparkles className="h-5 w-5 text-emerald-300" />} />
                <InfoCard label="Fruits" value={state?.fruits ?? 0} icon={<TreeDeciduous className="h-5 w-5 text-emerald-300" />} />
                <InfoCard label="Water level" value={`${state?.water_level ?? 0}%`} icon={<Droplet className="h-5 w-5 text-cyan-300" />} />
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
            <h2 className="text-xl font-semibold text-white">Nurture notes</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Stat label="Positive moments" value={`${state?.positive_events ?? 0}`} />
              <Stat label="Difficult days" value={`${state?.difficult_days ?? 0}`} />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">The tree reflects your balance. More positive emotions bring water, leaves, and gentle growth, while difficult days are part of the story too.</p>
          </motion.div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-slate-900/70 p-3">{icon}</div>
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
