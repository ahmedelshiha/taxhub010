/**
 * Financial Summary API
 * GET /api/portal/financial-summary
 * 
 * Returns current and previous month financial data
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

        // Calculate date ranges
        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        // Fetch current month invoices grouped by status
        const currentMonthInvoices = await prisma.invoice.groupBy({
            by: ['status'],
            _sum: {
                totalCents: true,
            },
            where: {
                tenantId,
                createdAt: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
        })

        // Fetch previous month invoices grouped by status
        const previousMonthInvoices = await prisma.invoice.groupBy({
            by: ['status'],
            _sum: {
                totalCents: true,
            },
            where: {
                tenantId,
                createdAt: {
                    gte: previousMonthStart,
                    lte: previousMonthEnd,
                },
            },
        })

        // Fetch current month expenses
        const currentMonthExpenses = await prisma.expense.groupBy({
            by: ['status'],
            _sum: {
                amountCents: true, // Assuming Expense also uses cents based on schema convention, checking schema later if error
            },
            where: {
                tenantId,
                createdAt: {
                    gte: currentMonthStart,
                    lte: currentMonthEnd,
                },
            },
        })

        // Fetch previous month expenses
        const previousMonthExpenses = await prisma.expense.groupBy({
            by: ['status'],
            _sum: {
                amountCents: true,
            },
            where: {
                tenantId,
                createdAt: {
                    gte: previousMonthStart,
                    lte: previousMonthEnd,
                },
            },
        })

        // Helper to calculate totals from grouped invoice data
        const calculateInvoiceTotals = (groupedData: typeof currentMonthInvoices) => {
            let total = 0
            let paid = 0

            groupedData.forEach(group => {
                const amount = (group._sum.totalCents || 0) / 100
                total += amount
                if (group.status === 'PAID') {
                    paid += amount
                }
            })

            return { total, paid, unpaid: total - paid }
        }

        // Helper to calculate totals from grouped expense data
        const calculateExpenseTotals = (groupedData: typeof currentMonthExpenses) => {
            let pending = 0
            let approved = 0

            groupedData.forEach(group => {
                // Check if amountCents exists, otherwise fallback (if schema differs)
                // Based on previous error logs, 'amount' was used but might be 'amountCents'
                // Let's assume amountCents for now as per standard, if it fails we check schema
                const amount = (group._sum.amountCents || 0) / 100

                if (group.status === 'PENDING') {
                    pending += amount
                } else if (group.status === 'APPROVED') {
                    approved += amount
                }
            })

            return { pending, approved }
        }

        const currentInvoices = calculateInvoiceTotals(currentMonthInvoices)
        const previousInvoices = calculateInvoiceTotals(previousMonthInvoices)

        const currentExpenses = calculateExpenseTotals(currentMonthExpenses)
        const previousExpenses = calculateExpenseTotals(previousMonthExpenses)

        return respond.ok({
            data: {
                currentMonth: {
                    invoicesTotal: currentInvoices.total,
                    invoicesPaid: currentInvoices.paid,
                    invoicesUnpaid: currentInvoices.unpaid,
                    expensesPending: currentExpenses.pending,
                    expensesApproved: currentExpenses.approved,
                },
                previousMonth: {
                    invoicesTotal: previousInvoices.total,
                    invoicesPaid: previousInvoices.paid,
                    invoicesUnpaid: previousInvoices.unpaid,
                    expensesPending: previousExpenses.pending,
                    expensesApproved: previousExpenses.approved,
                },
            },
        })
    } catch (error) {
        console.error('Error fetching financial summary:', error)
        return respond.serverError()
    }
})
