"use client"

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface MessageComposeModalProps {
    open: boolean
    onClose: () => void
    defaultRecipient?: string
    onSuccess?: () => void
}

export function MessageComposeModal({
    open,
    onClose,
    defaultRecipient,
    onSuccess,
}: MessageComposeModalProps) {
    const [recipientId, setRecipientId] = useState(defaultRecipient || '')
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!recipientId || !body.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        if (body.length < 10) {
            toast.error('Message body must be at least 10 characters')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId,
                    subject: subject || undefined,
                    body,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to send message')
            }

            toast.success('Message sent successfully')
            onSuccess?.()
            handleClose()
        } catch (err: any) {
            console.error('Error sending message:', err)
            toast.error(err.message || 'Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setRecipientId(defaultRecipient || '')
        setSubject('')
        setBody('')
        onClose()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Compose Message</DialogTitle>
                    <DialogDescription>
                        Send a message to support staff
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Recipient Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="recipient">
                            Recipient <span className="text-red-500">*</span>
                        </Label>
                        <Select value={recipientId} onValueChange={setRecipientId}>
                            <SelectTrigger id="recipient">
                                <SelectValue placeholder="Select a recipient" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="support">Support Team</SelectItem>
                                <SelectItem value="accounting">Accounting</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            placeholder="Enter message subject (optional)"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            maxLength={255}
                            disabled={loading}
                        />
                    </div>

                    {/* Message Body */}
                    <div className="space-y-2">
                        <Label htmlFor="body">
                            Message <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="body"
                            placeholder="Type your message here... (minimum 10 characters)"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={8}
                            className="resize-none"
                            maxLength={5000}
                            disabled={loading}
                            required
                        />
                        <p className="text-xs text-gray-500">
                            {body.length}/5000 characters
                        </p>
                    </div>
                </form>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        type="button"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !recipientId || !body.trim()}
                        className="gap-2"
                    >
                        <Send className="h-4 w-4" />
                        {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
