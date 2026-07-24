"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';

export default function SignUpPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({ email, name, password });
    } catch (err) {
      setError('Could not create account. Please verify your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950/80 px-6 py-12 sm:px-10">
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-slate-950/90 p-10 shadow-glow">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Start your first chapter</p>
          <h1 className="text-4xl font-semibold text-white">Create an account for your growth sanctuary</h1>
          <p className="text-sm leading-7 text-slate-400">Sign up with email and a secure password to access your AI companion, journal, life tree, and insights.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Avery" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@domain.com" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Create a strong password" minLength={8} required />
          </div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">Already have an account? <Link href="/signin" className="font-semibold text-white hover:text-violet-300">Sign in</Link></p>
      </motion.section>
    </main>
  );
}
