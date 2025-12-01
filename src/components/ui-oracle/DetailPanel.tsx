/**
 * DetailPanel Component
 * Side panel for detail views (sheet/slideover)
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface DetailPanelProps {
    title?: string
    children: React.ReactNode
    open?: boolean
    onClose?: () => void
    className?: string
}

export function DetailPanel({ title, children, open, onClose, className }: DetailPanelProps) {
    // If open/onClose props exist, use Sheet (slideover)
    if (open !== undefined && onClose) {
        return (
            <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
                <SheetContent>
                    {title && (
                        <SheetHeader>
                            <SheetTitle>{title}</SheetTitle>
                        </SheetHeader>
                    )}
                    <div className="mt-6">
                        {children}
                    </div>
                </SheetContent>
            </Sheet>
        )
    }

    // Otherwise use Card (static panel)
    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    )
}
