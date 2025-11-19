# Developer Guide - Portal-Admin Integration

**For**: Developers working on the Portal-Admin integration project  
**Updated**: November 2024  
**Status**: Active - Updated regularly

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Code Patterns](#code-patterns)
4. [Common Tasks](#common-tasks)
5. [Testing](#testing)
6. [Git Workflow](#git-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (via Neon or local)
- Environment variables configured (.env)

### Initial Setup

```bash
# Install dependencies
pnpm install

# Setup database
pnpm prisma:generate
pnpm prisma:migrate

# Start development server
pnpm dev

# Run tests
pnpm test

# Run linting
pnpm lint
```

### Development Server

The development server runs at `http://localhost:3000`

- Portal: `http://localhost:3000/portal`
- Admin: `http://localhost:3000/admin`
- API: `http://localhost:3000/api`

---

## Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── services/             # Service endpoints
│   │   ├── bookings/             # Booking endpoints
│   │   ├── tasks/                # Task endpoints
│   │   └── [entity]/             # Other entity APIs
│   ├── admin/                    # Admin dashboard pages
│   ├── portal/                   # Client portal pages
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── shared/                   # Shared components (15+)
│   │   ├── cards/                # Display cards
│   │   ├── forms/                # Form components
│   │   ├── inputs/               # Input widgets
│   │   ├── tables/               # Table components
│   │   ├── widgets/              # Utility components
│   │   └── notifications/        # Notification components
│   ├── admin/                    # Admin-only components
│   ├── portal/                   # Portal-only components
│   └── ui/                       # Base UI components (shadcn)
│
├── hooks/
│   ├── shared/                   # Shared hooks (17)
│   │   ├── useServices.ts        # Data fetching hooks
│   │   ├── useFilters.ts         # State management
│   │   ├── useCanAction.ts       # Permission checks
│   │   └── ...
│   ├── admin/                    # Admin-specific hooks
│   └── (existing hooks)          # Legacy hooks
│
├── lib/
│   ├── shared/                   # Shared utilities (formatters, validators)
│   ├── api-route-factory.ts      # API route helpers
│   ├── auth-middleware.ts        # Auth wrappers
│   ├── use-permissions.ts        # Permission checks
│   ├── prisma.ts                 # Prisma client
│   └── ...
│
├── types/
│   ├── shared/                   # Shared entity types
│   │   ├── entities/             # Type definitions
│   │   └── index.ts              # Main exports
│   └── ...
│
├── schemas/
│   ├─�� shared/                   # Shared Zod schemas
│   │   ├── entities/             # Create/Update/Filter schemas
│   │   └── index.ts              # Main exports
│   └── ...
│
└── styles/
    ├── globals.css               # Global styles
    └── dark-mode.css             # Dark mode styles
```

---

## Code Patterns

### 1. API Routes

**Pattern**: Use auth middleware + API route factory

```typescript
// src/app/api/services/route.ts
import { createListRoute, createCreateRoute } from '@/lib/api-route-factory'
import { ServiceFilterSchema, ServiceCreateSchema } from '@/schemas/shared'

export const GET = createListRoute(
  async (tenantId, filters) => {
    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where: { tenantId, ...filters },
        take: filters.limit,
        skip: filters.offset,
      }),
      prisma.service.count({ where: { tenantId, ...filters } }),
    ])
    return { data, total }
  },
  ServiceFilterSchema
)

export const POST = createCreateRoute(
  async (tenantId, data) => {
    return prisma.service.create({
      data: { ...data, tenantId },
    })
  },
  ServiceCreateSchema
)
```

### 2. Components

**Pattern**: Support portal/admin variants with permission checks

```typescript
'use client'

import { Service } from '@/types/shared'
import { usePermissions } from '@/lib/use-permissions'

interface ServiceCardProps {
  service: Service
  variant?: 'portal' | 'admin'
}

export function ServiceCard({ service, variant = 'portal' }: ServiceCardProps) {
  const { can } = usePermissions()

  return (
    <div className="service-card">
      <h3>{service.name}</h3>
      
      {variant === 'admin' && can('service:update') && (
        <button>Edit</button>
      )}
      
      {variant === 'portal' && (
        <p className="price">${service.price}</p>
      )}
    </div>
  )
}
```

### 3. Data Fetching Hooks

**Pattern**: Use SWR with proper typing

```typescript
import { useServices } from '@/hooks/shared'

