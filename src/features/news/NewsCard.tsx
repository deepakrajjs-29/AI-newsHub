import Link from "next/link";
import { Calendar, ExternalLink, ArrowRight, Clock } from "lucide-react";
import { formatRelativeTime, getDynamicFallbackImage } from "../../lib/utils";

export interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  sourceName: string;
  originalUrl: string;
  featuredImage: string | null;
  publishedAt: Date;
  category: {
    name: string;
    slug: string;
  } | null;
}

interface NewsCardProps {
  article: ArticlePreview;
  featured?: boolean;
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Returns a hue (HSL) for each category to create unique gradient accents
function getCategoryColor(categorySlug?: string): { from: string; to: string; badge: string } {
  const map: Record<string, { from: string; to: string; badge: string }> = {
    "artificial-intelligence":  { from: "#6366f1", to: "#8b5cf6", badge: "bg-indigo-500/12 text-indigo-400 border-indigo-500/20" },
    "machine-learning":         { from: "#3b82f6", to: "#6366f1", badge: "bg-blue-500/12 text-blue-400 border-blue-500/20" },
    "generative-ai":            { from: "#a855f7", to: "#ec4899", badge: "bg-purple-500/12 text-purple-400 border-purple-500/20" },
    "cloud-computing":          { from: "#06b6d4", to: "#3b82f6", badge: "bg-cyan-500/12 text-cyan-400 border-cyan-500/20" },
    "cybersecurity":            { from: "#ef4444", to: "#f97316", badge: "bg-red-500/12 text-red-400 border-red-500/20" },
    "developer-tools":          { from: "#10b981", to: "#06b6d4", badge: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20" },
    "startups":                 { from: "#f59e0b", to: "#f97316", badge: "bg-amber-500/12 text-amber-400 border-amber-500/20" },
    "data-science":             { from: "#14b8a6", to: "#10b981", badge: "bg-teal-500/12 text-teal-400 border-teal-500/20" },
  };
  return map[categorySlug || ""] || { from: "#6366f1", to: "#8b5cf6", badge: "bg-indigo-500/12 text-indigo-400 border-indigo-500/20" };
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const formattedDate = formatRelativeTime(article.publishedAt);
  const readingTime = estimateReadingTime(article.summary || article.title);
  const imageUrl = (article.featuredImage && article.featuredImage.startsWith("http"))
    ? article.featuredImage
    : getDynamicFallbackImage(article.title, article.category?.slug);

  const colors = getCategoryColor(article.category?.slug);

  if (featured) {
    return (
      <div className="group relative grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-border bg-card hover-card-bounce overflow-hidden shadow-sm">
        {/* Featured Image */}
        <div className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:h-80 w-full overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {article.category && (
            <span
              className="absolute top-4 left-4 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md"
              style={{ background: `${colors.from}20`, color: colors.from, borderColor: `${colors.from}35` }}
            >
              {article.category.name}
            </span>
          )}
        </div>

        {/* Content details */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 lg:p-8 space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-bold text-foreground uppercase tracking-wide text-[10px]">{article.sourceName}</span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime} min read
              </span>
            </div>

            <Link href={`/news/${article.slug}`} className="block group/title">
              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground group-hover/title:text-indigo-400 transition-colors duration-200 leading-snug">
                {article.title}
              </h3>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
              {article.summary || "AI-generated summary coming shortly..."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Link
              href={`/news/${article.slug}`}
              className="group/btn inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-indigo-400 transition-all duration-200"
            >
              Read AI Summary
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>

            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Original <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card hover-card-bounce overflow-hidden shadow-sm">
      {/* Gradient accent bar at top */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }}
      />

      {/* Cover image */}
      <div className="relative w-full overflow-hidden bg-muted" style={{ paddingBottom: "56.25%" }}>
        <img
          src={imageUrl}
          alt={article.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-106"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category Badge */}
        {article.category && (
          <span
            className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${colors.badge}`}
          >
            {article.category.name}
          </span>
        )}

        {/* Reading time */}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 text-white text-[9px] font-bold backdrop-blur-md">
          <Clock className="h-2.5 w-2.5" />
          {readingTime} min
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* Meta */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="font-bold text-foreground uppercase tracking-wide">{article.sourceName}</span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-0.5">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <Link href={`/news/${article.slug}`} className="block group/title">
          <h4 className="text-base font-extrabold tracking-tight text-foreground line-clamp-2 group-hover/title:text-indigo-400 transition-colors duration-200 leading-snug">
            {article.title}
          </h4>
        </Link>

        {/* Summary */}
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
          {article.summary || "AI-generated summary coming shortly..."}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/50">
        <Link
          href={`/news/${article.slug}`}
          className="group/btn inline-flex items-center gap-1 text-xs font-bold text-foreground hover:text-indigo-400 transition-all duration-200"
        >
          View Summary
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
        </Link>

        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Source <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}
