"use client";
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Search, Trash2, RotateCcw } from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';
import { format } from 'date-fns';

interface Entry {
  id: number;
  title: string;
  content: string;
  mood: string;
  emoji: string;
  font_style: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

const moods = ['reflective', 'calm', 'hopeful', 'joyful', 'anxious', 'sad', 'stressed'];

export default function JournalPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('reflective');
  const [emoji, setEmoji] = useState('📝');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadEntries() {
      if (!token) return;
      try {
        const response = await api.get('/api/journal/entries', { headers: authHeaders(token), params: { query } });
        setEntries(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadEntries();
  }, [token, query]);

  const activeEntries = useMemo(() => entries.filter((entry) => !entry.deleted_at), [entries]);
  const archivedEntries = useMemo(() => entries.filter((entry) => !!entry.deleted_at), [entries]);

  const createEntry = async () => {
    if (!token || !title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setError('');
    try {
      const response = await api.post('/api/journal/entries', { title, content, mood, emoji, font_style: 'handwritten' }, { headers: authHeaders(token) });
      setEntries((current) => [response.data, ...current]);
      setTitle('');
      setContent('');
      setSuccess('Entry saved.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Unable to save your entry.');
      console.error(err);
    }
  };

  const archiveEntry = async (id: number) => {
    if (!token) return;
    await api.delete(`/api/journal/entries/${id}`, { headers: authHeaders(token) });
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, deleted_at: new Date().toISOString() } : entry)));
  };

  const restoreEntry = async (id: number) => {
    if (!token) return;
    await api.post(`/api/journal/entries/${id}/restore`, {}, { headers: authHeaders(token) });
    setEntries((current) => current.map((entry) => (entry.id === id ? { ...entry, deleted_at: null } : entry)));
  };

  const deleteEntry = async (id: number) => {
    if (!token) return;
    await api.delete(`/api/journal/entries/${id}/permanent`, { headers: authHeaders(token) });
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card rounded-[32px] border border-white/10 p-8 shadow-glow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Journal</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">A notebook that feels like your safe space.</h1>
                <p className="mt-3 max-w-2xl text-slate-300">Capture moods, memories, and insights with natural handwriting-inspired styling and soft autosave energy.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Journal rhythm</p>
                <p className="mt-2 text-2xl font-semibold text-white">{activeEntries.length} entries</p>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
            <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-violet-300" />
                <h2 className="text-lg font-semibold text-white">Write a new entry</h2>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Title</label>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" placeholder="Evening reflections" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Mood</label>
                  <select value={mood} onChange={(event) => setMood(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20">
                    {moods.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Entry</label>
                  <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={8} className="w-full rounded-[28px] border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" placeholder="Describe what happened, how you felt, and what you want to remember." />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {['📝', '✨', '🌿', '❤️'].map((symbol) => (
                      <button key={symbol} type="button" onClick={() => setEmoji(symbol)} className={`rounded-3xl px-4 py-3 text-lg ${emoji === symbol ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}>
                        {symbol}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={createEntry} className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400">
                    <Plus className="h-4 w-4" />
                    Save entry
                  </button>
                </div>
                {error && <p className="text-sm text-rose-300">{error}</p>}
                {success && <p className="text-sm text-emerald-300">{success}</p>}
              </div>
            </div>
            <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Search entries</p>
                  <p className="mt-2 text-sm text-slate-400">Search by title, mood, or content.</p>
                </div>
                <div className="rounded-3xl bg-violet-500/10 p-3 text-violet-300">
                  <Search className="h-4 w-4" />
                </div>
              </div>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search journal" className="mt-5 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <h2 className="text-xl font-semibold text-white">Recent entries</h2>
              <div className="mt-5 space-y-4">
                {activeEntries.length > 0 ? activeEntries.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-violet-200">{entry.mood} · {format(new Date(entry.created_at), 'MMM d')}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{entry.title}</h3>
                      </div>
                      <button type="button" onClick={() => archiveEntry(entry.id)} className="rounded-full bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-300 line-clamp-3">{entry.content}</p>
                  </div>
                )) : <p className="text-sm text-slate-400">No journal entries yet. Start your ritual above.</p>}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }} className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-violet-300" />
                <h2 className="text-xl font-semibold text-white">Archive</h2>
              </div>
              <div className="mt-5 space-y-4">
                {archivedEntries.length > 0 ? archivedEntries.map((entry) => (
                  <div key={entry.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{format(new Date(entry.deleted_at || entry.updated_at), 'MMM d')}</p>
                        <h3 className="mt-2 text-lg font-semibold text-white">{entry.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => restoreEntry(entry.id)} className="rounded-full bg-violet-500/10 p-2 text-violet-200 transition hover:bg-violet-500/20">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => deleteEntry(entry.id)} className="rounded-full bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400">Deleted entries will appear here so you can restore them later.</p>}
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}
