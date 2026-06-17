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
  Clock,
  Layers,
  Calendar,
  Lock,
  ExternalLink,
  Volume2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch actual data from the database to populate all landing page sections dynamically
  const [
    totalArticles,
    totalSources,
    latestArticles,
    startupArticles,
    categories,
  ] = await Promise.all([
    // Real count of active processed/pending articles
    prisma.article.count({ where: { status: { not: "failed" } } }),
    // Real count of active sources
    prisma.source.count({ where: { active: true } }),
    // Latest 3 articles for the "Freshly Brewed Today" showcase
    prisma.article.findMany({
      where: { status: { not: "failed" } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: { select: { name: true, slug: true } } },
    }),
    // Latest 2 articles in the Startups category for the "Startup Radar" showcase
    prisma.article.findMany({
      where: { status: { not: "failed" }, category: { slug: "startups" } },
      orderBy: { publishedAt: "desc" },
      take: 2,
      include: { category: { select: { name: true, slug: true } } },
    }),
    // Categories list for pills
    prisma.category.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-background">
      {/* Background glow meshes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px] dark:bg-indigo-600/5" />
        <div className="absolute top-[20%] left-[5%] w-[450px] h-[450px] rounded-full bg-purple-600/3 blur-[100px] dark:bg-purple-600/3" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(hsl(var(--foreground))_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* ─────────────────────────── HERO SECTION ─────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Copywriting */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/40 text-[10px] sm:text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span className="font-semibold text-indigo-500">Core Aggregator Online</span>
            <span className="text-border">·</span>
            <Clock className="h-3 w-3" />
            <span>Updated hourly</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            AI & Tech Intelligence{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Real-time feed aggregation from 16 industry-leading sources.
            Deduplicated, classified into 9 categories, and summarized using
            advanced AI. Get the raw engineering signal, save hours of reading time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 hover:scale-[1.01] transition duration-200"
            >
              Start Ingesting News
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/30 backdrop-blur-sm font-semibold text-sm hover:bg-muted/30 transition duration-200"
            >
              Access Dashboard
            </Link>
          </div>
        </div>

        {/* Right Side: Animated SVG Holographic Signal Core */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-[350px] aspect-square rounded-2xl border border-border bg-card/30 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg">
            {/* Spinning background orbital rings */}
            <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-indigo-500/10 animate-[spin_60s_linear_infinite]" />
            <div className="absolute w-[60%] h-[60%] rounded-full border border-dashed border-purple-500/10 animate-[spin_30s_linear_infinite_reverse]" />

            {/* Glowing Core */}
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.15)] z-10">
              <Cpu className="h-10 w-10 text-indigo-400 animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-sm animate-ping" />
            </div>

            {/* Floating Tags (representing incoming RSS signals) */}
            <div className="absolute inset-x-0 bottom-4 top-0 pointer-events-none overflow-hidden z-20 flex flex-col justify-end items-center">
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float-up-tag-1 {
                  0% { transform: translateY(60px) scale(0.8); opacity: 0; }
                  20% { opacity: 0.8; }
                  85% { opacity: 0.8; }
                  100% { transform: translateY(-220px) scale(1.05); opacity: 0; }
                }
                .floating-tag-1 { animation: float-up-tag-1 7s infinite linear; }
                .floating-tag-2 { animation: float-up-tag-1 8.5s infinite linear 2s; }
                .floating-tag-3 { animation: float-up-tag-1 6s infinite linear 3.8s; }
                .floating-tag-4 { animation: float-up-tag-1 9s infinite linear 5.5s; }
              `}} />
              
              <span className="floating-tag-1 absolute text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-950/60 text-indigo-300">#openai</span>
              <span className="floating-tag-2 absolute text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-950/60 text-purple-300">#arxiv-feed</span>
              <span className="floating-tag-3 absolute text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-950/60 text-blue-300">#huggingface</span>
              <span className="floating-tag-4 absolute text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-950/60 text-emerald-300">#startup-funding</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── TIMEFRAMES OF INTELLIGENCE ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Timeframes of Intelligence</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            We summarize noise at three distinct intervals so you always get immediate signal and historical context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Today */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">What Changed Today</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Real-time ingestion updates. Access hourly summaries of product releases, tech logs, and announcements as they go live.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-semibold text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Hourly RSS checks</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Executive 100-word summaries</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Week */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">What Changed This Week</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Weekly digests compiling research breakthroughs, framework launches, and major corporate funding benchmarks.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-semibold text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Weekly trend compilation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Cross-feed duplicate removal</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Month */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">What Changed This Month</h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Monthly macroeconomic summaries identifying technology shifts, consolidations, and strategic engineering trajectories.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-semibold text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Category telemetry breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>In-depth 300-word analysis</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─────────────────── CORE PILLARS OF SIGNAL FEED ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Core Pillars of Platform Signal Feed</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            We parse, classify, and isolate feeds into three primary channels that drive tech intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Cpu className="h-4.5 w-4.5" />
                <span>AI & ML Research</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                arXiv preprints, Hugging Face models, OpenAI updates, and Anthropic API logs. Focuses on foundational research and API shifts.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 text-[11px] font-mono leading-relaxed text-muted-foreground">
              <span className="text-indigo-400 font-bold block mb-1">RECENT SIGNAL</span>
              Gemini 1.5 Pro updates expand native context to 2.0M tokens.
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Globe className="h-4.5 w-4.5" />
                <span>Developer Tools & Cloud</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Infrastructure logs, cybersecurity vulnerabilities, cloud releases (AWS/Nvidia), and framework updates. Focuses on developer velocity.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 text-[11px] font-mono leading-relaxed text-muted-foreground">
              <span className="text-purple-400 font-bold block mb-1">RECENT SIGNAL</span>
              AWS releases SDK integration enhancements for serverless workers.
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                <BarChart3 className="h-4.5 w-4.5" />
                <span>Startups & Markets</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Venture capital investments, acquisitions, mergers, and product announcements. Focuses on tech ecosystem movement.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-background/50 border border-border/50 text-[11px] font-mono leading-relaxed text-muted-foreground">
              <span className="text-pink-400 font-bold block mb-1">RECENT SIGNAL</span>
              AI hardware startup secures $120M Series A for edge deployment computing.
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── LIVE SHOWCASE: DASHBOARD GRID ───────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
            Dynamic Platform Showcase
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Live Ingested Signals</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            A real-time snapshot of the actual articles and statistics currently stored in our local database.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: News Streams & Benchmarks (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Stream 1: Freshly Ingested Today */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs border-b border-border/50 pb-3">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <Rss className="h-4.5 w-4.5 text-indigo-500" /> Ingested Signals Stream
                </h3>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Latest DB Ingests
                </span>
              </div>
              
              <div className="space-y-3">
                {latestArticles.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No articles available. Run RSS ingestion to fetch.</p>
                ) : (
                  latestArticles.map((art) => (
                    <div key={art.id} className="flex gap-3 text-xs leading-relaxed group">
                      <span className="px-2 py-0.5 h-fit text-[9px] font-bold uppercase rounded bg-muted/65 text-indigo-400 shrink-0 border border-indigo-500/10">
                        {art.category?.name || "News"}
                      </span>
                      <div className="space-y-1">
                        <Link href={`/news/${art.slug}`} className="font-semibold text-foreground hover:text-indigo-400 transition line-clamp-1">
                          {art.title}
                        </Link>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{art.summary}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stream 2: Benchmark Matrix */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between text-xs border-b border-border/50 pb-3">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-purple-500" /> LLM Benchmarks Reference
                </h3>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  June 2026 Model Weights
                </span>
              </div>
              
              <table className="w-full text-left border-collapse text-xs font-medium">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2 pr-4">Model</th>
                    <th className="py-2 px-4">MMLU</th>
                    <th className="py-2 px-4">Context</th>
                    <th className="py-2 pl-4 text-right">Strategic Feature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-muted-foreground">
                  <tr className="hover:bg-muted/5">
                    <td className="py-2.5 pr-4 font-bold text-foreground">GPT-4o</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-bold">88.7%</td>
                    <td className="py-2.5 px-4 font-mono">128k</td>
                    <td className="py-2.5 pl-4 text-right">Advanced vision & latency</td>
                  </tr>
                  <tr className="hover:bg-muted/5">
                    <td className="py-2.5 pr-4 font-bold text-foreground">Claude 3.5 Sonnet</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-bold">88.7%</td>
                    <td className="py-2.5 px-4 font-mono">200k</td>
                    <td className="py-2.5 pl-4 text-right">Superb coding logic</td>
                  </tr>
                  <tr className="hover:bg-muted/5">
                    <td className="py-2.5 pr-4 font-bold text-foreground">Gemini 1.5 Pro</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-bold">85.9%</td>
                    <td className="py-2.5 px-4 font-mono">2.0M</td>
                    <td className="py-2.5 pl-4 text-right">Huge needle-in-a-haystack</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: Database Pulse, Tech categories & Startup signals (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Widget 1: Ingest Metrics (Pulse) */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-pink-500" /> Database Pulse Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Articles Count</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">{totalArticles.toLocaleString()}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Crawl Sources</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">{totalSources}</span>
                </div>
              </div>
            </div>

            {/* Widget 2: Trending Categories Radar */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <Globe className="h-4.5 w-4.5 text-emerald-500" /> Signal Categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/news?category=${cat.slug}`}
                    className="px-2.5 py-1 rounded bg-muted/65 hover:bg-muted text-[10px] font-semibold text-muted-foreground hover:text-foreground transition duration-200 border border-border/40"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Widget 3: Startup Radar */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm space-y-4 shadow-sm">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-yellow-500" /> Startup Funding Radar
              </h3>
              <div className="space-y-3">
                {startupArticles.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    No startup specific articles processed yet. Startup signals populate here dynamically when available.
                  </p>
                ) : (
                  startupArticles.map((art) => (
                    <div key={art.id} className="text-xs leading-relaxed space-y-0.5 border-l-2 border-indigo-500/20 pl-3">
                      <Link href={`/news/${art.slug}`} className="font-bold text-foreground hover:text-indigo-400 block line-clamp-1">
                        {art.title}
                      </Link>
                      <span className="text-[10px] text-muted-foreground">{art.sourceName}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── PRICING SECTIONS ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50 text-center space-y-12">
        <div className="space-y-3 max-w-3xl mx-auto">
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
            Subscription
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Flexible Plans for Tech Professionals</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            All basic feed readers are free. Upgrade to unlock deep research summaries, custom feeds tracking, and interactive chat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* FREE PLAN */}
          <div className="p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm flex flex-col justify-between hover:border-foreground/10 transition-colors duration-200 shadow-sm">
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold tracking-tight text-foreground">Free Aggregator</h3>
                <p className="text-xs text-muted-foreground">Monitor essential AI feeds and bookmark highlights.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold">$0</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>
              <ul className="space-y-3 pt-4 border-t border-border/60 text-xs font-semibold text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">Hourly feed ingestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">100-word summaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">Advanced categorization & search</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  <span className="line-through decoration-border/60">300-word detailed research reviews</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  <span className="line-through decoration-border/60">AI Voice Audiobook narration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  <span className="line-through decoration-border/60">Interactive AI Chat Assistant</span>
                </li>
              </ul>
            </div>
            <Link
              href="/news"
              className="w-full mt-8 py-3 rounded-xl border border-border bg-muted/20 font-bold text-xs text-center text-muted-foreground hover:bg-muted/30 transition"
            >
              Browse News
            </Link>
          </div>

          {/* PRO PLAN */}
          <div className="p-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.01] dark:bg-indigo-950/[0.01] backdrop-blur-sm flex flex-col justify-between relative shadow-lg ring-1 ring-indigo-500/20">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-foreground text-background text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="h-3 w-3 text-yellow-500" /> RECOMMENDED
            </div>
            
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold tracking-tight text-foreground">Hub Pro</h3>
                <p className="text-xs text-muted-foreground">For researchers, builders, and AI investors.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-extrabold">$9.99</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>
              
              <ul className="space-y-3 pt-4 border-t border-indigo-500/10 text-xs font-semibold text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">Everything in Free plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">Detailed 300-word summaries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">Custom Private RSS Feeds monitoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">AI Voice Audiobook Narration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">Interactive AI Research Assistant chat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">One-click exports (Notion / PDF)</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pricing"
              className="w-full mt-8 py-3 rounded-xl bg-foreground text-background text-center font-bold text-xs hover:opacity-90 transition shadow-md block"
            >
              Upgrade / Test Pro (Sandbox)
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────── FINAL CTA BANNER ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/30 p-10 sm:p-16 shadow-lg backdrop-blur-sm">
          {/* Inner glow */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-indigo-600/5 blur-[80px]" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/50 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              <span>No credit card required to explore</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto">
              The AI & Tech landscape is{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                shifting today.
              </span>
            </h2>
            
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Stay ahead. Aggregate from 16 high-quality sources, view digests, and query AI summaries instantly.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/news"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/20 hover:scale-[1.01] transition duration-200"
              >
                Start Ingesting Now
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
