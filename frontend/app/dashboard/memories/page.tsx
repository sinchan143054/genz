"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bookmark,
  Search,
  Pin,
  Sparkles,
  Bot,
  Heart,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Brain,
  UserCheck,
  Target,
  Flame,
} from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface MemoryFact {
  id: number;
  category: string;
  key_name: string;
  fact_value: string;
  source: string;
  created_at: string;
}

interface JournalEntry {
  id: number;
  title: string;
  reflection: string;
  mood: string;
  emoji: string;
  highlight: string;
  gratitude: string;
  is_pinned: boolean;
  created_at: string;
}

export default function MemoriesPage() {
  const { token } = useAuth();
  const [memoryFacts, setMemoryFacts] = useState<MemoryFact[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [query, setQuery] = useState('');
  const [recalling, setRecalling] = useState(false);
  const [recallSummary, setRecallSummary] = useState('');
  
  // Add Memory Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('person');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAllData = async () => {
    try {
      const [factsRes, journalsRes] = await Promise.all([
        api.get('/api/memories/facts', { headers: authHeaders(token || undefined) }),
        api.get(`/api/memories/search?query=${encodeURIComponent(query)}`, { headers: authHeaders(token || undefined) }),
      ]);
      setMemoryFacts(factsRes.data || []);
      setJournalEntries(journalsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAllData();
    const handleMemoryUpdate = () => fetchAllData();
    if (typeof window !== "undefined") {
      window.addEventListener("memory_updated", handleMemoryUpdate);
      window.addEventListener("journal_updated", handleMemoryUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("memory_updated", handleMemoryUpdate);
        window.removeEventListener("journal_updated", handleMemoryUpdate);
      }
    };
  }, [token, query]);

  const handleAiRecall = async () => {
    setRecalling(true);
    try {
      const res = await api.post('/api/memories/recall', { topic: query || 'General Growth' }, {
        headers: authHeaders(token || undefined),
      });
      if (res.data?.recall_summary) {
        setRecallSummary(res.data.recall_summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecalling(false);
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    setAdding(true);
    try {
      await api.post('/api/memories/facts', {
        category: newCategory,
        key_name: newKey,
        fact_value: newValue,
        source: 'manual',
      }, { headers: authHeaders(token || undefined) });
      
      setNewKey('');
      setNewValue('');
      setShowAddModal(false);
      fetchAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteFact = async (id: number) => {
    if (!confirm("Remove this memory fact from long-term memory engine?")) return;
    try {
      await api.delete(`/api/memories/facts/${id}`, { headers: authHeaders(token || undefined) });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredFacts = memoryFacts.filter(f => 
    `${f.key_name} ${f.fact_value} ${f.category}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-violet-300">Automated Long-Term Memory Engine</p>
              <h1 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
                Memory Engine 🧠
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-violet-500/30 bg-violet-600/20 px-4 py-2.5 text-xs font-bold text-violet-200 hover:bg-violet-600 hover:text-white transition"
              >
                <Plus className="h-4 w-4" /> Add Memory Fact
              </button>

              <button
                onClick={handleAiRecall}
                disabled={recalling}
                className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition disabled:opacity-50"
              >
                <Bot className="h-4 w-4" />
                {recalling ? "Recalling..." : "AI Memory Synthesis"}
              </button>
            </div>
          </div>

          {/* AI Recall Summary Banner */}
          {recallSummary && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-violet-500/30 bg-violet-950/30 p-6 backdrop-blur-md space-y-2 shadow-2xl"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Memory Synthesis
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">{recallSummary}</p>
            </motion.div>
          )}

          {/* Search Controls */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search people, goals, events, or reflections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
            />
          </div>

          {/* Long-Term Memory Engine Facts Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-400" /> Auto-Extracted Memory Facts ({filteredFacts.length})
            </h2>

            {filteredFacts.length === 0 ? (
              <div className="text-center py-10 rounded-3xl border border-white/5 bg-slate-900/40 p-6 space-y-2">
                <p className="text-xs text-slate-400">No memory facts stored yet. Write reflections or chat with Nova AI to automatically extract key people, goals, and events!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredFacts.map((fact) => (
                  <motion.div
                    key={fact.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-3 relative group hover:border-violet-500/50 transition backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-violet-500/20 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-violet-300 border border-violet-500/30">
                        {fact.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 uppercase">{fact.source}</span>
                        <button
                          onClick={() => handleDeleteFact(fact.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition"
                          title="Delete memory fact"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-sm">{fact.key_name}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{fact.fact_value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Journal Reflections Section */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-amber-400" /> Reflection Archives ({journalEntries.length})
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {journalEntries.map((entry) => (
                <div key={entry.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{entry.emoji}</span> {entry.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{entry.reflection}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Memory Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
              <form onSubmit={handleAddMemory} className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-2xl">
                <h3 className="text-lg font-bold text-white">Add Memory Fact</h3>
                
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white focus:border-violet-500 outline-none"
                >
                  <option value="person">👤 Person / Relationship</option>
                  <option value="goal">🎯 Goal / Target</option>
                  <option value="dream">✨ Dream / Aspiration</option>
                  <option value="fear">🌧️ Fear / Stressor</option>
                  <option value="hobby">🎨 Hobby / Interest</option>
                  <option value="achievement">🏆 Achievement</option>
                  <option value="event">📅 Event</option>
                </select>

                <input
                  type="text"
                  placeholder="Key Subject (e.g. Sister Priya, Exam Prep)"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                  required
                />

                <textarea
                  placeholder="Memory Fact Detail (e.g. Priya graduates next month)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                  required
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="rounded-2xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500"
                  >
                    {adding ? "Saving..." : "Save Memory"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}
