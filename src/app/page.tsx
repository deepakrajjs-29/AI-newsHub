import Link from "next/link";
import { prisma } from "../lib/prisma";
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
  Calendar,
  Lock,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real metrics from the database
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
      take: 3,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.article.findMany({
      where: { status: { not: "failed" }, category: { slug: "startups" } },
      orderBy: { publishedAt: "desc" },
      take: 2,
      include: { category: { select: { name: true, slug: true } } },
    }),
  ]);

  return (
    <div className="relative overflow-x-hidden min-h-screen bg-background text-foreground">
      
      {/* CSS STYLES FOR CORE ANIMATIONS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 3D perspective floor grid movement */
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 0 80px; }
        }
        .perspective-container {
          perspective: 260px;
          perspective-origin: 50% 30%;
        }
        .grid-mesh {
          width: 300%;
          height: 180%;
          top: -20%;
          left: -100%;
          background-image: 
            linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: rotateX(65deg);
          animation: grid-move 12s linear infinite;
        }

        /* Drifting particle flows */
        @keyframes drift-particle {
          0% { transform: translateY(0) translateX(0) scale(0.8); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-300px) translateX(30px) scale(1.1); opacity: 0; }
        }
        .drift-p-1 { animation: drift-particle 8s infinite linear; }
        .drift-p-2 { animation: drift-particle 11s infinite linear 2s; }
        .drift-p-3 { animation: drift-particle 9s infinite linear 4.5s; }
        .drift-p-4 { animation: drift-particle 13s infinite linear 7s; }

        /* Sinusoidal category wave bouncing */
        @keyframes wave-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .wave-bounce-item {
          animation: wave-bounce 4s ease-in-out infinite;
        }
      `}} />

      {/* ─────────────────────────── HERO SECTION ─────────────────────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-24 pb-16">
        
        {/* Animated Perspective 3D Grid Canvas Background */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--background)_80%)] z-10" />
          <div className="perspective-container absolute inset-0 w-full h-full">
            <div className="grid-mesh absolute" />
          </div>
          
          {/* Glowing orbital backdrops */}
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px]" />
          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-purple-500/5 blur-[60px]" />
          
          {/* Drifting background stars/particles */}
          <span className="drift-p-1 absolute w-1.5 h-1.5 rounded-full bg-indigo-400 left-[20%] bottom-[10%]" />
          <span className="drift-p-2 absolute w-1 h-1 rounded-full bg-purple-400 left-[45%] bottom-[15%]" />
          <span className="drift-p-3 absolute w-2 h-2 rounded-full bg-pink-400 left-[75%] bottom-[8%]" />
          <span className="drift-p-4 absolute w-1 h-1 rounded-full bg-indigo-300 left-[60%] bottom-[25%]" />
        </div>

        {/* Copywriting Area */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          
          {/* Core Online Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/60 text-[10px] sm:text-xs font-semibold tracking-wider text-muted-foreground shadow-sm backdrop-blur-sm select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            <span>REAL-TIME AGGREGATOR ACTIVE</span>
            <span className="text-border">·</span>
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>16 CHANNELS LIVE</span>
          </div>

          {/* Centered Large Headline */}
          <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-foreground leading-[1.05] max-w-3xl mx-auto">
            Aggregated Signal.{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Ingested Live.
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Your AI and technology command center. 16 feeds aggregated, deduplicated, and summarized by Gemini AI — simplified into clean signal.
          </p>

          {/* Centered CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/news"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-bold text-xs shadow-md hover:scale-[1.01] transition duration-200"
            >
              Start Exploring
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card/40 backdrop-blur-sm font-semibold text-xs hover:bg-muted/40 transition duration-200"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────── SINUSOIDAL CATEGORY WAVE ─────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-border/40 relative z-10 overflow-hidden select-none reveal-on-scroll">
        
        {/* Sinusoidal Wave categories container */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-10">
          {[
            { name: "AI", slug: "artificial-intelligence", icon: Cpu, delay: "0s" },
            { name: "ML", slug: "machine-learning", icon: Zap, delay: "0.4s" },
            { name: "GenAI", slug: "generative-ai", icon: Sparkles, delay: "0.8s" },
            { name: "Cloud", slug: "cloud-computing", icon: Globe, delay: "1.2s" },
            { name: "Security", slug: "cybersecurity", icon: Shield, delay: "1.6s" },
            { name: "DevTools", slug: "developer-tools", icon: Layers, delay: "2.0s" },
            { name: "Startups", slug: "startups", icon: TrendingUp, delay: "2.4s" },
            { name: "DataSci", slug: "data-science", icon: BarChart3, delay: "2.8s" },
            { name: "Tech", slug: "technology", icon: Clock, delay: "3.2s" }
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/news?category=${cat.slug}`}
                style={{ animationDelay: cat.delay }}
                className="wave-bounce-item flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-indigo-500/10 bg-indigo-500/[0.02] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 text-center shrink-0 shadow-sm relative group"
              >
                <Icon className="h-4.5 w-4.5 text-indigo-400 mb-1 group-hover:scale-110 transition" />
                <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground transition leading-none">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────────────── PLATFORM SHOWCASE: DYNAMIC GRIDS ───────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-16 border-t border-border/40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Ingest Stream & Benchmarks (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real Dynamic Signals Stream */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-4 shadow-sm reveal-on-scroll">
              <div className="flex items-center justify-between text-xs border-b border-border/40 pb-3">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <Rss className="h-4.5 w-4.5 text-indigo-400" /> Ingested Signals Stream
                </h3>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Live DB Feed
                </span>
              </div>
              
              <div className="space-y-3">
                {latestArticles.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No articles processed. Crawl feeds to load.</p>
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

            {/* Model Benchmarks Matrix */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-4 shadow-sm overflow-x-auto reveal-on-scroll">
              <div className="flex items-center justify-between text-xs border-b border-border/40 pb-3">
                <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-purple-400" /> LLM Benchmarks Reference
                </h3>
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Frontier Weights
                </span>
              </div>
              
              <table className="w-full text-left border-collapse text-xs font-medium">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
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
                    <td className="py-2.5 px-4 font-mono text-[11px]">128k</td>
                    <td className="py-2.5 pl-4 text-right">Advanced vision & latency</td>
                  </tr>
                  <tr className="hover:bg-muted/5">
                    <td className="py-2.5 pr-4 font-bold text-foreground">Claude 3.5 Sonnet</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-bold">88.7%</td>
                    <td className="py-2.5 px-4 font-mono text-[11px]">200k</td>
                    <td className="py-2.5 pl-4 text-right">Superb coding logic</td>
                  </tr>
                  <tr className="hover:bg-muted/5">
                    <td className="py-2.5 pr-4 font-bold text-foreground">Gemini 1.5 Pro</td>
                    <td className="py-2.5 px-4 text-indigo-400 font-bold">85.9%</td>
                    <td className="py-2.5 px-4 font-mono text-[11px]">2.0M</td>
                    <td className="py-2.5 pl-4 text-right">Massive context needle</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN: Database Pulse & Startups (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Database Pulse Stats */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-4 shadow-sm reveal-on-scroll">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-pink-400" /> Database Pulse Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Articles Count</span>
                  <span className="text-xl font-black text-foreground tracking-tight">{totalArticles.toLocaleString()}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-background/50 border border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Active Sources</span>
                  <span className="text-xl font-black text-foreground tracking-tight">{totalSources}</span>
                </div>
              </div>
            </div>

            {/* Startup Funding Signals */}
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-card/45 backdrop-blur-sm space-y-4 shadow-sm reveal-on-scroll">
              <h3 className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-yellow-500" /> Startup Ingestion Feed
              </h3>
              <div className="space-y-3">
                {startupArticles.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Startup signals populate here dynamically when startup category articles are ingested into the database.
                  </p>
                ) : (
                  startupArticles.map((art) => (
                    <div key={art.id} className="text-xs leading-relaxed space-y-0.5 border-l-2 border-indigo-500/25 pl-3 text-left">
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

      {/* ───────────────────────── PRICING PLANS ───────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-border/40 relative z-10 text-center space-y-12">
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Flexible Plans</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Basic aggregator is free forever. Upgrade to customize RSS sources and unlock deep analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch text-left">
          {/* Free Tier */}
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card/45 hover-card-bounce backdrop-blur-sm flex flex-col justify-between transition shadow-sm reveal-on-scroll">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-foreground">Free Aggregator</h3>
                <p className="text-[11px] text-muted-foreground">Monitor essential AI feeds and bookmark updates.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold">$0</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>
              <ul className="space-y-2.5 pt-4 border-t border-border/40 text-xs font-semibold text-muted-foreground">
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
                  <span className="text-foreground">9 category routing & search</span>
                </li>
              </ul>
            </div>
            <Link
              href="/news"
              className="w-full mt-6 py-2.5 rounded-xl border border-border bg-muted/20 font-bold text-xs text-center text-muted-foreground hover:bg-muted/30 transition block"
            >
              Browse Feed
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-6 sm:p-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.01] dark:bg-indigo-950/[0.01] hover-card-bounce backdrop-blur-sm flex flex-col justify-between relative shadow-md ring-1 ring-indigo-500/20 reveal-on-scroll">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-foreground text-background text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" /> RECOMMENDED
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-foreground">Hub Pro</h3>
                <p className="text-[11px] text-muted-foreground">For builders, researchers, and tech analysts.</p>
              </div>
              <div className="flex items-baseline">
                <span className="text-3xl font-extrabold">$9.99</span>
                <span className="text-xs text-muted-foreground ml-1">/ month</span>
              </div>
              
              <ul className="space-y-2.5 pt-4 border-t border-indigo-500/10 text-xs font-semibold text-muted-foreground">
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
                  <span className="text-foreground">AI Audiobook Voice Reader</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground">Interactive AI Research Assistant chat</span>
                </li>
              </ul>
            </div>

            <Link
              href="/pricing"
              className="w-full mt-6 py-2.5 rounded-xl bg-foreground text-background text-center font-bold text-xs hover:opacity-95 transition shadow-sm block"
            >
              Simulate Pro Upgrade (Sandbox)
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}

// Reuse CheckCircle2 for comparative checklist rendering
function CheckCircle2({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
