'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface CreateInvoiceModalProps {
    open: boolean
    onClose: () => void
    onSubmit: (data: { description: string; amount: number; dueDate?: string }) => void
    isCreating: boolean
}

export function CreateInvoiceModal({ open, onClose, onSubmit, isCreating }: CreateInvoiceModalProps) {
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [dueDate, setDueDate] = useState('')

    const handleSubmit = () => {
        if (!description || !amount) {
            toast.error('Please fill in all required fields')
            return
        }
        onSubmit({ description, amount: parseFloat(amount), dueDate: dueDate || undefined })
        setDescription('')
        setAmount('')
        setDueDate('')
    }

    const handleClose = () => {
        if (!isCreating) {
            setDescription('')
            setAmount('')
            setDueDate('')
            onClose()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Fill in the details to create a new invoice</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                        <Input placeholder="Invoice description" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isCreating} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount (USD) *</label>
                        <Input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={isCreating} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date (optional)</label>
                        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={isCreating} />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={handleClose} disabled={isCreating}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isCreating || !description || !amount}>
                            {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating...</> : <><Plus className="h-4 w-4 mr-2" />Create Invoice</>}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
