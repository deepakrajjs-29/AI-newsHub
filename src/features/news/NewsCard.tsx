import Link from "next/link";
import { Calendar, ExternalLink, ArrowRight } from "lucide-react";
import { formatRelativeTime } from "../../lib/utils";

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

// Generate a deterministic abstract gradient background based on the article's title
function generateAbstractGradient(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 40%) 0%, hsl(${hue2}, 60%, 20%) 100%)`;
}

export default function NewsCard({ article, featured = false }: NewsCardProps) {
  const formattedDate = formatRelativeTime(article.publishedAt);

  const gradientStyle = !article.featuredImage
    ? { background: generateAbstractGradient(article.title) }
    : {};

  if (featured) {
    return (
      <div className="group relative grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 rounded-2xl border border-border bg-card hover:bg-muted/30 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
        {/* Featured Image */}
        <div className="lg:col-span-7 relative aspect-video lg:aspect-auto lg:h-80 w-full rounded-xl overflow-hidden bg-muted">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div style={gradientStyle} className="h-full w-full flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>
          )}
          {article.category && (
            <span className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-background/90 text-foreground backdrop-blur-sm shadow-sm">
              {article.category.name}
            </span>
          )}
        </div>

        {/* Content details */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground uppercase tracking-wider">{article.sourceName}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
            </div>
            
            <Link href={`/news/${article.slug}`} className="block">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground hover:text-muted-foreground transition-colors duration-200">
                {article.title}
              </h3>
            </Link>
            
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed line-clamp-4">
              {article.summary || "Summary pending generation..."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Link
              href={`/news/${article.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:gap-2.5 transition-all duration-200"
            >
              Read AI Summary <ArrowRight className="h-4 w-4" />
            </Link>
            
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Original Feed <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col justify-between p-5 rounded-xl border border-border bg-card hover:bg-muted/20 hover:border-border/80 transition-all duration-300 shadow-sm hover:shadow">
      <div className="space-y-4">
        {/* Cover image */}
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-muted">
          {article.featuredImage ? (
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div style={gradientStyle} className="h-full w-full flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>
            </div>
          )}
          {article.category && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-background/90 text-foreground backdrop-blur-sm">
              {article.category.name}
            </span>
          )}
        </div>

        {/* Content details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground uppercase tracking-wider">{article.sourceName}</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          </div>
          
          <Link href={`/news/${article.slug}`} className="block">
            <h4 className="text-base sm:text-lg font-bold tracking-tight text-foreground line-clamp-2 hover:text-muted-foreground transition-colors duration-200">
              {article.title}
            </h4>
          </Link>
          
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {article.summary || "Summary pending generation..."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50 text-xs">
        <Link
          href={`/news/${article.slug}`}
          className="inline-flex items-center gap-1 font-medium text-foreground hover:gap-1.5 transition-all duration-200"
        >
          View Summary <ArrowRight className="h-3 w-3" />
        </Link>
        
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground flex items-center gap-0.5"
        >
          Source <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
