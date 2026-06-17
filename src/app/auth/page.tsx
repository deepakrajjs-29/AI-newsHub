"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Cpu, AlertCircle, KeyRound, Mail, User, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push(redirectTo);
      }
    });
  }, [router, redirectTo]);

  // Sync profile metadata with Postgres after signup/login
  const syncProfile = async (sessionToken: string) => {
    try {
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
    } catch (err) {
      console.error("Failed to sync profile:", err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          await syncProfile(data.session.access_token);
          setSuccessMsg("Registration successful! Redirecting...");
          setTimeout(() => router.push(redirectTo), 1500);
        } else {
          setSuccessMsg("Sign-up complete! Please check your email inbox to confirm your email.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          await syncProfile(data.session.access_token);
          setSuccessMsg("Login successful! Redirecting...");
          setTimeout(() => {
            router.push(redirectTo);
            router.refresh();
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-2xl relative z-10 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground font-extrabold text-2xl tracking-tight mb-2">
          <div className="p-2 rounded-xl bg-foreground text-background">
            <Cpu className="h-6 w-6" />
          </div>
          <span>AI News Hub</span>
        </Link>
        <h2 className="text-xl font-extrabold tracking-tight">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isSignUp ? "Get started with your free aggregator profile." : "Enter your credentials to access your dashboard."}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-yellow-500 animate-pulse" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Password</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2 bg-background/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-foreground text-background font-bold text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <div className="text-center pt-2">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className="text-xs text-muted-foreground hover:text-foreground font-semibold underline underline-offset-4"
        >
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account yet? Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="flex-grow flex items-center justify-center p-4 relative min-h-[80vh] overflow-hidden bg-background">
      {/* Dynamic Background Radial Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-40 select-none">
        <div className="absolute top-[20%] left-[25%] w-[350px] h-[350px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[80px]"></div>
        <div className="absolute bottom-[20%] right-[25%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px]"></div>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-2xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      }>
        <AuthForm />
      </Suspense>
    </div>
  );
}
