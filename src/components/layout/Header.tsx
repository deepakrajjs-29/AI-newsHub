"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "../common/ThemeToggle";
import { supabase } from "../../lib/supabase";
import { Cpu, Menu, X, LogOut, Sparkles } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.access_token);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All News", href: "/news" },
    { name: "Pricing", href: "/pricing" },
  ];

  if (session) {
    // Add Dashboard if logged in
    navLinks.splice(2, 0, { name: "Dashboard", href: "/dashboard" });
    // Add Admin if admin role
    if (profile?.role === "admin") {
      navLinks.push({ name: "Admin", href: "/admin" });
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full glassmorphism border-b border-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-foreground font-bold text-xl tracking-tight">
              <div className="p-1.5 rounded-lg bg-foreground text-background">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="font-extrabold">AI News Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-foreground font-bold border-b-2 border-foreground pb-1 -mb-[18px]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Tools */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {session ? (
              <div className="flex items-center gap-3">
                {profile?.tier === "pro" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500 ring-1 ring-indigo-500/20">
                    <Sparkles className="h-3 w-3 text-yellow-500" /> PRO
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90 transition shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? "bg-muted text-foreground font-bold"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-2 border-t border-border mt-2 px-3 flex items-center justify-between">
            {session ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm font-semibold transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center inline-flex items-center justify-center px-4 py-2 rounded-lg bg-foreground text-background text-sm font-bold hover:opacity-90 transition shadow-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
