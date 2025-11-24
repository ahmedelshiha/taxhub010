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
        const [
            tasks,
            bookings,
            invoices,
            compliance,
            activity,
            invoiceAgg
        ] = await Promise.all([
            // 1. Pending Tasks
            prisma.task.findMany({
                where: {
                    tenantId,
                    status: { not: 'COMPLETED' },
                    assigneeId: userId // Only show tasks assigned to the user? Or all tenant tasks? Let's show assigned or created by for now.
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
            }),

            // 2. Upcoming Bookings
            prisma.booking.findMany({
                where: {
                    tenantId,
                    clientId: userId || undefined, // Ensure not null
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
            }) as Promise<Array<any>>, // Cast to any to bypass inference issues with Promise.all and includes

            // 3. Outstanding Invoices
            prisma.invoice.findMany({
                where: {
                    tenantId,
                    clientId: userId, // Show invoices for the current user
                    status: 'UNPAID'
                },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: {
                    id: true,
                    number: true,
                    totalCents: true,
                    createdAt: true, // Using createdAt as proxy for due date if not available
                    status: true
                }
            }),

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
                    status: true,
                    // ComplianceRecord doesn't have priority, so we'll infer or omit
                }
            }),

            // 5. Recent Activity
            prisma.auditLog.findMany({
                where: {
                    tenantId,
                    userId // Show activity for this user
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
            }),

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
            })
        ]);

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

        return NextResponse.json(dashboardData);

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
    }
});
