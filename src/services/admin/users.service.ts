/**
 * Users Service
 * Business logic for user management (admin)
 * Extracted from API routes for reusability and testing
 */

import { prisma } from '@/lib/prisma'
import { BaseService, NotFoundError, ValidationError } from '@/services/shared/base.service'
import type { User } from '@prisma/client'

export interface UserFilters {
    role?: string
    department?: string
    search?: string
    active?: boolean
    limit?: number
    offset?: number
}

export interface UserCreateInput {
    email: string
    name: string
    role?: string
    department?: string | null
    position?: string | null
}

export interface UserUpdateInput {
    name?: string
    role?: string
    department?: string | null
    position?: string | null
    isActive?: boolean
}

export type UserWithoutPassword = Omit<User, 'password' | 'passwordHash'>

export interface UserListResult {
    data: UserWithoutPassword[]
    meta: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

export class UsersService extends BaseService {
    /**
     * List users with filters and pagination
     */
    async listUsers(tenantId: string, filters: UserFilters): Promise<UserListResult> {
        const where = this.buildUserQuery(tenantId, filters)

        return await this.paginate<UserWithoutPassword>(
            {
                where,
                orderBy: { createdAt: 'desc' },
            },
            prisma.user,
            filters.limit || 25,
            filters.offset || 0
        )
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: string, tenantId: string): Promise<UserWithoutPassword> {
        const user = await this.getOrThrow(
            prisma.user.findFirst({
                where: { id: userId, tenantId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                    role: true,
                    department: true,
                    position: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    emailVerified: true,
                    tenantId: true,
                },
            }),
            'User',
            userId
        )

        return user as UserWithoutPassword
    }

    /**
     * Create a new user
     */
    async createUser(tenantId: string, input: UserCreateInput): Promise<UserWithoutPassword> {
        // Check if user already exists
        const existing = await prisma.user.findFirst({
            where: { email: input.email, tenantId },
        })

        if (existing) {
            throw new ValidationError('User with this email already exists in this organization')
        }

        const user = await prisma.user.create({
            data: {
                email: input.email,
                name: input.name,
                role: (input.role || 'TEAM_MEMBER') as any,
                department: input.department,
                position: input.position,
                tenantId,
                isActive: true,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                position: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                emailVerified: true,
                tenantId: true,
                image: true,
            },
        })

        return user as UserWithoutPassword
    }

    /**
     * Update user
     */
    async updateUser(
        userId: string,
        tenantId: string,
        updates: UserUpdateInput
    ): Promise<UserWithoutPassword> {
        // Verify user exists and belongs to tenant
        await this.getUserById(userId, tenantId)

        const user = await prisma.user.update({
            where: { id: userId },
            data: updates as any,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                department: true,
                position: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                emailVerified: true,
                tenantId: true,
                image: true,
            },
        })

        return user as UserWithoutPassword
    }

    /**
     * Delete user
     */
    async deleteUser(userId: string, tenantId: string): Promise<void> {
        // Verify user exists and belongs to tenant
        await this.getUserById(userId, tenantId)

        await prisma.user.delete({
            where: { id: userId },
        })
    }

    /**
     * Deactivate user (soft delete)
     */
    async deactivateUser(userId: string, tenantId: string): Promise<UserWithoutPassword> {
        return await this.updateUser(userId, tenantId, { isActive: false })
    }

    /**
     * Activate user
     */
    async activateUser(userId: string, tenantId: string): Promise<UserWithoutPassword> {
        return await this.updateUser(userId, tenantId, { isActive: true })
    }

    /**
     * Build user query with filters
     */
    private buildUserQuery(tenantId: string, filters: UserFilters) {
        const where: any = { tenantId }

        if (filters.role) {
            where.role = filters.role
        }

        if (filters.department) {
            where.department = filters.department
        }

        if (filters.active !== undefined) {
            where.isActive = filters.active
        }

        if (filters.search) {
            where.OR = [
                { email: { contains: filters.search, mode: 'insensitive' } },
                { name: { contains: filters.search, mode: 'insensitive' } },
                { department: { contains: filters.search, mode: 'insensitive' } },
            ]
        }

        return where
    }
}

// Export singleton instance
export const usersService = new UsersService()
