import { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-news-hub-mvp.onrender.com";

  // Fetch all processed article slugs
  const articles = await prisma.article.findMany({
    where: { status: "processed" },
    select: { slug: true, updatedAt: true },
  });

  const articleUrls = articles.map((article) => ({
    url: `${siteUrl}/news/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
  ];

  return [...staticUrls, ...articleUrls];
}
