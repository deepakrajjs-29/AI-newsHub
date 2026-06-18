"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthGate({ children, fallback }: AuthGateProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (session) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default professional locked screen
  return (
    <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-2xl text-center space-y-6 animate-fade-in relative z-10">
      <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
        <Lock className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold tracking-tight">Access Locked</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sign in to access the latest AI & Technology News, personalized discovery tools, and the complete platform experience.
        </p>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <Link
          href={`/auth?redirect=${pathname}`}
          className="w-full py-2.5 rounded-lg bg-foreground text-background font-bold text-sm hover:opacity-90 transition flex items-center justify-center shadow-md"
        >
          Sign In
        </Link>
        <Link
          href={`/auth?redirect=${pathname}`}
          className="w-full py-2.5 rounded-lg border border-border bg-card hover:bg-muted font-semibold text-sm transition flex items-center justify-center"
        >
          Create Account (Free)
        </Link>
      </div>
    </div>
  );
}
