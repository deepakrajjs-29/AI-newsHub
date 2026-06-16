import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);

    // Verify JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    // Check admin database list
    const adminRecord = await prisma.adminUser.findUnique({
      where: { email: user.email },
    });
    if (!adminRecord) {
      return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
    }

    // Fetch Stats
    const totalArticles = await prisma.article.count();
    const pendingArticles = await prisma.article.count({ where: { status: "pending" } });
    const processedArticles = await prisma.article.count({ where: { status: "processed" } });
    const failedArticles = await prisma.article.count({ where: { status: "failed" } });
    const totalSources = await prisma.source.count();
    const activeSources = await prisma.source.count({ where: { active: true } });

    // Fetch sources, articles (latest 50), logs (latest 30), and settings
    const sources = await prisma.source.findMany({
      orderBy: { createdAt: "desc" },
    });
    const articles = await prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 50,
      include: {
        category: { select: { name: true } },
      },
    });
    const logs = await prisma.cronLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    const settings = await prisma.setting.findMany();

    return NextResponse.json({
      stats: {
        totalArticles,
        pendingArticles,
        processedArticles,
        failedArticles,
        totalSources,
        activeSources,
      },
      sources,
      articles,
      logs,
      settings,
    });
  } catch (err: any) {
    console.error("Admin data fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
