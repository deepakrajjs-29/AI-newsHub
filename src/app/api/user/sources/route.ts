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

    const sources = await prisma.source.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ sources });
  } catch (err: any) {
    console.error("User sources GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getAuthenticatedProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gated check removed for MVP growth phase (all features free)

    const body = await request.json();
    const { name, rssUrl, category } = body;
    if (!name || !rssUrl || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify unique RSS URL globally or for this profile
    const existing = await prisma.source.findFirst({
      where: { rssUrl }
    });

    if (existing) {
      return NextResponse.json({ error: "This RSS source is already registered" }, { status: 400 });
    }

    const source = await prisma.source.create({
      data: {
        name,
        rssUrl,
        category,
        profileId: profile.id,
        active: true
      }
    });

    return NextResponse.json({ success: true, source });
  } catch (err: any) {
    console.error("User sources POST error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const profile = await getAuthenticatedProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get("sourceId");
    if (!sourceId) {
      return NextResponse.json({ error: "Missing sourceId" }, { status: 400 });
    }

    // Ensure they own this source
    const source = await prisma.source.findFirst({
      where: { id: sourceId, profileId: profile.id }
    });

    if (!source) {
      return NextResponse.json({ error: "Source not found or access denied" }, { status: 404 });
    }

    await prisma.source.delete({
      where: { id: sourceId }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("User sources DELETE error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
