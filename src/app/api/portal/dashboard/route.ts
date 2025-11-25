import { NextRequest, NextResponse } from 'next/server';
import { withTenantContext } from '@/lib/api-wrapper';
import { prisma } from '@/lib/prisma';
import { tenantContext } from '@/lib/tenant-context';

export const GET = withTenantContext(async (req: NextRequest) => {
    const ctx = tenantContext.getContextOrNull();
    const tenantId = ctx?.tenantId;

    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant context required' }, { status: 400 });
    }

    const userId = ctx?.userId;

    try {
        // Fetch all data in parallel with graceful fallbacks
        // Use Promise.allSettled to prevent one failure from blocking all data
        const results = await Promise.allSettled([
            // 1. Pending Tasks
            prisma.task.findMany({
                where: {
                    tenantId,
                    status: { not: 'COMPLETED' },
                    assigneeId: userId
                },
                orderBy: { dueAt: 'asc' },
                take: 5,
                select: {
                    id: true,
                    title: true,
                    priority: true,
                    dueAt: true,
                    status: true
                }
            }).catch(() => []),

            // 2. Upcoming Bookings
            prisma.booking.findMany({
                where: {
                    tenantId,
                    clientId: userId || undefined,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    scheduledAt: { gte: new Date() }
                },
                orderBy: { scheduledAt: 'asc' },
                take: 3,
                include: {
                    service: {
                        select: { name: true }
                    }
                }
            }).catch(() => []),

            // 3. Outstanding Invoices
            prisma.invoice.findMany({
                where: {
                    tenantId,
                    clientId: userId,
                    status: 'UNPAID'
                },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: {
                    id: true,
                    number: true,
                    totalCents: true,
                    createdAt: true,
                    status: true
                }
            }).catch(() => []),

            // 4. Compliance Records
            prisma.complianceRecord.findMany({
                where: {
                    tenantId,
                    status: { not: 'COMPLETED' }
                },
                orderBy: { dueAt: 'asc' },
                take: 3,
                select: {
                    id: true,
                    type: true,
                    dueAt: true,
                    status: true
                }
            }).catch(() => []),

            // 5. Recent Activity
            prisma.auditLog.findMany({
                where: {
                    tenantId,
                    userId
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    action: true,
                    resource: true,
                    createdAt: true,
                    user: {
                        select: { name: true }
                    }
                }
            }).catch(() => []),

            // 6. Invoice Aggregation
            prisma.invoice.aggregate({
                where: {
                    tenantId,
                    clientId: userId,
                    status: 'UNPAID'
                },
                _sum: {
                    totalCents: true
                }
            }).catch(() => ({ _sum: { totalCents: null } }))
        ]);

        // Extract values from settled promises
        const tasks = results[0].status === 'fulfilled' ? results[0].value : [];
        const bookings = results[1].status === 'fulfilled' ? results[1].value : [];
        const invoices = results[2].status === 'fulfilled' ? results[2].value : [];
        const compliance = results[3].status === 'fulfilled' ? results[3].value : [];
        const activity = results[4].status === 'fulfilled' ? results[4].value : [];
        const invoiceAgg = results[5].status === 'fulfilled' ? results[5].value : { _sum: { totalCents: null } };

        // Transform data for frontend
        const dashboardData = {
            tasks: tasks.map(t => ({
                id: t.id,
                title: t.title,
                priority: t.priority.toLowerCase(),
                dueDate: t.dueAt?.toISOString() || null,
                status: t.status.toLowerCase()
            })),
            bookings: bookings.map(b => ({
                id: b.id,
                serviceName: b.service?.name || 'Unknown Service',
                date: b.scheduledAt.toISOString(),
                time: b.scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: b.status.toLowerCase()
            })),
            invoices: invoices.map(i => ({
                id: i.id,
                number: i.number || 'Draft',
                amount: (i.totalCents || 0) / 100,
                dueDate: i.createdAt.toISOString(), // TODO: Add dueDate to Invoice model if needed
                status: i.status.toLowerCase()
            })),
            totalOutstanding: (invoiceAgg._sum.totalCents || 0) / 100,
            compliance: compliance.map(c => ({
                id: c.id,
                title: c.type, // Using type as title
                dueDate: c.dueAt?.toISOString() || null,
                progress: 0, // Placeholder
                priority: 'medium', // Placeholder
                status: c.status.toLowerCase()
            })),
            activity: activity.map(a => ({
                id: a.id,
                type: 'system', // Infer type from action?
                description: `${a.action} ${a.resource || ''}`,
                timestamp: a.createdAt.toISOString(),
                user: a.user?.name || 'System'
            }))
        };

        return NextResponse.json({
            success: true,
            ...dashboardData
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
});
