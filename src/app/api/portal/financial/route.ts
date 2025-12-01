/**
 * Portal Financial API
 * Returns financial data and statistics for FinancialTab
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

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Fetch invoices and financial stats
    const [
      invoices,
      totalRevenue,
      outstandingInvoices,
      overdueInvoices,
      paidThisMonth,
      totalExpenses,
      lastMonthRevenue,
    ] = await Promise.all([
      // Recent invoices
      prisma.invoice.findMany({
        where: { tenantId },
        take: 10,
        orderBy: { createdAt: 'desc' }, // Use createdAt instead of dueDate
        include: {
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      // Total revenue (all paid invoices) - use totalCents
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'PAID',
        },
        _sum: { totalCents: true },
      }),
      // Outstanding invoices count (UNPAID)
      prisma.invoice.count({
        where: {
          tenantId,
          status: 'UNPAID',
        },
      }),
      // Void invoices count (using VOID as overdue equivalent)
      prisma.invoice.count({
        where: {
          tenantId,
          status: 'VOID',
        },
      }),
      // Paid this month - use totalCents
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          paidAt: { gte: firstDayOfMonth },
        },
        _sum: { totalCents: true },
      }),
      // Total expenses - use amountCents
      prisma.expense.aggregate({
        where: { tenantId },
        _sum: { amountCents: true },
      }),
      // Last month revenue for trend - use totalCents
      prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'PAID',
          paidAt: {
            gte: lastMonth,
            lt: firstDayOfMonth,
          },
        },
        _sum: { totalCents: true },
      }),
    ])

    // Convert cents to dollars
    const totalRevCents = totalRevenue._sum?.totalCents || 0
    const lastMonthRevCents = lastMonthRevenue._sum?.totalCents || 0
    const paidThisMonthCents = paidThisMonth._sum?.totalCents || 0
    const totalExpensesCents = totalExpenses._sum?.amountCents || 0

    const totalRev = totalRevCents / 100
    const lastMonthRev = lastMonthRevCents / 100
    const revenueTrend = lastMonthRev > 0
      ? ((totalRev - lastMonthRev) / lastMonthRev) * 100
      : 0

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        stats: {
          totalRevenue: totalRev,
          outstandingInvoices,
          overdueInvoices,
          paidThisMonth: paidThisMonthCents / 100,
          expenses: totalExpensesCents / 100,
          netIncome: totalRev - (totalExpensesCents / 100),
          revenueTrend: Number(revenueTrend.toFixed(1)),
        },
      },
    })
  } catch (error: unknown) {
    console.error('Portal financial API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch financial data',
        data: {
          invoices: [],
          stats: {
            totalRevenue: 0,
            outstandingInvoices: 0,
            overdueInvoices: 0,
            paidThisMonth: 0,
            expenses: 0,
            netIncome: 0,
            revenueTrend: 0,
          },
        },
      },
      { status: 500 }
    )
  }
}
