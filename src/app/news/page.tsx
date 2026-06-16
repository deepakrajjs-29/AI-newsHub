import Link from "next/link";
import { prisma } from "../../lib/prisma";
import NewsCard from "../../features/news/NewsCard";
import NewsSearchFilters from "../../features/news/NewsSearchFilters";
import { ArrowLeft, ArrowRight, Newspaper, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const resolvedParams = await searchParams;
  const currentQuery = resolvedParams.query || "";
  const currentCategory = resolvedParams.category || "";
  const currentSort = resolvedParams.sort === "asc" ? "asc" : "desc";
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  
  const pageSize = 9;
  const skip = (currentPage - 1) * pageSize;

  // 1. Fetch all categories for filter options
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  // 2. Build where filter clauses
  const whereClause: any = {
    status: "processed",
  };

  if (currentCategory) {
    whereClause.category = {
      slug: currentCategory,
    };
  }

  if (currentQuery) {
    whereClause.OR = [
      { title: { contains: currentQuery, mode: "insensitive" } },
      { summary: { contains: currentQuery, mode: "insensitive" } },
      { content: { contains: currentQuery, mode: "insensitive" } },
    ];
  }

  // 3. Query matching articles
  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { publishedAt: currentSort },
    skip,
    take: pageSize,
    include: {
      category: {
        select: { name: true, slug: true },
      },
    },
  });

  // 4. Get total count for pagination calculations
  const totalCount = await prisma.article.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Helper to construct pagination URLs
  const getPaginationUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (currentQuery) params.set("query", currentQuery);
    if (currentCategory) params.set("category", currentCategory);
    if (currentSort !== "desc") params.set("sort", currentSort);
    params.set("page", pageNumber.toString());
    return `/news?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header Info */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          <Newspaper className="h-3.5 w-3.5" />
          <span>News Archive</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Explore AI Developments
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
      />

      {articles.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border bg-card/25 space-y-4">
          <div className="p-3 rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h3 className="text-lg font-bold text-foreground">No articles found</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We couldn't find any articles matching your filters. Try clearing search text or choosing another category.
            </p>
          </div>
          {(currentQuery || currentCategory) && (
            <Link
              href="/news"
              className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
            >
              Reset All Filters
            </Link>
          )}
        </div>
      ) : (
        /* Articles Grid list */
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
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
