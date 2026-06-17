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
  AlertCircle
} from "lucide-react";
import Link from "next/link";

type Tab = "overview" | "bookmarks" | "feeds" | "billing" | "profile";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [customSources, setCustomSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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
    if (!session || profile?.tier !== "pro") return;
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

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[70vh]">
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
    <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6 bg-background">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">User Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Manage your saved articles, configurations, and subscription.
          </p>
        </div>
        
        {profile && (
          <div className="flex items-center gap-3">
            {profile.tier === "pro" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-xs font-bold ring-1 ring-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Pro Subscriber
              </span>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90 transition"
              >
                Upgrade to Pro
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm overflow-x-auto">
        {([
          { id: "overview", label: "Overview", icon: Cpu },
          { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
          { id: "feeds", label: "Custom Feeds", icon: Globe },
          { id: "billing", label: "Billing", icon: CreditCard },
          { id: "profile", label: "Account Settings", icon: User }
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-semibold capitalize border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="p-6 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg">
                  {(profile?.fullName || profile?.email || "?")[0].toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-base">{profile?.fullName || "Hub Member"}</h3>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bookmarks</span>
                  <p className="text-2xl font-extrabold">{bookmarks.length}</p>
                </div>
                <div className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Private Feeds</span>
                  <p className="text-2xl font-extrabold">{customSources.length}</p>
                </div>
              </div>
            </div>

            {/* Reading Breakdown Card */}
            <div className="p-6 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderHeart className="h-4.5 w-4.5 text-indigo-500" /> Topic Breakdown
              </h3>
              {bookmarks.length === 0 ? (
                <p className="text-xs text-muted-foreground pt-4">Bookmark articles to see category analysis stats.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(catStats).map(([cat, count]) => {
                    const percentage = Math.round((count / bookmarks.length) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{cat}</span>
                          <span className="text-muted-foreground">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground"
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
        )}

        {/* BOOKMARKS PANEL */}
        {activeTab === "bookmarks" && (
          <div className="space-y-4">
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-border rounded-xl text-muted-foreground space-y-2">
                <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm">You haven't bookmarked any articles yet.</p>
                <Link href="/news" className="inline-block text-xs font-semibold underline underline-offset-4 text-foreground">
                  Browse AI News
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((b) => (
                  <div key={b.id} className="p-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex flex-col justify-between hover:border-foreground/15 transition shadow-sm relative group">
                    <button
                      onClick={() => handleRemoveBookmark(b.articleId)}
                      className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-destructive transition-colors duration-200"
                      aria-label="Delete bookmark"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="space-y-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                        {b.article?.category?.name || "News"}
                      </span>
                      <h4 className="font-extrabold text-sm text-foreground line-clamp-2 pr-6">
                        {b.article?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {b.article?.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-4 text-[10px] text-muted-foreground">
                      <span>{b.article?.sourceName}</span>
                      <Link
                        href={`/news/${b.article?.slug}`}
                        className="font-bold hover:text-foreground text-xs"
                      >
                        Read Summary &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CUSTOM FEEDS PANEL */}
        {activeTab === "feeds" && (
          <div>
            {profile?.tier !== "pro" ? (
              /* Lock State overlay */
              <div className="p-8 text-center border border-indigo-500/20 bg-indigo-500/[0.01] dark:bg-indigo-950/[0.01] rounded-2xl space-y-6 max-w-xl mx-auto ring-1 ring-indigo-500/20 shadow-xl relative">
                <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold">Custom RSS Feeds Monitoring</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Personalized RSS integration is a premium feature. Upgrade to the Pro plan to add your own private RSS tracking feeds and monitor them with AI summaries.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-block px-5 py-2.5 rounded-lg bg-foreground text-background font-bold text-xs hover:opacity-90 shadow-md"
                >
                  Upgrade to Pro
                </Link>
              </div>
            ) : (
              /* Active custom sources management */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl border border-border bg-card/60 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Plus className="h-4.5 w-4.5" /> Register RSS Feed
                  </h3>
                  {sourceError && (
                    <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" />
                      <span>{sourceError}</span>
                    </div>
                  )}
                  <form onSubmit={handleAddSource} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Feed Name</label>
                      <input
                        type="text"
                        required
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value)}
                        placeholder="My Favorite Research Blog"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">RSS feed URL</label>
                      <input
                        type="url"
                        required
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://example.com/feed.xml"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Default Category</label>
                      <select
                        value={sourceCategory}
                        onChange={(e) => setSourceCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1"
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
                      className="w-full py-2 bg-foreground text-background font-bold text-xs rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                      {sourceLoading ? "Saving Feed..." : "Add Private Source"}
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 border border-border rounded-xl bg-card/60 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-4 py-3">Feed Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {customSources.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                            No custom sources registered yet. Add one in the form.
                          </td>
                        </tr>
                      ) : (
                        customSources.map((src) => (
                          <tr key={src.id} className="hover:bg-muted/5">
                            <td className="px-4 py-3.5">
                              <p className="font-semibold">{src.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">{src.rssUrl}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground">
                                {src.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteSource(src.id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors duration-200"
                                aria-label="Delete custom source"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BILLING PANEL */}
        {activeTab === "billing" && (
          <div className="max-w-xl p-6 border border-border bg-card/60 rounded-xl space-y-6 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-1.5">
              <CreditCard className="h-5 w-5 text-indigo-500" /> Subscription Billing details
            </h3>
            
            <div className="p-4 rounded-xl border border-border flex items-center justify-between bg-background">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Plan</p>
                <p className="text-lg font-extrabold capitalize">{profile?.tier} Membership</p>
              </div>
              <div>
                {profile?.tier === "pro" ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-indigo-500/10 text-indigo-500 text-xs font-bold ring-1 ring-indigo-500/20">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded bg-muted text-muted-foreground text-xs font-bold">
                    Free Tier
                  </span>
                )}
              </div>
            </div>

            {profile?.tier === "pro" ? (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Your billing period updates monthly. To cancel your membership, click below. This will instantly return your profile to the Free tier.
                </p>
                <button
                  onClick={handleDowngrade}
                  className="px-4 py-2 border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-semibold rounded-lg transition"
                >
                  Cancel Pro Subscription
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Unlock detailed 300-word summaries, AI Narration player, Notion export option, custom feeds monitor, and interactive chat.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-5 py-2.5 rounded-lg bg-foreground text-background text-xs font-bold hover:opacity-90 shadow-md"
                >
                  View Subscription Options
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT PROFILE SETTINGS */}
        {activeTab === "profile" && (
          <div className="max-w-xl p-6 border border-border bg-card/60 rounded-xl space-y-6 shadow-sm">
            <h3 className="font-bold text-base flex items-center gap-1.5">
              <Settings className="h-5 w-5 text-indigo-500" /> Account Settings
            </h3>
            
            {profileSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-lg">
                {profileSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaveLoading}
                  className="px-5 py-2 bg-foreground text-background font-bold text-xs rounded-lg hover:opacity-90 transition"
                >
                  {profileSaveLoading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
