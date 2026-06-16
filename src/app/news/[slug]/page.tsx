import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import NewsCard from "../../../features/news/NewsCard";
import { Calendar, ExternalLink, ArrowLeft, Tag, BookOpen, BrainCircuit } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    return {
      title: "Article Not Found - AI News Hub",
    };
  }

  const title = article.seoTitle || `${article.title} | AI News Hub`;
  const description = article.seoDescription || article.summary || "AI aggregated news summary.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/news/${article.slug}`,
      images: article.featuredImage ? [{ url: article.featuredImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
  };
}

// Generate a deterministic abstract gradient background based on the article's title
function generateAbstractGradient(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 75%, 35%) 0%, hsl(${hue2}, 60%, 15%) 100%)`;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Fetch current article
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!article) {
    notFound();
  }

  // 2. Fetch related articles in the same category (limit to 3, excluding current)
  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "processed",
      categoryId: article.categoryId,
      id: {
        not: article.id,
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

  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const gradientStyle = !article.featuredImage
    ? { background: generateAbstractGradient(article.title) }
    : {};

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to all news
        </Link>
      </div>

      {/* Article Header info */}
      <div className="space-y-4">
        {article.category && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-foreground/10 text-foreground">
            {article.category.name}
          </span>
        )}
        
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.15]">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground pt-2">
          <div>
            Published by: <span className="font-semibold text-foreground">{article.sourceName}</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Featured Cover banner */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted shadow-sm">
        {article.featuredImage ? (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div style={gradientStyle} className="h-full w-full flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
        )}
      </div>

      {/* AI summaries sections */}
      <div className="grid grid-cols-1 gap-8 pt-4">
        {/* Short Executive Summary (Highlight card) */}
        <div className="p-6 sm:p-8 rounded-2xl border border-indigo-500/10 bg-indigo-500/5 dark:bg-indigo-950/10 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-500">
            <BrainCircuit className="h-5.5 w-5.5" />
            <h3 className="font-bold text-base sm:text-lg">Executive Summary (AI Generated)</h3>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground font-medium italic">
            &ldquo;{article.summary || "Summary generation pending..."}&rdquo;
          </p>
        </div>

        {/* Detailed Insights Summary */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-border pb-3">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-bold text-lg sm:text-xl">In-Depth Analysis</h3>
          </div>
          <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-4">
            {article.summaryLong ? (
              // Format long summary by splitting into paragraphs or display as is
              article.summaryLong.split("\n").map((para, idx) => (
                <p key={idx}>{para.trim()}</p>
              ))
            ) : (
              <p>Full detailed summary will be processed shortly by the background ingestion workers.</p>
            )}
          </div>
        </div>

        {/* Action Call for full original article */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {article.tags.length > 0 && (
              <>
                <Tag className="h-4 w-4 text-muted-foreground" />
                {article.tags.map((at) => (
                  <Link
                    key={at.tagId}
                    href={`/news?query=${at.tag.name}`}
                    className="px-2.5 py-1 rounded bg-muted hover:bg-muted/70 text-xs font-semibold text-muted-foreground transition duration-200"
                  >
                    #{at.tag.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          <a
            href={article.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition duration-200"
          >
            Read Original Full Article <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* Related Articles list */}
      {relatedArticles.length > 0 && (
        <div className="pt-12 border-t border-border space-y-6">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <NewsCard key={rel.id} article={rel as any} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
