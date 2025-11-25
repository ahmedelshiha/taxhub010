import { NextRequest, NextResponse } from "next/server";
import { withTenantContext } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

interface FeatureCounts {
  kycPending: number;
  documentsPending: number;
  invoicesPending: number;
  billsPending: number;
  approvalsPending: number;
  // Phase 3 additions
  tasksPending: number;
  upcomingBookings: number;
  unreadNotifications: number;
  outstandingInvoices: number;
  pendingExpenses: number;
}

/**
 * GET /api/features/counts?entityId=...
 * Get pending item counts for each feature area
 */
const _api_GET = async (request: NextRequest) => {
  try {
    const ctx = requireTenantContext();
    const { searchParams } = new URL(request.url);
    const entityId = searchParams.get("entityId");

    if (!ctx.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // If entityId provided, verify it belongs to tenant
    const query: any = { tenantId: ctx.tenantId };
    if (entityId) {
      const entity = await prisma.entity.findUnique({
        where: { id: entityId },
      });

      if (!entity || entity.tenantId !== ctx.tenantId) {
        return NextResponse.json(
          { error: "Entity not found" },
          { status: 404 }
        );
      }
      query.entityId = entityId;
    }

    // Run all count queries in parallel
    const [
      tasksPending,
      upcomingBookings,
      unreadNotifications,
      outstandingInvoicesCount,
      pendingExpenses,
    ] = await Promise.all([
      // Tasks pending (IN_PROGRESS or PENDING status)
      prisma.task.count({
        where: {
          tenantId: ctx.tenantId as string,
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      }),

      // Upcoming bookings (next 30 days, PENDING or CONFIRMED)
      prisma.booking.count({
        where: {
          tenantId: ctx.tenantId as string,
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
      }),

      // Unread notifications
      prisma.notification.count({
        where: {
          userId: ctx.userId as string,
          status: 'sent',
        },
      }),

      // Outstanding invoices (unpaid)
      prisma.invoice.count({
        where: {
          tenantId: ctx.tenantId as string,
          status: 'UNPAID',
        },
      }),

      // Pending expenses
      prisma.expense.count({
        where: {
          tenantId: ctx.tenantId as string,
          status: 'PENDING',
        },
      }),
    ]);

    const counts: FeatureCounts = {
      // Legacy counts (kept for backwards compatibility)
      kycPending: 0,
      documentsPending: 0,
      invoicesPending: outstandingInvoicesCount, // Map to new field
      billsPending: 0,
      approvalsPending: 0,

      // Phase 3 counts
      tasksPending,
      upcomingBookings,
      unreadNotifications,
      outstandingInvoices: outstandingInvoicesCount,
      pendingExpenses,
    };

    return NextResponse.json({
      success: true,
      data: counts,
    });
  } catch (error) {
    logger.error("Error fetching feature counts", { error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = withTenantContext(_api_GET, { requireAuth: true });
