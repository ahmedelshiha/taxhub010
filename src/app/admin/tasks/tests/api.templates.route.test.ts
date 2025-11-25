import { describe, it, expect, vi, beforeEach } from 'vitest'

const mem = { data: '' as string }

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')
  return {
    default: actual,
    ...actual,
    readFileSync: vi.fn(() => (mem.data || '[]')),
    writeFileSync: vi.fn((_p: string, content: string) => { mem.data = content }),
    mkdirSync: vi.fn(() => {})
  }
})

describe('api/admin/tasks/templates route', () => {
  beforeEach(() => { mem.data = '[]' })

  it('supports CRUD operations', async () => {
    const mod: Record<string, unknown> = await import('@/app/api/admin/tasks/templates/route')

    const get1: Response = await (mod.GET as () => Promise<Response>)()
    const list: unknown = await get1.json()
    expect(Array.isArray(list)).toBe(true)
    expect((list as any[]).length).toBe(0)

    const createdRes: Response = await (mod.POST as (request: Request) => Promise<Response>)(new Request('https://x', { method: 'POST', body: JSON.stringify({ name: 'T1', content: 'C' }) }))
    expect(createdRes.status).toBe(201)
    const created: Record<string, unknown> = await createdRes.json()
    expect((created as any).id).toBeDefined()

    const patchRes: Response = await (mod.PATCH as (request: Request) => Promise<Response>)(new Request('https://x', { method: 'PATCH', body: JSON.stringify({ id: (created as any).id, name: 'T2' }) }))
    expect(patchRes.status).toBe(200)
    const updated: Record<string, unknown> = await patchRes.json()
    expect((updated as any).name).toBe('T2')

    const delRes: Response = await (mod.DELETE as (request: Request) => Promise<Response>)(new Request('https://x?id=' + encodeURIComponent((created as any).id), { method: 'DELETE' }))
    expect(delRes.status).toBe(200)
    const ok: Record<string, unknown> = await delRes.json()
    expect((ok as any).ok).toBe(true)
  })
})
