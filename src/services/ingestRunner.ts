import { prisma } from "../lib/prisma";
import { fetchAndNormalizeFeed } from "./rss";
import { checkIsDuplicate } from "./duplicate";
import { summarizeArticleWithAI } from "./ai";

// Standard URL-friendly slug generator
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric, non-spaces, non-hyphens
    .replace(/[\s_]+/g, "-")  // replace spaces/underscores with hyphens
    .replace(/-+/g, "-")       // replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, "");  // trim leading/trailing hyphens
}

// Generate a unique slug by checking db
export async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug || "article";
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findUnique({
      where: { slug },
    });
    if (!existing) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export interface IngestReport {
  success: boolean;
  durationMs: number;
  sourcesProcessed: number;
  articlesFetched: number;
  articlesSaved: number;
  articlesProcessed: number;
  errors: string[];
}

export async function runIngestion(): Promise<IngestReport> {
  const startTime = Date.now();
  const errors: string[] = [];
  let sourcesProcessed = 0;
  let articlesFetched = 0;
  let articlesSaved = 0;
  let articlesProcessed = 0;

  try {
    // 1. Fetch active RSS sources
    const activeSources = await prisma.source.findMany({
      where: { active: true },
    });

    // 2. Fetch categories list to pass to OpenAI for categorization mapping
    const categoriesList = await prisma.category.findMany({
      select: { name: true },
    });
    const categoryNames = categoriesList.map((c) => c.name);
    if (categoryNames.length === 0) {
      categoryNames.push("News", "Research", "Engineering", "Community");
    }

    // 3. Process each RSS source
    for (const source of activeSources) {
      console.log(`Processing source: ${source.name} (${source.rssUrl})`);
      sourcesProcessed++;

      const feedArticles = await fetchAndNormalizeFeed(source.rssUrl, source.name);
      articlesFetched += feedArticles.length;

      for (const rawArticle of feedArticles) {
        try {
          // Check if article is duplicate
          const isDuplicate = await checkIsDuplicate(rawArticle);
          if (isDuplicate) {
            continue;
          }

          // Generate unique slug
          const slug = await generateUniqueSlug(rawArticle.title);

          // Find appropriate category relation from the source category
          let matchedCategory = await prisma.category.findFirst({
            where: {
              name: {
                equals: source.category,
                mode: "insensitive",
              },
            },
          });

          // Insert raw article as pending
          const newArticle = await prisma.article.create({
            data: {
              title: rawArticle.title,
              slug,
              content: rawArticle.content,
              sourceId: source.id,
              sourceName: source.name,
              sourceUrl: source.rssUrl,
              originalUrl: rawArticle.originalUrl,
              featuredImage: rawArticle.featuredImage,
              publishedAt: rawArticle.publishedAt,
              categoryId: matchedCategory?.id || null,
              status: "pending",
            },
          });

          // Create processing job record
          await prisma.processingJob.create({
            data: {
              articleId: newArticle.id,
              status: "pending",
            },
          });

          articlesSaved++;
        } catch (itemErr: any) {
          const errMsg = `Error saving article "${rawArticle.title}": ${itemErr.message}`;
          console.error(errMsg);
          errors.push(errMsg);
        }
      }

      // Update source last fetched time
      await prisma.source.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date() },
      });
    }

    // 4. Run AI Processing on all pending jobs (limit to 15 per run to avoid timeout/rate limits)
    const pendingJobs = await prisma.processingJob.findMany({
      where: { status: "pending" },
      take: 15,
    });

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

      // Mark job as processing
      await prisma.processingJob.update({
        where: { id: job.id },
        data: { status: "processing", attempts: { increment: 1 } },
      });

      try {
        const aiResult = await summarizeArticleWithAI(
          article.title,
          article.content,
          categoryNames
        );

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
            // If OpenAI suggests a category not in database, create it dynamically
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

          articlesProcessed++;
        } else {
          // Failed to process (no AI response)
          const attempts = job.attempts + 1;
          await prisma.processingJob.update({
            where: { id: job.id },
            data: {
              status: attempts >= 3 ? "failed" : "pending",
              attempts,
              error: "OpenAI returned null response",
            },
          });

          if (attempts >= 3) {
            await prisma.article.update({
              where: { id: article.id },
              data: { status: "failed" },
            });
          }
        }
      } catch (aiErr: any) {
        const errMsg = `Error processing AI for article "${article.title}": ${aiErr.message}`;
        console.error(errMsg);
        errors.push(errMsg);

        const attempts = job.attempts + 1;
        await prisma.processingJob.update({
          where: { id: job.id },
          data: {
            status: attempts >= 3 ? "failed" : "pending",
            attempts,
            error: aiErr.message,
          },
        });

        if (attempts >= 3) {
          await prisma.article.update({
            where: { id: article.id },
            data: { status: "failed" },
          });
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const success = errors.length === 0;

    // 5. Write execution log
    await prisma.cronLog.create({
      data: {
        jobName: "fetch-news",
        status: success ? "success" : "failure",
        durationMs,
        message: `Sources processed: ${sourcesProcessed}. Articles fetched: ${articlesFetched}. Unique saved: ${articlesSaved}. AI Processed: ${articlesProcessed}. Errors: ${errors.join(" | ")}`,
      },
    });

    return {
      success,
      durationMs,
      sourcesProcessed,
      articlesFetched,
      articlesSaved,
      articlesProcessed,
      errors,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    console.error("Critical error in ingestion runner:", error);
    
    await prisma.cronLog.create({
      data: {
        jobName: "fetch-news",
        status: "failure",
        durationMs,
        message: `Critical Failure: ${error.message}`,
      },
    });

    return {
      success: false,
      durationMs,
      sourcesProcessed,
      articlesFetched,
      articlesSaved,
      articlesProcessed,
      errors: [error.message],
    };
  }
}
