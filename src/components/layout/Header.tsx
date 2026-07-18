"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "../common/ThemeToggle";
import { supabase } from "../../lib/supabase";
import { Menu, X, LogOut, Sparkles, Zap } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.access_token);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.access_token);
      else setProfile(null);
    });

    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.profile) setProfile(data.profile);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All News", href: "/news" },
  ];

  if (session) {
    navLinks.splice(2, 0, { name: "Dashboard", href: "/dashboard" });
    if (profile?.role === "admin") navLinks.push({ name: "Admin", href: "/admin" });
  }

  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth")
  ) return null;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "glassmorphism shadow-lg shadow-black/5"
          : "bg-background/80 backdrop-blur-md"
      } border-b border-border/60`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group" aria-label="AI News Hub Home">
              <img
                src="/logo.png"
                alt="AI News Hub"
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {session ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-500">
                  <Sparkles className="h-3 w-3" />
                  <span>Pro</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-red-500/20 bg-red-500/8 text-red-500 hover:bg-red-500/15 text-xs font-bold transition-all duration-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="px-4 py-1.5 rounded-full border border-border text-xs font-semibold hover:bg-muted/60 transition-all duration-200 text-muted-foreground"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth"
                  className="btn-primary text-xs py-1.5 px-4 rounded-full"
                >
                  <Zap className="h-3 w-3" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur-xl px-4 pt-3 pb-5 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive(link.href)
                  ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-border/40 mt-3">
            {session ? (
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/8 text-red-500 text-sm font-bold transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn-primary justify-center text-sm py-2.5 rounded-xl"
              >
                <Zap className="h-4 w-4" />
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
