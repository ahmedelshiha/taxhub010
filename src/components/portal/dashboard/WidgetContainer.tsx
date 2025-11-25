import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WidgetContainerProps {
    title: string
    icon?: React.ReactNode
    action?: React.ReactNode
    children: React.ReactNode
    loading?: boolean
    error?: string
    className?: string
    contentClassName?: string
}

export function WidgetContainer({
    title,
    icon,
    action,
    children,
    loading,
    error,
    className,
    contentClassName
}: WidgetContainerProps) {
    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    {icon && <div className="text-gray-500">{icon}</div>}
                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                </div>
                {action && <div>{action}</div>}
            </CardHeader>
            <CardContent className={cn("flex-1", contentClassName)}>
                {loading ? (
                    <div className="h-full flex items-center justify-center min-h-[150px]">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="h-full flex flex-col items-center justify-center min-h-[150px] text-red-500 gap-2">
                        <AlertCircle className="h-8 w-8" />
                        <p className="text-sm text-center">{error}</p>
                    </div>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    )
}
