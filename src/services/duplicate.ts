import { prisma } from "../lib/prisma";
import crypto from "crypto";

// Get lowercase, alphanumeric word tokens longer than 2 characters
function getTokens(str: string): Set<string> {
  const cleaned = str
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((token) => token.length > 2);
  return new Set(cleaned);
}

// Calculate Jaccard similarity (Intersection over Union) of token sets
export function calculateJaccardSimilarity(str1: string, str2: string): number {
  const set1 = getTokens(str1);
  const set2 = getTokens(str2);
  if (set1.size === 0 || set2.size === 0) return 0;

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
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

/**
 * Checks if an incoming article is a duplicate based on:
 * 1. Exact originalUrl match
 * 2. Recent title similarity (Jaccard > threshold)
 * 3. Recent content hash match (if we store hashes or compute similarity on content)
 */
export async function checkIsDuplicate(
  article: DuplicateCheckInput,
  similarityThreshold = 0.85
): Promise<boolean> {
  // 1. Check exact URL match (globally across all records)
  const exactUrlMatch = await prisma.article.findUnique({
    where: { originalUrl: article.originalUrl },
  });

  if (exactUrlMatch) {
    return true;
  }

  // 2. Fetch articles from the last 7 days to run similarity comparisons
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentArticles = await prisma.article.findMany({
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

  // Check title similarity
  for (const recent of recentArticles) {
    const titleSim = calculateJaccardSimilarity(article.title, recent.title);
    if (titleSim >= similarityThreshold) {
      console.log(`Duplicate detected (Title similarity: ${titleSim.toFixed(2)}): "${article.title}" vs "${recent.title}"`);
      return true;
    }

    // Check content similarity using Jaccard on content snippets
    const contentSim = calculateJaccardSimilarity(
      article.content.slice(0, 1000),
      recent.content.slice(0, 1000)
    );
    if (contentSim >= 0.90) {
      console.log(`Duplicate detected (Content similarity: ${contentSim.toFixed(2)}): "${article.title}"`);
      return true;
    }
  }

  return false;
}
