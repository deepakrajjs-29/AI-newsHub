"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import NewsCard from "@/features/news/NewsCard";
import NewsSearchFilters from "@/features/news/NewsSearchFilters";
import { ArrowLeft, ArrowRight, Newspaper, Lock, Sparkles, Inbox } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  sourceName: string;
  originalUrl: string;
  featuredImage: string | null;
  publishedAt: Date | string; // Dates can be serialized as string from server components
  category: {
    name: string;
    slug: string;
  } | null;
}

interface NewsPageClientProps {
  initialArticles: Article[];
  categories: CategoryOption[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentQuery: string;
  currentCategory: string;
  currentSort: "asc" | "desc";
  currentTimeFilter: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalAvailable: number | null;
}

export default function NewsPageClient({
  initialArticles,
  categories,
  totalCount,
  totalPages,
  currentPage,
  currentQuery,
  currentCategory,
  currentSort,
  currentTimeFilter,
  hasNextPage,
  hasPrevPage,
  totalAvailable,
}: NewsPageClientProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  // Helper to construct pagination URLs client-side
  const getPaginationUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (currentQuery) params.set("query", currentQuery);
    if (currentCategory) params.set("category", currentCategory);
    if (currentTimeFilter && currentTimeFilter !== "all") params.set("time", currentTimeFilter);
    if (currentSort !== "desc") params.set("sort", currentSort);
    params.set("page", pageNumber.toString());
    return `/news?${params.toString()}`;
  };

  // Format articles publishedAt to Date objects since serialization can convert them to string
  const formattedArticles = initialArticles.map((art) => ({
    ...art,
    publishedAt: new Date(art.publishedAt),
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 1. Authenticated User view
  if (session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
        {/* Header Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            <Newspaper className="h-3.5 w-3.5" />
            <span>News Archive</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Explore <span className="gradient-text">AI Developments</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Browse and filter articles from OpenAI, Anthropic, Google, Hugging Face, and arXiv.
          </p>
        </div>

        {/* Search and Filter Row */}
        <NewsSearchFilters
          categories={categories}
          currentQuery={currentQuery}
          currentCategory={currentCategory}
          currentSort={currentSort}
          currentTimeFilter={currentTimeFilter}
        />

        {formattedArticles.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border bg-card/25 space-y-4">
            <div className="p-3 rounded-full bg-muted text-muted-foreground">
              <Inbox className="h-8 w-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-foreground">No articles match these filters</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {currentTimeFilter === "today"
                  ? "No articles were published in the last 24 hours for this filter."
                  : currentTimeFilter === "week"
                  ? "No articles were published in the last 7 days for this filter."
                  : currentTimeFilter === "month"
                  ? "No articles were published in the last 30 days for this filter."
                  : "We couldn't find any articles matching your search or category filter."}
                {totalAvailable !== null && totalAvailable > 0 && (
                  <>
                    {" "}Browse all <strong className="text-foreground">{totalAvailable.toLocaleString()}</strong> available articles instead.
                  </>
                )}
              </p>
            </div>
            <Link
              href="/news"
              className="px-5 py-2.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
            >
              View All Articles
            </Link>
          </div>
        ) : (
          /* Articles Grid list */
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedArticles.map((article) => (
                <NewsCard key={article.id} article={article as any} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/60 pt-6">
                <span className="text-xs text-muted-foreground">
                  Showing page <strong className="text-foreground">{currentPage}</strong> of{" "}
                  <strong className="text-foreground">{totalPages}</strong> ({totalCount} articles total)
                </span>
                <div className="flex items-center space-x-2">
                  <Link
                    href={hasPrevPage ? getPaginationUrl(currentPage - 1) : "#"}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-xs font-semibold transition ${
                      hasPrevPage
                        ? "hover:bg-muted text-foreground"
                        : "opacity-40 pointer-events-none text-muted-foreground"
                    }`}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </Link>
                  <Link
                    href={hasNextPage ? getPaginationUrl(currentPage + 1) : "#"}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-card text-xs font-semibold transition ${
                      hasNextPage
                        ? "hover:bg-muted text-foreground"
                        : "opacity-40 pointer-events-none text-muted-foreground"
                    }`}
                  >
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 2. Public Visitor View (Gated/Limited Preview)
  // Limit to first 3 articles
  const visitorArticles = formattedArticles.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fade-in">
      {/* Header Info */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold border border-border bg-card px-2.5 py-1 rounded-full select-none">
          <Newspaper className="h-3 w-3 text-indigo-400" />
          <span>Limited Visitor Preview</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Latest AI Developments
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Unlock the complete aggregator feed to follow real-time alerts, detailed summaries, and search by keywords.
        </p>
      </div>

      {/* Articles Grid list (Limited to 3) */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60 filter blur-[0.5px] pointer-events-none select-none">
          {visitorArticles.map((article) => (
            <NewsCard key={article.id} article={article as any} />
          ))}
        </div>

        {/* Fading overlay */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

        {/* Locked Wall Premium CTA */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl shadow-2xl text-center space-y-5 relative">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 blur" />
            
            <div className="relative space-y-5">
              <div className="mx-auto w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-lg text-zinc-100 flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4 text-yellow-500" /> Complete Feed Gated
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Sign in to access the latest AI & Technology News, personalized discovery tools, and the complete platform experience.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  href="/auth?redirect=/news"
                  className="flex-1 py-2 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition shadow-md flex items-center justify-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth?redirect=/news"
                  className="flex-1 py-2 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition flex items-center justify-center"
                >
                  Sign Up (Free)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
