"use client"

import { useState, useEffect, useRef } from 'react'
import { Send, X, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import useSWR from 'swr'

interface Message {
    id: string
    senderId: string
    recipientId: string
    body: string
    createdAt: string
    readAt: string | null
    sender: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

interface MessageThreadModalProps {
    open: boolean
    onClose: () => void
    threadId: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function MessageThreadModal({
    open,
    onClose,
    threadId,
}: MessageThreadModalProps) {
    const [replyBody, setReplyBody] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data, error, isLoading, mutate } = useSWR<{
        success: boolean
        data: Message[]
    }>(
        open && threadId ? `/api/messages/${threadId}/messages` : null,
        fetcher,
        {
            refreshInterval: 5000, // Poll every 5 seconds when open
            revalidateOnFocus: true,
        }
    )

    const messages = data?.data || []

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages.length])

    const handleSendReply = async () => {
        if (!replyBody.trim() || !threadId) {
            toast.error('Please enter a message')
            return
        }

        if (replyBody.length < 10) {
            toast.error('Message must be at least 10 characters')
            return
        }

        setSending(true)
        try {
            const response = await fetch(`/api/messages/${threadId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: replyBody }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to send reply')
            }

            toast.success('Reply sent')
            setReplyBody('')
            mutate() // Refresh messages
        } catch (err: any) {
            console.error('Error sending reply:', err)
            toast.error(err.message || 'Failed to send reply')
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Message Thread</DialogTitle>
                    <DialogDescription>
                        View and reply to this conversation
                    </DialogDescription>
                </DialogHeader>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-[400px]">
                    {isLoading ? (
                        <div className="text-center text-sm text-gray-500 py-8">
                            Loading messages...
                        </div>
                    ) : error || !data?.success ? (
                        <div className="text-center text-sm text-red-600 py-8">
                            Failed to load messages
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-sm text-gray-500 py-8">
                            No messages in this thread
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isCurrentUser = false // TODO: Get from session
                            const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId

                            return (
                                <div
                                    key={message.id}
                                    className={cn(
                                        'flex gap-3',
                                        isCurrentUser && 'flex-row-reverse'
                                    )}
                                >
                                    {showAvatar ? (
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            <AvatarImage src={message.sender.image || undefined} />
                                            <AvatarFallback className="text-xs">
                                                {message.sender.name?.charAt(0) || message.sender.email.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="h-8 w-8 flex-shrink-0" />
                                    )}

                                    <div
                                        className={cn(
                                            'flex flex-col max-w-[70%]',
                                            isCurrentUser && 'items-end'
                                        )}
                                    >
                                        {showAvatar && (
                                            <div className={cn(
                                                'text-xs font-medium text-gray-700 dark:text-gray-300 mb-1',
                                                isCurrentUser && 'text-right'
                                            )}>
                                                {message.sender.name || message.sender.email}
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                'rounded-lg p-3',
                                                isCurrentUser
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                            )}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.body}
                                            </p>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1 px-1">
                                            {formatDistanceToNow(new Date(message.createdAt), {
                                                addSuffix: true,
                                            })}
                                            {message.readAt && ' • Read'}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Reply Input */}
                <div className="space-y-2 pt-4 border-t">
                    <Textarea
                        placeholder="Type your reply... (minimum 10 characters)"
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        rows={3}
                        className="resize-none"
                        maxLength={5000}
                        disabled={sending}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendReply()
                            }
                        }}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            {replyBody.length}/5000 • Press Enter to send, Shift+Enter for new line
                        </p>
                        <Button
                            onClick={handleSendReply}
                            disabled={sending || !replyBody.trim()}
                            size="sm"
                            className="gap-2"
                        >
                            <Send className="h-4 w-4" />
                            {sending ? 'Sending...' : 'Send Reply'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
