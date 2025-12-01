"use client"

import { useState } from 'react'
import { Settings2, Eye, EyeOff, GripVertical } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { usePortalWidgetPreferences, usePortalLayoutActions } from '@/stores/portal/layout.store'

export interface WidgetConfig {
    id: string
    label: string
    description?: string
}

interface DashboardCustomizerProps {
    widgets: WidgetConfig[]
}

export function DashboardCustomizer({ widgets }: DashboardCustomizerProps) {
    const [open, setOpen] = useState(false)
    const preferences = usePortalWidgetPreferences()
    const { updateWidgetPreference, resetWidgetPreferences } = usePortalLayoutActions()

    const handleToggle = (widgetId: string, checked: boolean) => {
        updateWidgetPreference(widgetId, { visible: checked })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Customize Dashboard</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Customize Dashboard</DialogTitle>
                    <DialogDescription>
                        Choose which widgets to display on your overview.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {widgets.map((widget) => {
                        const isVisible = preferences[widget.id]?.visible ?? true

                        return (
                            <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-md text-muted-foreground">
                                        {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label htmlFor={`widget-${widget.id}`} className="text-sm font-medium cursor-pointer">
                                            {widget.label}
                                        </Label>
                                        {widget.description && (
                                            <p className="text-xs text-muted-foreground">
                                                {widget.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Switch
                                    id={`widget-${widget.id}`}
                                    checked={isVisible}
                                    onCheckedChange={(checked) => handleToggle(widget.id, checked)}
                                />
                            </div>
                        )
                    })}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            resetWidgetPreferences()
                            setOpen(false)
                        }}
                    >
                        Reset to Default
                    </Button>
                    <Button onClick={() => setOpen(false)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
