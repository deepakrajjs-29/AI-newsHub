import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { prisma } from "./src/lib/prisma";

async function main() {
  const total = await prisma.article.count({ where: { status: "processed" } });
  console.log(`Total processed: ${total}`);

  const newest = await prisma.article.findFirst({
    where: { status: "processed" },
    orderBy: { publishedAt: "desc" },
    select: { title: true, publishedAt: true, sourceName: true },
  });
  const oldest = await prisma.article.findFirst({
    where: { status: "processed" },
    orderBy: { publishedAt: "asc" },
    select: { title: true, publishedAt: true, sourceName: true },
  });

  console.log("Newest article:", newest);
  console.log("Oldest article:", oldest);

  // Count by recency buckets
  const now = new Date();
  const h24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const last24h = await prisma.article.count({ where: { status: "processed", publishedAt: { gte: h24 } } });
  const last7d = await prisma.article.count({ where: { status: "processed", publishedAt: { gte: d7 } } });
  const last30d = await prisma.article.count({ where: { status: "processed", publishedAt: { gte: d30 } } });

  console.log(`Last 24h: ${last24h}`);
  console.log(`Last 7 days: ${last7d}`);
  console.log(`Last 30 days: ${last30d}`);
  console.log(`Older than 30 days: ${total - last30d}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
