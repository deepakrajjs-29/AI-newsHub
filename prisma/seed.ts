import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");
  const categories = [
    { name: "News", slug: "news", description: "General AI news and announcements" },
    { name: "Research", slug: "research", description: "Academic papers, preprints, and scientific breakthroughs" },
    { name: "Engineering", slug: "engineering", description: "Technical implementation, developer articles, and code blogs" },
    { name: "Community", slug: "community", description: "Community initiatives, open-source projects, and forum highlights" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoryMap[cat.name] = record.id;
  }

  console.log("Seeding sources...");
  const sources = [
    {
      name: "OpenAI Blog",
      rssUrl: "https://openai.com/news/rss.xml",
      category: "News",
      active: true,
    },
    {
      name: "Anthropic News",
      rssUrl: "https://www.anthropic.com/news.xml", // Placeholder URL (Admin can edit/disable)
      category: "News",
      active: false, // Inactive by default as it's a placeholder
    },
    {
      name: "Google AI Blog",
      rssUrl: "https://research.google/blog/feed/",
      category: "Research",
      active: true,
    },
    {
      name: "Hugging Face Blog",
      rssUrl: "https://huggingface.co/blog/feed.xml",
      category: "Community",
      active: true,
    },
    {
      name: "arXiv Artificial Intelligence",
      rssUrl: "https://rss.arxiv.org/rss/cs.ai",
      category: "Research",
      active: true,
    },
  ];

  for (const source of sources) {
    await prisma.source.upsert({
      where: { rssUrl: source.rssUrl },
      update: {
        name: source.name,
        category: source.category,
        active: source.active,
      },
      create: source,
    });
  }

  console.log("Seeding system settings...");
  const defaultSettings = [
    { key: "cron_interval_minutes", value: "60" },
    { key: "openai_model", value: "gpt-4o-mini" },
    { key: "similarity_threshold", value: "0.85" },
    { key: "cron_secret", value: "ai-news-hub-cron-secret-12345" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Seeding admin list...");
  const defaultAdmins = [
    { email: "admin@ainewshub.com" },
  ];

  for (const admin of defaultAdmins) {
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: {},
      create: admin,
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
