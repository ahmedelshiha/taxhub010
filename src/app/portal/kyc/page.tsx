/**
 * KYC Center Page
 * Entry point for KYC verification with Suspense boundary
 */

import { Suspense } from 'react'
import KYCPage from './KYCPage'
import { Loader2 } from 'lucide-react'

export default function KYCCenterPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <KYCPage />
    </Suspense>
  )
}
