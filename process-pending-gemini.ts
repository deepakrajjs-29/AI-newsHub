import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { prisma } from "./src/lib/prisma";
import { summarizeArticleWithAI } from "./src/services/ai";
import { generateSlug } from "./src/services/ingestRunner";

// Delay helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("Starting REAL Gemini AI processing for pending articles...");

  // Fetch categories list to pass for categorization mapping
  const categoriesList = await prisma.category.findMany({
    select: { name: true },
  });
  const categoryNames = categoriesList.map((c) => c.name);

  // Fetch pending jobs
  const pendingJobs = await prisma.processingJob.findMany({
    where: { status: { in: ["pending", "processing"] } },
    take: 50, // Process 50 at a time to stay safe with rate limits
  });

  console.log(`Found ${pendingJobs.length} pending/processing jobs to process using Gemini AI.`);

  let successCount = 0;

  for (let i = 0; i < pendingJobs.length; i++) {
    const job = pendingJobs[i];
    const article = await prisma.article.findUnique({
      where: { id: job.articleId },
    });

    if (!article) {
      await prisma.processingJob.update({
        where: { id: job.id },
        data: { status: "failed", error: "Article not found" },
      });
      continue;
    }

    console.log(`[${i + 1}/${pendingJobs.length}] Processing article: "${article.title}"`);

    try {
      // Call the real Gemini API
      const aiResult = await summarizeArticleWithAI(article.title, article.content, categoryNames);

      if (!aiResult) {
        throw new Error("Gemini API returned null response");
      }

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

      // Link tags
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
      
      // Delay to avoid Gemini API rate limits (15 RPM for Gemini free tier is roughly 4 seconds delay)
      await sleep(4000);

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
      // Delay anyway to keep rate limits clean
      await sleep(2000);
    }
  }

  console.log(`REAL Gemini AI Processing complete. Successfully updated ${successCount} articles.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
