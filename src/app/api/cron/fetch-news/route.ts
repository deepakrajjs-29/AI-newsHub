import { NextResponse } from "next/server";
import { runIngestion } from "../../../../services/ingestRunner";
import { prisma } from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Authenticate the trigger using a secret token
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");
    
    const authHeader = request.headers.get("authorization");
    const headerSecret = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // Fetch cron secret from settings table or environment variable
    const cronSecretSetting = await prisma.setting.findUnique({
      where: { key: "cron_secret" },
    });
    
    const expectedSecret =
      process.env.CRON_SECRET ||
      cronSecretSetting?.value ||
      "ai-news-hub-cron-secret-12345";

    const providedSecret = querySecret || headerSecret;

    if (!providedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid or missing secret token" },
        { status: 401 }
      ) ;
    }

    // 2. Execute ingestion runner
    const report = await runIngestion();

    return NextResponse.json({
      message: "Ingestion job completed",
      report,
    });
  } catch (error: any) {
    console.error("Cron job execution error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
