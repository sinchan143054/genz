"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  TreeDeciduous,
  BarChart3,
  Heart,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronDown,
  Lock,
  Globe,
  Smile,
} from 'lucide-react';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the AI Companion maintain conversational memory?",
      a: "GenZ Growth Companion securely indexes your past guided reflections and mood logs. When you chat with Nova AI, relevant emotional context is woven into system prompts so advice feels deeply personalized."
    },
    {
      q: "Is my personal journal data private and secure?",
      a: "Yes! All user data is encrypted in transit and at rest. Authentication is powered by Clerk, ensuring enterprise-grade protection with zero password storage on custom servers."
    },
    {
      q: "How does the Life Tree visualization grow?",
      a: "Your Life Tree evolves through 6 distinct stages (Seed to Flourishing Tree) based on your journaling frequency, gratitude logs, reflection quality, and daily check-ins."
    },
    {
      q: "Can I dictate my journal reflections using my voice?",
      a: "Absolutely! Our rich reflection editor features real-time voice-to-text dictation powered by modern Web Speech recognition."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-violet-500 selection:text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600/30 text-violet-300 ring-1 ring-violet-500/30">
              🌱
            </span>
            <span className="text-xl font-bold text-white tracking-tight">GenZ Growth</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-xs font-semibold text-slate-300 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-28 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-violet-300 ring-1 ring-violet-400/20">
              <Sparkles className="h-4 w-4" />
              "Grow Every Day. Understand Yourself Better."
            </span>

            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-none">
              Your personal AI companion for emotional clarity & momentum.
            </h1>

            <p className="max-w-2xl text-lg text-slate-300 leading-relaxed">
              A startup-grade self-discovery workspace combining guided voice journaling, a living animated Life Tree, emotional analytics, and a memory-aware AI companion.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-violet-600/30 hover:bg-violet-500 transition hover:scale-[1.02]"
              >
                Start Your Story
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:border-violet-400/40 transition"
              >
                Explore Demo Account
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Clerk Auth Security</span>
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-amber-400" /> Real-time Streaming AI</span>
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-400" /> Zero Pressure Design</span>
            </div>
          </motion.div>

          {/* Hero Visual Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-[36px] border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-rose-500" />
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-violet-300">Nova AI • Active Memory</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 space-y-3 shadow-inner">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-400">Nova Companion</p>
                <p className="text-sm font-medium text-slate-100">
                  "I noticed in your reflection yesterday that you felt proud after finishing your project. How are you carrying that momentum today?"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-white">88%</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Gratitude Index</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-400">Flourishing</p>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Life Tree Stage</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="px-6 py-20 bg-slate-900/50 border-y border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Engineered for deep self-awareness.</h2>
            <p className="text-slate-300 text-base">Every feature is designed to transform daily thoughts into long-term emotional strength.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="Nova AI Companion"
              desc="ChatGPT-style interface with real-time streaming, long-term memory, and 4 empathetic personalities."
            />
            <FeatureCard
              icon={Sparkles}
              title="Guided Journal"
              desc="Rich multi-field reflection with auto-save, speech-to-text dictation, and instant AI insights."
            />
            <FeatureCard
              icon={TreeDeciduous}
              title="Animated Life Tree"
              desc="A living digital tree that grows from Seed to Flourishing Tree based on your positive daily habits."
            />
            <FeatureCard
              icon={BarChart3}
              title="Growth Story Insights"
              desc="Emotional radar charts, happiness timelines, stress tracking, and weekly progress summaries."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold text-white">Loved by Gen Z growth seekers</h2>
          <p className="text-slate-400 text-sm">Real stories from people growing every day.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <TestimonialCard
            name="Maya L."
            role="Design Student"
            text="GenZ Growth Companion feels like talking to a friend who actually remembers what you went through last week. The Life Tree visualization is super motivating."
          />
          <TestimonialCard
            name="Jordan K."
            role="Software Engineer"
            text="The guided journal isn’t just a text box — the emotional check-in and voice dictation make reflecting after a long day effortless."
          />
          <TestimonialCard
            name="Elena R."
            role="Content Creator"
            text="The insights story showed me patterns in my stress levels I never noticed before. The dark glass aesthetics are 10/10."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 bg-slate-900/40 border-t border-white/10">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-sm">Invest in your mind and daily momentum.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Free Explorer"
              price="$0"
              desc="Perfect for starting your daily reflection habit."
              features={["Unlimited Guided Journaling", "Basic Life Tree Growth", "Nova AI (10 msgs/day)", "Standard Insights"]}
            />
            <PricingCard
              title="Pro Growth"
              price="$9.99"
              period="/month"
              highlighted={true}
              desc="Unlimited AI memory recall & advanced emotional story."
              features={["Unlimited Nova AI Companion", "Full Memory Recall Vault", "Advanced Growth Radar", "Voice Dictation Engine", "Priority AI Reflections"]}
            />
            <PricingCard
              title="Unlimited Founder"
              price="$19.99"
              period="/month"
              desc="For deep self-actualization & team sharing."
              features={["Everything in Pro", "Custom AI Personalities", "Data Export & JSON Backup", "Early Access Features", "Direct Architect Support"]}
            />
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know about GenZ Growth Companion.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md cursor-pointer transition hover:border-violet-500/40"
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
            >
              <div className="flex justify-between items-center font-semibold text-white">
                <span>{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-violet-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </div>
              {openFaq === idx && (
                <p className="mt-4 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-4">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-10 px-6 text-center text-xs text-slate-500 space-y-3">
        <p>© 2026 GenZ Growth Companion. Built for emotional clarity and personal growth.</p>
        <p className="text-slate-400">Next.js 14 • FastAPI • PostgreSQL • Clerk Auth • OpenAI Ready</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 space-y-4 shadow-lg hover:border-violet-500/40 transition">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 space-y-4 backdrop-blur-md">
      <div className="flex items-center gap-1 text-amber-400">
        {"★".repeat(5)}
      </div>
      <p className="text-sm text-slate-200 leading-relaxed italic">"{text}"</p>
      <div>
        <p className="text-sm font-bold text-white">{name}</p>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
    </div>
  );
}

function PricingCard({ title, price, period, desc, features, highlighted }: any) {
  return (
    <div className={`rounded-3xl border p-8 space-y-6 flex flex-col justify-between ${
      highlighted ? 'border-violet-500 bg-violet-950/20 shadow-2xl shadow-violet-900/30 ring-1 ring-violet-500' : 'border-white/10 bg-slate-900/50'
    }`}>
      <div className="space-y-4">
        {highlighted && (
          <span className="rounded-full bg-violet-500/20 px-3 py-1 text-[10px] font-bold text-violet-300 uppercase tracking-wider">Most Popular</span>
        )}
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-white">{price}</span>
          {period && <span className="text-xs text-slate-400">{period}</span>}
        </div>
        <p className="text-xs text-slate-300">{desc}</p>
        <ul className="space-y-2.5 pt-4 text-xs text-slate-200">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/sign-up"
        className={`w-full rounded-2xl py-3 text-xs font-bold text-center block transition ${
          highlighted ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        Choose Plan
      </Link>
    </div>
  );
}
