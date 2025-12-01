/**
 * Tasks Tab Component - Refactored with Oracle Fusion UI
 * 
 * Modular architecture using:
 * - React Query (usePortalTasks)
 * - Oracle Fusion KPICard/Grid
 * - StatusMessage for errors
 * - LoadingSkeleton for loading
 * - ContentSection for layout
 * 
 * ~120 lines, production-ready
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  KPICard,
  KPIGrid,
  ContentSection,
  LoadingSkeleton,
  StatusMessage,
  StatusBadge,
  EmptyState,
} from '@/components/ui-oracle'
import { usePortalTasks } from '@/hooks/usePortalQuery'
import { CheckSquare, Clock, AlertCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueAt?: string
  assignee?: { name: string }
}

export default function TasksTab() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')
  const { data, isLoading, error } = usePortalTasks()

  if (error) {
    return (
      <StatusMessage variant="error" title="Failed to load tasks">
        {error.message || 'An error occurred while fetching tasks data.'}
      </StatusMessage>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={4} />
        <LoadingSkeleton variant="list" count={5} />
      </div>
    )
  }

  const stats = (data as any)?.data?.stats || { total: 0, active: 0, completed: 0, overdue: 0 }
  const tasks = (data as any)?.data?.tasks || []

  const filteredTasks = tasks.filter((task: Task) => {
    if (filter === 'active') return ['OPEN', 'IN_PROGRESS'].includes(task.status)
    if (filter === 'completed') return task.status === 'DONE'
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Bar */}
      <div className="flex items-center justify-end gap-2">
        <Button onClick={() => router.push('/portal/tasks/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* KPI Stats */}
      <KPIGrid columns={4}>
        <KPICard
          label="Total Tasks"
          value={stats.total}
          icon={CheckSquare}
          variant="info"
          onClick={() => setFilter('all')}
        />
        <KPICard
          label="Active"
          value={stats.active}
          comparisonText="In progress"
          icon={Clock}
          variant="warning"
          onClick={() => setFilter('active')}
        />
        <KPICard
          label="Completed"
          value={stats.completed}
          comparisonText="Done"
          icon={CheckSquare}
          variant="success"
          onClick={() => setFilter('completed')}
        />
        <KPICard
          label="Overdue"
          value={stats.overdue}
          comparisonText="Need attention"
          icon={AlertCircle}
          variant="danger"
        />
      </KPIGrid>

      {/* Task List */}
      <ContentSection title={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`}>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={`No ${filter} tasks`}
            description="Tasks will appear here when created."
            variant="compact"
          />
        ) : (
          <div className="space-y-3">
            {filteredTasks.slice(0, 10).map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/portal/tasks/${task.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h3>
                    <StatusBadge
                      variant={task.priority === 'HIGH' ? 'danger' : 'neutral'}
                      size="sm"
                    >
                      {task.priority}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.assignee?.name || 'Unassigned'}
                    {task.dueAt && ` • Due ${formatDistanceToNow(new Date(task.dueAt), { addSuffix: true })}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ContentSection>
    </div>
  )
}
