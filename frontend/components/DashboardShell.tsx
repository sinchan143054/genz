"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, MessageCircle, Notebook, TreeDeciduous, BarChart3, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/assistant', label: 'AI Companion', icon: MessageCircle },
  { href: '/dashboard/journal', label: 'Journal', icon: Notebook },
  { href: '/dashboard/tree', label: 'Life Tree', icon: TreeDeciduous },
  { href: '/dashboard/insights', label: 'Insights', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950/80 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[280px,1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card flex flex-col justify-between rounded-[32px] border border-white/10 p-6 shadow-glow"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Growth hub</p>
              <h2 className="mt-4 text-2xl font-semibold text-white">{user?.name}</h2>
              <p className="mt-2 text-sm text-slate-300">{user?.bio || 'Companion for your next chapter.'}</p>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition ${
                      active ? 'bg-violet-500/15 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Daily growth score</p>
              <p className="mt-3 text-3xl font-semibold text-white">{Math.min(100, Math.max(74, (user?.name?.length ?? 10) * 7))}%</p>
            </div>
            <button
              onClick={logout}
              className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-violet-400/40 hover:bg-violet-500/10"
            >
              Sign out
            </button>
          </div>
        </motion.aside>
        <main className="space-y-8">{children}</main>
      </div>
    </div>
  );
}
