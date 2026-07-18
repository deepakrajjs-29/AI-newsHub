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
/**
 * Returns a dynamic, deterministic fallback image URL from a curated list of verified tech Unsplash photos based on the article title.
 */
export function getDynamicFallbackImage(title: string, categorySlug?: string): string {
  const techImages = [
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e", // Humanoid robot arm
    "https://images.unsplash.com/photo-1518770660439-4636190af475", // Motherboard microchip
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5", // Matrix code
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", // Python code editor
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa", // Digital network globe
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31", // Datacenter servers
    "https://images.unsplash.com/photo-1563986768609-322da13575f3", // Cybersecurity keyboard
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1", // MacBook desk
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d", // Tech office workspace
    "https://images.unsplash.com/photo-1535378917042-10a22c95931a", // Futuristic robot head
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe", // Abstract digital waves
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485", // Generative AI brain
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", // Green circuit board
    "https://images.unsplash.com/photo-1607799279861-4dd421887fb3", // Dev code editing
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c", // Team startup board
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c", // Dev team office
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f", // Charts analytics
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f", // Dashboard computer
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71", // Data graph
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f", // Vintage electronics
    "https://images.unsplash.com/photo-1581092921461-eab62e97a780", // Tech engineer chip
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", // Data scientist office
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758", // Coding screen close-up
    "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b", // Motherboard tracks
    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952", // Robotics assembly lab
    "https://images.unsplash.com/photo-1581091870622-09489fc285f1"  // Server cable racks
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % techImages.length;
  
  return `${techImages[index]}?auto=format&fit=crop&w=800&q=80`;
}
