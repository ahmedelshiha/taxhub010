import { useState, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Building2, ChevronDown, Search, History, Plus } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePortalSelectedEntity, usePortalLayoutActions } from '@/stores/portal/layout.store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Entity {
    id: string
    name: string
    type: string
    status: string
    taxId?: string | null
    country: string
}

const RECENT_ENTITIES_KEY = 'portal_recent_entities'

export default function EntitySwitcher() {
    const selectedEntityId = usePortalSelectedEntity()
    const { setSelectedEntity } = usePortalLayoutActions()
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [recentIds, setRecentIds] = useState<string[]>([])

    const { data, error, isLoading } = useQuery<{
        success: boolean
        data: { entities: Entity[]; total: number }
    }>({
        queryKey: ['/api/portal/entities'],
        queryFn: async () => {
            const res = await fetch('/api/portal/entities')
            if (!res.ok) throw new Error('Failed to fetch entities')
            return res.json()
        },
    })

    const rawEntities = data?.data?.entities
    const entities = Array.isArray(rawEntities) ? rawEntities : []

    const currentEntity = selectedEntityId
        ? entities.find(e => e.id === selectedEntityId)
        : entities[0]

    // Load recent entities from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(RECENT_ENTITIES_KEY)
                if (stored) setRecentIds(JSON.parse(stored))
            } catch (e) {
                console.error('Failed to parse recent entities', e)
            }
        }
    }, [])

    const handleEntitySwitch = async (entityId: string) => {
        setSelectedEntity(entityId)
        setIsOpen(false)
        setSearchQuery('')

        // Update recent entities
        const newRecents = [entityId, ...recentIds.filter(id => id !== entityId)].slice(0, 3)
        setRecentIds(newRecents)
        if (typeof window !== 'undefined') {
            localStorage.setItem(RECENT_ENTITIES_KEY, JSON.stringify(newRecents))
        }

        // Refresh all portal data for new entity
        await Promise.all([
            mutate('/api/portal/overview'),
            mutate('/api/portal/tasks'),
            mutate('/api/portal/compliance'),
            mutate('/api/portal/financial'),
            mutate('/api/portal/activity'),
            mutate('/api/portal/counts'),
        ])
    }

    const filteredEntities = useMemo(() => {
        if (!searchQuery) return entities
        return entities.filter(e =>
            e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.taxId?.includes(searchQuery)
        )
    }, [entities, searchQuery])

    const recentEntities = useMemo(() => {
        return recentIds
            .map(id => entities.find(e => e.id === id))
            .filter((e): e is Entity => !!e && e.id !== currentEntity?.id)
    }, [recentIds, entities, currentEntity])

    if (isLoading) {
        return (
            <Button variant="ghost" size="sm" disabled className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden md:inline">Loading...</span>
            </Button>
        )
    }

    if (error || !entities.length) return null

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 min-w-[200px] justify-between bg-white dark:bg-gray-900">
                    <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium truncate max-w-[140px]">
                            {currentEntity?.name || 'Select Entity'}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px] p-0">
                <div className="p-2 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950 z-10">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search entities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 text-sm"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto py-1">
                    {!searchQuery && recentEntities.length > 0 && (
                        <>
                            <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 font-normal">
                                Recent
                            </DropdownMenuLabel>
                            {recentEntities.map(entity => (
                                <EntityItem
                                    key={entity.id}
                                    entity={entity}
                                    isSelected={false}
                                    onSelect={() => handleEntitySwitch(entity.id)}
                                    isRecent
                                />
                            ))}
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 font-normal">
                        All Entities ({filteredEntities.length})
                    </DropdownMenuLabel>

                    {filteredEntities.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No entities found
                        </div>
                    ) : (
                        filteredEntities.map((entity) => (
                            <EntityItem
                                key={entity.id}
                                entity={entity}
                                isSelected={entity.id === currentEntity?.id}
                                onSelect={() => handleEntitySwitch(entity.id)}
                            />
                        ))
                    )}
                </div>

                <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                            setIsOpen(false)
                            // Trigger add entity modal or navigation
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Entity
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function EntityItem({
    entity,
    isSelected,
    onSelect,
    isRecent
}: {
    entity: Entity
    isSelected: boolean
    onSelect: () => void
    isRecent?: boolean
}) {
    return (
        <DropdownMenuItem
            onClick={onSelect}
            className="cursor-pointer px-3 py-2.5 focus:bg-gray-50 dark:focus:bg-gray-800"
        >
            <div className="flex items-start gap-3 w-full">
                <div className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-md flex-shrink-0 mt-0.5",
                    isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                )}>
                    {isRecent ? <History className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("font-medium truncate text-sm", isSelected && "text-primary")}>
                            {entity.name}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0 ml-2" />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="capitalize truncate max-w-[80px]">{entity.type.toLowerCase()}</span>
                        {entity.taxId && (
                            <>
                                <span className="text-gray-300 dark:text-gray-700">•</span>
                                <span className="font-mono">{entity.taxId}</span>
                            </>
                        )}
                        <span className="text-gray-300 dark:text-gray-700">•</span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "h-4 px-1 text-[10px] border-0",
                                entity.status === 'VERIFIED'
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                            )}
                        >
                            {entity.status}
                        </Badge>
                    </div>
                </div>
            </div>
        </DropdownMenuItem>
    )
}
