/**
 * Tasks API
 * Thin controller using service layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { withTenantContext } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import { TaskFilterSchema, TaskCreateSchema } from '@/schemas/shared/entities/task'
import { tasksService } from '@/services/portal/tasks.service'
import { ServiceError, ValidationError, ForbiddenError } from '@/services/shared/base.service'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

/**
 * GET /api/tasks
 * List tasks for the current user
 */
export const GET = withTenantContext(
  async (request, { params }: { params: unknown }) => {
    try {
      const ctx = requireTenantContext()
      const { userId, tenantId, role, tenantRole } = ctx

      const { searchParams } = new URL(request.url)

      // Parse and validate filters
      const filterInput = {
        status: searchParams.getAll('status'),
        priority: searchParams.getAll('priority'),
        assigneeId: searchParams.get('assigneeId'),
        search: searchParams.get('search'),
        dueBefore: searchParams.get('dueBefore'),
        dueAfter: searchParams.get('dueAfter'),
        limit: parseInt(searchParams.get('limit') || '20'),
        offset: parseInt(searchParams.get('offset') || '0'),
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      }

      // Clean up arrays
      if (filterInput.status.length === 0) delete (filterInput as any).status
      if (filterInput.status.length === 1) filterInput.status = filterInput.status[0] as any
      if (filterInput.priority.length === 0) delete (filterInput as any).priority
      if (filterInput.priority.length === 1) filterInput.priority = filterInput.priority[0] as any

      const filters = TaskFilterSchema.parse(filterInput)

      // Delegate to service layer
      const result = await tasksService.listTasks(
        tenantId as string,
        userId as string,
        role as string,
        tenantRole || null,
        filters
      )

      return respond.ok(result)
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid filter parameters', error.errors)
      }
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        )
      }
      console.error('Task list error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)

/**
 * POST /api/tasks
 * Create a new task (admin only)
 */
export const POST = withTenantContext(
  async (request, { params }: { params: unknown }) => {
    try {
      const { userId, tenantId, role, tenantRole } = requireTenantContext()

      // Validate admin access
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && !tenantRole?.includes('ADMIN')) {
        throw new ForbiddenError('Only administrators can create tasks')
      }

      const body = await request.json()
      const input = TaskCreateSchema.parse(body)

      // Delegate to service layer
      const task = await tasksService.createTask(tenantId as string, userId as string, input)

      // Log audit event
      await logAudit({
        tenantId,
        actorId: userId,
        action: 'TASK_CREATED',
        targetId: task.id,
        details: {
          title: task.title,
          priority: task.priority,
          assigneeId: task.assigneeId,
          dueAt: task.dueAt,
        },
      })

      return respond.created({ data: task })
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid task data', error.errors)
      }
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        )
      }
      console.error('Task creation error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
