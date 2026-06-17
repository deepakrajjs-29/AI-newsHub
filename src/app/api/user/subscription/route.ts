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

    const body = await request.json();
    const { action } = body; // e.g. "upgrade" or "downgrade"

    const newTier = action === "downgrade" ? "free" : "pro";

    const profile = await prisma.profile.update({
      where: { email: user.email },
      data: { tier: newTier },
    });

    return NextResponse.json({ success: true, tier: profile.tier });
  } catch (err: any) {
    console.error("Subscription update error:", err);
    return NextResponse.json({ error: "Internal Server Error", message: err.message }, { status: 500 });
  }
}
