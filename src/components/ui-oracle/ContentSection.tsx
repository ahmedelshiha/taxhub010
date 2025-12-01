/**
 * ContentSection Component
 * Standard content section with title, description, and optional actions
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ContentSectionProps {
    title?: string
    description?: string
    actions?: React.ReactNode
    children: React.ReactNode
    className?: string
    headerClassName?: string
    contentClassName?: string
}

export function ContentSection({
    title,
    description,
    actions,
    children,
    className,
    headerClassName,
    contentClassName,
}: ContentSectionProps) {
    return (
        <Card className={className}>
            {(title || description || actions) && (
                <CardHeader className={cn('flex flex-row items-center justify-between space-y-0', headerClassName)}>
                    <div className="space-y-1.5">
                        {title && <CardTitle className="text-xl">{title}</CardTitle>}
                        {description && <CardDescription>{description}</CardDescription>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </CardHeader>
            )}
            <CardContent className={contentClassName}>
                {children}
            </CardContent>
        </Card>
    )
}
