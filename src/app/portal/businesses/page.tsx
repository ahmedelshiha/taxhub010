/**
 * Businesses Page - Server Component
 * Entry point for Business Management feature
 */

import { Suspense } from "react";
import BusinessesClientPage from "@/components/portal/businesses/BusinessesClientPage";
import { Loader2 } from "lucide-react";

export const metadata = {
    title: "My Businesses | NextAccounting",
    description: "View and manage your registered business entities",
};

export default function BusinessesPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            }
        >
            <BusinessesClientPage />
        </Suspense>
    );
}
