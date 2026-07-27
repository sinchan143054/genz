"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Lock,
  Download,
  Trash2,
  CheckCircle2,
  Moon,
  Globe,
  ShieldCheck,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

export default function SettingsPage() {
  const { user, token, refetchUser, logout } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');

  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyStreak, setNotifyStreak] = useState(true);
  const [notifyWeekly, setNotifyWeekly] = useState(true);
  const [shareInsights, setShareInsights] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setTheme(user.theme || 'dark');
      setLanguage(user.language || 'en');
      setNotifyDaily(user.notify_daily_reminder ?? true);
      setNotifyStreak(user.notify_streak_milestones ?? true);
      setNotifyWeekly(user.notify_weekly_digest ?? true);
      setShareInsights(user.share_insights ?? true);
    }
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/api/settings', {
        name,
        bio,
        theme,
        language,
        notify_daily_reminder: notifyDaily,
        notify_streak_milestones: notifyStreak,
        notify_weekly_digest: notifyWeekly,
        share_insights: shareInsights,
      }, {
        headers: authHeaders(token || undefined),
      });
      await refetchUser();
      setSaveMsg("Preferences updated successfully! ✨");
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setSaveMsg("Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/api/settings/export', {
        headers: authHeaders(token || undefined),
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `genz_growth_backup_${user?.id || 'data'}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to export backup data.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/api/settings/account', {
        headers: authHeaders(token || undefined),
      });
      logout();
    } catch (err) {
      console.error(err);
      alert("Failed to delete account.");
    }
  };

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-violet-300">Preferences & Data Control</p>
              <h1 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
                Settings & Profile ⚙️
              </h1>
            </div>

            {saveMsg && (
              <span className="text-xs font-semibold text-emerald-400 animate-pulse">{saveMsg}</span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-8">
            {/* Profile Information */}
            <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 space-y-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-violet-400" /> Public Profile
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Account Email (Verified by Clerk)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-xs text-slate-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Personal Motto / Bio</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Dream big, feel deeply, grow daily..."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                />
              </div>
            </div>

            {/* Notifications & Preferences */}
            <div className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 space-y-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" /> Notification & Digest Rules
              </h3>

              <div className="space-y-4 text-xs text-slate-300">
                <ToggleRow
                  label="Daily Reflection Reminder"
                  desc="Receive a reminder to log your evening reflection & gratitude"
                  checked={notifyDaily}
                  onChange={setNotifyDaily}
                />
                <ToggleRow
                  label="Streak Milestone Alerts"
                  desc="Get notified when you reach 3, 7, and 14 day streak achievements"
                  checked={notifyStreak}
                  onChange={setNotifyStreak}
                />
                <ToggleRow
                  label="Weekly Emotional Digest"
                  desc="Receive a weekly AI summary report of your growth trends"
                  checked={notifyWeekly}
                  onChange={setNotifyWeekly}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving Changes..." : "Save Preferences"}
              </button>
            </div>
          </form>

          {/* Data Export & Danger Zone */}
          <div className="rounded-[32px] border border-rose-500/20 bg-rose-950/10 p-7 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-rose-400" /> Data Privacy & Account Management
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-rose-500/10 pt-4">
              <div>
                <p className="text-sm font-bold text-white">Export Personal Data</p>
                <p className="text-xs text-slate-400">Download a complete JSON backup of all your journals, reflections, and chat logs.</p>
              </div>
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                <Download className="h-4 w-4 text-violet-400" /> Export JSON
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-rose-500/10 pt-4">
              <div>
                <p className="text-sm font-bold text-rose-300">Delete Account</p>
                <p className="text-xs text-slate-400">Permanently delete your profile, journals, and Life Tree state.</p>
              </div>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600/30 border border-rose-500/40 px-5 py-3 text-xs font-semibold text-rose-200 hover:bg-rose-600 hover:text-white transition"
              >
                <Trash2 className="h-4 w-4" /> Delete Account
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {deleteModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
              >
                <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-900 p-6 space-y-4 shadow-2xl">
                  <div className="flex items-center gap-3 text-rose-400">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="text-lg font-bold text-white">Delete Account?</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This action is permanent and cannot be undone. All your guided reflections, AI chat history, and Life Tree points will be deleted.
                  </p>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setDeleteModalOpen(false)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-500"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function ToggleRow({ label, desc, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="text-[11px] text-slate-400">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
      </label>
    </div>
  );
}
