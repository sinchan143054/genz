"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Save,
  Mic,
  MicOff,
  Trash2,
  Pin,
  Search,
  Smile,
  Heart,
  Lightbulb,
  Target,
  Bookmark,
  CheckCircle2,
  Bot,
  Plus,
  X,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface Entry {
  id: number;
  title: string;
  reflection: string;
  mood: string;
  emoji: string;
  highlight: string;
  emotional_checkin: string;
  lesson_learned: string;
  gratitude: string;
  tomorrow_focus: string;
  memory_note: string;
  is_pinned: boolean;
  ai_reflection?: string;
  created_at: string;
  updated_at: string;
}

import { getLocalEntries, saveLocalEntry, syncLocalEntries } from '../../../lib/storage';
import { markReflectionDone } from '../../../lib/notifications';

export default function JournalPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState("calm");
  const [highlight, setHighlight] = useState("");
  const [emotionalCheckin, setEmotionalCheckin] = useState("");
  const [lessonLearned, setLessonLearned] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [tomorrowFocus, setTomorrowFocus] = useState("");
  const [memoryNote, setMemoryNote] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Voice Dictation State
  const [isListening, setIsListening] = useState(false);
  const [aiReflecting, setAiReflecting] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await api.get('/api/journal/entries', {
        headers: authHeaders(token || undefined),
      });
      if (res.data) {
        setEntries(res.data);
        syncLocalEntries(res.data);
      } else {
        setEntries(getLocalEntries() as any);
      }
    } catch (err) {
      console.log("Journal fetch falling back to local storage");
      setEntries(getLocalEntries() as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [token]);

  // Voice Recognition Handler
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice speech recognition is not supported in this browser environment.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setReflection((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !reflection.trim()) {
      alert("Please provide at least a title and reflection body.");
      return;
    }
    setSaving(true);
    setSaveStatus("Saving reflection...");

    const payload = {
      title,
      reflection,
      mood,
      emoji: mood === "grateful" ? "💖" : mood === "inspired" ? "✨" : mood === "anxious" ? "🌧️" : "🌱",
      highlight,
      emotional_checkin: emotionalCheckin,
      lesson_learned: lessonLearned,
      gratitude,
      tomorrow_focus: tomorrowFocus,
      memory_note: memoryNote,
      is_pinned: isPinned,
    };

    // Mark daily ritual reflection task as complete!
    markReflectionDone();

    try {
      if (editingId) {
        await api.put(`/api/journal/entries/${editingId}`, payload, {
          headers: authHeaders(token || undefined),
        });
      } else {
        await api.post('/api/journal/entries', payload, {
          headers: authHeaders(token || undefined),
        });
      }

      setSaveStatus("All changes saved ✨");
      resetForm();
      fetchEntries();

      // Dispatch global events for real-time ecosystem sync
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("journal_updated"));
        window.dispatchEvent(new Event("tree_updated"));
        window.dispatchEvent(new Event("insights_updated"));
        window.dispatchEvent(new Event("memory_updated"));
      }
    } catch (err) {
      console.log("Saving reflection locally due to network response");
      const localEntry: Entry = {
        id: editingId || Date.now(),
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      saveLocalEntry(localEntry as any);
      setEntries((prev) => [localEntry, ...prev.filter((e) => e.id !== localEntry.id)]);
      setSaveStatus("Saved to memory vault ✨");
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {

    setTitle("");
    setReflection("");
    setMood("calm");
    setHighlight("");
    setEmotionalCheckin("");
    setLessonLearned("");
    setGratitude("");
    setTomorrowFocus("");
    setMemoryNote("");
    setIsPinned(false);
    setEditingId(null);
  };

  const handleEdit = (entry: Entry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setReflection(entry.reflection);
    setMood(entry.mood || "calm");
    setHighlight(entry.highlight || "");
    setEmotionalCheckin(entry.emotional_checkin || "");
    setLessonLearned(entry.lesson_learned || "");
    setGratitude(entry.gratitude || "");
    setTomorrowFocus(entry.tomorrow_focus || "");
    setMemoryNote(entry.memory_note || "");
    setIsPinned(entry.is_pinned || false);
    setSelectedEntry(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to archive this journal entry?")) return;
    try {
      await api.delete(`/api/journal/entries/${id}`, {
        headers: authHeaders(token || undefined),
      });
      fetchEntries();
      if (selectedEntry?.id === id) setSelectedEntry(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAiReflection = async (entry: Entry) => {
    setAiReflecting(true);
    try {
      const res = await api.post(`/api/journal/entries/${entry.id}/ai-reflection`, {}, {
        headers: authHeaders(token || undefined),
      });
      if (res.data?.ai_reflection) {
        setSelectedEntry({ ...entry, ai_reflection: res.data.ai_reflection });
        fetchEntries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiReflecting(false);
    }
  };

  const filteredEntries = entries.filter((e) => {
    const text = `${e.title} ${e.reflection} ${e.highlight} ${e.gratitude}`.toLowerCase();
    return text.includes(searchQuery.toLowerCase());
  });

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-violet-300">Guided Reflection Studio</p>
              <h1 className="text-3xl font-extrabold text-white mt-1">Daily Journal Ritual</h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">{saveStatus}</span>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8">
            {/* Journal Editor */}
            <form onSubmit={handleSave} className="rounded-[32px] border border-white/10 bg-slate-900/60 p-7 space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  {editingId ? "Edit Guided Reflection" : "New Guided Reflection"}
                </h2>

                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    isListening ? "bg-rose-500 text-white animate-pulse" : "border border-white/10 bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-violet-400" />}
                  {isListening ? "Listening..." : "Voice Dictate"}
                </button>
              </div>

              {/* Title & Mood Selection */}
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="Reflection Title e.g., Finding Balance in Chaos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                  required
                />

                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white focus:border-violet-500 outline-none"
                >
                  <option value="calm">😌 Mood: Calm</option>
                  <option value="grateful">💖 Mood: Grateful</option>
                  <option value="inspired">✨ Mood: Inspired</option>
                  <option value="anxious">🌧️ Mood: Anxious</option>
                  <option value="focused">🎯 Mood: Focused</option>
                </select>
              </div>

              {/* Main Reflection */}
              <textarea
                placeholder="What feelings, insights, or thoughts are present for you right now?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-violet-500 outline-none leading-relaxed"
                required
              />

              {/* Guided Reflection Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <GuidedInput icon={Sparkles} label="Today's Highlight" placeholder="Small win or happy moment..." value={highlight} onChange={setHighlight} />
                <GuidedInput icon={Smile} label="Emotional Check-in" placeholder="How does your heart feel?" value={emotionalCheckin} onChange={setEmotionalCheckin} />
                <GuidedInput icon={Lightbulb} label="Lesson Learned" placeholder="What did today teach you?" value={lessonLearned} onChange={setLessonLearned} />
                <GuidedInput icon={Heart} label="Gratitude" placeholder="One thing you're thankful for..." value={gratitude} onChange={setGratitude} />
                <GuidedInput icon={Target} label="Tomorrow's Focus" placeholder="Primary intention for tomorrow..." value={tomorrowFocus} onChange={setTomorrowFocus} />
                <GuidedInput icon={Bookmark} label="Memory Note" placeholder="A detail worth remembering..." value={memoryNote} onChange={setMemoryNote} />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-white/10 bg-slate-950 text-violet-600 focus:ring-0"
                  />
                  <span>Pin to Memory Vault</span>
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editingId ? "Update Entry" : "Save Reflection"}
                </button>
              </div>
            </form>

            {/* Entries Feed & Search */}
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search reflections & gratitude..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                />
              </div>

              <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-12 rounded-3xl border border-white/5 bg-slate-900/40 p-6 space-y-2">
                    <p className="text-xs text-slate-400">No reflections match your search.</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 space-y-3 hover:border-violet-500/40 transition backdrop-blur-md relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{entry.emoji}</span>
                          <h3 className="font-bold text-white text-sm">{entry.title}</h3>
                          {entry.is_pinned && <Pin className="h-3 w-3 text-amber-400 fill-amber-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">{entry.reflection}</p>

                      {entry.gratitude && (
                        <p className="text-[11px] text-rose-300 flex items-center gap-1.5 pt-1">
                          <Heart className="h-3 w-3 text-rose-400" /> Gratitude: {entry.gratitude}
                        </p>
                      )}

                      {entry.ai_reflection && (
                        <div className="rounded-2xl bg-violet-500/10 p-3 ring-1 ring-violet-500/20 text-xs text-violet-200 space-y-1">
                          <span className="font-bold text-violet-300 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                            <Bot className="h-3 w-3" /> AI Insight
                          </span>
                          <p className="text-slate-300">{entry.ai_reflection}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <button
                          onClick={() => handleGenerateAiReflection(entry)}
                          disabled={aiReflecting}
                          className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                        >
                          <Bot className="h-3.5 w-3.5" /> AI Reflect
                        </button>

                        <div className="flex items-center gap-3">
                          <button onClick={() => handleEdit(entry)} className="text-[11px] font-semibold text-slate-300 hover:text-white">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(entry.id)} className="text-[11px] font-semibold text-rose-400 hover:text-rose-300">
                            Archive
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}

function GuidedInput({ icon: Icon, label, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-violet-400" /> {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
      />
    </div>
  );
}