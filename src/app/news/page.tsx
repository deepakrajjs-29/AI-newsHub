import { prisma } from "../../lib/prisma";
import NewsPageClient from "../../components/news/NewsPageClient";
import { checkAndRunIngestionIfNeeded } from "../../services/ingestRunner";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    sort?: string;
    page?: string;
    time?: string;
  }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  // Trigger background news ingestion refresh if needed (hourly check)
  await checkAndRunIngestionIfNeeded();

  const resolvedParams = await searchParams;
  const currentQuery = resolvedParams.query || "";
  const currentCategory = resolvedParams.category || "";
  const currentSort = resolvedParams.sort === "asc" ? "asc" : "desc";
  const currentTimeFilter = resolvedParams.time || "all";
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  
  const pageSize = 9;
  const skip = (currentPage - 1) * pageSize;

  // 1. Fetch all categories for filter options
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  // 2. Build where filter clauses
  // Show all articles (processed + pending) so content is visible even during AI processing
  // Exclude failed articles
  const whereClause: any = {
    status: { not: "failed" },
  };

  if (currentCategory) {
    whereClause.category = {
      slug: currentCategory,
    };
  }

  // Time-based filtering: Today (last 24 hours), This Week (last 7 days), This Month (last 30 days)
  if (currentTimeFilter === "today") {
    const todayLimit = new Date();
    todayLimit.setHours(todayLimit.getHours() - 24);
    whereClause.publishedAt = {
      gte: todayLimit,
    };
  } else if (currentTimeFilter === "week") {
    const weekLimit = new Date();
    weekLimit.setDate(weekLimit.getDate() - 7);
    whereClause.publishedAt = {
      gte: weekLimit,
    };
  } else if (currentTimeFilter === "month") {
    const monthLimit = new Date();
    monthLimit.setDate(monthLimit.getDate() - 30);
    whereClause.publishedAt = {
      gte: monthLimit,
    };
  }

  // Improved search by Article title, Keywords/Tags, Source name, or Category name
  if (currentQuery) {
    whereClause.OR = [
      { title: { contains: currentQuery, mode: "insensitive" } },
      { summary: { contains: currentQuery, mode: "insensitive" } },
      { content: { contains: currentQuery, mode: "insensitive" } },
      { sourceName: { contains: currentQuery, mode: "insensitive" } },
      {
        category: {
          name: { contains: currentQuery, mode: "insensitive" },
        },
      },
      {
        tags: {
          some: {
            tag: {
              name: { contains: currentQuery, mode: "insensitive" },
            },
          },
        },
      },
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

  // Total article count (without any filters) for display in empty state
  const totalAvailable = articles.length === 0
    ? await prisma.article.count({ where: { status: { not: "failed" } } })
    : null;

  return (
    <NewsPageClient
      initialArticles={articles as any}
      categories={categories}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      currentQuery={currentQuery}
      currentCategory={currentCategory}
      currentSort={currentSort}
      currentTimeFilter={currentTimeFilter}
      hasNextPage={hasNextPage}
      hasPrevPage={hasPrevPage}
      totalAvailable={totalAvailable}
    />
  );
}
