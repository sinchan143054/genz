"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Paperclip, Send } from 'lucide-react';
import { DashboardShell } from '../../../components/DashboardShell';
import { ProtectedPage } from '../../../components/ProtectedPage';
import { useAuth } from '../../../context/AuthContext';
import { api, authHeaders } from '../../../lib/api';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  personality: string;
  created_at: string;
}

const personalities = ['gentle guide', 'flow coach', 'mood ally'];

export default function CompanionPage() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [personality, setPersonality] = useState(personalities[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadHistory() {
      if (!token) return;
      try {
        const response = await api.get('/api/companion/history', { headers: authHeaders(token) });
        setMessages(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    loadHistory();
  }, [token]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const summary = useMemo(() => {
    const count = messages.length;
    return `${count} message${count === 1 ? '' : 's'} exchanged`;
  }, [messages]);

  const sendMessage = async () => {
    if (!token || !message.trim()) return;
    setError('');
    setLoading(true);
    const content = message.trim();
    const newMessage: Message = {
      id: Date.now(),
      role: 'user',
      content,
      personality,
      created_at: new Date().toISOString(),
    };

    setMessages((current) => [...current, newMessage, { id: newMessage.id + 1, role: 'assistant', content: 'Thinking...', personality, created_at: new Date().toISOString() }]);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companion/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(token),
        },
        body: JSON.stringify({ message: content, personality }),
      });
      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      const placeholderId = newMessage.id + 1;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';
        for (const part of chunks) {
          if (!part.startsWith('data: ')) continue;
          const data = part.replace('data: ', '').trim();
          if (data === '[DONE]') {
            break;
          }
          try {
            const event = JSON.parse(data);
            assistantText += event.delta;
            setMessages((current) => current.map((item) => (item.id === placeholderId ? { ...item, content: assistantText } : item)));
          } catch {
            // ignore
          }
        }
      }
      speakAssistant(assistantText);
    } catch (err) {
      setError('Unable to connect to the assistant. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input is not available in this browser.');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage((current) => `${current} ${transcript}`.trim());
      };
      recognition.onend = () => setRecording(false);
      recognition.onerror = () => {
        setError('Voice recognition failed, please try again.');
        setRecording(false);
      };
      recognitionRef.current = recognition;
    }

    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
      return;
    }
    recognitionRef.current.start();
    setRecording(true);
  };

  const speakAssistant = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <ProtectedPage>
      <DashboardShell>
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="glass-card rounded-[32px] border border-white/10 p-8 shadow-glow">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">AI companion</p>
                <h1 className="mt-3 text-3xl font-semibold text-white">Talk through your day with a gentle AI friend.</h1>
                <p className="mt-3 max-w-2xl text-slate-300">Choose a tone, talk through emotions, and use voice input for a more natural flow.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-5 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Current session</p>
                <p className="mt-2 text-2xl font-semibold text-white">{summary}</p>
              </div>
            </div>
          </motion.section>

          <div className="grid gap-6 xl:grid-cols-[1.4fr,0.8fr]">
            <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
              <div ref={chatContainerRef} className="max-h-[760px] space-y-4 overflow-y-auto pr-2 pb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`${msg.role === 'assistant' ? 'rounded-3xl bg-slate-900/80 text-slate-100' : 'rounded-3xl bg-violet-500/10 text-white'} p-5`}>
                    <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-400">
                      <span>{msg.role === 'assistant' ? 'Companion' : 'You'}</span>
                      <span>{msg.personality}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7">{msg.content}</p>
                  </div>
                ))}
                {loading && <div className="rounded-3xl bg-slate-900/70 px-5 py-4 text-sm text-slate-300">Assistant is typing...</div>}
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Personality</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {personalities.map((option) => (
                    <button key={option} type="button" onClick={() => setPersonality(option)} className={`rounded-3xl px-4 py-3 text-sm font-medium transition ${personality === option ? 'bg-violet-500 text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Voice & attachments</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button type="button" onClick={handleVoice} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                    <Mic className="h-4 w-4" />
                    {recording ? 'Stop' : 'Speak'}
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
                    <Paperclip className="h-4 w-4" />
                    Upload
                    <input type="file" className="hidden" onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file || !token) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const response = await api.post('/api/upload', formData, {
                          headers: { ...authHeaders(token), 'Content-Type': 'multipart/form-data' },
                        });
                        setMessage((current) => `${current} [Uploaded file: ${response.data.filename}]`);
                      } catch (uploadError) {
                        setError('Unable to upload file.');
                        console.error(uploadError);
                      }
                    }} />
                  </label>
                </div>
                <p className="mt-3 text-sm text-slate-400">Add context from photos or speak naturally to keep the experience human and calm.</p>
              </div>
              <div className="glass-card rounded-[32px] border border-white/10 p-6 shadow-glow">
                <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Message</p>
                <textarea rows={6} value={message} onChange={(event) => setMessage(event.target.value)} className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 text-sm text-slate-100 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" placeholder="Share how you're feeling, ask for encouragement, or reflect on a challenge..." />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Private, compassionate space to explore your emotions.</p>
                  <button type="button" onClick={sendMessage} disabled={loading || !message.trim()} className="inline-flex items-center gap-2 rounded-full bg-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60">
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
                {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </DashboardShell>
    </ProtectedPage>
  );
}
