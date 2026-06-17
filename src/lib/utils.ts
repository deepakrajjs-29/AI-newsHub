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
