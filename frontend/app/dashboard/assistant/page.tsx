"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Heart,
  Smile,
  Zap,
  Bookmark,
  Trash2,
  AlertTriangle,
  PhoneCall,
  Check,
} from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';
import { markNovaCheckinDone } from '../../../lib/notifications';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  personality?: string;
  created_at?: string;
}

interface MemoryFact {
  id: number;
  category: string;
  key_name: string;
  fact_value: string;
}

export default function AssistantPage() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MemoryFact[]>([]);
  const [input, setInput] = useState('');
  const [personality, setPersonality] = useState('gentle guide');
  const [loading, setLoading] = useState(false);
  const [savingAsJournal, setSavingAsJournal] = useState<number | null>(null);
  const [savedJournalIndex, setSavedJournalIndex] = useState<number | null>(null);
  const [isCrisis, setIsCrisis] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistoryAndMemories = async () => {
    try {
      const [histRes, memRes] = await Promise.all([
        api.get('/api/companion/history', { headers: authHeaders(token || undefined) }),
        api.get('/api/memories/facts', { headers: authHeaders(token || undefined) }),
      ]);
      setMessages(histRes.data || []);
      setMemories(memRes.data || []);
    } catch (err) {
      console.error("Companion load note:", err);
    }
  };

  useEffect(() => {
    fetchHistoryAndMemories();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      personality,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput('');
    setLoading(true);

    // Crisis keyword check on frontend UI
    const lower = textToSend.toLowerCase();
    if (lower.includes("want to die") || lower.includes("suicide") || lower.includes("kill myself") || lower.includes("end my life")) {
      setIsCrisis(true);
    } else {
      setIsCrisis(false);
    }

    markNovaCheckinDone();

    try {
      const res = await api.post(
        '/api/companion/chat',
        {
          message: textToSend,
          personality,
        },
        {
          headers: authHeaders(token || undefined),
        }
      );

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
        // Refresh memory facts and tree status
        window.dispatchEvent(new Event("tree_updated"));
        window.dispatchEvent(new Event("insights_updated"));
        window.dispatchEvent(new Event("memory_updated"));
        const memRes = await api.get('/api/memories/facts', { headers: authHeaders(token || undefined) });
        setMemories(memRes.data || []);
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorDetail = err.response?.data?.detail || err.message || "Failed to reach Nova AI. Please check your connection or sign in again.";
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errorDetail}`,
          personality,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to clear your conversation history with Nova AI?")) return;
    try {
      await api.delete('/api/companion/history', { headers: authHeaders(token || undefined) });
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToJournal = async (msgContent: string, idx: number) => {
    setSavingAsJournal(idx);
    try {
      await api.post(
        '/api/journal/entries',
        {
          title: `Nova AI Insight (${new Date().toLocaleDateString()})`,
          reflection: msgContent,
          mood: 'inspired',
          emoji: '✨',
          highlight: 'Advice saved from Nova AI Chat',
          is_pinned: true,
        },
        { headers: authHeaders(token || undefined) }
      );
      setSavedJournalIndex(idx);
      setTimeout(() => setSavedJournalIndex(null), 3000);
      window.dispatchEvent(new Event("journal_updated"));
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAsJournal(null);
    }
  };

  const quickPrompts = [
    "Reflect on my mood today",
    "Help me unwind evening stress",
    "Plan one meaningful goal for tomorrow",
    "What do you remember about my goals?",
  ];

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-violet-300">Memory-Aware AI Companion</p>
              <h1 className="text-3xl font-extrabold text-white mt-1 flex items-center gap-2">
                Nova AI <Sparkles className="h-5 w-5 text-violet-400" />
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white focus:border-violet-500 outline-none"
              >
                <option value="gentle guide">🌱 Gentle Guide</option>
                <option value="mindful mentor">🧘 Mindful Mentor</option>
                <option value="energetic coach">⚡ Energetic Coach</option>
                <option value="deep thinker">🌌 Deep Thinker</option>
              </select>

              {messages.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500 hover:text-white transition"
                  title="Clear conversation history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Active Memory Engine Context Badges */}
          {memories.length > 0 && (
            <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-violet-300 flex items-center gap-1">
                <Bookmark className="h-3 w-3" /> Nova's Active Context:
              </span>
              {memories.slice(0, 4).map((m) => (
                <span key={m.id} className="rounded-full bg-violet-600/30 border border-violet-500/30 px-3 py-0.5 text-[11px] text-violet-200">
                  {m.key_name}: {m.fact_value}
                </span>
              ))}
              {memories.length > 4 && (
                <span className="text-[10px] text-slate-400">+{memories.length - 4} more memories in engine</span>
              )}
            </div>
          )}

          {/* Crisis Support Banner if triggered */}
          {isCrisis && (
            <div className="rounded-3xl border border-rose-500/40 bg-rose-950/60 p-5 text-rose-100 space-y-2 shadow-2xl">
              <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <span>24/7 Crisis Support Resources</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">
                If you or someone you know is struggling or in distress, help is available. You are not alone.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="tel:988" className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-rose-500">
                  <PhoneCall className="h-3.5 w-3.5" /> Call or Text 988 (Lifeline)
                </a>
                <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/40 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20">
                  Find International Helpline ➔
                </a>
              </div>
            </div>
          )}

          {/* Quick Action Prompt Chips */}
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white transition"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="rounded-[32px] border border-white/10 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl h-[520px] flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4 text-slate-400">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/30">
                    <Bot className="h-8 w-8" />
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-lg font-bold text-white">Hello, {user?.name || "Explorer"}.</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      I'm Nova, your conversational AI companion. I remember your guided reflections, emotional history, and long-term memory facts. What's on your mind today?
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-violet-600/30 text-violet-300 ring-1 ring-violet-500/30">
                          <Bot className="h-4.5 w-4.5" />
                        </div>
                      )}

                      <div className="space-y-1.5 max-w-[80%]">
                        <div
                          className={`rounded-3xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                            isUser
                              ? 'bg-violet-600 text-white rounded-tr-sm'
                              : 'bg-slate-950/80 border border-white/10 text-slate-100 rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>

                        {!isUser && (
                          <div className="flex items-center gap-2 pl-2">
                            <button
                              onClick={() => handleSaveToJournal(msg.content, index)}
                              disabled={savingAsJournal === index}
                              className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                            >
                              {savedJournalIndex === index ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  Saved to Journal <Check className="h-3 w-3" />
                                </span>
                              ) : (
                                <>
                                  <Bookmark className="h-3 w-3" />
                                  {savingAsJournal === index ? "Saving..." : "Save Advice to Journal"}
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-200 ring-1 ring-white/10 font-bold text-xs">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}

              {loading && (
                <div className="flex items-center gap-3 text-xs text-violet-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-600/20">
                    <Bot className="h-4 w-4 animate-bounce text-violet-400" />
                  </div>
                  <span>Nova AI is reflecting with memory context...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4"
            >
              <input
                type="text"
                placeholder="Share your thoughts, feelings, or questions with Nova..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-violet-500 outline-none"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center rounded-2xl bg-violet-600 p-3.5 text-white shadow-lg hover:bg-violet-500 transition disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}