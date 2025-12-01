/**
 * Compliance Export API
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCSV, csvPresets } from '@/lib/export/csv-export'

export async function POST(request: NextRequest) {
    try {
        const session = await getSessionOrBypass()
        if (!session?.user) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const tenantId = (session.user as any).tenantId
        const body = await request.json()
        const { format = 'csv' } = body

        // Fetch compliance items (FilingPeriods)
        const items = await prisma.filingPeriod.findMany({
            where: {
                obligation: {
                    entity: { tenantId },
                },
            },
            include: {
                obligation: {
                    include: {
                        entity: { select: { name: true } },
                    },
                },
            },
            orderBy: { dueAt: 'asc' },
        })

        // Transform for export
        const exportData = items.map(item => ({
            title: `${item.obligation.type} - ${item.obligation.country}`,
            type: item.obligation.type,
            status: item.status,
            dueDate: item.dueAt,
            entity: item.obligation.entity,
        }))

        if (format === 'csv') {
            const csvContent = generateCSV(exportData, csvPresets.compliance as any)
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="compliance-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            })
        }

        return new NextResponse('Unsupported format', { status: 400 })
    } catch (error: unknown) {
        console.error('Compliance export error:', error)
        return new NextResponse('Export failed', { status: 500 })
    }
}
