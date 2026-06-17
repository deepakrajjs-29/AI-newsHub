import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Fixing broken RSS feed URLs...");

  // Fix Anthropic - their RSS moved
  const anthropic = await prisma.source.updateMany({
    where: { name: "Anthropic News" },
    data: { rssUrl: "https://www.anthropic.com/rss.xml" },
  });
  console.log(`Anthropic update: ${anthropic.count} row(s)`);

  // Disable Google Research Blog (feedburner DNS fails) - replace with Google AI Blog
  const googleOld = await prisma.source.updateMany({
    where: { name: "Google Research Blog" },
    data: {
      name: "Google AI Blog",
      rssUrl: "https://blog.google/technology/ai/rss/",
      active: true,
    },
  });
  console.log(`Google AI Blog update: ${googleOld.count} row(s)`);

  // Disable BleepingComputer (DNS resolution fails in this environment) - keep active but note
  // It may work in production. Leave it.

  // Add additional high-quality sources
  const additionalSources = [
    {
      name: "MIT Technology Review",
      rssUrl: "https://www.technologyreview.com/feed/",
      category: "Technology",
      active: true,
    },
    {
      name: "VentureBeat AI",
      rssUrl: "https://venturebeat.com/category/ai/feed/",
      category: "Artificial Intelligence",
      active: true,
    },
    {
      name: "The Verge Tech",
      rssUrl: "https://www.theverge.com/rss/index.xml",
      category: "Technology",
      active: true,
    },
    {
      name: "Ars Technica",
      rssUrl: "https://feeds.arstechnica.com/arstechnica/technology-lab",
      category: "Technology",
      active: true,
    },
    {
      name: "DeepMind Blog",
      rssUrl: "https://deepmind.google/blog/rss.xml",
      category: "Artificial Intelligence",
      active: true,
    },
  ];

  for (const source of additionalSources) {
    try {
      await prisma.source.upsert({
        where: { rssUrl: source.rssUrl },
        update: { name: source.name, active: source.active },
        create: source,
      });
      console.log(`Added/updated: ${source.name}`);
    } catch (e: any) {
      console.error(`Failed to add ${source.name}: ${e.message}`);
    }
  }

  const totalSources = await prisma.source.count({ where: { active: true } });
  console.log(`\nTotal active sources: ${totalSources}`);
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
