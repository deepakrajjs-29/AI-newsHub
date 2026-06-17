import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { prisma } from "./src/lib/prisma";

async function main() {
  const total = await prisma.article.count();
  const pending = await prisma.article.count({ where: { status: "pending" } });
  const processed = await prisma.article.count({ where: { status: "processed" } });
  const failed = await prisma.article.count({ where: { status: "failed" } });

  console.log(`--- Article Counts ---`);
  console.log(`Total Articles:     ${total}`);
  console.log(`Pending Articles:   ${pending}`);
  console.log(`Processed Articles: ${processed}`);
  console.log(`Failed Articles:    ${failed}`);

  const categoryCounts = await prisma.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log(`--- Category Distribution ---`);
  for (const cat of categoryCounts) {
    console.log(`Category "${cat.name}": ${cat._count.articles} articles`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
