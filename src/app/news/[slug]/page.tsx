import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import NewsCard from "../../../features/news/NewsCard";
import { Calendar, ExternalLink, ArrowLeft, Tag, BrainCircuit, Clock, Sparkles } from "lucide-react";
import InteractiveArticlePortal from "../../../components/news/InteractiveArticlePortal";
import { formatRelativeTime, getDynamicFallbackImage } from "../../../lib/utils";
import AuthGate from "../../../components/common/AuthGate";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) return { title: "Article Not Found - AI News Hub" };

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

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article) notFound();

  const relatedArticles = await prisma.article.findMany({
    where: {
      status: "processed",
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { category: { select: { name: true, slug: true } } },
  });

  const formattedDate = formatRelativeTime(article.publishedAt);
  const imageUrl = (article.featuredImage && article.featuredImage.startsWith("http"))
    ? article.featuredImage
    : getDynamicFallbackImage(article.title, article.category?.slug);

  // Split summary into sentences for display
  const longSummary = article.summaryLong || article.summary || "";
  const summaryParagraphs = longSummary
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 5);

  // Group into paragraphs of 2-3 sentences
  const groupedParas: string[] = [];
  for (let i = 0; i < summaryParagraphs.length; i += 3) {
    groupedParas.push(summaryParagraphs.slice(i, i + 3).join(" "));
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* Back button */}
      <div>
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to all news
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-5">
        {/* Category & Meta */}
        <div className="flex flex-wrap items-center gap-2">
          {article.category && (
            <span className="badge badge-brand">
              <Sparkles className="h-2.5 w-2.5" />
              {article.category.name}
            </span>
          )}
          <span className="text-border text-xs">·</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
          <span className="text-border text-xs">·</span>
          <span className="text-xs text-muted-foreground">
            Source: <span className="font-semibold text-foreground">{article.sourceName}</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-foreground">
          {article.title}
        </h1>

        {/* Quick summary excerpt */}
        {article.summary && (
          <p className="text-base text-muted-foreground leading-relaxed max-w-3xl border-l-2 border-indigo-500/40 pl-4">
            {article.summary}
          </p>
        )}
      </div>

      {/* Featured Cover */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted shadow-lg">
        <img
          src={imageUrl}
          alt={article.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* AI Executive Summary — full 10-line display */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent p-[1px]">
          <div className="absolute inset-[1px] rounded-2xl bg-background" />
        </div>

        <div className="relative p-7 sm:p-9 space-y-5 bg-gradient-to-br from-indigo-500/[0.05] via-purple-500/[0.03] to-transparent rounded-2xl border border-indigo-500/20">
          {/* Section header */}
          <div className="flex items-center gap-3 pb-2 border-b border-indigo-500/15">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <BrainCircuit className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-foreground flex items-center gap-2">
                Executive Summary
                <span className="badge badge-brand text-[9px] py-0.5">AI Generated</span>
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Powered by Gemini AI · Auto-synthesized from source content
              </p>
            </div>
          </div>

          {/* Summary paragraphs */}
          {groupedParas.length > 0 ? (
            <div className="space-y-4">
              {groupedParas.map((para, i) => (
                <p
                  key={i}
                  className="text-sm sm:text-base leading-[1.85] text-foreground"
                >
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Summary generation pending — our AI workers will process this article shortly.
            </p>
          )}

          {/* Footer pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-indigo-500/10">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              ~{Math.max(1, Math.round(longSummary.split(/\s+/).length / 200))} min read
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Gemini-summarized
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Client Portal */}
      <AuthGate>
        <InteractiveArticlePortal article={article} />

        {/* Tags & Original link */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {article.tags.length > 0 && (
              <>
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                {article.tags.map((at) => (
                  <Link
                    key={at.tagId}
                    href={`/news?query=${at.tag.name}`}
                    className="px-3 py-1 rounded-full bg-muted hover:bg-indigo-500/10 hover:text-indigo-400 border border-border hover:border-indigo-500/25 text-[11px] font-semibold text-muted-foreground transition-all duration-200"
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
            className="btn-primary text-xs py-2 px-5 rounded-full"
          >
            Read Original Article <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-12 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold tracking-tight">Related Articles</h3>
              <Link
                href={`/news?category=${article.category?.slug}`}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                View more →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <NewsCard key={rel.id} article={rel as any} />
              ))}
            </div>
          </div>
        )}
      </AuthGate>
    </article>
  );
}
