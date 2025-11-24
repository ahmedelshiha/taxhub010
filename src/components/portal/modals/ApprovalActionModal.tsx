"use client"

import { useState } from 'react'
import { Check, X, AlertCircle, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Approval {
    id: string
    type: string
    status: string
    requesterId: string
    requesterName?: string
    requestedAt: string
    description?: string
    metadata?: any
    amount?: number
    entityType?: string
    entityId?: string
}

interface ApprovalHistory {
    id: string
    action: string
    performedBy: string
    performedByName?: string
    comment?: string
    createdAt: string
}

interface ApprovalActionModalProps {
    open: boolean
    onClose: () => void
    approval: Approval | null
    onSuccess: () => void
}

const approvalTypeConfig = {
    expense: { color: 'bg-orange-500', label: 'Expense Approval' },
    document: { color: 'bg-purple-500', label: 'Document Approval' },
    timeoff: { color: 'bg-blue-500', label: 'Time Off' },
    purchase: { color: 'bg-green-500', label: 'Purchase Order' },
    workflow: { color: 'bg-gray-500', label: 'Workflow' },
    default: { color: 'bg-gray-400', label: 'Approval Request' },
}

export function ApprovalActionModal({
    open,
    onClose,
    approval,
    onSuccess,
}: ApprovalActionModalProps) {
    const [comment, setComment] = useState('')
    const [action, setAction] = useState<'approve' | 'reject' | null>(null)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [history, setHistory] = useState<ApprovalHistory[]>([])

    // Fetch approval history when modal opens
    useState(() => {
        if (open && approval) {
            fetchHistory()
        }
    }, [open, approval])

    const fetchHistory = async () => {
        if (!approval) return

        try {
            const response = await fetch(`/api/approvals/${approval.id}/history`)
            if (response.ok) {
                const data = await response.json()
                setHistory(data.data || [])
            }
        } catch (err) {
            console.error('Failed to fetch approval history:', err)
        }
    }

    const handleAction = (selectedAction: 'approve' | 'reject') => {
        setAction(selectedAction)

        // For rejection, require comment
        if (selectedAction === 'reject' && (!comment || comment.trim().length < 10)) {
            toast.error('Please provide a reason for rejection (min 10 characters)')
            return
        }

        setConfirmDialogOpen(true)
    }

    const confirmAction = async () => {
        if (!approval || !action) return

        setLoading(true)
        try {
            const endpoint = `/api/approvals/${approval.id}/${action}`
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: comment || undefined }),
            })


            const handleClose = () => {
                setComment('')
                setAction(null)
                setConfirmDialogOpen(false)
                onClose()
            }

            if (!approval) return null

            const typeConfig =
                approvalTypeConfig[approval.type as keyof typeof approvalTypeConfig] ||
                approvalTypeConfig.default

            return (
                <>
                    <Dialog open={open} onOpenChange={handleClose}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <DialogTitle className="text-xl">Approval Request</DialogTitle>
                                        <DialogDescription className="mt-2">
                                            Review and take action on this approval request
                                        </DialogDescription>
                                    </div>
                                    <Badge className={cn('text-white', typeConfig.color)}>
                                        {typeConfig.label}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Request Details */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <User className="h-4 w-4" />
                                        <span>
                                            Requested by{' '}
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {approval.requesterName || 'Unknown'}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {formatDistanceToNow(new Date(approval.requestedAt), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                    {approval.amount && (
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Amount: ${approval.amount.toFixed(2)}
                                        </div>
                                    )}
                                    {approval.description && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                            {approval.description}
                                        </p>
                                    )}
                                </div>

                                {/* Approval History */}
                                {history.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                            Approval History
                                        </h3>
                                        <div className="space-y-2">
                                            {history.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    className="flex items-start gap-3 text-sm p-2 rounded border border-gray-200 dark:border-gray-700"
                                                >
                                                    <div
                                                        className={cn(
                                                            'mt-0.5 h-2 w-2 rounded-full',
                                                            entry.action === 'APPROVED'
                                                                ? 'bg-green-500'
                                                                : entry.action === 'REJECTED'
                                                                    ? 'bg-red-500'
                                                                    : 'bg-gray-400'
                                                        )}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-gray-900 dark:text-gray-100">
                                                            <span className="font-medium">
                                                                {entry.performedByName || 'Unknown'}
                                                            </span>{' '}
                                                            {entry.action.toLowerCase()} this request
                                                        </p>
                                                        {entry.comment && (
                                                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                                "{entry.comment}"
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatDistanceToNow(new Date(entry.createdAt), {
                                                                addSuffix: true,
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Comment Section */}
                                <div>
                                    <label
                                        htmlFor="approval-comment"
                                        className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
                                    >
                                        Comment {action === 'reject' && <span className="text-red-500">*</span>}
                                    </label>
                                    <Textarea
                                        id="approval-comment"
                                        placeholder={
                                            action === 'reject'
                                                ? 'Please provide a reason for rejection (required, min 10 characters)'
                                                : 'Add an optional comment (optional)'
                                        }
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        className="resize-none"
                                        maxLength={500}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {comment.length}/500 characters
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="flex gap-2">
                                <Button variant="outline" onClick={handleClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleAction('reject')}
                                    disabled={loading || approval.status !== 'PENDING'}
                                    className="gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Reject
                                </Button>
                                <Button
                                    onClick={() => handleAction('approve')}
                                    disabled={loading || approval.status !== 'PENDING'}
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                >
                                    <Check className="h-4 w-4" />
                                    Approve
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Confirmation Dialog */}
                    <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertCircle className={cn(
                                        'h-5 w-5',
                                        action === 'approve' ? 'text-green-600' : 'text-red-600'
                                    )} />
                                    Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to {action} this approval request?
                                    {action === 'reject' && comment && (
                                        <span className="block mt-2 text-sm text-gray-700 dark:text-gray-300">
                                            Your reason: "{comment}"
                                        </span>
                                    )}
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmAction}
                                    disabled={loading}
                                    className={cn(
                                        action === 'approve'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    )}
                                >
                                    {loading ? 'Processing...' : `Confirm ${action === 'approve' ? 'Approval' : 'Rejection'}`}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )
        }
