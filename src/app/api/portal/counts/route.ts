/**
 * Portal Counts API
 * Returns badge counts for sidebar navigation
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

    // Fetch all counts in parallel
    const [
      kycPending,
      documentsPending,
      invoicesPending,
      billsPending,
      compliancePending,
      tasksPending,
      upcomingBookings,
    ] = await Promise.all([
      // KYC pending verification
      prisma.entity.count({
        where: {
          tenantId,
          status: 'PENDING',
        },
      }),

      // Documents pending review - count attachments with PENDING avStatus
      prisma.attachment.count({
        where: {
          tenantId,
          avStatus: 'PENDING',
        },
      }),

      // Invoices unpaid
      prisma.invoice.count({
        where: {
          tenantId,
          status: 'UNPAID',
        },
      }),

      // Bills pending approval
      prisma.bill.count({
        where: {
          tenantId,
          status: 'PENDING',
        },
      }),

      // Compliance items due soon (next 30 days) - query FilingPeriod
      prisma.filingPeriod.count({
        where: {
          obligation: {
            entity: {
              tenantId,
            },
          },
          dueAt: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
          status: 'UPCOMING',
        },
      }),

      // Tasks pending
      prisma.task.count({
        where: {
          tenantId,
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      }),

      // Upcoming bookings (next 7 days)
      prisma.booking.count({
        where: {
          tenantId,
          scheduledAt: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          status: 'CONFIRMED',
        },
      }),
    ])

    const counts = {
      kycPending,
      documentsPending,
      invoicesPending,
      billsPending,
      compliancePending,
      tasksPending,
      upcomingBookings,
    }

    return NextResponse.json({
      success: true,
      data: counts,
    })
  } catch (error: unknown) {
    console.error('Portal counts API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch counts',
        data: {
          kycPending: 0,
          documentsPending: 0,
          invoicesPending: 0,
          billsPending: 0,
          compliancePending: 0,
          tasksPending: 0,
          upcomingBookings: 0,
        }
      },
      { status: 500 }
    )
  }
}
