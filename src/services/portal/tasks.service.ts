/**
 * Tasks Service
 * Business logic for task management
 * Extracted from API routes for reusability and testing
 */

import { prisma } from '@/lib/prisma'
import { TaskStatus } from '@/types/shared/entities/task'
import type { Task, User } from '@prisma/client'

export interface TaskFilters {
    status?: TaskStatus | TaskStatus[]
    priority?: string | string[]
    assigneeId?: string
    search?: string
    dueBefore?: string | Date
    dueAfter?: string | Date
    limit?: number
    offset?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface TaskCreateInput {
    title: string
    description?: string | null
    priority: string
    dueAt?: Date | null
    assigneeId?: string | null
    complianceRequired?: boolean
    complianceDeadline?: Date | null
}

export interface TaskWithAssignee extends Task {
    assignee: Pick<User, 'id' | 'name' | 'email' | 'image' | 'department' | 'position'> | null
}

export interface TaskListResult {
    data: TaskWithAssignee[]
    meta: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

export class TasksService {
    /**
     * List tasks with filters and pagination
     */
    async listTasks(
        tenantId: string,
        userId: string,
        role: string,
        tenantRole: string | null,
        filters: TaskFilters
    ): Promise<TaskListResult> {
        const where = this.buildTaskQuery(tenantId, userId, role, tenantRole, filters)

        const [total, data] = await Promise.all([
            prisma.task.count({ where }),
            prisma.task.findMany({
                where,
                include: {
                    assignee: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            department: true,
                            position: true,
                        },
                    },
                },
                orderBy: {
                    [filters.sortBy || 'createdAt']: filters.sortOrder === 'asc' ? 'asc' : 'desc',
                },
                skip: filters.offset || 0,
                take: filters.limit || 20,
            }),
        ])

        return {
            data: data as TaskWithAssignee[],
            meta: {
                total,
                limit: filters.limit || 20,
                offset: filters.offset || 0,
                hasMore: (filters.offset || 0) + (filters.limit || 20) < total,
            },
        }
    }

    /**
     * Create a new task
     */
    async createTask(
        tenantId: string,
        userId: string,
        input: TaskCreateInput
    ): Promise<TaskWithAssignee> {
        const task = await prisma.task.create({
            data: {
                title: input.title,
                description: input.description,
                priority: input.priority as any,
                dueAt: input.dueAt,
                assigneeId: input.assigneeId,
                complianceRequired: input.complianceRequired,
                complianceDeadline: input.complianceDeadline,
                tenantId,
                createdById: userId,
            },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        department: true,
                        position: true,
                    },
                },
            },
        })

        return task as TaskWithAssignee
    }

    /**
     * Get task by ID
     */
    async getTaskById(taskId: string, tenantId: string): Promise<TaskWithAssignee | null> {
        const task = await prisma.task.findFirst({
            where: { id: taskId, tenantId },
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        department: true,
                        position: true,
                    },
                },
            },
        })

        return task as TaskWithAssignee | null
    }

    /**
     * Update task
     */
    async updateTask(
        taskId: string,
        tenantId: string,
        updates: Partial<TaskCreateInput>
    ): Promise<TaskWithAssignee> {
        // First verify task exists and belongs to tenant
        const existing = await prisma.task.findFirst({
            where: { id: taskId, tenantId },
        })

        if (!existing) {
            throw new Error('Task not found')
        }

        const task = await prisma.task.update({
            where: { id: taskId },
            data: updates as any,
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        department: true,
                        position: true,
                    },
                },
            },
        })

        return task as TaskWithAssignee
    }

    /**
     * Delete task
     */
    async deleteTask(taskId: string, tenantId: string): Promise<void> {
        // First verify task exists and belongs to tenant
        const existing = await prisma.task.findFirst({
            where: { id: taskId, tenantId },
        })

        if (!existing) {
            throw new Error('Task not found')
        }

        await prisma.task.delete({
            where: { id: taskId },
        })
    }

    /**
     * Build task query with filters
     */
    private buildTaskQuery(
        tenantId: string,
        userId: string,
        role: string,
        tenantRole: string | null,
        filters: TaskFilters
    ) {
        const where: any = { tenantId }

        // Status filter
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                where.status = { in: filters.status }
            } else {
                where.status = filters.status
            }
        }

        // Priority filter
        if (filters.priority) {
            if (Array.isArray(filters.priority)) {
                where.priority = { in: filters.priority }
            } else where.priority = filters.priority
        }

        // Assignee filter with role-based access control
        if (filters.assigneeId) {
            where.assigneeId = filters.assigneeId
        } else if (role !== 'SUPER_ADMIN' && !tenantRole?.includes('ADMIN')) {
            // Non-admin users only see their own tasks
            where.OR = [{ assigneeId: userId }, { assigneeId: null }]
        }

        // Search filter
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ]
        }

        // Date range filters
        if (filters.dueAfter) {
            where.dueAt = { gte: new Date(filters.dueAfter) }
        }
        if (filters.dueBefore) {
            where.dueAt = {
                ...(where.dueAt || {}),
                lte: new Date(filters.dueBefore),
            }
        }

        return where
    }
}

// Export singleton instance
export const tasksService = new TasksService()
