import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

// Helper to authenticate user from Bearer Token
async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user || !user.email) {
    return null;
  }
  return user;
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Auto-create profile on first login (upsert pattern)
    const profile = await prisma.profile.upsert({
      where: { email: user.email! },
      update: {}, // Don't overwrite existing data
      create: {
        email: user.email!,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
        role: "user",
        tier: "pro",
      },
    });

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName } = body;

    const profile = await prisma.profile.update({
      where: { email: user.email },
      data: { fullName },
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("Profile PUT error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
