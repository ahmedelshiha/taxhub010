/**
 * Tasks Export API
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
        const { format = 'csv', filters = {} } = body

        // Fetch tasks with filters
        const tasks = await prisma.task.findMany({
            where: {
                tenantId,
                ...(filters.status && { status: filters.status }),
            },
            include: {
                assignee: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        if (format === 'csv') {
            const csvContent = generateCSV(tasks, csvPresets.tasks as any)
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="tasks-${new Date().toISOString().split('T')[0]}.csv"`,
                },
            })
        }

        return new NextResponse('Unsupported format', { status: 400 })
    } catch (error: unknown) {
        console.error('Tasks export error:', error)
        return new NextResponse('Export failed', { status: 500 })
    }
}
