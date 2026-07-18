/**
 * Formats a date or timestamp as a relative human-readable string.
 * Examples: "just now", "10 minutes ago", "2 hours ago", "Yesterday", "3 days ago", "Jun 17, 2026".
 */
export function formatRelativeTime(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  // Future date safety fallback
  if (diffSec < 0) {
    return "just now";
  }

  if (diffSec < 60) {
    return "just now";
  }
  
  if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
  }
  
  if (diffHr < 24) {
    return `${diffHr} ${diffHr === 1 ? "hour" : "hours"} ago`;
  }
  
  if (diffDays === 1) {
    return "Yesterday";
  }
  
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  
  // Return standard absolute short date formatting for anything older than a week
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns a dynamic, keyword-relevant fallback image URL using Lorem Flickr based on the article title and category.
 */
export function getDynamicFallbackImage(title: string, categorySlug?: string): string {
  // Clean special characters and filter out common stop words to extract keywords
  const stopWords = ["with", "from", "that", "this", "your", "what", "their", "about", "uses", "how", "why", "who", "wants", "says", "deserve", "access"];
  const words = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.includes(w));
  
  // Extract up to 2 key terms, or fallback to the category name
  const keywords = words.slice(0, 2).join(",");
  const fallbackTerm = categorySlug ? categorySlug.replace("-", ",") : "technology";
  
  const query = keywords ? `${keywords},${fallbackTerm}` : fallbackTerm;
  
  // Append random param to prevent caching duplicate images across different news items
  return `https://loremflickr.com/800/500/${query}?random=${encodeURIComponent(title.slice(0, 30))}`;
}
