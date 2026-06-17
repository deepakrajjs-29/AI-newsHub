import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { prisma } from "./src/lib/prisma";
import { summarizeArticleWithAI, generateFallbackSummary } from "./src/services/ai";
import { generateSlug } from "./src/services/ingestRunner";

async function main() {
  console.log("Starting manual AI processing for pending articles...");

  // Fetch categories list to pass to OpenAI for categorization mapping
  const categoriesList = await prisma.category.findMany({
    select: { name: true },
  });
  const categoryNames = categoriesList.map((c) => c.name);

  // Fetch all pending jobs
  const pendingJobs = await prisma.processingJob.findMany({
    where: { status: "pending" },
    take: 2000, // Process all pending articles in this run
  });

  console.log(`Found ${pendingJobs.length} pending jobs to process.`);

  let successCount = 0;
  let useLocalFallback = process.env.FORCE_LOCAL_FALLBACK === "true";

  for (const job of pendingJobs) {
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

    console.log(`Processing article: "${article.title}" [Local Fallback: ${useLocalFallback}]`);

    // Mark job as processing
    await prisma.processingJob.update({
      where: { id: job.id },
      data: { status: "processing" },
    });

    let attempts = 0;
    let success = false;

    while (attempts < 3 && !success) {
      try {
        let aiResult;
        if (useLocalFallback) {
          aiResult = generateFallbackSummary(article.title, article.content, categoryNames);
        } else {
          aiResult = await summarizeArticleWithAI(
            article.title,
            article.content,
            categoryNames
          );
        }

        if (aiResult) {
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

            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: {},
              create: {
                name: tagName.toLowerCase(),
                slug: tagSlug,
              },
            });

            articleTagsData.push({
              tagId: tag.id,
            });
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
          success = true;
        } else {
          // AI returned null (e.g. rate limit error or invalid response)
          attempts++;
          if (attempts < 2 && !useLocalFallback) {
            console.log(`AI returned null for "${article.title}". Retrying in 10 seconds (attempt ${attempts}/2)...`);
            await new Promise((resolve) => setTimeout(resolve, 10000));
          } else {
            // Switch to local fallback for this and subsequent articles
            console.log(`AI failed twice or rate limited. Switching to local fallback mode.`);
            useLocalFallback = true;
            // Immediate retry with local fallback
          }
        }
      } catch (aiErr: any) {
        attempts++;
        console.error(`Error processing AI for article "${article.title}":`, aiErr.message || aiErr);
        if (attempts < 2 && !useLocalFallback) {
          console.log(`Retrying in 10 seconds (attempt ${attempts}/2)...`);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } else {
          console.log(`Error caught. Switching to local fallback mode.`);
          useLocalFallback = true;
        }
      }
    }

    if (!success) {
      await prisma.processingJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          attempts,
          error: "AI summarization failed after max retries.",
        },
      });

      await prisma.article.update({
        where: { id: article.id },
        data: { status: "failed" },
      });
      console.log(`Failed to process "${article.title}" even with local fallback.`);
    }

    // Delay spacing only when calling real API
    if (!useLocalFallback) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  console.log(`AI Processing complete. Processed ${successCount} articles successfully.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
