import Link from "next/link";
import { prisma } from "../lib/prisma";
import { checkAndRunIngestionIfNeeded } from "../services/ingestRunner";
import {
  ArrowRight,
  Cpu,
  Sparkles,
  Zap,
  Globe,
  Shield,
  BarChart3,
  Rss,
  Clock,
  Layers,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Trigger background news ingestion refresh if needed (hourly check)
  await checkAndRunIngestionIfNeeded();

  const [
    totalArticles,
    totalSources,
    latestArticles,
    startupArticles,
  ] = await Promise.all([
    prisma.article.count({ where: { status: { not: "failed" } } }),
    prisma.source.count({ where: { active: true } }),
    prisma.article.findMany({
      where: { status: { not: "failed" } },
      orderBy: { publishedAt: "desc" },
      take: 4,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: { not: "failed" }, category: { slug: "startups" } },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: { select: { name: true, slug: true } } },
    }),
  ]);

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-background text-foreground">
      
      {/* ANIMATION STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 80px; }
        }
        .perspective-container {
          perspective: 280px;
          perspective-origin: 50% 30%;
        }
        .grid-mesh {
          width: 300%;
          height: 180%;
          top: -20%;
          left: -100%;
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: rotateX(65deg);
          animation: grid-move 14s linear infinite;
        }
        @keyframes drift-particle {
          0%   { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-280px) translateX(25px) scale(1.1); opacity: 0; }
        }
        .drift-p-1 { animation: drift-particle 9s infinite linear; }
        .drift-p-2 { animation: drift-particle 12s infinite linear 2.5s; }
        .drift-p-3 { animation: drift-particle 10s infinite linear 5s; }
        .drift-p-4 { animation: drift-particle 14s infinite linear 7.5s; }

        @keyframes slow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .glow-orb {
          animation: slow-pulse 6s ease-in-out infinite;
        }
      `}} />

      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20 pb-12">
        
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_80%)] z-10" />
          <div className="perspective-container absolute inset-0 w-full h-full">
            <div className="grid-mesh absolute" />
          </div>
          <div className="glow-orb absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/8 blur-[100px]" />
          <div className="glow-orb absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-500/5 blur-[60px]" />
          
          {/* Drifting particles */}
          <span className="drift-p-1 absolute w-1.5 h-1.5 rounded-full bg-indigo-400/60 left-[18%] bottom-[12%]" />
          <span className="drift-p-2 absolute w-1 h-1 rounded-full bg-purple-400/50 left-[48%] bottom-[18%]" />
          <span className="drift-p-3 absolute w-1.5 h-1.5 rounded-full bg-pink-400/40 left-[72%] bottom-[8%]" />
          <span className="drift-p-4 absolute w-1 h-1 rounded-full bg-indigo-300/50 left-[62%] bottom-[30%]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-7">
          
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/60 text-[10px] font-semibold tracking-wider text-muted-foreground shadow-sm backdrop-blur-sm select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>LIVE — {totalArticles.toLocaleString()} articles indexed</span>
            <span className="text-border">·</span>
            <Clock className="h-3 w-3 text-indigo-400" />
            <span>Updated hourly</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.05] max-w-3xl mx-auto">
            The AI news that{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              actually matters.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {totalSources} trusted RSS sources. Deduplicated, summarized by Gemini AI, and delivered in clean signal — no noise.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold text-sm shadow-md hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
            >
              Browse Latest News
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card/50 backdrop-blur-sm font-semibold text-sm hover:bg-muted/40 transition-all duration-200"
            >
              My Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────── CATEGORY PILLS ─────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-12 border-b border-border/30 relative z-10 reveal-on-scroll">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          Browse by category
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { name: "AI", slug: "artificial-intelligence", icon: Cpu },
            { name: "Machine Learning", slug: "machine-learning", icon: Zap },
            { name: "Generative AI", slug: "generative-ai", icon: Sparkles },
            { name: "Cloud", slug: "cloud-computing", icon: Globe },
            { name: "Security", slug: "cybersecurity", icon: Shield },
            { name: "Dev Tools", slug: "developer-tools", icon: Layers },
            { name: "Startups", slug: "startups", icon: TrendingUp },
            { name: "Data Science", slug: "data-science", icon: BarChart3 },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/news?category=${cat.slug}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border/60 bg-card/40 hover:bg-indigo-500/8 hover:border-indigo-500/30 hover:text-indigo-400 text-muted-foreground transition-all duration-200 text-xs font-medium"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─────────────────── LIVE FEED SHOWCASE ─────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Latest Articles Stream */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-sm space-y-4 shadow-sm reveal-on-scroll">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Rss className="h-4 w-4 text-indigo-400" />
                  Latest Ingested Articles
                </h2>
                <Link
                  href="/news"
                  className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {latestArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <Rss className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">No articles yet. Feed ingestion running hourly.</p>
                  </div>
                ) : (
                  latestArticles.map((art) => (
                    <div key={art.id} className="flex gap-3 text-xs leading-relaxed group">
                      <span className="px-2 py-0.5 h-fit text-[9px] font-bold uppercase rounded-md bg-indigo-500/8 text-indigo-400 shrink-0 border border-indigo-500/15 mt-0.5">
                        {art.category?.name || "News"}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <Link href={`/news/${art.slug}`} className="font-semibold text-foreground hover:text-indigo-400 transition line-clamp-1 block">
                          {art.title}
                        </Link>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{art.summary}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Stats + Startup Feed */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Database Stats */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm space-y-4 shadow-sm reveal-on-scroll">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-pink-400" />
                Platform Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-background/60 border border-border/50 text-left">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">Articles</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">{totalArticles.toLocaleString()}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-background/60 border border-border/50 text-left">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-0.5">Sources</span>
                  <span className="text-2xl font-black text-foreground tracking-tight">{totalSources}</span>
                </div>
              </div>
            </div>

            {/* Startup Feed */}
            <div className="p-5 rounded-2xl border border-border bg-card/50 backdrop-blur-sm space-y-4 shadow-sm reveal-on-scroll">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                Startup Signals
              </h3>
              <div className="space-y-3">
                {startupArticles.length === 0 ? (
                  <div className="text-center py-4">
                    <TrendingUp className="h-7 w-7 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[11px] text-muted-foreground">
                      Startup articles populate here automatically as they are ingested.
                    </p>
                  </div>
                ) : (
                  startupArticles.map((art) => (
                    <div key={art.id} className="text-xs leading-relaxed space-y-0.5 border-l-2 border-indigo-500/20 pl-3 text-left">
                      <Link href={`/news/${art.slug}`} className="font-semibold text-foreground hover:text-indigo-400 transition block line-clamp-2">
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

    </div>
  );
}
