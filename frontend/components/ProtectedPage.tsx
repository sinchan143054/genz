"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-3xl bg-slate-950/80 px-7 py-5 text-sm text-slate-200 ring-1 ring-white/10">
          Loading your growth space...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
