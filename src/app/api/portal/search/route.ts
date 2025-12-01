/**
 * Global Search API
 * GET /api/portal/search
 * 
 * Search across tasks, bookings, documents, and invoices
 */

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { respond } from '@/lib/api-response'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'

export const GET = withTenantContext(async (request: NextRequest) => {
    try {
        const ctx = requireTenantContext()
        const { userId, tenantId } = ctx

        if (!userId || !tenantId) {
            return respond.unauthorized()
        }

        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q') || ''
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

        if (!query.trim()) {
            return respond.ok({ data: [] })
        }

        const searchTerm = `%${query}%`

        // Search tasks
        const tasks = await prisma.task.findMany({
            where: {
                tenantId,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
            },
            take: limit,
        })

        // Search bookings
        const bookings = await prisma.booking.findMany({
            where: {
                tenantId,
                OR: [
                    { clientName: { contains: query, mode: 'insensitive' } },
                    { notes: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                scheduledAt: true,
                status: true,
                service: {
                    select: {
                        name: true,
                    },
                },
            },
            take: limit,
        })

        // Note: Document model doesn't exist in schema, skipping document search
        const documents: any[] = []

        // Search invoices
        const invoices = await prisma.invoice.findMany({
            where: {
                tenantId,
                number: { contains: query, mode: 'insensitive' },
            },
            select: {
                id: true,
                number: true,
                totalCents: true,
                status: true,
                createdAt: true,
            },
            take: limit,
        })

        // Transform results to common format
        const results = [
            ...tasks.map(task => ({
                id: task.id,
                type: 'task' as const,
                title: task.title,
                subtitle: `${task.status} • ${task.priority} priority`,
                href: `/portal/tasks?id=${task.id}`,
            })),
            ...bookings.map(booking => ({
                id: booking.id,
                type: 'booking' as const,
                title: booking.service?.name || 'Unknown Service',
                subtitle: `${new Date(booking.scheduledAt).toLocaleDateString()} • ${booking.status}`,
                href: `/portal/bookings?id=${booking.id}`,
            })),
            ...documents.map(doc => ({
                id: doc.id,
                type: 'document' as const,
                title: doc.filename,
                subtitle: `${doc.fileType} • ${new Date(doc.uploadedAt).toLocaleDateString()}`,
                href: `/portal/documents?id=${doc.id}`,
            })),
            ...invoices.map(invoice => ({
                id: invoice.id,
                type: 'invoice' as const,
                title: invoice.number || 'Invoice',
                subtitle: `$${(invoice.totalCents / 100).toFixed(2)} • ${invoice.status}`,
                href: `/portal/invoices?id=${invoice.id}`,
            })),
        ]

        // Sort by relevance (exact matches first, then partial)
        const sortedResults = results.sort((a, b) => {
            const aExact = a.title.toLowerCase() === query.toLowerCase()
            const bExact = b.title.toLowerCase() === query.toLowerCase()
            if (aExact && !bExact) return -1
            if (!aExact && bExact) return 1
            return 0
        })

        return respond.ok({
            data: sortedResults.slice(0, limit),
            meta: {
                query,
                totalResults: results.length,
                limit,
            },
        })
    } catch (error: unknown) {
        console.error('Search error:', error)
        return respond.serverError()
    }
})
