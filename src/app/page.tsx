import Link from "next/link";
import { prisma } from "../lib/prisma";
import NewsCard from "../features/news/NewsCard";
import {
  ArrowRight,
  Cpu,
  Sparkles,
  Zap,
  Search,
  Globe,
  Shield,
  BarChart3,
  Rss,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Lightweight fetch — only what the landing page needs
  const [totalArticles, totalSources, previewArticles, trendingArticles] =
    await Promise.all([
      prisma.article.count({ where: { status: { not: "failed" } } }),
      prisma.source.count({ where: { active: true } }),
      // Latest 3 articles for "Latest Updates" preview
      prisma.article.findMany({
        where: { status: { not: "failed" } },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: { category: { select: { name: true, slug: true } } },
      }),
      // Top 3 trending (most bookmarked)
      prisma.article.findMany({
        where: { status: { not: "failed" } },
        orderBy: [{ bookmarks: { _count: "desc" } }, { publishedAt: "desc" }],
        take: 3,
        include: { category: { select: { name: true, slug: true } } },
      }),
    ]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    { label: "Articles Aggregated", value: `${totalArticles.toLocaleString()}+`, icon: Layers },
    { label: "Active RSS Sources", value: `${totalSources}`, icon: Rss },
    { label: "Tech Categories", value: "9", icon: BarChart3 },
    { label: "Refresh Interval", value: "30 min", icon: Clock },
  ];

  // ── Features ───────────────────────────────────────────────────────────────
  const features = [
    {
      icon: Rss,
      title: "Real-Time RSS Aggregation",
      description:
        "Pulls from OpenAI, Anthropic, Google, Hugging Face, AWS, NVIDIA, TechCrunch, Wired and more — every 30 minutes.",
      accent: "from-orange-500 to-amber-500",
      glow: "group-hover:shadow-orange-500/10",
    },
    {
      icon: Cpu,
      title: "AI-Powered Summaries",
      description:
        "Every article is automatically summarized by Gemini AI. Get the key insight without reading thousands of words.",
      accent: "from-indigo-500 to-blue-500",
      glow: "group-hover:shadow-indigo-500/10",
    },
    {
      icon: Search,
      title: "Full-Text Search",
      description:
        "Search across titles, summaries, tags, source names, and categories to find exactly what you need instantly.",
      accent: "from-blue-500 to-cyan-500",
      glow: "group-hover:shadow-blue-500/10",
    },
    {
      icon: BarChart3,
      title: "Smart Categorization",
      description:
        "AI classifies every article into one of 9 categories: AI, ML, Generative AI, Cloud, Cybersecurity, Dev Tools, Startups, Data Science, and Technology.",
      accent: "from-emerald-500 to-teal-500",
      glow: "group-hover:shadow-emerald-500/10",
    },
    {
      icon: Globe,
      title: "Multi-Source Coverage",
      description:
        "From research papers and product launches to funding rounds and security advisories — the full AI & tech ecosystem in one place.",
      accent: "from-purple-500 to-violet-500",
      glow: "group-hover:shadow-purple-500/10",
    },
    {
      icon: Shield,
      title: "Duplicate Detection",
      description:
        "Smart similarity-based deduplication ensures you never see the same story twice, even when covered by multiple outlets.",
      accent: "from-rose-500 to-pink-500",
      glow: "group-hover:shadow-rose-500/10",
    },
  ];

  // ── Why choose ─────────────────────────────────────────────────────────────
  const reasons = [
    "No social media noise or opinion pieces",
    "Only verified RSS sources from industry leaders",
    "AI summaries save hours of reading time",
    "9 focused categories with date-based filtering",
    "Search across 1,500+ aggregated articles",
    "Automatic updates every 30 minutes",
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* ─────────────────────────── HERO ─────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Layered background glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-indigo-600/8 blur-[140px]" />
          <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] rounded-full bg-purple-600/6 blur-[120px]" />
          <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-600/6 blur-[100px]" />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(hsl(var(--foreground))_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 text-xs text-muted-foreground mb-8 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-emerald-500">Live</span>
            <span className="text-border">·</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Powered by Gemini AI · Updated every 30 minutes</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-foreground leading-[1.05] mb-6 max-w-5xl mx-auto">
            Your{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI & Tech
              </span>
            </span>{" "}
            News Command Center
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Real-time aggregation from the world&apos;s top AI and technology
            sources. AI-summarized, categorized, and fully searchable — all in
            one focused platform.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link
              href="/news"
              id="hero-explore-btn"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Explore All News
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/admin"
              id="hero-dashboard-btn"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-card/50 backdrop-blur-sm font-semibold text-sm hover:bg-muted/50 hover:border-border/80 transition-all duration-200"
            >
              View Dashboard
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-4 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm"
              >
                <stat.icon className="h-4 w-4 text-muted-foreground mb-2" />
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 text-center leading-tight">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade into next section */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"
        />
      </section>

      {/* ──────────────────── LATEST UPDATES PREVIEW ─────────────────────── */}
      {previewArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
                <Zap className="h-3.5 w-3.5 fill-indigo-400/30" />
                Latest Updates
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Fresh from the feeds
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                A glimpse of what&apos;s happening right now in AI & Tech.
              </p>
            </div>
            <Link
              href="/news"
              id="preview-viewall-btn"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              View all {totalArticles.toLocaleString()}+ articles
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {previewArticles.map((article) => (
              <NewsCard key={article.id} article={article as any} />
            ))}
          </div>

          {/* Mobile "view all" */}
          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              View all {totalArticles.toLocaleString()}+ articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* ───────────────────────── FEATURES ──────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Section background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-purple-600/5 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-4">
              <Cpu className="h-3.5 w-3.5" />
              Platform Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                stay ahead
              </span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Built to surface the signal, not the noise. One focused platform
              for the AI and tech ecosystem.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative p-6 rounded-2xl border border-border bg-card hover:bg-muted/20 hover:border-border/80 transition-all duration-300 shadow-sm hover:shadow-xl ${feature.glow}`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${feature.accent} mb-4 shadow-sm`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── WHY CHOOSE + TRENDING ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Why choose */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-4">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Why This Platform
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
              Signal over noise,{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                always.
              </span>
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The AI and technology news space is crowded, noisy, and
              fragmented. This platform aggregates, filters, and summarizes the
              content that actually matters.
            </p>
            <ul className="space-y-3">
              {reasons.map((reason) => (
                <li key={reason} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/news"
                id="why-explore-btn"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-all duration-200"
              >
                Start Exploring
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/news?category=artificial-intelligence"
                id="why-ai-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card font-semibold text-sm hover:bg-muted/40 transition-colors duration-200"
              >
                Browse AI News
              </Link>
            </div>
          </div>

          {/* Right: Trending stories teaser */}
          {trendingArticles.length > 0 && (
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-4">
                <TrendingUp className="h-3.5 w-3.5" />
                Trending Stories
              </div>
              <h3 className="text-xl font-bold mb-5">
                What people are reading
              </h3>
              <div className="space-y-3">
                {trendingArticles.map((article, idx) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 hover:border-border/80 transition-all duration-200 group"
                  >
                    {/* Rank number */}
                    <span className="text-2xl font-black text-muted-foreground/30 tabular-nums leading-none mt-0.5 select-none min-w-[1.5rem]">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      {article.category && (
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                          {article.category.name}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-foreground line-clamp-2 mt-0.5 group-hover:text-muted-foreground transition-colors">
                        {article.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {article.sourceName}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
              <Link
                href="/news"
                id="trending-more-btn"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
              >
                Discover more trending stories
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ──────────────────── FINAL CTA BANNER ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 sm:p-16 text-center shadow-xl">
          {/* Inner glow */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-indigo-600/8 blur-[80px]" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/50 text-xs text-muted-foreground mb-6">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Free to explore · No sign-up required
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-5 max-w-3xl mx-auto">
              The future of AI & Tech is{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                happening now.
              </span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of developers, researchers, and founders who use
              this platform to stay ahead of AI and tech developments.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/news"
                id="cta-final-explore-btn"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Start Exploring Now
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/news?category=artificial-intelligence"
                id="cta-final-ai-btn"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-border bg-background/50 font-bold text-sm hover:bg-muted/40 transition-colors duration-200"
              >
                Browse AI News
              </Link>
            </div>

            {/* Category pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {[
                { label: "Artificial Intelligence", slug: "artificial-intelligence" },
                { label: "Machine Learning", slug: "machine-learning" },
                { label: "Generative AI", slug: "generative-ai" },
                { label: "Cloud Computing", slug: "cloud-computing" },
                { label: "Cybersecurity", slug: "cybersecurity" },
                { label: "Developer Tools", slug: "developer-tools" },
                { label: "Startups", slug: "startups" },
                { label: "Data Science", slug: "data-science" },
                { label: "Technology", slug: "technology" },
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/news?category=${cat.slug}`}
                  className="px-3 py-1 rounded-full text-[11px] font-medium border border-border bg-card hover:bg-muted hover:border-border/80 transition-all duration-200 text-muted-foreground hover:text-foreground"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
