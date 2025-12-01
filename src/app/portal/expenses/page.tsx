'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Receipt } from 'lucide-react'

export default function ExpensesPage() {
    const router = useRouter()

    return (
        <div className="space-y-6 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your business expenses and receipts</p>
                </div>
                <Button onClick={() => router.push('/portal/expenses/scan')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Scan Receipt
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$0.00</div>
                        <p className="text-xs text-muted-foreground">No expenses recorded yet</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-gray-500">
                        No expenses found. Scan a receipt to get started.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
