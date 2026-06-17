import { prisma } from "../lib/prisma";
import crypto from "crypto";

// Get lowercase, alphanumeric word tokens longer than 2 characters
export function getTokens(str: string): Set<string> {
  const cleaned = str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((token) => token.length > 2);
  return new Set(cleaned);
}

// Calculate Jaccard similarity of two pre-computed token sets
export function calculateSetJaccard(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 || set2.size === 0) return 0;
  let intersectionSize = 0;
  for (const x of set1) {
    if (set2.has(x)) {
      intersectionSize++;
    }
  }
  const unionSize = set1.size + set2.size - intersectionSize;
  return intersectionSize / unionSize;
}

// Calculate Jaccard similarity (Intersection over Union) of token sets from strings
export function calculateJaccardSimilarity(str1: string, str2: string): number {
  const set1 = getTokens(str1);
  const set2 = getTokens(str2);
  return calculateSetJaccard(set1, set2);
}

// Create a stable SHA-256 hash of cleaned text content (first 500 chars)
export function generateContentHash(content: string): string {
  const cleaned = content
    .replace(/<[^>]*>/g, "") // remove HTML tags
    .replace(/\s+/g, "")     // remove whitespace
    .toLowerCase()
    .slice(0, 500);          // first 500 chars
  
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

export interface DuplicateCheckInput {
  title: string;
  originalUrl: string;
  content: string;
}

export interface PreloadedRecentArticle {
  title: string;
  content: string;
  titleTokens: Set<string>;
  contentTokens: Set<string>;
}

/**
 * Checks if an incoming article is a duplicate based on:
 * 1. Exact originalUrl match
 * 2. Recent title similarity (Jaccard > threshold)
 * 3. Recent content similarity (Jaccard > 0.90)
 */
export async function checkIsDuplicate(
  article: DuplicateCheckInput,
  similarityThreshold = 0.85,
  preloadedUrls?: Set<string>,
  preloadedRecent?: PreloadedRecentArticle[]
): Promise<boolean> {
  // 1. Check exact URL match
  if (preloadedUrls) {
    if (preloadedUrls.has(article.originalUrl)) {
      return true;
    }
  } else {
    const exactUrlMatch = await prisma.article.findUnique({
      where: { originalUrl: article.originalUrl },
    });

    if (exactUrlMatch) {
      return true;
    }
  }

  // Compute incoming tokens
  const incomingTitleTokens = getTokens(article.title);
  const incomingContentTokens = getTokens(article.content.slice(0, 1000));

  // 2. Fetch recent articles from the last 7 days to run similarity comparisons if not preloaded
  const recentArticles = preloadedRecent || await (async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dbRecent = await prisma.article.findMany({
      where: {
        publishedAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        title: true,
        content: true,
      },
    });

    return dbRecent.map((r) => ({
      title: r.title,
      content: r.content,
      titleTokens: getTokens(r.title),
      contentTokens: getTokens(r.content.slice(0, 1000)),
    }));
  })();

  // Check title & content similarity
  for (const recent of recentArticles) {
    const titleSim = calculateSetJaccard(incomingTitleTokens, recent.titleTokens);
    if (titleSim >= similarityThreshold) {
      console.log(`Duplicate detected (Title similarity: ${titleSim.toFixed(2)}): "${article.title}" vs "${recent.title}"`);
      return true;
    }

    const contentSim = calculateSetJaccard(incomingContentTokens, recent.contentTokens);
    if (contentSim >= 0.90) {
      console.log(`Duplicate detected (Content similarity: ${contentSim.toFixed(2)}): "${article.title}"`);
      return true;
    }
  }

  return false;
}
