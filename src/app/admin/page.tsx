"use client";

import { useEffect, useState, startTransition } from "react";
import { supabase } from "../../lib/supabase";
import {
  Cpu,
  RefreshCw,
  LogOut,
  Sliders,
  FileText,
  FileSpreadsheet,
  Globe,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Database,
  Search,
  Edit,
  Save,
  Clock,
  Sparkles
} from "lucide-react";

type ActiveTab = "overview" | "sources" | "articles" | "logs" | "settings";

export default function AdminDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Dashboard data state
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Source form state
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newSourceCategory, setNewSourceCategory] = useState("News");
  const [newSourceActive, setNewSourceActive] = useState(true);
  const [sourceSubmitLoading, setSourceSubmitLoading] = useState(false);

  // Edit Article modal state
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [editSummary, setEditSummary] = useState("");
  const [editSummaryLong, setEditSummaryLong] = useState("");
  const [articleSubmitLoading, setArticleSubmitLoading] = useState(false);

  // Settings state
  const [settingsInputs, setSettingsInputs] = useState<Record<string, string>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Check current session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user && session.user.email) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email);
        setSessionToken(session.access_token);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user && session.user.email) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email);
        setSessionToken(session.access_token);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
        setSessionToken(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Dashboard data when sessionToken is set
  useEffect(() => {
    if (sessionToken) {
      fetchDashboardData();
    }
  }, [sessionToken]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data", {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to load dashboard data");
      }
      setData(result);
      
      // Load current settings values to inputs
      const settingsMap: Record<string, string> = {};
      result.settings.forEach((s: any) => {
        settingsMap[s.key] = s.value;
      });
      setSettingsInputs(settingsMap);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("Forbidden")) {
        // Authenticated but not an admin -> sign out
        await supabase.auth.signOut();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) throw authErr;
      
      if (authData.session) {
        setIsAuthenticated(true);
        setUserEmail(authData.session.user.email ?? "");
        setSessionToken(authData.session.access_token);
      }
    } catch (err: any) {
      setAuthError(err.message || "Invalid login credentials");
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserEmail(null);
    setSessionToken(null);
    setData(null);
  };

  const triggerManualRefresh = async () => {
    if (!sessionToken) return;
    setRefreshing(true);
    setSuccessMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Manual refresh trigger failed");
      }
      setSuccessMsg(`Refresh Completed! Ingested: ${result.report.articlesSaved}, Processed: ${result.report.articlesProcessed}`);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Mutations
  const executeMutation = async (action: string, payload: any) => {
    if (!sessionToken) return;
    try {
      const res = await fetch("/api/admin/mutate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ action, payload }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Operation failed");
      }
      setSuccessMsg("Changes saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchDashboardData();
      return result;
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setSourceSubmitLoading(true);
    const success = await executeMutation("createSource", {
      name: newSourceName,
      rssUrl: newSourceUrl,
      category: newSourceCategory,
      active: newSourceActive,
    });
    setSourceSubmitLoading(false);
    if (success) {
      setNewSourceName("");
      setNewSourceUrl("");
      setNewSourceCategory("News");
      setNewSourceActive(true);
    }
  };

  const handleToggleSource = async (sourceId: string, currentActive: boolean) => {
    await executeMutation("toggleSource", {
      id: sourceId,
      active: !currentActive,
    });
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (confirm("Are you sure you want to delete this RSS source?")) {
      await executeMutation("deleteSource", { id: sourceId });
    }
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    setEditSummary(article.summary || "");
    setEditSummaryLong(article.summaryLong || "");
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setArticleSubmitLoading(true);
    const success = await executeMutation("updateArticle", {
      id: editingArticle.id,
      summary: editSummary,
      summaryLong: editSummaryLong,
    });
    setArticleSubmitLoading(false);
    if (success) {
      setEditingArticle(null);
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      await executeMutation("deleteArticle", { id: articleId });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    await executeMutation("saveSettings", { settings: settingsInputs });
    setSettingsLoading(false);
  };

  if (!isAuthenticated) {
    /* Sign in form overlay */
    return (
      <div className="flex-1 flex items-center justify-center p-4 relative bg-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] pointer-events-none opacity-25 select-none">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-purple-500/10 blur-[80px]"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px]"></div>
        </div>

        <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-lg relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-max mb-2">
              <img src="/logo.png" alt="AI News Hub" className="h-10 w-auto object-contain dark:brightness-110" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with your admin credentials to manage feeds & articles.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ainewshub.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {authLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
      {/* Admin Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Logged in as: <span className="font-semibold text-foreground">{userEmail}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerManualRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Fetching..." : "Manual Fetch"}
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>

      {/* Message Notifications banner */}
      {successMsg && (
        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list navigation */}
      <div className="flex border-b border-border text-sm overflow-x-auto">
        {(["overview", "sources", "articles", "logs", "settings"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-semibold capitalize border-b-2 transition whitespace-nowrap ${
              activeTab === tab
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        /* Loading Skeleton */
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      ) : !data ? (
        <div className="text-center py-12 text-muted-foreground">No dashboard data found.</div>
      ) : (
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Articles</span>
                <p className="text-3xl font-extrabold">{data.stats.totalArticles}</p>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-semibold">Processed (AI)</span>
                <p className="text-3xl font-extrabold text-emerald-500">{data.stats.processedArticles}</p>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending AI Queue</span>
                <p className="text-3xl font-extrabold text-yellow-500">{data.stats.pendingArticles}</p>
              </div>
              <div className="p-5 rounded-xl border border-border bg-card space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active RSS Feeds</span>
                <p className="text-3xl font-extrabold">{data.stats.activeSources} / {data.stats.totalSources}</p>
              </div>
            </div>
          )}

          {/* SOURCES CONFIG TAB */}
          {activeTab === "sources" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add New source form */}
              <div className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h3 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-1.5">
                  <Plus className="h-4.5 w-4.5" /> Add New RSS Source
                </h3>
                <form onSubmit={handleAddSource} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Source Name</label>
                    <input
                      type="text"
                      required
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      placeholder="Google DeepMind Blog"
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">RSS Feed URL</label>
                    <input
                      type="url"
                      required
                      value={newSourceUrl}
                      onChange={(e) => setNewSourceUrl(e.target.value)}
                      placeholder="https://example.com/feed.xml"
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Default Category</label>
                    <select
                      value={newSourceCategory}
                      onChange={(e) => setNewSourceCategory(e.target.value)}
                      className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1"
                    >
                      <option value="News">News</option>
                      <option value="Research">Research</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Status</label>
                    <button
                      type="button"
                      onClick={() => setNewSourceActive(!newSourceActive)}
                      className="text-foreground hover:opacity-85 focus:outline-none"
                    >
                      {newSourceActive ? <ToggleRight className="h-7 w-7 text-emerald-500" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={sourceSubmitLoading}
                    className="w-full py-2 bg-foreground text-background font-semibold text-xs rounded-lg hover:opacity-90 transition"
                  >
                    {sourceSubmitLoading ? "Saving..." : "Add Source"}
                  </button>
                </form>
              </div>

              {/* RSS Sources Table */}
              <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {data.sources.map((src: any) => (
                      <tr key={src.id} className="hover:bg-muted/10">
                        <td className="px-4 py-3.5 space-y-1">
                          <p className="font-semibold text-foreground">{src.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">{src.rssUrl}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary text-secondary-foreground">
                            {src.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => handleToggleSource(src.id, src.active)}>
                            {src.active ? (
                              <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold text-xs">
                                <CheckCircle className="h-3.5 w-3.5" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-muted-foreground font-semibold text-xs">
                                <XCircle className="h-3.5 w-3.5" /> Inactive
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteSource(src.id)}
                            className="p-1 text-muted-foreground hover:text-destructive transition-colors duration-200"
                            aria-label="Delete source"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ARTICLES MANAGEMENT TAB */}
          {activeTab === "articles" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Title & Source</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Published At</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {data.articles.map((art: any) => (
                      <tr key={art.id} className="hover:bg-muted/10">
                        <td className="px-4 py-3.5 space-y-0.5">
                          <p className="font-semibold text-foreground line-clamp-1 max-w-[400px]">{art.title}</p>
                          <p className="text-xs text-muted-foreground">{art.sourceName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              art.status === "processed"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : art.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {new Date(art.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditArticle(art)}
                            className="p-1.5 rounded bg-muted hover:bg-muted/80 text-foreground"
                            aria-label="Edit summaries"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="p-1.5 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive"
                            aria-label="Delete article"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edit Summary Modal Overlay */}
              {editingArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                  <div className="w-full max-w-2xl p-6 rounded-xl border border-border bg-card shadow-lg flex flex-col space-y-4 animate-fade-in max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h3 className="font-bold text-lg flex items-center gap-1">
                        <Edit className="h-4.5 w-4.5 text-indigo-500" /> Edit Article AI Summaries
                      </h3>
                      <button
                        onClick={() => setEditingArticle(null)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveArticle} className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Article Title</p>
                        <p className="text-sm font-semibold border-l-2 border-indigo-500 pl-2 text-foreground">
                          {editingArticle.title}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Short Summary (100 words max)</label>
                        <textarea
                          rows={3}
                          required
                          value={editSummary}
                          onChange={(e) => setEditSummary(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Long Summary (300 words max)</label>
                        <textarea
                          rows={6}
                          required
                          value={editSummaryLong}
                          onChange={(e) => setEditSummaryLong(e.target.value)}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground font-mono text-xs leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingArticle(null)}
                          className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={articleSubmitLoading}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-foreground text-background text-xs font-semibold rounded-lg hover:opacity-90"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {articleSubmitLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CRON LOGS TAB */}
          {activeTab === "logs" && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Job Name</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {data.logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/5">
                      <td className="px-4 py-3 font-semibold text-foreground">{log.jobName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            log.status === "success"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {(log.durationMs / 1000).toFixed(2)}s
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-sm line-clamp-1 truncate" title={log.message}>
                        {log.message}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SYSTEM SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="max-w-2xl p-6 rounded-xl border border-border bg-card">
              <h3 className="font-bold text-lg border-b border-border pb-3 flex items-center gap-1.5 mb-6">
                <Sliders className="h-5 w-5 text-indigo-500" /> System Configurations
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {Object.keys(settingsInputs).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsInputs[key]}
                      onChange={(e) =>
                        setSettingsInputs({ ...settingsInputs, [key]: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-foreground font-mono"
                    />
                  </div>
                ))}
                
                <div className="flex items-center gap-2.5 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-600 text-xs">
                  <AlertCircle className="h-4.5 w-4.5" />
                  <span>Be careful modifying the cron secret or database parameters as it might break existing scheduling runners.</span>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="inline-flex items-center gap-1 px-5 py-2.5 bg-foreground text-background text-xs font-bold rounded-lg hover:opacity-90"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {settingsLoading ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
