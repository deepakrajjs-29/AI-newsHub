import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/rss+xml, application/rdf+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1"
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

export interface NormalizedArticle {
  title: string;
  description: string;
  content: string;
  originalUrl: string;
  publishedAt: Date;
  featuredImage: string | null;
}

// Extract the first image src from an HTML string
function extractImageFromHtml(html: string): string | null {
  if (!html) return null;
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = html.match(imgRegex);
  return match ? match[1] : null;
}

export async function fetchAndNormalizeFeed(
  rssUrl: string,
  sourceName: string
): Promise<NormalizedArticle[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(rssUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/rdf+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.1"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const xmlString = await response.text();
    const feed = await parser.parseString(xmlString);
    const articles: NormalizedArticle[] = [];

    for (const item of feed.items) {
      if (!item.title || !item.link) {
        continue;
      }

      // 1. Content extraction
      const content = item.contentEncoded || item.content || item.summary || "";
      const description = item.contentSnippet || item.summary || "";

      // 2. Publish Date normalization
      let publishedAt = new Date();
      if (item.pubDate || item.isoDate) {
        const parsedDate = new Date(item.pubDate || item.isoDate || "");
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate;
        }
      }

      // 3. Featured Image extraction
      let featuredImage: string | null = null;

      // Try item.enclosure
      if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith("image/")) {
        featuredImage = item.enclosure.url;
      }

      // Try mediaContent custom field
      if (!featuredImage && (item as any).mediaContent) {
        const mediaArray = (item as any).mediaContent;
        if (Array.isArray(mediaArray) && mediaArray.length > 0) {
          featuredImage = mediaArray[0].$?.url || mediaArray[0].url || null;
        }
      }

      // Try mediaThumbnail custom field
      if (!featuredImage && (item as any).mediaThumbnail) {
        featuredImage = (item as any).mediaThumbnail.$?.url || (item as any).mediaThumbnail.url || null;
      }

      // Fallback: extract from HTML contents
      if (!featuredImage) {
        featuredImage = extractImageFromHtml(content) || extractImageFromHtml(item.content || "") || null;
      }

      articles.push({
        title: item.title.trim(),
        description: description.trim(),
        content: content.trim(),
        originalUrl: item.link.trim(),
        publishedAt,
        featuredImage,
      });
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching/parsing feed from ${sourceName} (${rssUrl}):`, error);
    return [];
  }
}
