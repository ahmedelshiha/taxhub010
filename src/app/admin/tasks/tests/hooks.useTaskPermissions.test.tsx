import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

function renderWithHook(role: string) {
  vi.resetModules()
  vi.doMock('next-auth/react', () => ({ useSession: () => ({ data: { user: { role } } }) }))
  // dynamic import after mocking
  return import('../hooks/useTaskPermissions')
}

describe('useTaskPermissions', () => {
  it('grants full perms to ADMIN', async () => {
    const mod: Record<string, unknown> = await renderWithHook('ADMIN')
    const Comp: React.FC = () => { const p = (mod.useTaskPermissions as () => Record<string, unknown>)(); return <div data-create={String((p as any).canCreate)} data-delete={String((p as any).canDelete)} /> }
    const { container } = render(<Comp />)
    expect(container.querySelector('[data-create="true"]')).toBeTruthy()
    expect(container.querySelector('[data-delete="true"]')).toBeTruthy()
  })

  it('grants limited perms to STAFF', async () => {
    const mod: Record<string, unknown> = await renderWithHook('STAFF')
    const Comp: React.FC = () => { const p = (mod.useTaskPermissions as () => Record<string, unknown>)(); return <div data-create={String((p as any).canCreate)} data-bulk={String((p as any).canBulk)} /> }
    const { container } = render(<Comp />)
    expect(container.querySelector('[data-create="true"]')).toBeTruthy()
    expect(container.querySelector('[data-bulk="false"]')).toBeTruthy()
  })

  it('grants comment-only to USER', async () => {
    const mod: Record<string, unknown> = await renderWithHook('USER')
    const Comp: React.FC = () => { const p = (mod.useTaskPermissions as () => Record<string, unknown>)(); return <div data-comment={String((p as any).canComment)} data-edit={String((p as any).canEdit)} /> }
    const { container } = render(<Comp />)
    expect(container.querySelector('[data-comment="true"]')).toBeTruthy()
    expect(container.querySelector('[data-edit="false"]')).toBeTruthy()
  })
})
