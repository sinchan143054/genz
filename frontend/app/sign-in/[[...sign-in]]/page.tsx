"use client";
import React, { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { API_BASE_URL } from "../../../lib/api";

export default function SignInPage() {
  const router = useRouter();
  const { setAuthToken } = useAuth();

  const [authMethod, setAuthMethod] = useState<"native" | "clerk">("native");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNativeSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.access_token) {
        setAuthToken(res.data.access_token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid email or password. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-[32px] border border-white/10 p-7 text-center shadow-glow bg-slate-900/80 backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
          <p className="mt-1 text-xs text-slate-400">Sign in to your GenZ Growth Companion account</p>

          {/* Auth Method Switcher */}
          <div className="mt-6 flex rounded-2xl border border-white/10 bg-slate-950 p-1">
            <button
              onClick={() => setAuthMethod("native")}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                authMethod === "native" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => setAuthMethod("clerk")}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                authMethod === "clerk" ? "bg-violet-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Clerk SSO
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-500/10 p-3 text-xs text-rose-300 border border-rose-500/20 text-left">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMethod === "native" ? (
            <form onSubmit={handleNativeSignIn} className="mt-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:border-violet-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-violet-500 transition disabled:opacity-50 mt-2"
              >
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in..." : "Sign In to Growth"}
              </button>

              <p className="text-center text-xs text-slate-400 pt-2">
                Don't have an account yet?{" "}
                <Link href="/sign-up" className="font-bold text-violet-400 hover:text-violet-300">
                  Create Account
                </Link>
              </p>
            </form>
          ) : (
            <div className="mt-6 flex justify-center">
              <SignIn
                appearance={{
                  elements: {
                    card: "bg-slate-900/90 border border-white/10 shadow-2xl rounded-2xl",
                    headerTitle: "text-white text-xl font-bold",
                    headerSubtitle: "text-slate-400 text-sm",
                    socialButtonsBlockButton: "border border-white/10 bg-white/5 text-white hover:bg-white/10",
                    formFieldLabel: "text-slate-300 text-xs font-medium",
                    formFieldInput: "bg-slate-950 border border-white/10 text-white rounded-xl focus:border-violet-500",
                    formButtonPrimary: "bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition",
                    footerActionLink: "text-violet-400 hover:text-violet-300",
                  }
                }}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl="/dashboard"
              />
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}