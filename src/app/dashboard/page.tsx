"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
  User,
  Bookmark,
  Sparkles,
  CreditCard,
  Plus,
  Trash2,
  Lock,
  Cpu,
  RefreshCw,
  FolderHeart,
  Globe,
  Settings,
  AlertCircle,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Music,
  Search,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
} from "lucide-react";
import Link from "next/link";
import { useAudio } from "@/lib/AudioContext";


type Tab = "overview" | "bookmarks" | "feeds" | "profile" | "music";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [customSources, setCustomSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Background Music state
  const {
    isPlaying,
    currentTrack,
    currentTrackIndex,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    togglePlay,
    nextTrack,
    prevTrack,
    playTrack,
    tracks
  } = useAudio();
  const [searchQuery, setSearchQuery] = useState("");

  // Profile Edit Form State
  const [fullName, setFullName] = useState("");
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Custom Source Form State
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceCategory, setSourceCategory] = useState("News");
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/auth?redirect=/dashboard");
      } else {
        loadDashboardData(session.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/auth?redirect=/dashboard");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loadDashboardData = async (token: string) => {
    setLoading(true);
    try {
      // Fetch Profile
      const profileRes = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.profile) {
        setProfile(profileData.profile);
        setFullName(profileData.profile.fullName || "");
      }

      // Fetch Bookmarks
      const bookmarksRes = await fetch("/api/user/bookmarks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookmarksData = await bookmarksRes.json();
      if (bookmarksRes.ok && bookmarksData.bookmarks) {
        setBookmarks(bookmarksData.bookmarks);
      }

      // Fetch Custom Sources
      const sourcesRes = await fetch("/api/user/sources", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sourcesData = await sourcesRes.json();
      if (sourcesRes.ok && sourcesData.sources) {
        setCustomSources(sourcesData.sources);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setProfileSaveLoading(true);
    setProfileSuccessMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ fullName })
      });
      if (res.ok) {
        setProfileSuccessMsg("Profile updated successfully!");
        setProfile({ ...profile, fullName });
        setTimeout(() => setProfileSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaveLoading(false);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !profile) return;
    setSourceLoading(true);
    setSourceError(null);

    try {
      const res = await fetch("/api/user/sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ name: sourceName, rssUrl: sourceUrl, category: sourceCategory })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save feed source.");
      }

      setCustomSources([data.source, ...customSources]);
      setSourceName("");
      setSourceUrl("");
      setSourceCategory("News");
    } catch (err: any) {
      setSourceError(err.message);
    } finally {
      setSourceLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!session || !confirm("Are you sure you want to delete this custom RSS source?")) return;
    try {
      const res = await fetch(`/api/user/sources?sourceId=${sourceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        setCustomSources(customSources.filter(s => s.id !== sourceId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveBookmark = async (articleId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/user/bookmarks?articleId=${articleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (res.ok) {
        setBookmarks(bookmarks.filter(b => b.articleId !== articleId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDowngrade = async () => {
    if (!session || !confirm("Are you sure you want to cancel your Pro plan subscription?")) return;
    try {
      const res = await fetch("/api/user/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: "downgrade" })
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({ ...profile, tier: data.tier });
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

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[70vh] bg-background">
        <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
      </div>
    );
  }

  // Calculate bookmark category stats
  const catStats: Record<string, number> = {};
  bookmarks.forEach(b => {
    const cat = b.article?.category?.name || "General";
    catStats[cat] = (catStats[cat] || 0) + 1;
  });

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden relative">
      
      {/* MOBILE TOP NAVIGATION BAR */}
      <div className="md:hidden w-full absolute top-0 left-0 h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-4 z-40">
        <Link href="/" className="flex items-center space-x-2 text-foreground font-bold text-lg">
          <div className="p-1 rounded-md bg-foreground text-background">
            <Cpu className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold">AI News Hub</span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label="Toggle Menu"
        >
          {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* LEFT NAVIGATION SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card/40 backdrop-blur-md flex flex-col justify-between p-4 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-foreground font-bold text-lg">
              <div className="p-1.5 rounded-lg bg-foreground text-background shrink-0">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <span className="font-extrabold">AI News Hub</span>
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1 text-muted-foreground hover:text-foreground"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Pages Group */}
          <nav className="space-y-1">
            <span className="px-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Workspace
            </span>
            {[
              { id: "overview", label: "Brewing Room", icon: Cpu },
              { id: "bookmarks", label: "Personal Vault", icon: Bookmark },
              { id: "feeds", label: "Custom Feeds", icon: Globe },
              { id: "music", label: "Music Lounge", icon: Music }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as Tab);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition duration-200 border ${
                    activeTab === tab.id
                      ? "bg-foreground/5 text-foreground border-foreground/10"
                      : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/15"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
            
            {/* Direct Link to News Feed */}
            <Link
              href="/news"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/15 transition border border-transparent"
            >
              <Globe className="h-4 w-4" />
              <span>News Archive</span>
            </Link>
          </nav>

          {/* Account settings group */}
          <nav className="space-y-1">
            <span className="px-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Settings & Account
            </span>
            {[
              { id: "profile", label: "Account Settings", icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as Tab);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition duration-200 border ${
                    activeTab === tab.id
                      ? "bg-foreground/5 text-foreground border-foreground/10"
                      : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/15"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}

            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/15 transition border border-transparent"
              >
                <Settings className="h-4 w-4" />
                <span>Admin Command</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Sidebar Footer User profile Card */}
        <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-foreground/10 text-foreground flex items-center justify-center font-bold text-xs shrink-0 select-none">
              {(profile?.fullName || profile?.email || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate leading-tight">
                {profile?.fullName || "Hub Member"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate leading-none mt-0.5 font-mono">
                {profile?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative pt-16 md:pt-0 bg-background">
        
        {/* Workspace Top Header Bar */}
        <header className="h-16 border-b border-border bg-card/25 backdrop-blur-sm flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-bold capitalize select-none">
              Dashboard / {activeTab === "overview" ? "Brewing Room" : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-500 font-bold text-[10px] sm:text-xs">Core Aggregator Active</span>
            </div>

            {profile && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded border border-indigo-500/10 bg-indigo-500/5 text-indigo-400 capitalize">
                {profile.tier} tier
              </span>
            )}
          </div>
        </header>

        {/* Panel Window Container */}
        <div className="flex-grow p-6 max-w-5xl w-full mx-auto space-y-6">
          
          {/* ────────────────── OVERVIEW TAB PANEL ────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Brewing Room</h2>
                <p className="text-xs text-muted-foreground">
                  Get a metrics overview of your bookmarks and active integration status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards Column */}
                <div className="md:col-span-2 space-y-6">
                  {/* Greetings profile card */}
                  <div className="p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-foreground/10 text-foreground flex items-center justify-center font-bold text-lg select-none">
                      {(profile?.fullName || profile?.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-base">Welcome Back, {profile?.fullName || "Hub Member"}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{profile?.email}</p>
                    </div>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-2 shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Bookmarks</span>
                      <p className="text-2xl font-black text-foreground">{bookmarks.length}</p>
                    </div>
                    <div className="p-5 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-2 shadow-sm">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Custom RSS Feeds</span>
                      <p className="text-2xl font-black text-foreground">{customSources.length}</p>
                    </div>
                  </div>
                </div>

                {/* Topic breakdown chart */}
                <div className="p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <FolderHeart className="h-4.5 w-4.5 text-indigo-500" /> Topic Distribution
                    </h3>
                    <p className="text-[10px] text-muted-foreground">Percentage of topics bookmarked</p>
                  </div>

                  {bookmarks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      No bookmarks saved yet.
                    </div>
                  ) : (
                    <div className="space-y-3 pt-4 border-t border-border/40">
                      {Object.entries(catStats).map(([cat, count]) => {
                        const percentage = Math.round((count / bookmarks.length) * 100);
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="truncate max-w-[140px]">{cat}</span>
                              <span className="text-muted-foreground">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Your Cup is Empty State (if bookmarks are empty) */}
              {bookmarks.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-2xl bg-card/10 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground">
                    <Bookmark className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h4 className="font-bold text-sm">Your Personal Vault is Empty</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You haven't bookmarked any AI summaries yet. Start exploring the news archive and save articles to populate your dashboard analysis.
                    </p>
                  </div>
                  <Link
                    href="/news"
                    className="px-4 py-2 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition"
                  >
                    Browse News Archive
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ────────────────── BOOKMARKS TAB PANEL ────────────────── */}
          {activeTab === "bookmarks" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Personal Vault</h2>
                <p className="text-xs text-muted-foreground">Browse and review your saved article summaries.</p>
              </div>

              {bookmarks.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card/10 space-y-4">
                  <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/30" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">No bookmarks saved</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Bookmark articles on the news lists to store summaries here for quick access.
                    </p>
                  </div>
                  <Link
                    href="/news"
                    className="inline-block px-4 py-2 bg-foreground text-background font-bold text-xs rounded-xl hover:opacity-95"
                  >
                    Browse AI News
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl border border-border bg-card/45 backdrop-blur-sm flex flex-col justify-between hover:border-foreground/10 transition relative group shadow-sm"
                    >
                      {/* Delete bookmark button */}
                      <button
                        onClick={() => handleRemoveBookmark(b.articleId)}
                        className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-destructive transition-colors duration-200"
                        title="Remove Bookmark"
                        aria-label="Remove Bookmark"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      <div className="space-y-2.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground shrink-0 w-fit block uppercase">
                          {b.article?.category?.name || "News"}
                        </span>
                        <h4 className="font-extrabold text-sm text-foreground line-clamp-2 pr-6">
                          {b.article?.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {b.article?.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-4 text-[10px] text-muted-foreground font-semibold">
                        <span>{b.article?.sourceName}</span>
                        <Link
                          href={`/news/${b.article?.slug}`}
                          className="font-bold hover:text-indigo-400 transition"
                        >
                          View Summary &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ────────────────── CUSTOM FEEDS TAB PANEL ────────────────── */}
          {activeTab === "feeds" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Custom RSS Feeds</h2>
                <p className="text-xs text-muted-foreground">Monitor custom private RSS channels with automated AI summaries.</p>
              </div>

              {/* Active feed sources layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Form registration */}
                  <div className="p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-4 shadow-sm h-fit">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <PlusCircle className="h-4.5 w-4.5 text-indigo-500" /> Ingest RSS Feed
                    </h3>
                    {sourceError && (
                      <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5 font-semibold">
                        <AlertCircle className="h-4 w-4" />
                        <span>{sourceError}</span>
                      </div>
                    )}
                    <form onSubmit={handleAddSource} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Feed Title</label>
                        <input
                          type="text"
                          required
                          value={sourceName}
                          onChange={(e) => setSourceName(e.target.value)}
                          placeholder="My Custom Dev Feed"
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">RSS feed URL</label>
                        <input
                          type="url"
                          required
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          placeholder="https://example.com/feed.xml"
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Default Category</label>
                        <select
                          value={sourceCategory}
                          onChange={(e) => setSourceCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1"
                        >
                          <option value="News">News</option>
                          <option value="Research">Research</option>
                          <option value="Engineering">Engineering</option>
                          <option value="Community">Community</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={sourceLoading}
                        className="w-full py-2.5 bg-foreground text-background font-bold text-xs rounded-xl hover:opacity-90 transition disabled:opacity-50"
                      >
                        {sourceLoading ? "Saving Feed..." : "Add Private Source"}
                      </button>
                    </form>
                  </div>

                  {/* Registered feeds list table */}
                  <div className="lg:col-span-2 border border-border rounded-2xl bg-card/45 backdrop-blur-sm overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/40 text-[9px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                          <th className="px-4 py-3">Feed Info</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-muted-foreground">
                        {customSources.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-12 text-xs">
                              No custom sources configured. Ingest your first channel above.
                            </td>
                          </tr>
                        ) : (
                          customSources.map((src) => (
                            <tr key={src.id} className="hover:bg-muted/5">
                              <td className="px-4 py-3.5">
                                <p className="font-semibold text-foreground">{src.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono line-clamp-1 max-w-[280px]">{src.rssUrl}</p>
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground uppercase">
                                  {src.category}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-right">
                                <button
                                  onClick={() => handleDeleteSource(src.id)}
                                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors duration-200"
                                  title="Delete Custom Feed"
                                  aria-label="Delete Custom Feed"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          {/* ────────────────── ACCOUNT SETTINGS TAB PANEL ────────────────── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Account Settings</h2>
                <p className="text-xs text-muted-foreground">Update your display settings and display name.</p>
              </div>

              <div className="max-w-xl p-6 border border-border bg-card/45 backdrop-blur-sm rounded-2xl space-y-6 shadow-sm">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 select-none">
                  <Settings className="h-4.5 w-4.5 text-indigo-500" /> Profile Details
                </h3>
                
                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-xl animate-fade-in">
                    {profileSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email || ""}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-xl text-xs text-muted-foreground cursor-not-allowed font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="My display name"
                      className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>

                  <div className="pt-4 border-t border-border/50 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaveLoading}
                      className="px-5 py-2 bg-foreground text-background font-bold text-xs rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                      {profileSaveLoading ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ────────────────── MUSIC LOUNGE TAB PANEL ────────────────── */}
          {activeTab === "music" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold tracking-tight">Music Lounge</h2>
                <p className="text-xs text-muted-foreground">
                  Select and control calming ambient background music to focus while reading or browsing.
                </p>
              </div>

              {/* Master Controls Section */}
              <div className="p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative group shrink-0 select-none">
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur group-hover:opacity-30 transition duration-300" />
                    <div className="relative w-16 h-16 rounded-2xl bg-background flex items-center justify-center border border-border">
                      {isPlaying ? (
                        <div className="flex items-end justify-between h-6 w-8 px-1.5 pb-0.5">
                          <span className="audio-wave-bar" />
                          <span className="audio-wave-bar" />
                          <span className="audio-wave-bar" />
                          <span className="audio-wave-bar" />
                        </div>
                      ) : (
                        <Music className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Currently Playing</span>
                    <h3 className="text-base font-extrabold text-foreground truncate mt-0.5">{currentTrack?.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{currentTrack?.artist} • {currentTrack?.category}</p>
                  </div>
                </div>

                {/* Player actions */}
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                  {/* Playback Control Bar */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevTrack}
                      className="p-2 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/30 transition"
                      title="Previous Track"
                    >
                      <SkipBack className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="p-3.5 rounded-full bg-indigo-500 text-white hover:bg-indigo-400 hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-indigo-500/20"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="h-4.5 w-4.5 fill-current" />
                      ) : (
                        <Play className="h-4.5 w-4.5 fill-current translate-x-[0.5px]" />
                      )}
                    </button>
                    <button
                      onClick={nextTrack}
                      className="p-2 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/30 transition"
                      title="Next Track"
                    >
                      <SkipForward className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Volume Control Bar */}
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border bg-background/50">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-muted-foreground hover:text-foreground transition"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-4.5 w-4.5 text-rose-400" />
                      ) : (
                        <Volume2 className="h-4.5 w-4.5 text-indigo-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        if (isMuted) setIsMuted(false);
                      }}
                      className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Track Search & Library Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-muted-foreground select-none">
                    Track Library
                  </h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search tracks or genres..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tracks
                    .filter(t => 
                      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.artist.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((track, idx) => {
                      const isActive = currentTrackIndex === idx;
                      const isCurrentPlaying = isActive && isPlaying;

                      return (
                        <div
                          key={track.url}
                          onClick={() => playTrack(idx)}
                          className={`p-5 rounded-2xl border cursor-pointer hover-card-bounce transition-all duration-300 relative group overflow-hidden ${
                            isActive
                              ? 'bg-indigo-500/[0.03] border-indigo-500/35'
                              : 'bg-card/45 border-border hover:border-zinc-700/80'
                          }`}
                        >
                          {/* Decorative track gradient background */}
                          <div className={`absolute -inset-2.5 bg-gradient-to-tr opacity-[0.02] transition-opacity group-hover:opacity-[0.06] duration-500 ${
                            idx % 3 === 0
                              ? 'from-indigo-500 to-purple-500'
                              : idx % 3 === 1
                              ? 'from-emerald-500 to-teal-500'
                              : 'from-pink-500 to-indigo-500'
                          }`} />

                          <div className="relative flex flex-col h-full justify-between gap-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  isActive ? 'bg-indigo-500/10 text-indigo-400' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {track.category}
                                </span>
                                <h4 className="font-extrabold text-sm text-foreground truncate mt-2 max-w-[180px]">
                                  {track.title}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">
                                  {track.artist}
                                </p>
                              </div>
                              
                              {/* Round status indicator button */}
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                isActive
                                  ? 'bg-indigo-500/15 text-indigo-400 scale-105'
                                  : 'bg-background border border-border text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                              }`}>
                                {isCurrentPlaying ? (
                                  <Pause className="h-3.5 w-3.5 fill-current" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 fill-current translate-x-[0.5px]" />
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold pt-3 border-t border-border/40">
                              <span>{track.duration} min</span>
                              {isActive && (
                                <span className="text-indigo-400 font-bold flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                                  {isCurrentPlaying ? 'Playing' : 'Selected'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {tracks.filter(t => 
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="col-span-full py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                      No tracks found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
