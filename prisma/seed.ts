import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up old database records...");
  await prisma.cronLog.deleteMany({});
  await prisma.processingJob.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.articleTag.deleteMany({});
  await prisma.article.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.source.deleteMany({});
  await prisma.category.deleteMany({});

  console.log("Seeding new technology categories...");
  const categories = [
    { name: "Artificial Intelligence", slug: "artificial-intelligence", description: "General AI developments, foundational models, and announcements" },
    { name: "Machine Learning", slug: "machine-learning", description: "Machine learning research, architectures, frameworks, and core math" },
    { name: "Generative AI", slug: "generative-ai", description: "LLMs, image generation, video generation, and prompt engineering tools" },
    { name: "Cloud Computing", slug: "cloud-computing", description: "Cloud infrastructure, serverless architecture, AWS, Azure, and Google Cloud" },
    { name: "Cybersecurity", slug: "cybersecurity", description: "Threat intelligence, software vulnerabilities, data breaches, and defensive security" },
    { name: "Developer Tools", slug: "developer-tools", description: "Coding libraries, developer environments, CLI tools, and databases" },
    { name: "Startups", slug: "startups", description: "Tech funding, product launches, founders, and business growth" },
    { name: "Technology", slug: "technology", description: "General technology news, consumer tech, and electronics" },
    { name: "Data Science", slug: "data-science", description: "Analytics, data warehousing, python libraries, data visualisations, and scraping" },
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

  console.log("Seeding expanded RSS sources...");
  const sources = [
    {
      name: "OpenAI Blog",
      rssUrl: "https://openai.com/news/rss.xml",
      category: "Artificial Intelligence",
      active: true,
    },
    {
      name: "Anthropic News",
      rssUrl: "https://www.anthropic.com/news.xml",
      category: "Artificial Intelligence",
      active: true,
    },
    {
      name: "Google Research Blog",
      rssUrl: "http://googleresearch.blogspot.com/atom.xml",
      category: "Machine Learning",
      active: true,
    },
    {
      name: "Hugging Face Blog",
      rssUrl: "https://huggingface.co/blog/feed.xml",
      category: "Machine Learning",
      active: true,
    },
    {
      name: "Nvidia Developer Blog",
      rssUrl: "https://developer.nvidia.com/blog/feed",
      category: "Generative AI",
      active: true,
    },
    {
      name: "AWS News Blog",
      rssUrl: "https://aws.amazon.com/blogs/aws/feed/",
      category: "Cloud Computing",
      active: true,
    },
    {
      name: "BleepingComputer",
      rssUrl: "https://www.bleepingcomputer.com/feed/",
      category: "Cybersecurity",
      active: true,
    },
    {
      name: "InfoQ Developer News",
      rssUrl: "https://feed.infoq.com/",
      category: "Developer Tools",
      active: true,
    },
    {
      name: "TechCrunch Startups",
      rssUrl: "https://techcrunch.com/feed/",
      category: "Startups",
      active: true,
    },
    {
      name: "Wired Technology",
      rssUrl: "https://www.wired.com/feed/rss",
      category: "Technology",
      active: true,
    },
    {
      name: "KDnuggets Data Science",
      rssUrl: "https://www.kdnuggets.com/feed",
      category: "Data Science",
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
    { key: "cron_interval_minutes", value: "30" },
    { key: "openai_model", value: "gemini-2.5-flash" },
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
