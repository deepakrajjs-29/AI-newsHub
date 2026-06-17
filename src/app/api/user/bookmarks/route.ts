import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

async function getAuthenticatedProfile(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || !user.email) return null;

  return await prisma.profile.findUnique({
    where: { email: user.email },
  });
}

export async function GET(request: Request) {
  try {
    const profile = await getAuthenticatedProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { profileId: profile.id },
      include: {
        article: {
          include: {
            category: { select: { name: true, slug: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ bookmarks });
  } catch (err: any) {
    console.error("Bookmarks GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getAuthenticatedProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { articleId } = await request.json();
    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    const bookmark = await prisma.bookmark.upsert({
      where: {
        profileId_articleId: {
          profileId: profile.id,
          articleId
        }
      },
      update: {},
      create: {
        profileId: profile.id,
        articleId
      }
    });

    return NextResponse.json({ success: true, bookmark });
  } catch (err: any) {
    console.error("Bookmark POST error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const profile = await getAuthenticatedProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");
    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    await prisma.bookmark.deleteMany({
      where: {
        profileId: profile.id,
        articleId
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Bookmark DELETE error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
