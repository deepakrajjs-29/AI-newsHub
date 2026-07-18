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
 * Returns a dynamic, deterministic fallback image URL from a curated list of Unsplash photos based on the article title and category.
 */
export function getDynamicFallbackImage(title: string, categorySlug?: string): string {
  const fallbacks: Record<string, string[]> = {
    "artificial-intelligence": [
      "https://images.unsplash.com/photo-1677442136019-21780efad99a",
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04",
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc",
      "https://images.unsplash.com/photo-1507146426996-ef05306b995a"
    ],
    "machine-learning": [
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
    ],
    "generative-ai": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
      "https://images.unsplash.com/photo-1684369175833-31626f2bf941"
    ],
    "cloud-computing": [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
      "https://images.unsplash.com/photo-1597852074816-d933c7d2b988"
    ],
    "cybersecurity": [
      "https://images.unsplash.com/photo-1563986768609-322da13575f3",
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7"
    ],
    "developer-tools": [
      "https://images.unsplash.com/photo-1607799279861-4dd421887fb3",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12"
    ],
    "startups": [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f"
    ],
    "data-science": [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
    ],
    "technology": [
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f"
    ]
  };

  const slug = categorySlug && fallbacks[categorySlug] ? categorySlug : "technology";
  const list = fallbacks[slug];
  
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % list.length;
  
  return `${list[index]}?auto=format&fit=crop&w=800&q=80`;
}
