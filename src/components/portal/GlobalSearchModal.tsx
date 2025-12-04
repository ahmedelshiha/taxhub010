/**
 * GlobalSearchModal Component
 * 
 * Keyboard-driven search modal for quick navigation
 * Activated by Cmd+K / Ctrl+K
 * 
 * Features:
 * - Search across tasks, bookings, documents, invoices
 * - Categorized results
 * - Recent searches (localStorage)
 * - Keyboard navigation (↑/↓, Enter, Esc)
 * - Debounced search (300ms)
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, FileText, Calendar, DollarSign, CheckSquare, Clock, ArrowRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut'

interface SearchResult {
    id: string
    type: 'task' | 'booking' | 'document' | 'invoice' | 'entity'
    title: string
    subtitle?: string
    href: string
}

interface GlobalSearchModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const RECENT_SEARCHES_KEY = 'portal_recent_searches'
const MAX_RECENT_SEARCHES = 5

const searchIcons = {
    task: CheckSquare,
    booking: Calendar,
    document: FileText,
    invoice: DollarSign,
    entity: FileText,
}

const searchColors = {
    task: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    booking: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    document: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20',
    invoice: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    entity: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceRef = useRef<number | undefined>(undefined)

    // Load recent searches from localStorage
    useEffect(() => {
        if (open && typeof window !== 'undefined') {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
            if (stored) {
                try {
                    setRecentSearches(JSON.parse(stored))
                } catch (e) {
                    console.error('Failed to parse recent searches:', e)
                }
            }
            // Focus input when modal opens
            setTimeout(() => inputRef.current?.focus(), 0)
        }
    }, [open])

    // Save recent search
    const saveRecentSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return

        const updated = [
            searchQuery,
            ...recentSearches.filter(s => s !== searchQuery)
        ].slice(0, MAX_RECENT_SEARCHES)

        setRecentSearches(updated)
        if (typeof window !== 'undefined') {
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
        }
    }, [recentSearches])

    // Debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)

        // Clear existing timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        // Debounce for 300ms
        debounceRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/portal/search?q=${encodeURIComponent(query)}&limit=10`)

                if (!response.ok) {
                    throw new Error('Search failed')
                }

                const data = await response.json()
                setResults(data.data || [])
            } catch (error) {
                console.error('Search error:', error)
                toast.error('Search failed')
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }, 300) as unknown as number

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current)
            }
        }
    }, [query])

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0)
    }, [results])

    // Keyboard navigation
    useKeyboardShortcut({
        id: 'global-search-nav-down',
        combo: 'ArrowDown',
        description: 'Navigate down',
        action: () => setSelectedIndex(prev => Math.min(prev + 1, results.length - 1)),
        disabled: !open || results.length === 0
    })

    useKeyboardShortcut({
        id: 'global-search-nav-up',
        combo: 'ArrowUp',
        description: 'Navigate up',
        action: () => setSelectedIndex(prev => Math.max(prev - 1, 0)),
        disabled: !open || results.length === 0
    })

    useKeyboardShortcut({
        id: 'global-search-select',
        combo: 'Enter',
        description: 'Select result',
        action: () => {
            if (results[selectedIndex]) {
                handleSelect(results[selectedIndex])
            }
        },
        disabled: !open || results.length === 0
    })

    const handleSelect = (result: SearchResult) => {
        saveRecentSearch(query)
        onOpenChange(false)
        router.push(result.href)
        // Reset after navigation
        setTimeout(() => {
            setQuery('')
            setResults([])
        }, 100)
    }

    const handleRecentSearch = (searchQuery: string) => {
        setQuery(searchQuery)
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        if (typeof window !== 'undefined') {
            localStorage.removeItem(RECENT_SEARCHES_KEY)
        }
    }

    // Group results by type
    const groupedResults = results.reduce((acc, result) => {
        if (!acc[result.type]) {
            acc[result.type] = []
        }
        acc[result.type].push(result)
        return acc
    }, {} as Record<string, SearchResult[]>)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 gap-0 max-w-2xl">
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
                    <Search className="h-5 w-5 text-gray-400" />
                    <Input
                        ref={inputRef}
                        placeholder="Search tasks, bookings, documents, invoices..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading && (
                        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                            Searching...
                        </div>
                    )}

                    {!isLoading && query && results.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">No results found</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Try a different search term</p>
                        </div>
                    )}

                    {!isLoading && !query && recentSearches.length > 0 && (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Recent Searches
                                </p>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-1">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRecentSearch(search)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                                    >
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isLoading && results.length > 0 && (
                        <div className="p-2">
                            {Object.entries(groupedResults).map(([type, items]) => (
                                <div key={type} className="mb-4 last:mb-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 mb-2">
                                        {type}s
                                    </p>
                                    <div className="space-y-1">
                                        {items.map((result, index) => {
                                            const globalIndex = results.indexOf(result)
                                            const Icon = searchIcons[result.type]
                                            const isSelected = globalIndex === selectedIndex

                                            return (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleSelect(result)}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                                                        isSelected
                                                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "flex-shrink-0 p-2 rounded-lg",
                                                        searchColors[result.type]
                                                    )}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                            {result.title}
                                                        </p>
                                                        {result.subtitle && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {result.subtitle}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border text-[10px]">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border text-[10px]">↓</kbd>
                            to navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border text-[10px]">↵</kbd>
                            to select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded border text-[10px]">esc</kbd>
                            to close
                        </span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
