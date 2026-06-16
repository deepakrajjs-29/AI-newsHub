import { NextResponse } from "next/server";
import { runIngestion } from "../../../../services/ingestRunner";
import { supabase } from "../../../../lib/supabase";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing authorization header" },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);

    // 1. Get user details from Supabase Auth using the JWT token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user || !user.email) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired access token", details: error?.message },
        { status: 401 }
      );
    }

    // 2. Check if the user's email is registered in the admin_users table
    const adminRecord = await prisma.adminUser.findUnique({
      where: { email: user.email },
    });

    if (!adminRecord) {
      return NextResponse.json(
        { error: "Forbidden: You do not have administrator permissions" },
        { status: 403 }
      );
    }

    // 3. Trigger the ingestion runner manually
    const report = await runIngestion();

    return NextResponse.json({
      message: "Manual fetch and AI summarization completed successfully",
      report,
    });
  } catch (error: any) {
    console.error("Admin refresh execution error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
