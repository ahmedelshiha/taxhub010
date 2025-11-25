import { describe, it, expect, vi, beforeEach } from 'vitest'

const state: Record<string, Array<Record<string, unknown>>> = { comments: [{ id: 'c1', content: 'hi', createdAt: new Date().toISOString() }] }

vi.mock('@/lib/prisma', () => {
  return {
    default: {
      task: {
        findUnique: vi.fn(async () => ({ comments: state.comments })),
        update: vi.fn(async ({ data }: Record<string, unknown>) => { state.comments = (data as any).comments; return { id: '1' } })
      }
    }
  }
})

describe('api/admin/tasks/[id]/comments route', () => {
  beforeEach(() => { state.comments = [{ id: 'c1', content: 'hi', createdAt: new Date().toISOString() }] })

  it('GET returns list', async () => {
    const { GET }: Record<string, unknown> = await import('@/app/api/admin/tasks/[id]/comments/route')
    const res: Response = await (GET as (request: Request, context: Record<string, unknown>) => Promise<Response>)(new Request('https://x'), { params: { id: '1' } } as Record<string, unknown>)
    const json: unknown = await res.json()
    expect(Array.isArray(json)).toBe(true)
    expect((json as any[]).length).toBeGreaterThan(0)
  })

  it('POST validates payload and appends comment', async () => {
    const { POST }: Record<string, unknown> = await import('@/app/api/admin/tasks/[id]/comments/route')
    const bad: Response = await (POST as (request: Request, context: Record<string, unknown>) => Promise<Response>)(new Request('https://x', { method: 'POST', body: JSON.stringify({}) }), { params: { id: '1' } } as Record<string, unknown>)
    expect(bad.status).toBe(400)

    const ok: Response = await (POST as (request: Request, context: Record<string, unknown>) => Promise<Response>)(new Request('https://x', { method: 'POST', body: JSON.stringify({ content: 'new' }) }), { params: { id: '1' } } as Record<string, unknown>)
    expect(ok.status).toBe(201)
    const created: Record<string, unknown> = await ok.json()
    expect((created as any).content).toBe('new')
  })
})
