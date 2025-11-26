/**
 * Global Search Modal
 * Cmd+K to search across all portal data
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, DollarSign, Users, Calendar, File, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchResult {
    id: string
    type: 'task' | 'invoice' | 'client' | 'booking' | 'document'
    title: string
    subtitle: string
    href: string
}

const typeIcons = {
    task: FileText,
    invoice: DollarSign,
    client: Users,
    booking: Calendar,
    document: File,
}

const typeColors = {
    task: 'text-blue-600',
    invoice: 'text-green-600',
    client: 'text-purple-600',
    booking: 'text-orange-600',
    document: 'text-gray-600',
}

interface GlobalSearchModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    // Debounced search
    useEffect(() => {
        if (!query || query.length < 2) {
            setResults([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/portal/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                if (data.success) {
                    const rawResults = data.data.results
                    setResults(Array.isArray(rawResults) ? rawResults : [])
                }
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setIsLoading(false)
            }
        }, 300) // 300ms debounce

        return () => clearTimeout(timeoutId)
    }, [query])

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev + 1) % results.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault()
            handleSelect(results[selectedIndex])
        }
    }, [results, selectedIndex])

    const handleSelect = (result: SearchResult) => {
        router.push(result.href)
        onOpenChange(false)
        setQuery('')
        setResults([])
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0">
                <DialogHeader className="px-4 pt-4 pb-0">
                    <DialogTitle className="sr-only">Global Search</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-3 px-4 pb-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks, invoices, clients, bookings..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="border-0 focus-visible:ring-0 text-base"
                        autoFocus
                    />
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {query.length > 0 && (
                    <div className="max-h-[400px] overflow-y-auto border-t">
                        {results.length === 0 && !isLoading && (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                {query.length < 2 ? 'Type at least 2 characters to search' : 'No results found'}
                            </div>
                        )}

                        {results.map((result, index) => {
                            const Icon = typeIcons[result.type]
                            return (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={cn(
                                        'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors',
                                        index === selectedIndex && 'bg-accent'
                                    )}
                                >
                                    <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', typeColors[result.type])} />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{result.title}</div>
                                        <div className="text-sm text-muted-foreground truncate">{result.subtitle}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground capitalize">{result.type}</div>
                                </button>
                            )
                        })}
                    </div>
                )}

                <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span><kbd className="px-1.5 py-0.5 rounded bg-background border">↑↓</kbd> Navigate</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-background border">Enter</kbd> Select</span>
                        <span><kbd className="px-1.5 py-0.5 rounded bg-background border">Esc</kbd> Close</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
