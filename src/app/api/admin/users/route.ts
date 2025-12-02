/**
 * Admin Users API
 * Thin controller using service layer
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdminAuth } from '@/lib/api-wrapper'
import { requireTenantContext } from '@/lib/tenant-utils'
import { respond } from '@/lib/api-response'
import { usersService, type UserCreateInput } from '@/services/admin/users.service'
import { ServiceError } from '@/services/shared/base.service'
import { logAudit } from '@/lib/audit'
import { z } from 'zod'

const UserListFilterSchema = z.object({
  role: z.string().optional(),
  department: z.string().optional(),
  search: z.string().optional(),
  active: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
})

const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.enum(['ADMIN', 'TEAM_MEMBER', 'CLIENT']).default('TEAM_MEMBER'),
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
})

/**
 * GET /api/admin/users
 * List all users with filtering and pagination
 */
export const GET = withAdminAuth(
  async (request) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId } = ctx

      const { searchParams } = new URL(request.url)
      const filters = UserListFilterSchema.parse(Object.fromEntries(searchParams))

      // Delegate to service layer
      const result = await usersService.listUsers(tenantId as string, filters)

      return respond.ok(result)
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid filters', error.errors)
      }
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        )
      }
      console.error('User list error:', error)
      return respond.serverError()
    }
  }
)

/**
 * POST /api/admin/users
 * Create a new user
 */
export const POST = withAdminAuth(
  async (request) => {
    try {
      const ctx = requireTenantContext()
      const { tenantId, userId } = ctx

      const body = await request.json()
      const input = UserCreateSchema.parse(body) as UserCreateInput

      // Delegate to service layer
      const newUser = await usersService.createUser(tenantId as string, input)

      // Log audit event
      await logAudit({
        tenantId,
        userId,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: newUser.id,
        changes: { ...input }, // Object spread creates a proper Record<string, unknown>
      })

      return respond.created({ data: newUser })
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return respond.badRequest('Invalid user data', error.errors)
      }
      if (error instanceof ServiceError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.statusCode }
        )
      }
      console.error('User creation error:', error)
      return respond.serverError()
    }
  },
  { requireAuth: true }
)
