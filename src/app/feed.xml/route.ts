import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-news-hub-mvp.onrender.com";

  // Fetch latest 20 processed articles
  const articles = await prisma.article.findMany({
    where: { status: "processed" },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const feedItems = articles
    .map((art) => {
      const pubDate = new Date(art.publishedAt).toUTCString();
      const articleLink = `${siteUrl}/news/${art.slug}`;
      const descriptionText = art.summary || "Summary pending.";

      return `
    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${articleLink}</link>
      <guid isPermaLink="true">${articleLink}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${descriptionText}]]></description>
    </item>`;
    })
    .join("");

  const rssFeedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>AI News Hub</title>
  <link>${siteUrl}</link>
  <description>Aggregated and summarized AI news insights from top industry sources.</description>
  <language>en-us</language>
  <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
  ${feedItems}
</channel>
</rss>`;

  return new Response(rssFeedXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
