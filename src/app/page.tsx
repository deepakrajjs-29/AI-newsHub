import Link from "next/link";
import { prisma } from "../lib/prisma";
import NewsCard from "../features/news/NewsCard";
import { ArrowRight, Cpu, BookOpen, Sparkles, Newspaper, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // 1. Fetch categories
  const categories = await prisma.category.findMany({
    take: 6,
  });

  // 2. Fetch the latest processed article to use as the Featured Highlight
  const featuredArticle = await prisma.article.findFirst({
    where: { status: "processed" },
    orderBy: { publishedAt: "desc" },
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  // 3. Fetch the next 6 latest articles
  const latestArticles = await prisma.article.findMany({
    where: {
      status: "processed",
      id: {
        not: featuredArticle?.id || "",
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 6,
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  // 4. Fetch the latest 3 research papers / updates (category slug = 'research')
  const researchArticles = await prisma.article.findMany({
    where: {
      status: "processed",
      category: {
        slug: "research",
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  const isEmpty = !featuredArticle && latestArticles.length === 0;

  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Background Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none opacity-30 select-none">
        <div className="absolute top-[-10%] left-[10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px] sm:blur-[120px]"></div>
        <div className="absolute top-[5%] right-[10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[70px] sm:blur-[100px]"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/60 text-xs text-muted-foreground mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
          <span>Intelligent RSS Aggregation & Summarization</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1] mb-6">
          Stay Ahead of the <span className="bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent">AI Revolution</span>
        </h1>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          Aggregating verified news, research papers, and technical blogs from top industry sources. Summarized instantly with GPT-4o.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-foreground text-background font-semibold text-sm hover:opacity-95 transition-opacity duration-200"
          >
            Browse All Articles <ArrowRight className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-border bg-card/40 font-semibold text-sm hover:bg-muted/40 transition-colors duration-200"
          >
            Admin Dashboard
          </Link>
        </div>
      </section>

      {isEmpty ? (
        /* Empty State Warning with Actions */
        <section className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="p-8 rounded-2xl border border-dashed border-border bg-card/40 space-y-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <Info className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No Articles Ingested Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                The database is currently empty. Run the migrations/seed to populate feed sources, then visit the Admin Dashboard to fetch articles.
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-xs font-semibold bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                Go to Admin Dashboard
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 relative z-10">
          
          {/* Category Navigation Row */}
          <section className="border-y border-border py-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
                Categories:
              </span>
              <Link
                href="/news"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-card hover:bg-muted transition-colors duration-200"
              >
                All News
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/news?category=${cat.slug}`}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium border border-border bg-card hover:bg-muted transition-colors duration-200"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Highlights Section */}
          {featuredArticle && (
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-indigo-500/10 text-indigo-500">
                  <Cpu className="h-4 w-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Featured Article</h2>
              </div>
              <NewsCard article={featuredArticle as any} featured={true} />
            </section>
          )}

          {/* Latest AI News Grid */}
          {latestArticles.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded bg-purple-500/10 text-purple-500">
                    <Newspaper className="h-4 w-4" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Latest AI News</h2>
                </div>
                <Link
                  href="/news"
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 group"
                >
                  View All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestArticles.map((article) => (
                  <NewsCard key={article.id} article={article as any} />
                ))}
              </div>
            </section>
          )}

          {/* Research Updates Section */}
          {researchArticles.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-500">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Research & Papers</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {researchArticles.map((article) => (
                  <NewsCard key={article.id} article={article as any} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
