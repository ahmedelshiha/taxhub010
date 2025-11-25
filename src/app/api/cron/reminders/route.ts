import { NextRequest, NextResponse } from "next/server";
import { ReminderService } from "@/lib/services/reminder-service";
import { logger } from "@/lib/logger";

/**
 * GET /api/cron/reminders
 * Triggered by Vercel Cron or external scheduler
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (e.g., CRON_SECRET)
    // For MVP, we'll check for a simple secret or allow if in development
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow if no secret configured (dev) or matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await ReminderService.processReminders();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("Cron job failed", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
