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

    // Verify JWT with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user || !user.email) {
      return NextResponse.json({ error: "Unauthorized: Invalid session" }, { status: 401 });
    }

    // Sync profile to local database
    const email = user.email;
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
    const avatarUrl = user.user_metadata?.avatar_url || null;

    // Check if the user should be admin based on admin_users table
    const isAdminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    const role = isAdminUser ? "admin" : "user";
    const defaultTier = "pro";

    const profile = await prisma.profile.upsert({
      where: { email },
      update: {
        fullName,
        avatarUrl,
        role,
        tier: defaultTier,
      },
      create: {
        id: user.id,
        email,
        fullName,
        avatarUrl,
        role,
        tier: defaultTier,
      },
    });

    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error("Auth sync error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
