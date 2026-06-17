import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { prisma } from "./src/lib/prisma";
import { generateFallbackSummary } from "./src/services/ai";
import { generateSlug } from "./src/services/ingestRunner";

async function main() {
  console.log("Starting FAST manual AI processing for pending articles...");

  // Fetch categories list to pass to OpenAI for categorization mapping
  const categoriesList = await prisma.category.findMany({
    select: { name: true },
  });
  const categoryNames = categoriesList.map((c) => c.name);

  // Fetch all pending jobs
  const pendingJobs = await prisma.processingJob.findMany({
    where: { status: { in: ["pending", "processing"] } },
    take: 2000,
  });

  console.log(`Found ${pendingJobs.length} pending/processing jobs to process.`);

  const concurrency = 25;
  let index = 0;
  let successCount = 0;

  async function worker() {
    while (true) {
      const jobIndex = index++;
      if (jobIndex >= pendingJobs.length) {
        break;
      }
      const job = pendingJobs[jobIndex];
      const article = await prisma.article.findUnique({
        where: { id: job.articleId },
      });

      if (!article) {
        await prisma.processingJob.update({
          where: { id: job.id },
          data: { status: "failed", error: "Article not found in database" },
        });
        continue;
      }

      try {
        // Since we are doing fast manual local fallback:
        const aiResult = generateFallbackSummary(article.title, article.content, categoryNames);

        // Resolve category
        let categoryId = article.categoryId;
        if (aiResult.categoryName) {
          let cat = await prisma.category.findFirst({
            where: {
              name: {
                equals: aiResult.categoryName,
                mode: "insensitive",
              },
            },
          });
          if (!cat) {
            const slug = generateSlug(aiResult.categoryName);
            cat = await prisma.category.create({
              data: {
                name: aiResult.categoryName,
                slug,
              },
            });
          }
          categoryId = cat.id;
        }

        // Link tags — use try/catch to handle concurrent upsert race conditions
        const articleTagsData = [];
        for (const tagName of aiResult.tags) {
          const tagSlug = generateSlug(tagName);
          if (!tagSlug) continue;

          try {
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: {
                name: tagName.toLowerCase(),
                slug: tagSlug,
              },
            });
            articleTagsData.push({ tagId: tag.id });
          } catch {
            // Race condition: another worker created the tag — find and use it
            const existing = await prisma.tag.findFirst({
              where: { slug: tagSlug },
            });
            if (existing) articleTagsData.push({ tagId: existing.id });
          }
        }

        // Save AI results to article
        await prisma.article.update({
          where: { id: article.id },
          data: {
            summary: aiResult.summaryShort,
            summaryLong: aiResult.summaryLong,
            categoryId,
            seoTitle: aiResult.seoTitle,
            seoDescription: aiResult.seoDescription,
            status: "processed",
            tags: {
              createMany: {
                data: articleTagsData,
                skipDuplicates: true,
              },
            },
          },
        });

        // Update job
        await prisma.processingJob.update({
          where: { id: job.id },
          data: { status: "completed" },
        });

        successCount++;
        if (successCount % 50 === 0) {
          console.log(`Processed ${successCount}/${pendingJobs.length} articles...`);
        }
      } catch (err: any) {
        console.error(`Error processing article "${article.title}":`, err.message || err);
        await prisma.processingJob.update({
          where: { id: job.id },
          data: {
            status: "failed",
            error: err.message || String(err),
          },
        });
        await prisma.article.update({
          where: { id: article.id },
          data: { status: "failed" },
        });
      }
    }
  }

  // Start workers
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`FAST AI Processing complete. Processed ${successCount} articles successfully.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
