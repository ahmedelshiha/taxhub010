/**
 * Portal Tasks API
 * Returns tasks list and statistics for TasksTab
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSessionOrBypass } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionOrBypass()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = (session.user as any).id
    const tenantId = (session.user as any).tenantId

    // Get filter from query params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') // 'active', 'completed', or null for all

    // Build where clause
    const whereClause: any = { tenantId }
    if (status === 'active') {
      whereClause.status = { in: ['OPEN', 'IN_PROGRESS'] }
    } else if (status === 'completed') {
      whereClause.status = 'COMPLETED'
    }

    // Fetch tasks and stats in parallel
    const [tasks, totalCount, activeCount, completedCount, overdueCount] = await Promise.all([
      prisma.task.findMany({
        where: whereClause,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { dueAt: 'asc' },
        ],
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.task.count({ where: { tenantId } }),
      prisma.task.count({ 
        where: { 
          tenantId, 
          status: { in: ['OPEN', 'IN_PROGRESS'] } 
        } 
      }),
      prisma.task.count({ 
        where: { 
          tenantId, 
          status: 'COMPLETED' 
        } 
      }),
      prisma.task.count({
        where: {
          tenantId,
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          dueAt: { lt: new Date() },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        stats: {
          total: totalCount,
          active: activeCount,
          completed: completedCount,
          overdue: overdueCount,
        },
      },
    })
  } catch (error: unknown) {
    console.error('Portal tasks API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tasks',
        data: {
          tasks: [],
          stats: {
            total: 0,
            active: 0,
            completed: 0,
            overdue: 0,
          },
        },
      },
      { status: 500 }
    )
  }
}
