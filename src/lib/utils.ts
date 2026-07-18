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
 * Returns a high-quality fallback image URL for a category if the article has no featured image.
 */
export function getCategoryFallbackImage(categorySlug?: string): string {
  const fallbacks: Record<string, string> = {
    "artificial-intelligence": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    "machine-learning": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800&q=80",
    "generative-ai": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    "cloud-computing": "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80",
    "cybersecurity": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    "developer-tools": "https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&w=800&q=80",
    "startups": "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80",
    "data-science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  };
  
  return categorySlug && fallbacks[categorySlug]
    ? fallbacks[categorySlug]
    : "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
}
