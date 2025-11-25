import React from 'react'
import { WidgetContainer } from '../WidgetContainer'
import { CheckSquare, ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Task {
    id: string
    title: string
    priority: 'high' | 'medium' | 'low'
    dueDate: string
    status: string
}

interface TasksSummaryWidgetProps {
    tasks: Task[]
    loading?: boolean
    error?: string
}

const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
}

export function TasksSummaryWidget({ tasks, loading, error }: TasksSummaryWidgetProps) {
    return (
        <WidgetContainer
            title="Pending Tasks"
            icon={<CheckSquare className="h-5 w-5" />}
            loading={loading}
            error={error}
            action={
                <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                    <Link href="/portal/tasks">
                        View All <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            }
        >
            {tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-full mb-3">
                        <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">All caught up!</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No pending tasks right now.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => (
                        <div
                            key={task.id}
                            className="group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                        >
                            <div className="mt-1">
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    task.priority === 'high' ? "bg-red-500" :
                                        task.priority === 'medium' ? "bg-yellow-500" : "bg-green-500"
                                )} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-5", priorityColors[task.priority])}>
                                        {task.priority}
                                    </Badge>
                                    {task.dueDate && (
                                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </WidgetContainer>
    )
}
