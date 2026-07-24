"use client";
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';

export default function SignInPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError('Unable to sign in. Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950/80 px-6 py-12 sm:px-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-slate-950/90 p-10 shadow-glow"
      >
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-violet-200/80">Welcome back</p>
          <h1 className="text-4xl font-semibold text-white">Sign in to your growth sanctuary</h1>
          <p className="text-sm leading-7 text-slate-400">Use your email and password to continue your AI companion, journal, tree, and insights journey.</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Email</label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@domain.com" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Password</label>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Your password" required />
          </div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          New here? <Link href="/signup" className="font-semibold text-white hover:text-violet-300">Create an account</Link>
        </p>
      </motion.section>
    </main>
  );
}
