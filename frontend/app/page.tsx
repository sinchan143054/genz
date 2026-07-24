"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MessageSquare, TreeDeciduous, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-[32px] border border-white/10 p-10 shadow-glow"
        >
          <div className="grid gap-10 lg:grid-cols-[1.3fr,0.9fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-2 text-sm font-semibold text-violet-200 ring-1 ring-violet-400/20">
                <Sparkles className="h-4 w-4" />
                Designed for Gen Z clarity
              </span>
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Grow gently with an AI companion built for emotion, momentum, and meaning.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                A premium self-discovery platform with journal rituals, a living life tree, helpful insights, and a supportive AI voice that feels warm, modern, and emotionally attuned.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                  Start your story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/signin" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-violet-300/40">
                  Sign in
                </Link>
              </div>
            </div>
            <div className="rounded-[28px] bg-white/5 p-8 backdrop-blur-xl ring-1 ring-white/10">
              <div className="space-y-6 text-slate-100">
                <div className="rounded-3xl bg-slate-950/60 p-6 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Companion</p>
                  <p className="mt-4 text-xl font-semibold">Ask about your mood, get reflective prompts, or explore goal clarity.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Feature icon={MessageSquare} label="AI companion" />
                  <Feature icon={TreeDeciduous} label="Life tree growth" />
                  <Feature icon={BarChart3} label="Insight reports" />
                  <Feature icon={Sparkles} label="Journal rituals" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm text-slate-200">{label}</span>
    </div>
  );
}