export function ServiceList() {
  const { data, isLoading, error, refresh } = useServices({
    active: true,
    limit: 20,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  )
}
```

### 4. Forms with Validation

**Pattern**: Use react-hook-form + Zod

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ServiceCreateSchema } from '@/schemas/shared'

export function ServiceForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ServiceCreateSchema),
  })

  const onSubmit = async (data) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // Handle response
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Create</button>
    </form>
  )
}
```

### 5. Permission Checks

**Pattern**: Use permission hooks

```typescript
import { useCanAction, useUserRole } from '@/hooks/shared'

export function AdminPanel() {
  const canManageServices = useCanAction('service', 'manage')
  const role = useUserRole()

  if (!canManageServices) {
    return <div>Access denied</div>
  }

  return <AdminContent />
}
```

---

## Common Tasks

### Add a New API Endpoint

1. Create route file: `src/app/api/[entity]/route.ts`
2. Import route factory and schemas
3. Implement GET and/or POST handlers
4. Add tests in `src/app/api/__tests__/`

Example:
```typescript
// src/app/api/invoices/route.ts
import { createListRoute } from '@/lib/api-route-factory'

export const GET = createListRoute(
  async (tenantId, filters) => { /* ... */ },
  InvoiceFilterSchema
)
```

### Add a New Shared Component

1. Create file in `src/components/shared/[category]/`
2. Follow component template (see `templates/COMPONENT_TEMPLATE.md`)
3. Add export to category `index.ts`
4. Add export to shared `index.ts`
5. Create test file alongside component

### Add a New Shared Hook

1. Create file in `src/hooks/shared/`
2. Export type definitions and hook
3. Add tests in `src/hooks/shared/__tests__/`
4. Export from `src/hooks/shared/index.ts`

### Update Entity Types

1. Update type in `src/types/shared/entities/[entity].ts`
2. Update Zod schema in `src/schemas/shared/entities/[entity].ts`
3. Update API endpoints to use new schema
4. Run tests to ensure no breaking changes

---

## Testing

### Unit Tests (Vitest)

```bash
pnpm test                    # Run all tests once
pnpm test:watch             # Watch mode
pnpm test:coverage          # With coverage report
```

**Test patterns**:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { useServices } from '@/hooks/shared'

describe('useServices', () => {
  it('fetches and returns services', async () => {
    // Mock apiFetch
    vi.mock('@/lib/api')
    
    const { result } = renderHook(() => useServices())
    
    expect(result.current.data).toEqual([...])
  })
})
```

### E2E Tests (Playwright)

```bash
pnpm test:e2e               # Run E2E tests
pnpm test:e2e:debug        # Debug mode with UI
```

### API Testing

Use REST client or curl:

```bash
# Test GET endpoint
curl http://localhost:3000/api/services \
  -H "Cookie: [session-cookie]" \
  -H "x-tenant-id: tenant-123"

# Test POST endpoint
curl http://localhost:3000/api/services \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: [session-cookie]" \
  -d '{"name":"New Service"}'
```

---

## Git Workflow

### Branch Naming

```
feat/[phase]-[feature]      # Feature branch
fix/[issue-number]          # Bug fix
docs/[topic]                # Documentation
test/[feature]              # Test improvements
```

Examples:
- `feat/phase-1-shared-hooks`
- `feat/phase-2-service-api`
- `fix/123-auth-middleware`

### Commit Messages

Use semantic commits:

```
feat: Add shared useServices hook
fix: Auth middleware tenant isolation bug
docs: Update API response contract
test: Add comprehensive hook tests
```

### Pull Requests

1. Create feature branch from `main`
2. Make changes and commit with semantic messages
3. Push to remote: `git push origin [branch]`
4. Create PR with description of changes
5. Wait for reviews and CI/CD to pass
6. Merge to main

### Pushing Changes

```bash
# Stage changes
git add .

# Commit with semantic message
git commit -m "feat: [Phase X.Y] Description"

# Push to remote
git push origin [branch-name]

# Create PR in GitHub UI
```

---

## Troubleshooting

### TypeScript Errors

```bash
# Check TypeScript compilation
pnpm typecheck

# Fix TypeScript errors
pnpm lint:fix
```

**Common errors**:
- `Type 'X' is not assignable to type 'Y'` - Check type definitions in `src/types/shared/`
- `Property does not exist` - Ensure imports are correct and types are defined

### Auth Errors

**401 Unauthorized**:
- Check session cookie is present
- Verify `getServerSession` is working
- Ensure user exists in database

**403 Forbidden**:
- Check user role matches required role
- Verify permission is granted to role
- Check tenant isolation headers

### Build Errors

```bash
# Clean build
pnpm clean
pnpm install
pnpm build

# Check for missing dependencies
pnpm lint

# Run type check
pnpm typecheck
```

### Database Issues

```bash
# Reset database
pnpm prisma:reset

# Generate Prisma client
pnpm prisma:generate

# View database
pnpm prisma:studio
```

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/lib/auth-middleware.ts` | Auth & permission checking |
| `src/lib/api-route-factory.ts` | API route helpers |
| `src/lib/permissions.ts` | Permission definitions |
| `src/lib/use-permissions.ts` | Permission hooks |
| `src/types/shared/` | Shared type definitions |
| `src/schemas/shared/` | Zod validation schemas |
| `src/hooks/shared/` | Shared React hooks |
| `src/components/shared/` | Shared UI components |
| `docs/api/AUTH_MIDDLEWARE.md` | Auth middleware docs |
| `docs/api/RESPONSE_CONTRACT.md` | API response format |

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Documentation](https://react.dev)
- [Zod Documentation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)

---

## Getting Help

1. Check this guide and FAQs
2. Look at similar implementations in existing code
3. Review test files for examples
4. Ask team members in Slack or PR comments
5. Create GitHub issue if it's a blocker

---

**Questions?** See [docs/INTEGRATION_ROADMAP_INDEX.md](./INTEGRATION_ROADMAP_INDEX.md) for quick reference.
