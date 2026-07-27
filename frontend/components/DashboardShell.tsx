"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageCircle,
  Notebook,
  TreeDeciduous,
  BarChart3,
  Settings,
  Flame,
  Search,
  Bell,
  X,
  Bookmark,
  Sparkles,
  LogOut,
  Menu,
  CheckCircle2,
  Clock,
  Check,
  Trash2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "../context/AuthContext";
import { api, authHeaders } from "../lib/api";
import {
  getNotifications,
  markAllNotificationsRead,
  clearAllNotifications,
  getTodayRitual,
  requestBrowserNotificationPermission,
  AppNotification,
  RitualState,
} from "../lib/notifications";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/assistant", label: "Nova AI", icon: MessageCircle },
  { href: "/dashboard/journal", label: "Journal", icon: Notebook },
  { href: "/dashboard/tree", label: "Life Tree", icon: TreeDeciduous },
  { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
  { href: "/dashboard/memories", label: "Memories", icon: Bookmark },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [ritualModalOpen, setRitualModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [ritual, setRitual] = useState<RitualState>({ reflectionDone: false, novaCheckinDone: false });
  const [toastNotif, setToastNotif] = useState<AppNotification | null>(null);

  const loadNotificationsAndRitual = () => {
    setNotifications(getNotifications());
    setRitual(getTodayRitual());
  };

  useEffect(() => {
    loadNotificationsAndRitual();

    const handleNotifUpdate = () => setNotifications(getNotifications());
    const handleRitualUpdate = () => setRitual(getTodayRitual());
    const handleShowToast = (e: any) => {
      setToastNotif(e.detail);
      setTimeout(() => setToastNotif(null), 4000);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("notifications_updated", handleNotifUpdate);
      window.addEventListener("ritual_updated", handleRitualUpdate);
      window.addEventListener("show_toast", handleShowToast);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("notifications_updated", handleNotifUpdate);
        window.removeEventListener("ritual_updated", handleRitualUpdate);
        window.removeEventListener("show_toast", handleShowToast);
      }
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const completedCount = (ritual.reflectionDone ? 1 : 0) + (ritual.novaCheckinDone ? 1 : 0);
  const progressPercent = completedCount === 2 ? 100 : completedCount === 1 ? 50 : 0;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/api/memories/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: authHeaders(token || undefined),
      });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      alert("Browser push notifications enabled! You will receive daily self-care reminders.");
    } else {
      alert("Notification permission was not granted.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Live Toast Popup Banner */}
      <AnimatePresence>
        {toastNotif && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md rounded-2xl border border-violet-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/30 text-violet-300 ring-1 ring-violet-500/40">
                {toastNotif.type === "achievement" ? "🏆" : toastNotif.type === "success" ? "✨" : "🌱"}
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-white text-sm">{toastNotif.title}</h4>
                <p className="text-slate-300 leading-relaxed">{toastNotif.body}</p>
              </div>
            </div>
            <button onClick={() => setToastNotif(null)} className="text-slate-400 hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/30 text-violet-300 ring-1 ring-violet-500/30">
              🌱
            </span>
            <span>GenZ Growth</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400 hover:border-violet-500/50 hover:text-white transition"
          >
            <Search className="h-3.5 w-3.5 text-violet-400" />
            <span className="hidden sm:inline">Search memories & reflections...</span>
          </button>

          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white transition"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-slate-950 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 grid lg:grid-cols-[280px_1fr] relative">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col justify-between border-r border-white/10 bg-slate-950/60 p-6 backdrop-blur-md sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 font-bold text-white shadow-lg text-lg">
                  {user?.name?.charAt(0) ?? "G"}
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-semibold text-white truncate">{user?.name ?? "Explorer"}</h2>
                  <p className="text-xs text-slate-400 truncate">{user?.email ?? "Growth Journey"}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-violet-500/10 px-3.5 py-2.5 text-violet-300 ring-1 ring-violet-500/20">
                <Flame className="h-4 w-4 text-amber-400 animate-bounce" />
                <span className="text-xs font-semibold">Growth Streak Active</span>
              </div>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            {/* Dynamic Interactive Daily Ritual Card */}
            <div
              onClick={() => setRitualModalOpen(true)}
              className="rounded-3xl border border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-violet-500/50 p-4 space-y-3 cursor-pointer transition shadow-lg group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-violet-300 transition">
                    Daily Ritual
                  </p>
                  <HelpCircle className="h-3 w-3 text-slate-500 group-hover:text-violet-400" />
                </div>
                <span className="text-[10px] font-semibold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                  {completedCount}/2 Done
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Notebook className="h-3.5 w-3.5 text-violet-400" /> Guided Reflection
                  </span>
                  {ritual.reflectionDone ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      Done <CheckCircle2 className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      Pending <Clock className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-violet-400" /> Nova AI Check-in
                  </span>
                  {ritual.novaCheckinDone ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      Done <CheckCircle2 className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      Pending <Clock className="h-3 w-3" />
                    </span>
                  )}
                </div>

                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 group-hover:text-slate-300 transition text-center pt-1">
                Click to view details & complete daily tasks ➔
              </p>
            </div>

            <button
              onClick={logout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Daily Ritual Explanation Modal */}
        <AnimatePresence>
          {ritualModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
            >
              <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/30 text-violet-300">
                      🌱
                    </span>
                    <h3 className="text-xl font-bold text-white">What is Daily Ritual?</h3>
                  </div>
                  <button onClick={() => setRitualModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <p className="text-sm text-slate-200">
                    <strong className="text-violet-300">Daily Ritual</strong> is your daily 2-step habit routine on GenZ Growth designed to nurture emotional well-being and build lasting growth streaks.
                  </p>

                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-2">
                          <Notebook className="h-4 w-4 text-violet-400" /> 1. Guided Reflection (Journaling)
                        </span>
                        <span className="text-emerald-400 font-semibold">+15 Points</span>
                      </div>
                      <p className="text-slate-400">
                        Write down your mood, wins, lessons, and gratitude in your daily journal.
                      </p>
                      <button
                        onClick={() => {
                          setRitualModalOpen(false);
                          router.push("/dashboard/journal");
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-violet-600/30 border border-violet-500/40 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600 hover:text-white transition"
                      >
                        {ritual.reflectionDone ? "Completed ✨ (View Journal)" : "Start Guided Reflection ➔"}
                      </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-violet-400" /> 2. Nova AI Check-in (AI Chat)
                        </span>
                        <span className="text-emerald-400 font-semibold">+5 Points</span>
                      </div>
                      <p className="text-slate-400">
                        Share your feelings or ask for guidance from Nova AI, your memory-aware companion.
                      </p>
                      <button
                        onClick={() => {
                          setRitualModalOpen(false);
                          router.push("/dashboard/assistant");
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-violet-600/30 border border-violet-500/40 px-3 py-1.5 text-xs font-semibold text-violet-200 hover:bg-violet-600 hover:text-white transition"
                      >
                        {ritual.novaCheckinDone ? "Completed 💬 (Chat Nova)" : "Chat with Nova AI ➔"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-200 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
                    <span>Complete 100% of your Daily Ritual each day to earn <strong>+20 Bonus Tree Points</strong> and maintain your Growth Streak!</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 p-6 border-r border-white/10 lg:hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">GenZ Growth</span>
                  <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                        pathname === item.href ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
              <button
                onClick={logout}
                className="w-full rounded-2xl bg-rose-600/30 py-3 text-xs font-semibold text-rose-200"
              >
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Modal */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 p-4 backdrop-blur-md pt-20"
            >
              <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Search className="h-5 w-5 text-violet-400" /> Search Memory Vault
                  </h3>
                  <button onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search keywords, reflections, gratitude notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-500"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </form>

                <div className="max-h-60 overflow-y-auto space-y-2 pt-2">
                  {searchResults.length === 0 && !searching && (
                    <p className="text-center py-6 text-xs text-slate-400">Type a keyword above to recall past journal reflections.</p>
                  )}
                  {searchResults.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/5 bg-slate-950/50 p-3.5 space-y-1">
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="text-xs text-slate-300 line-clamp-2">{entry.reflection}</p>
                      <div className="flex gap-2 pt-1 text-[10px] text-violet-300">
                        <span>Mood: {entry.mood}</span>
                        <span>•</span>
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Notifications Drawer */}
        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-6 z-50 w-80 sm:w-96 rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" /> Notifications ({unreadCount} new)
                </span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => setNotifications(markAllNotificationsRead())}
                      className="text-[10px] font-semibold text-violet-300 hover:text-white"
                    >
                      Read All
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications(clearAllNotifications())}
                      className="text-[10px] font-semibold text-rose-400 hover:text-rose-300"
                    >
                      Clear
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Enable Browser Notifications Prompt */}
              <button
                onClick={handleEnablePush}
                className="w-full flex items-center justify-between rounded-2xl bg-violet-600/20 border border-violet-500/30 p-2.5 text-xs text-violet-200 hover:bg-violet-600/40 transition"
              >
                <span className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-violet-400" /> Enable Browser Reminders
                </span>
                <span className="text-[10px] font-bold underline">Allow</span>
              </button>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-xs">No notifications right now.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-2xl p-3 border transition ${
                        n.read
                          ? "bg-slate-950/40 border-white/5 text-slate-400 opacity-75"
                          : "bg-violet-500/10 border-violet-500/30 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span className="flex items-center gap-1.5">
                          {n.type === "achievement" ? "🏆" : n.type === "success" ? "✨" : "🌱"} {n.title}
                        </span>
                        {!n.read && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                      </div>
                      <p className="mt-1 text-slate-300 leading-relaxed text-[11px]">{n.body}</p>
                      <p className="mt-1.5 text-[9px] text-slate-500">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Viewport */}
        <main className="p-6 lg:p-10 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}