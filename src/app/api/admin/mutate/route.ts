import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { action, payload } = body;

    if (!action || !payload) {
      return NextResponse.json({ error: "Bad Request: Missing action or payload" }, { status: 400 });
    }

    switch (action) {
      case "createSource": {
        const { name, rssUrl, category, active } = payload;
        if (!name || !rssUrl || !category) {
          return NextResponse.json({ error: "Missing required fields for source creation" }, { status: 400 });
        }
        
        // Ensure category exists in Category table, create if not
        const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await prisma.category.upsert({
          where: { slug: catSlug },
          update: {},
          create: {
            name: category,
            slug: catSlug,
          },
        });

        const newSource = await prisma.source.create({
          data: {
            name,
            rssUrl,
            category,
            active: active ?? true,
          },
        });
        return NextResponse.json({ success: true, source: newSource });
      }

      case "toggleSource": {
        const { id, active } = payload;
        if (!id) return NextResponse.json({ error: "Missing source id" }, { status: 400 });

        const updatedSource = await prisma.source.update({
          where: { id },
          data: { active },
        });
        return NextResponse.json({ success: true, source: updatedSource });
      }

      case "deleteSource": {
        const { id } = payload;
        if (!id) return NextResponse.json({ error: "Missing source id" }, { status: 400 });

        await prisma.source.delete({
          where: { id },
        });
        return NextResponse.json({ success: true });
      }

      case "updateArticle": {
        const { id, summary, summaryLong } = payload;
        if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });

        const updatedArticle = await prisma.article.update({
          where: { id },
          data: {
            summary,
            summaryLong,
          },
        });
        return NextResponse.json({ success: true, article: updatedArticle });
      }

      case "deleteArticle": {
        const { id } = payload;
        if (!id) return NextResponse.json({ error: "Missing article id" }, { status: 400 });

        await prisma.article.delete({
          where: { id },
        });
        return NextResponse.json({ success: true });
      }

      case "saveSettings": {
        const { settings } = payload; // Expected shape: { key: value }
        if (!settings || typeof settings !== "object") {
          return NextResponse.json({ error: "Invalid settings payload" }, { status: 400 });
        }

        const promises = Object.entries(settings).map(([key, val]) => {
          return prisma.setting.upsert({
            where: { key },
            update: { value: String(val) },
            create: { key, value: String(val) },
          });
        });

        await Promise.all(promises);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Admin mutation error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
