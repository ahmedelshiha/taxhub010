import { PortalProviders } from './PortalProviders'

export const dynamic = 'force-dynamic'

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <PortalProviders>
            {children}
        </PortalProviders>
    )
}
