import { NextRequest, NextResponse } from "next/server";
import { withTenantContext } from "@/lib/api-wrapper";
import { requireTenantContext } from "@/lib/tenant-utils";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    type: "booking" | "task" | "compliance";
    resource: any;
}

/**
 * GET /api/portal/calendar?start=ISO_DATE&end=ISO_DATE
 * Get calendar events (bookings, tasks, compliance) for date range
 */
const _api_GET = async (request: NextRequest) => {
    try {
        const ctx = requireTenantContext();
        const { searchParams } = new URL(request.url);
        const startParam = searchParams.get("start");
        const endParam = searchParams.get("end");

        if (!ctx.userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        if (!startParam || !endParam) {
            return NextResponse.json(
                { error: "Start and end dates are required" },
                { status: 400 }
            );
        }

        const start = new Date(startParam);
        const end = new Date(endParam);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format" },
                { status: 400 }
            );
        }

        // Fetch bookings and tasks in parallel
        const [bookings, tasks] = await Promise.all([
            // Bookings
            prisma.booking.findMany({
                where: {
                    tenantId: ctx.tenantId as string,
                    scheduledAt: {
                        gte: start,
                        lte: end,
                    },
                },
                select: {
                    id: true,
                    scheduledAt: true,
                    status: true,
                    clientName: true,
                    service: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    scheduledAt: "asc",
                },
            }),

            // Tasks
            prisma.task.findMany({
                where: {
                    tenantId: ctx.tenantId as string,
                    dueAt: {
                        gte: start,
                        lte: end,
                    },
                },
                select: {
                    id: true,
                    title: true,
                    dueAt: true,
                    status: true,
                    priority: true,
                    description: true,
                },
                orderBy: {
                    dueAt: "asc",
                },
            }),
        ]);

        const events: CalendarEvent[] = [];

        // Transform bookings to calendar events
        bookings.forEach((booking) => {
            const endDate = new Date(booking.scheduledAt);
            endDate.setHours(endDate.getHours() + 1); // Default 1-hour duration

            events.push({
                id: `booking-${booking.id}`,
                title: booking.service.name,
                start: booking.scheduledAt.toISOString(),
                end: endDate.toISOString(),
                type: "booking",
                resource: {
                    ...booking,
                    serviceName: booking.service.name,
                    entityType: "booking",
                },
            });
        });

        // Transform tasks to calendar events
        tasks.forEach((task) => {
            if (!task.dueAt) return;

            const taskDate = new Date(task.dueAt);
            taskDate.setHours(23, 59, 59); // End of day

            events.push({
                id: `task-${task.id}`,
                title: task.title,
                start: task.dueAt.toISOString(),
                end: taskDate.toISOString(),
                type: "task",
                resource: {
                    ...task,
                    entityType: "task",
                },
            });
        });

        // TODO: Add compliance deadlines when Document model is available

        return NextResponse.json({
            success: true,
            data: events,
            meta: {
                total: events.length,
                bookings: bookings.length,
                tasks: tasks.length,
                compliance: 0,
            },
        });
    } catch (error) {
        logger.error("Error fetching calendar events", { error });
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};

export const GET = withTenantContext(_api_GET, { requireAuth: true });
